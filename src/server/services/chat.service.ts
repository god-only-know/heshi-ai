import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { ChatModel } from '../models/chat.model'

// 聊天服务类
export class ChatService {
  // 获取所有聊天
  async getAllChats(): Promise<ChatModel[]> {
    return await db.chats.toArray()
  }

  // 根据ID获取聊天
  async getChatById(chatId: string): Promise<ChatModel | undefined> {
    const chatData = await db.chats.get(chatId)
    const friendData = await db.friends.get(chatData?.friend_id)
    return {
      ...chatData,
      ...friendData,
    }
  }

  // 根据好友ID获取聊天
  async getChatByFriendId(friendId: string): Promise<ChatModel | undefined> {
    return await db.chats.where('friend_id').equals(friendId).first()
  }

  // 添加聊天
  async addChat(params: Clochat.AddChatParams): Promise<ChatModel> {
    const chatId = uuidv4()
    const now = Date.now()
    const newChat: ChatModel = {
      chat_id: chatId,
      create_time: now,
      friend_id: params.friend_id,
    }
    await db.chats.add(newChat)
    return newChat
  }

  // 更新聊天最后消息
  async updateChatLastMessage(chatId: string, message: string): Promise<void> {
    const now = Date.now()
    await db.chats.update(chatId, {
      last_message: message,
      last_message_time: now,
    })
  }

  // 删除聊天
  async deleteChat(chatId: string): Promise<void> {
    await db.chats.delete(chatId)
    // 同时删除相关的聊天记录
    await db.chatRecords.where('chat_id').equals(chatId).delete()
  }
}

// 导出单例
export const chatService = new ChatService()
