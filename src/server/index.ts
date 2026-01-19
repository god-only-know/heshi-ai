import { initDatabase } from './db'
import { friendService } from './services/friend.service'
import { chatService } from './services/chat.service'
import { chatRecordService } from './services/chat-record.service'
import { apiSettingService } from './services/api-setting.service'
import { userService } from './services/user.service'

// 初始化服务
export async function initServer() {
  // 初始化数据库
  await initDatabase()
  // 初始化默认用户
  await userService.initDefaultUser()
}

// 导出服务
export {
  friendService,
  chatService,
  chatRecordService,
  apiSettingService,
  userService,
}
