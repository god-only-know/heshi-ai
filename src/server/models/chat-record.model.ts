// 定义ChatRecord模型
export interface ChatRecordModel {
  chat_record_id: string
  create_time: number
  chat_id: string
  content: string
  type: string
}

// 定义表结构
export const chatRecordTableSchema = 'chat_record_id, create_time, chat_id, content, type'

// 初始数据
export const initialChatRecords: ChatRecordModel[] = [
  {
    chat_record_id: '1',
    create_time: 1761288356047,
    chat_id: '1',
    type: 'user',
    content: '你好，小鸡',
  },
]
