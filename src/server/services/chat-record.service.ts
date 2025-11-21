import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { ChatRecordModel } from '../models/chat-record.model'
import { chatService } from './chat.service'

// 默认每页记录数
const PAGE_SIZE = 20

// 分页结果接口
export interface PaginatedResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 聊天记录服务类
export class ChatRecordService {
  // 将未读消息标记为已读
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    for (const id of messageIds) {
      await db.chatRecords.update(id, { is_read: true })
    }
  }

  // 获取未读消息
  async getUnreadMessages(chatId: string): Promise<ChatRecordModel[]> {
    return await db.chatRecords
      .where('chat_id')
      .equals(chatId)
      .and(record => record.is_read === false)
      .toArray()
  }

  // 获取聊天记录
  async getChatRecords(chatId: string): Promise<ChatRecordModel[]> {
    return (await db.chatRecords.where('chat_id').equals(chatId).toArray()).toSorted(
      (a, b) => a.create_time - b.create_time,
    )
  }

  // 分页获取聊天记录，同时返回总数和是否有更多
  async getChatRecordsPaginated(params: {
    chatId: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<ChatRecordModel>> {
    const { chatId, page = 1, pageSize = PAGE_SIZE } = params
    const offset = (page - 1) * pageSize

    // 基础查询
    const query = db.chatRecords.where('chat_id').equals(chatId)

    // 获取所有记录
    const allRecords = await query.toArray()

    // 获取总数
    const total = allRecords.length

    // 按时间降序排序
    const sortedRecords = allRecords.toSorted((a, b) => b.create_time - a.create_time)

    // 分页
    const paginatedRecords = sortedRecords.slice(offset, offset + pageSize)

    // 返回时按时间升序排列
    const records = paginatedRecords.toSorted((a, b) => a.create_time - b.create_time)

    return {
      records,
      total,
      page,
      pageSize,
      hasMore: total > offset + records.length,
    }
  }

  // 添加聊天记录
  async addChatRecord(params: Api.Clochat.AddRecordParams): Promise<ChatRecordModel> {
    const recordId = uuidv4()
    const now = Date.now()
    const newRecord: ChatRecordModel = {
      chat_record_id: recordId,
      create_time: now,
      chat_id: params.chat_id,
      content: params.content,
      type: params.type,
      is_read: params.is_read !== undefined ? params.is_read : true,
    }
    await db.chatRecords.add(newRecord)

    // 更新聊天的最后消息
    await chatService.updateChatLastMessage(params.chat_id, params.content)

    return newRecord
  }

  // 编辑聊天记录
  async updateChatRecord(params: Api.Clochat.UpdateRecordParams): Promise<void> {
    const findItem = await db.chatRecords.get(params.chat_record_id)
    await db.chatRecords.update(params.chat_record_id, {
      content: params.content,
      type: params.type ?? findItem.type,
      is_read: params.is_read ?? findItem.is_read,
    })
  }

  // 删除聊天记录
  async deleteChatRecord(recordId: string): Promise<void> {
    await db.chatRecords.delete(recordId)
  }

  // 清空聊天历史
  async clearChatHistory(chatId: string): Promise<void> {
    await db.chatRecords.where('chat_id').equals(chatId).delete()
    // 更新聊天的最后消息为空
    await chatService.updateChatLastMessage(chatId, '')
  }

  // 根据关键词搜索聊天记录
  async searchChatRecords(chatId: string, keyword: string): Promise<ChatRecordModel[]> {
    return await db.chatRecords
      .where('chat_id')
      .equals(chatId)
      .filter(record => record.content.includes(keyword))
      .toArray()
  }

  // 获取最近几轮对话
  async getRecentRounds(chatId: string, rounds = 5): Promise<ChatRecordModel[]> {
    const allRecords = await this.getChatRecords(chatId)
    const result: ChatRecordModel[] = []
    let roundCount = 0
    let i = allRecords.length - 1

    // 从最新记录开始向前遍历
    while (i >= 0 && roundCount < rounds) {
    // 情况1：当前是AI回复，检查前一条是否是用户消息
      if (allRecords[i].type !== allRecords[i - 1].type && i > 0) {
      // 将用户消息插入到结果集开头（保持时间顺序）
        result.unshift(allRecords[i - 1], allRecords[i])
        roundCount++
        i -= 2 // 跳过已处理的两条
      }
      // 其他情况：跳过无效记录
      else {
        i--
      }
    }

    return result
  }
}

// 导出单例
export const chatRecordService = new ChatRecordService()
