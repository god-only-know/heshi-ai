import Dexie from 'dexie'
import type { FriendModel } from './models/friend.model'
import { friendTableSchema, initialFriends } from './models/friend.model'
import type { ChatModel } from './models/chat.model'
import { chatTableSchema, initialChats } from './models/chat.model'
import type { ChatRecordModel } from './models/chat-record.model'
import { chatRecordTableSchema, initialChatRecords } from './models/chat-record.model'
import type { ApiSettingModel, ModelSettingModel } from './models/api-setting.model'
import { apiSettingTableSchema, initialApiSettings, initialModelSettings, modelSettingTableSchema } from './models/api-setting.model'

// 定义数据库类，继承自Dexie
export class AppDatabase extends Dexie {
  // 定义表
  friends!: Dexie.Table<FriendModel, string>
  chats!: Dexie.Table<ChatModel, string>
  chatRecords!: Dexie.Table<ChatRecordModel, string>
  apiSettings!: Dexie.Table<ApiSettingModel, string>
  modelSettings!: Dexie.Table<ModelSettingModel, string>

  constructor() {
    super('AppDatabase')

    // 定义数据库结构，使用从模型中导入的表结构
    this.version(1).stores({
      friends: friendTableSchema,
      chats: chatTableSchema,
      chatRecords: chatRecordTableSchema,
      apiSettings: apiSettingTableSchema,
      modelSettings: modelSettingTableSchema,
    })
  }
}

// 创建数据库实例
export const db = new AppDatabase()

// 初始化数据库
export async function initDatabase() {
  try {
    // 检查friends表是否为空
    const friendCount = await db.friends.count()
    if (friendCount === 0) {
      // 添加初始数据，使用从模型中导入的初始数据
      await db.friends.bulkAdd(initialFriends)
      await db.chats.bulkAdd(initialChats)
      await db.chatRecords.bulkAdd(initialChatRecords)
    }

    // 检查apiSettings表是否为空
    const apiSettingCount = await db.apiSettings.count()
    if (apiSettingCount === 0) {
      // 添加初始数据
      await db.apiSettings.bulkAdd(initialApiSettings)
      await db.modelSettings.bulkAdd(initialModelSettings)
    }

    console.log('数据库初始化成功')
  }
  catch (error) {
    console.error('数据库初始化失败:', error)
  }
}
