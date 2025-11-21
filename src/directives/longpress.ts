import type { Directive, DirectiveBinding } from 'vue'

export interface LongPressOptions {
  onLongPress: (e: TouchEvent | MouseEvent) => void
  duration?: number
  preventDefault?: boolean
  stopPropagation?: boolean
}

const longPress: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (typeof binding.value !== 'object') {
      console.error('v-longpress指令需要一个对象类型的值，包含onLongPress回调函数')
      return
    }

    const options: LongPressOptions = binding.value
    const duration = options.duration || 500
    const preventDefault = options.preventDefault || true
    const stopPropagation = options.stopPropagation || true

    let timer: number | null = null
    let isLongPress = false

    // 开始长按
    const startLongPress = (e: TouchEvent | MouseEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }
      if (stopPropagation) {
        e.stopPropagation()
      }

      isLongPress = false
      timer = setTimeout(() => {
        isLongPress = true
        options.onLongPress(e)
      }, duration) as unknown as number
    }

    // 取消长按
    const cancelLongPress = (e: TouchEvent | MouseEvent) => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      // 如果是长按，阻止默认行为和冒泡
      if (isLongPress) {
        if (preventDefault) {
          e.preventDefault()
        }
        if (stopPropagation) {
          e.stopPropagation()
        }
      }
    }

    // 触摸事件
    el.addEventListener('touchstart', startLongPress, { passive: !preventDefault })
    el.addEventListener('touchend', cancelLongPress)
    el.addEventListener('touchmove', cancelLongPress)

    // 鼠标事件
    el.addEventListener('mousedown', startLongPress, { passive: !preventDefault })
    el.addEventListener('mouseup', cancelLongPress)
    el.addEventListener('mouseleave', cancelLongPress);

    // 存储事件处理函数，以便在卸载时移除
    (el as any)._longPressEvents = {
      startLongPress,
      cancelLongPress,
    }
  },

  beforeUnmount(el: HTMLElement) {
    const element = el as any
    if (element._longPressEvents) {
      const { startLongPress, cancelLongPress } = element._longPressEvents

      // 移除触摸事件
      el.removeEventListener('touchstart', startLongPress)
      el.removeEventListener('touchend', cancelLongPress)
      el.removeEventListener('touchmove', cancelLongPress)

      // 移除鼠标事件
      el.removeEventListener('mousedown', startLongPress)
      el.removeEventListener('mouseup', cancelLongPress)
      el.removeEventListener('mouseleave', cancelLongPress)

      delete element._longPressEvents
    }
  },
}

export default longPress
