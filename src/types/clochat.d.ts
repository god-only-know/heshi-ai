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
    last_message?: string
    last_message_time?: number
    friend_id: string
    friend_name: string
    friend_avatar: string
    friend_introduce?: string
  }
}
