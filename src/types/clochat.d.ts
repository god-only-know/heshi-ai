declare namespace Clochat {

  interface FriendItem {
    friend_id: string
    friend_name: string
    friend_avatar: string
    friend_introduce?: string
  }
  interface ChatItem {
    chat_id: string
    create_time: number
    friend_id: string
  }
  interface ChatRecordItem {
    chat_record_id: string
    create_time: number
    chat_id: string
    content: string
    type: 'user' | 'assistant'
  }

  interface AddRecordParams {
    chat_id: string
    content: string
    type: 'user' | 'assistant'
  }

  interface AddChatParams {
    friend_id: string
  }
}
