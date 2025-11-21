<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useEventListener } from '@vant/use'

// 定义菜单项接口
interface MenuItem {
  text: string
  action: string
}

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object as () => { x: number, y: number },
    default: () => ({ x: 0, y: 0 }),
  },
  menuItems: {
    type: Array as () => MenuItem[],
    default: () => [],
  },
  placement: {
    type: String as () => 'start' | 'end' | null,
    default: null, // 默认居中
  },
})

// 定义事件
const emit = defineEmits(['close', 'select'])

// 菜单元素引用
const menuRef = ref<HTMLElement | null>(null)

// 处理菜单项点击
function handleMenuItemClick(action: string) {
  emit('select', action)
  emit('close')
}

// 处理点击外部关闭菜单
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

// 使用vant的useEventListener监听mousedown事件
useEventListener('mousedown', handleClickOutside)
useEventListener('touchstart', handleClickOutside)

// 菜单宽度引用
const menuWidth = ref(0)

// 监听菜单可见性变化，更新宽度
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (menuRef.value) {
        const menuElement = menuRef.value.querySelector('.menu-container')
        if (menuElement) {
          menuWidth.value = menuElement.getBoundingClientRect().width
        }
      }
    })
  }
})

// 根据placement计算位置样式
const menuPositionStyle = computed(() => {
  const baseStyle = {
    top: `${props.position.y}px`,
  }

  switch (props.placement) {
    case 'start':
      return {
        ...baseStyle,
        left: `${props.position.x}px`,
      }
    case 'end':
      return {
        ...baseStyle,
        left: `${props.position.x - menuWidth.value}px`,
      }
    default:
      return {
        ...baseStyle,
        left: `${props.position.x - (menuWidth.value / 2)}px`,
      }
  }
})

// 根据placement计算箭头类名
const arrowClass = computed(() => {
  switch (props.placement) {
    case 'start':
      return 'ml-4'
    case 'end':
      return 'mr-4 ml-auto'
    default:
      return 'mx-auto' // 居中
  }
})
</script>

<template>
  <div
    v-if="visible"
    ref="menuRef"
    class="pb-1 absolute z-50 drop-shadow-md filter -translate-y-[100%]"
    :style="menuPositionStyle"
  >
    <div class="menu-container rounded-lg bg-white overflow-hidden">
      <div class="flex flex-row">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="text-sm text-gray-700 px-3 py-2 text-center border-r border-gray-100 shrink-0 last:border-r-0 active:bg-gray-100 hover:bg-gray-50"
          @click="handleMenuItemClick(item.action)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <!-- 箭头位置也根据placement调整 -->
    <div
      class="border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white h-0 w-0"
      :class="arrowClass"
    />
  </div>
</template>
