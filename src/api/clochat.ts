import request from '@/utils/request'

// 好友相关API
export function getFriends() {
  return request.post<Clochat.FriendItem[]>('/clochat/friends/list')
}

export function getFriendById(friendId: string) {
  return request.post('/clochat/friends/detail', { friendId })
}

export function addFriend(data: Omit<Clochat.FriendItem, 'friend_id'>) {
  return request.post('/clochat/friends', data)
}

export function updateFriend(data: Clochat.FriendItem) {
  return request.post('/clochat/friends/update', data)
}

export function deleteFriend(friendId: string) {
  return request.post('/clochat/friends/delete', { friendId })
}

// 聊天相关API
export function getChats() {
  return request.post('/clochat/chats/list')
}

export function getChatById(chatId: string) {
  return request.post('/clochat/chats/detail', { chatId })
}

export function getChatByFriendId(friendId: string) {
  return request.post('/clochat/chats/friend', { friendId })
}

export function addChat(data: Clochat.AddChatParams) {
  return request.post('/clochat/chats', data)
}

export function deleteChat(chatId: string) {
  return request.post('/clochat/chats/delete', { chatId })
}

// 聊天记录相关API
export function getChatRecords(chatId: string) {
  return request.post('/clochat/chat-records/list', { chatId })
}

export function addChatRecord(data: Clochat.AddRecordParams) {
  return request.post('/clochat/chat-records', data)
}

export function deleteChatRecord(recordId: string) {
  return request.post('/clochat/chat-records/delete', { recordId })
}

export function searchChatRecords(chatId: string, keyword: string) {
  return request.post('/clochat/chat-records/search', { chatId, keyword })
}
