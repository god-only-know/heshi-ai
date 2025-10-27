import { defineStore } from 'pinia'
import { initServer } from '@/server'

interface ClochatState {
  isLoading: boolean
  error: string | null
  // 当前选中的聊天对象ID（可以根据需要添加）
  currentChatId: string | null
}

const useClochatStore = defineStore('clochat', {
  state: (): ClochatState => ({
    isLoading: false,
    error: null,
    currentChatId: null,
  }),

  // 主要异步逻辑
  actions: {
    // 初始化服务
    async init() {
      try {
        this.isLoading = true
        this.error = null

        // 初始化服务器（包括数据库）
        await initServer()
      }
      catch (err) {
        this.error = '初始化失败'
        console.error(err)
      }
      finally {
        this.isLoading = false
      }
    },

    // 设置当前聊天ID
    setCurrentChatId(chatId: string | null) {
      this.currentChatId = chatId
    },
  },
  persist: true,
})

export default useClochatStore
