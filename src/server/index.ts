import { initDatabase } from './db'
import { friendService } from './services/friend.service'
import { chatService } from './services/chat.service'
import { chatRecordService } from './services/chat-record.service'

// 初始化服务
export async function initServer() {
  // 初始化数据库
  await initDatabase()
}

// 导出服务
export {
  friendService,
  chatService,
  chatRecordService,
}
