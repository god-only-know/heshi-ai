import type { App } from 'vue'
import longpress from './longpress'

export default {
  install(app: App) {
    // 注册长按指令
    app.directive('longpress', longpress)
  },
}
