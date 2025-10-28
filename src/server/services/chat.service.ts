import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { ChatModel } from '../models/chat.model'
import type { FriendModel } from '../models/friend.model'

// 聊天服务类
export class ChatService {
  // 获取所有聊天
  async getAllChats(): Promise<Api.Clochat.getChatListResult> {
    const chats = await db.chats.toArray()
    const friends = await db.friends.where('friend_id').anyOf(chats.map(i => i.friend_id)).toArray()
    return chats.map((i) => {
      return {
        ...i,
        ...friends.find(j => j.friend_id === i.friend_id),
      }
    })
  }

  // 根据ID获取聊天
  async getChatById(chatId: string): Promise<ChatModel | undefined> {
    const chatData = await db.chats.get(chatId)
    return {
      ...chatData,
    }
  }

  // 获取聊天详情（包括好友信息和聊天记录）
  async getChatDetail(chatId: string): Promise<Api.Clochat.getChatDetailResult> {
    const chatData = await db.chats.get(chatId)
    let friendData: FriendModel | undefined

    if (chatData) {
      friendData = await db.friends.get(chatData.friend_id)
    }

    const chatRecords = await db.chatRecords
      .where('chat_id')
      .equals(chatId)
      .toArray()

    return {
      ...chatData,
      ...friendData,
      record_list: chatRecords,
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
      last_message: params.last_message || '',
      last_message_time: now,
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
