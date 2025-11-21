declare namespace Api {
  declare namespace Clochat {

    // 获取对话详情请求参数
    interface getChatDetailParams {
      chat_id: string
    }

    // 获取对话详情返回结果
    interface getChatDetailResult {
      chat_id: string
      create_time: number
      last_message?: string
      last_message_time?: number
      friend_id: string
      friend_name: string
      friend_avatar: string
      friend_introduce?: string
      record_list: {
        chat_record_id: string
        create_time?: number
        chat_id?: string
        content: string
        type: string
        is_read?: boolean
      }[]
    }

    // 获取对话列表返回结果
    type getChatListResult = {
      chat_id: string
      create_time: number
      last_message?: string
      last_message_time?: number
      friend_id: string
      friend_name: string
      friend_avatar: string
      friend_introduce?: string
    }[]
    // 添加对话记录参数
    interface AddRecordParams {
      chat_id: string
      content: string
      type: 'user' | 'assistant'
      is_read?: boolean
    }

    // 编辑对话记录参数
    interface UpdateRecordParams {
      chat_record_id: string
      content?: string
      type?: 'user' | 'assistant'
      is_read?: boolean
    }

    // 添加对话参数
    interface AddChatParams {
      friend_id: string
      last_message?: string
    }
    // 发起对话参数
    interface SendMessageParams {
      setting_id: string
      chat_id: string
      user_message: string
      message_ids?: string[]
    }

    // 标记消息为已读参数
    interface MarkMessagesAsReadParams {
      message_ids: string[]
    }
  }
}
