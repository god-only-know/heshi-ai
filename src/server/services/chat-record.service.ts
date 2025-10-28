import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { ChatRecordModel } from '../models/chat-record.model'
import { chatService } from './chat.service'

// 聊天记录服务类
export class ChatRecordService {
  // 获取聊天记录
  async getChatRecords(chatId: string): Promise<ChatRecordModel[]> {
    return await db.chatRecords.where('chat_id').equals(chatId).toArray()
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
    }
    await db.chatRecords.add(newRecord)

    // 更新聊天的最后消息
    await chatService.updateChatLastMessage(params.chat_id, params.content)

    return newRecord
  }

  // 删除聊天记录
  async deleteChatRecord(recordId: string): Promise<void> {
    await db.chatRecords.delete(recordId)
  }

  // 根据关键词搜索聊天记录
  async searchChatRecords(chatId: string, keyword: string): Promise<ChatRecordModel[]> {
    return await db.chatRecords
      .where('chat_id')
      .equals(chatId)
      .filter(record => record.content.includes(keyword))
      .toArray()
  }
}

// 导出单例
export const chatRecordService = new ChatRecordService()
