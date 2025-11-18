<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Overlay } from 'vant'
import ApiSetting from '@/components/ApiSetting/index.vue'
import { useEventListener } from '@vant/use'

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
  { name: 'Clochat', path: '/clochat' },
]

const items = computed(() =>
  routes.map((r) => {
    const label = t(`navbar.${r.name}`) || r.name
    const initials = String(label).trim().slice(0, 1)
    return { ...r, label, initials }
  }),
)

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

// 新增状态栏时间响应式数据
const currentTime = ref('')
const currentDate = ref('')

// 更新时间函数
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = `${now.getMonth() + 1}月${now.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
}

// 初始化时间并设置定时更新
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => {
    clearInterval(timer)
  })
})
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
    <!-- 下拉触发顶部 Overlay 面板（支持触摸与鼠标拖拽） -->
    <Overlay v-model:show="showOverlay" @click="closeOverlay">
      <div
        class="mx-auto p-5 pt-[34px] max-w-[720px] w-full shadow-md from-white to-slate-50 bg-gradient-to-b"
        @click.stop
      >
        <div class="flex gap-2 items-center">
          <van-button type="primary" :plain="!showApiSetting" size="small" class="px-3" @click="openApiSetting">
            {{ t('navbar.ApiSetting') }}
          </van-button>
          <van-button type="primary" :plain="!showApiSetting" size="small" class="px-3" @click="openApiSetting">
            {{ t('navbar.Settings') }}
          </van-button>
        </div>
        <!-- 如果 showApiSetting 为真则显示 ApiSetting 组件 -->
        <div v-if="showApiSetting" class="mt-10 border-t-1 border-[--van-border-color] flex-1">
          <ApiSetting />
        </div>
      </div>
    </Overlay>

    <!-- 时间小部件（作为网格首项） -->
    <div class="mb-8 mt-4 px-8 py-4 rounded-2xl bg-white/60 col-span-5 backdrop-blur-[100%]">
      <div class="text-[30px] font-medium">
        {{ currentTime }}
      </div>
      <div class="text-[12px] opacity-80">
        {{ currentDate }}
      </div>
    </div>

    <!-- 应用图标网格 (使用 Tailwind/UnoCSS 原子类) -->
    <div role="list" aria-label="应用列表" class="gap-5 grid grid-cols-5">
      <div
        v-for="item in items" :key="item.name" :aria-label="item.label" role="listitem"
        class="p-0 border-0 bg-transparent flex flex-col cursor-pointer items-center" @click="go(item.path)"
      >
        <div
          class="mb-2 rounded-[14px] bg-[#f0f2f5] flex h-[50px] w-[50px] select-none shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-linear items-center justify-center overflow-hidden"
        >
          <span class="text-[22px] text-slate-700 font-semibold">{{ item.initials }}</span>
        </div>
        <div class="text-[14px] text-white/70 text-center truncate">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-home {
  -webkit-tap-highlight-color: transparent;
  background-image: url('@/assets/images/home-bg.png');
  background-position: center;
  background-size: cover;
  height: 100vh;
}
</style>
