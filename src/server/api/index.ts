import { chatRecordService, chatService, friendService } from '@/server'

// 好友相关API
export function getFriends() {
  return friendService.getAllFriends()
}

export function getFriendById(data: { friendId: string }) {
  return friendService.getFriendById(data.friendId)
}

export function addFriend(data: Omit<Clochat.FriendItem, 'friend_id'>) {
  return friendService.addFriend(data)
}

export function updateFriend(data: Clochat.FriendItem) {
  return friendService.updateFriend(data)
}

export function deleteFriend(data: { friendId: string }) {
  return friendService.deleteFriend(data.friendId)
}

// 聊天相关API
export function getChats() {
  return chatService.getAllChats()
}

export function getChatById(data: { chatId: string }) {
  return chatService.getChatById(data.chatId)
}

export function getChatByFriendId(data: { friendId: string }) {
  return chatService.getChatByFriendId(data.friendId)
}

export function addChat(data: Clochat.AddChatParams) {
  return chatService.addChat(data)
}

export function deleteChat(data: { chatId: string }) {
  return chatService.deleteChat(data.chatId)
}

// 聊天记录相关API
export function getChatRecords(data: { chatId: string }) {
  return chatRecordService.getChatRecords(data.chatId)
}

export function addChatRecord(data: Clochat.AddRecordParams) {
  return chatRecordService.addChatRecord(data)
}

export function deleteChatRecord(data: { recordId: string }) {
  return chatRecordService.deleteChatRecord(data.recordId)
}

export function searchChatRecords(data: { chatId: string, keyword: string }) {
  return chatRecordService.searchChatRecords(data.chatId, data.keyword)
}

// API映射表
export const apiMap: Record<string, any> = {
  'POST /api/clochat/friends/list': getFriends,
  'POST /api/clochat/friends/detail': getFriendById,
  'POST /api/clochat/friends': addFriend,
  'POST /api/clochat/friends/update': updateFriend,
  'POST /api/clochat/friends/delete': deleteFriend,
  'POST /api/clochat/chats/list': getChats,
  'POST /api/clochat/chats/detail': getChatById,
  'POST /api/clochat/chats/friend': getChatByFriendId,
  'POST /api/clochat/chats': addChat,
  'POST /api/clochat/chats/delete': deleteChat,
  'POST /api/clochat/chat-records/list': getChatRecords,
  'POST /api/clochat/chat-records': addChatRecord,
  'POST /api/clochat/chat-records/delete': deleteChatRecord,
  'POST /api/clochat/chat-records/search': searchChatRecords,
}
