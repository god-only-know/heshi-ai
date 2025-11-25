import request from '@/utils/request'

// 好友相关API
export function getFriends() {
  return request.post<Clochat.FriendItem[]>('/clochat/friends/list')
}

export function getFriendById(friendId: string) {
  return request.post('/clochat/friends/detail', { friendId })
}

export function addFriend(data: Api.Clochat.AddFriendParams) {
  return request.post('/clochat/friends/create', data)
}

export function updateFriend(data: Clochat.FriendItem) {
  return request.post('/clochat/friends/update', data)
}

export function deleteFriend(friendId: string) {
  return request.post('/clochat/friends/delete', { friendId })
}

// 新增：拉黑好友
export function blockFriend(friendId: string) {
  return request.post('/clochat/friends/block', { friendId })
}

// 新增：取消拉黑好友
export function unblockFriend(friendId: string) {
  return request.post('/clochat/friends/unblock', { friendId })
}

// 聊天相关API
export function sendMessage(data: Api.Clochat.SendMessageParams) {
  return request.post('/llm-model/send-message', data)
}
// 聊天相关API
export function getChats() {
  return request.post('/clochat/chats/list')
}

export function getChatDetail(chat_id: string) {
  return request.post<Api.Clochat.getChatDetailResult>('/clochat/chats/detail', { chat_id })
}

export function getChatByFriendId(friendId: string) {
  return request.post('/clochat/chats/friend', { friendId })
}

export function addChat(data: Api.Clochat.AddChatParams) {
  return request.post('/clochat/chats', data)
}

export function deleteChat(chatId: string) {
  return request.post('/clochat/chats/delete', { chatId })
}

// 聊天记录相关API
export function markMessagesAsRead(message_ids: string[]) {
  return request.post('/clochat/chat-records/mark-as-read', { message_ids })
}

export function getUnreadMessages(chatId: string) {
  return request.post('/clochat/chat-records/unread', { chatId })
}

export function getChatRecords(chatId: string) {
  return request.post('/clochat/chat-records/list', { chatId })
}

// 分页获取聊天记录，同时返回总数和是否有更多
export interface ChatRecordsPaginatedParams {
  chatId: string
  page?: number
  pageSize?: number
}

export function getChatRecordsPaginated(params: ChatRecordsPaginatedParams) {
  return request.post('/clochat/chat-records/paginated', params)
}

export function addChatRecord(data: Api.Clochat.AddRecordParams) {
  return request.post('/clochat/chat-records', data)
}
export function updateChatRecord(data: Api.Clochat.UpdateRecordParams) {
  return request.post('/clochat/chat-records/update', data)
}

export function deleteChatRecord(recordId: string) {
  return request.post('/clochat/chat-records/delete', { recordId })
}

export function clearChatHistory(chatId: string) {
  return request.post('/clochat/chat-records/clear', { chatId })
}

export function searchChatRecords(chatId: string, keyword: string) {
  return request.post('/clochat/chat-records/search', { chatId, keyword })
}
