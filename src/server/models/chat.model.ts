// 定义Chat模型
export interface ChatModel {
  chat_id: string
  create_time: number
  friend_id: string
  last_message: string
  last_message_time: number
}

// 定义表结构
export const chatTableSchema = 'chat_id, create_time, friend_id, last_message, last_message_time'

// 初始数据
export const initialChats: ChatModel[] = [
  {
    chat_id: '1',
    create_time: 1761288356047,
    friend_id: '1',
    last_message: '你好，小鸡',
    last_message_time: 1761288356047,
  },
]
