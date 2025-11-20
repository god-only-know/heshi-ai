<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Popup } from 'vant'
import ApiSetting from '@/components/ApiSetting/index.vue'
import { useEventListener } from '@vant/use'
import clochatIcon from '@/assets/icons/clochat-icon.svg'
import worldBookIcon from '@/assets/icons/world-book-icon.svg'
import defaultAvatar from '@/assets/images/default-avatar.svg'

const router = useRouter()
const { t } = useI18n()

const routes = [
  // { name: 'Charts', path: '/charts' },
  // { name: 'Counter', path: '/counter' },
  // { name: 'ForgotPassword', path: '/forgot-password' },
  // { name: 'Mock', path: '/mock' },
  // { name: 'Register', path: '/register' },
  // { name: 'ScrollCache', path: '/scroll-cache' },
  // { name: 'Settings', path: '/settings' },
  // { name: 'UnoCSS', path: '/unocss' },
  { name: 'Clochat', path: '/clochat', icon: clochatIcon },
  { name: '世界书', path: '/clochat', icon: worldBookIcon },
]

function go(path: string) {
  router.push({ path }).catch(() => {})
}

/* Pull-down -> show top Overlay panel (supports touch and mouse drag) */
const pulling = ref(false)
const pullDistance = ref(0)
const startY = ref<number | null>(null)
const maxPull = 200
const openThreshold = 80

const showOverlay = ref(false)
const showApiSetting = ref(false)

function openOverlay() {
  showOverlay.value = true
}

function openApiSetting() {
  showApiSetting.value = !showApiSetting.value
}

function closeOverlay() {
  showOverlay.value = false
}

/* touch handlers */
function onTouchStart(e: TouchEvent) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  if (scrollTop > 0)
    return
  startY.value = e.touches[0].clientY
  pulling.value = true
  pullDistance.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!pulling.value || startY.value == null)
    return
  const dy = e.touches[0].clientY - startY.value
  if (dy > 0) {
    e.preventDefault()
    pullDistance.value = Math.min(maxPull, dy)
  }
  else {
    pullDistance.value = 0
  }
}

function onTouchEnd() {
  if (!pulling.value)
    return
  pulling.value = false
  if (pullDistance.value >= openThreshold) {
    openOverlay()
  }
  pullDistance.value = 0
  startY.value = null
}

/* mouse handlers for desktop: only start when near top and scrollTop == 0 */
let mouseDown = false
function onMouseDown(e: MouseEvent) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  if (scrollTop > 0)
    return
  // 允许从页面顶部小区域开始拖拽
  if (e.clientY > 60)
    return
  mouseDown = true
  startY.value = e.clientY
  pulling.value = true
  pullDistance.value = 0
}

function onMouseMove(e: MouseEvent) {
  if (!mouseDown || !pulling.value || startY.value == null)
    return
  const dy = e.clientY - startY.value
  if (dy > 0) {
    e.preventDefault()
    pullDistance.value = Math.min(maxPull, dy)
  }
  else {
    pullDistance.value = 0
  }
}

function onMouseUp() {
  if (!mouseDown)
    return
  mouseDown = false
  if (pullDistance.value >= openThreshold) {
    openOverlay()
  }
  pulling.value = false
  pullDistance.value = 0
  startY.value = null
}

useEventListener('touchstart', onTouchStart, {
  passive: false,
})
useEventListener('touchmove', onTouchMove, {
  passive: false,
})
useEventListener('touchend', onTouchEnd, {
  passive: false,
})
useEventListener('mousedown', onMouseDown, {
  passive: false,
})
useEventListener('mousemove', onMouseMove, {
  passive: false,
})
useEventListener('mouseup', onMouseUp, {
  passive: false,
})
</script>

<template>
  <div class="mx-auto max-w-[375px] w-full top-0 position-fixed z-20" @click="openOverlay">
    <nav-time-bar />
  </div>
  <div class="page-home p-5 pt-[34px] w-full">
    <Popup v-model:show="showOverlay" position="top" round :overlay="false" safe-area-inset-top closeable close-icon-position="bottom-right" @close="closeOverlay">
      <div
        class="mx-auto p-5 pt-[34px] flex flex-col h-[80vh] max-w-[720px] w-full shadow-md from-white to-slate-50 backdrop-blur-2xl"
        @click.stop
      >
        <div class="mb-6 flex flex-col h-20 w-20 items-center">
          <van-image :src="defaultAvatar" height="100%" width="100%" fix="cover" />
        </div>
        <div class="flex gap-2 items-center">
          <van-button type="primary" :plain="!showApiSetting" size="small" class="px-3" @click="openApiSetting">
            {{ t('navbar.ApiSetting') }}
          </van-button>
          <!-- <van-button type="primary" :plain="!showApiSetting" size="small" class="px-3" @click="openApiSetting">
            {{ t('navbar.Settings') }}
          </van-button> -->
        </div>
        <!-- 如果 showApiSetting 为真则显示 ApiSetting 组件 -->
        <div v-if="showApiSetting" class="mt-2 border-t-1 border-[--van-border-color] flex-1 overflow-auto">
          <ApiSetting />
        </div>
      </div>
    </Popup>

    <!-- 时间小部件（作为网格首项） -->
    <ClockTime />

    <!-- 应用图标网格 (使用 Tailwind/UnoCSS 原子类) -->
    <div role="list" aria-label="应用列表" class="gap-5 grid grid-cols-5">
      <div
        v-for="item in routes" :key="item.path" :aria-label="item.name" role="listitem"
        class="p-0 border-0 bg-transparent flex flex-col cursor-pointer items-center" @click="go(item.path)"
      >
        <div

          class="mb-2 rounded-[14px] bg-[#D8D8D8] flex h-[50px] w-[50px] select-none shadow-[0px_2px_5px_0px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-linear items-center justify-center overflow-hidden"
        >
          <van-image :src="item.icon" height="30" width="30" />
        </div>

        <div class="text-[10px] text-[#2D2D2D] font-semibold text-center truncate">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.page-home {
  -webkit-tap-highlight-color: transparent;
  background-image: url('@/assets/images/home-bg.png');
  background-position: center;
  background-size: cover;
  height: 100vh;
  --van-popup-background: none;
}
</style>
