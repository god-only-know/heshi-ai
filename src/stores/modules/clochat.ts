import { defineStore } from 'pinia'
import { v4 } from 'uuid'

interface ClochatState {
  friendList: Clochat.FriendItem[]
  chatList: Clochat.ChatItem[]
  chatRecordList: Clochat.ChatRecordItem[]
}

const useClochatStore = defineStore('clochat', {
  state: (): ClochatState => ({
    friendList: [
      {
        friend_id: '1',
        friend_name: '小猫',
        friend_avatar: 'https://picsum.photos/200/300',
        friend_introduce: '小猫是一个可爱的小猫',
      },
      {
        friend_id: '2',
        friend_name: '小狗',
        friend_avatar: 'https://picsum.photos/200/301',
        friend_introduce: '小狗是一个可爱的小狗',
      },
      {
        friend_id: '3',
        friend_name: '小鸡',
        friend_avatar: 'https://picsum.photos/200/302',
        friend_introduce: '小狗是一个可爱的小鸡',
      },
    ],
    chatList: [
      {
        chat_id: '1',
        create_time: 1761288356047,
        friend_id: '1',
      },
    ],
    chatRecordList: [
      {
        chat_record_id: '1',
        create_time: 1761288356047,
        chat_id: '1',
        type: 'user',
        content: '你好，小鸡',
      },
    ],
    // isPersisting: false,
    // persistError: null,
  }),

  getters: {
    // 同步查询方法放入 getters
    getFriendItemById: state => (friend_id: string) => {
      return state.friendList.find(item => item.friend_id === friend_id)
    },

    getChatItemById: state => (chat_id: string) => {
      return state.chatList.find(item => item.chat_id === chat_id)
    },

    getChatItemByFriendId: state => (friend_id: string) => {
      return state.chatList.find(item => item.friend_id === friend_id)
    },

    getChatRecordList: state => (chat_id: string) => {
      return state.chatRecordList.filter(item => item.chat_id === chat_id)
    },

    getChatRecordItemByKeyword: state => (chat_id: string, keyword: string) => {
      return state.chatRecordList.find(
        item => item.chat_id === chat_id && item.content.includes(keyword),
      )
    },
  },
  // 主要异步逻辑
  actions: {
    // 异步操作放入 actions
    async initFromStorage() {
      try {
        this.isPersisting = true
        const storedData = await this.loadFromIndexedDB()
        if (storedData) {
          this.friendList = storedData.friendList
          this.chatList = storedData.chatList
          this.chatRecordList = storedData.chatRecordList
        }
      }
      catch (err) {
        this.persistError = '初始化持久化数据失败'
        console.error(err)
      }
      finally {
        this.isPersisting = false
      }
    },

    async persistState() {
      // try {
      //   this.isPersisting = true
      //   await this.saveToIndexedDB({
      //     friendList: this.friendList,
      //     chatList: this.chatList,
      //     chatRecordList: this.chatRecordList,
      //   })
      // }
      // catch (err) {
      //   this.persistError = '状态持久化失败'
      //   console.error(err)
      // }
      // finally {
      //   this.isPersisting = false
      // }
    },

    async addChatItem(item: Clochat.AddChatParams) {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 300))
      const addItem = { ...item, chat_id: v4(), create_time: Date.now() }
      this.chatList.push(addItem)
      await this.persistState()
      return addItem
    },

    async deleteChatItem(chat_id: string) {
      this.chatList = this.chatList.filter(item => item.chat_id !== chat_id)
      await this.persistState()
    },

    async fetchFriendList() {
      // try {
      //   this.isPersisting = true
      //   const friends = await api.getFriends() // 假设存在 API 模块
      //   this.friendList = friends
      //   await this.persistState()
      // }
      // catch (err) {
      //   this.persistError = '获取好友列表失败'
      //   throw err
      // }
      // finally {
      //   this.isPersisting = false
      // }
    },

    async addChatRecordItem(item: Clochat.AddRecordParams) {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 300))
      this.chatRecordList.push({ ...item, chat_record_id: v4(), create_time: Date.now() })

      // try {
      //   this.isPersisting = true
      //   await this.saveToIndexedDB(this.friendList)
      //   this.persistError = ''
      // }
      // catch (err) {
      //   this.persistError = '保存好友列表失败'
      //   throw err
      // }
      // finally {
      //   this.isPersisting = false
      // }
    },
    // IndexedDB 操作封装
    async saveToIndexedDB(data: any) {
      console.log('保存到 IndexedDB:', data)
      // 实际实现参考：https://www.npmjs.com/package/idb
    },

    async loadFromIndexedDB() {
      console.log('从 IndexedDB 加载')
      return null
    },
  },
  persist: true,
})

export default useClochatStore
