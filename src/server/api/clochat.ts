import { chatRecordService, chatService, friendService } from '@/server'
// 好友相关API
/** 获取好友列表 */
function getFriends() {
  return friendService.getAllFriends()
}
/** 获取好友详情 */
function getFriendDetail(data: { friendId: string }) {
  return friendService.getFriendById(data.friendId)
}
/** 删除好友 */
function deleteFriend(data: { friendId: string }) {
  return friendService.deleteFriend(data.friendId)
}

// 聊天相关API
/** 获取所有聊天 */
function getChats(): Promise<Api.Clochat.getChatListResult> {
  return chatService.getAllChats()
}
/** 获取聊天详情 */
function getChatDetail(data: Api.Clochat.getChatDetailParams): Promise<Api.Clochat.getChatDetailResult> {
  return chatService.getChatDetail(data.chat_id)
}
/** 获取聊天记录 */
function getChatByFriendId(data: { friendId: string }) {
  return chatService.getChatByFriendId(data.friendId)
}
/** 添加聊天 */
function addChat(data: Api.Clochat.AddChatParams) {
  return chatService.addChat(data)
}
/** 删除聊天 */
function deleteChat(data: { chatId: string }) {
  return chatService.deleteChat(data.chatId)
}

// 聊天记录相关API

/** 获取聊天记录 */
function getChatRecords(data: { chatId: string }) {
  return chatRecordService.getChatRecords(data.chatId)
}
/** 搜索聊天记录 */
function addChatRecord(data: Api.Clochat.AddRecordParams) {
  return chatRecordService.addChatRecord(data)
}
/** 删除聊天记录 */
function deleteChatRecord(data: { recordId: string }) {
  return chatRecordService.deleteChatRecord(data.recordId)
}
/** 搜索聊天记录 */
function searchChatRecords(data: { chatId: string, keyword: string }) {
  return chatRecordService.searchChatRecords(data.chatId, data.keyword)
}

// API映射表
export default [
  // 聊天记录相关
  {
    method: 'POST',
    path: '/api/clochat/chat-records',
    handler: addChatRecord,
  },
  {
    method: 'POST',
    path: '/api/clochat/chat-records/delete',
    handler: deleteChatRecord,
  },
  {
    method: 'POST',
    path: '/api/clochat/chat-records/list',
    handler: getChatRecords,
  },

  // 好友相关
  {
    method: 'POST',
    path: '/api/clochat/friends/list',
    handler: getFriends,
  },
  {
    method: 'POST',
    path: '/api/clochat/friends/detail',
    handler: getFriendDetail,
  },
  {
    method: 'POST',
    path: '/api/clochat/friends/delete',
    handler: deleteFriend,
  },

  // 聊天会话相关
  {
    method: 'POST',
    path: '/api/clochat/chats/list',
    handler: getChats,
  },
  {
    method: 'POST',
    path: '/api/clochat/chats/detail',
    handler: getChatDetail,
  },
  {
    method: 'POST',
    path: '/api/clochat/chats/friend',
    handler: getChatByFriendId,
  },
  {
    method: 'POST',
    path: '/api/clochat/chats',
    handler: addChat,
  },
  {
    method: 'POST',
    path: '/api/clochat/chats/delete',
    handler: deleteChat,
  },

  // 搜索相关（新转换部分）
  {
    method: 'POST',
    path: '/api/clochat/chat-records/search',
    handler: searchChatRecords,
  },

]
