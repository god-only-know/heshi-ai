<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface NavBarProps {
  leftArrow?: boolean
  rightArrow?: boolean
  title?: string
}

const props = withDefaults(defineProps<NavBarProps>(), {
  leftArrow: false,
  rightArrow: false,
  title: '',
})
const attrs = useAttrs()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
function onBack() {
  // 如果父组件传递了事件，优先执行父组件逻辑
  if ('onClickLeftButton' in attrs && typeof attrs.onClickLeftButton === 'function') {
    // 触发父组件传递的事件（注意：Vue 会将事件名转为驼峰式）
    attrs.onClickLeftButton()
  }
  else {
    // 否则执行默认逻辑
    router.replace('/')
  }
}
const title = computed(() => {
  return props.title ?? (route.meta?.title && t(route.meta?.title))
})
</script>

<template>
  <VanNavBar
    :title="title" :left-arrow="props.leftArrow" placeholder clickable
    @click-left="onBack"
  >
    <template v-if="props.leftArrow" #left>
      <slot name="left" />
      <van-icon name="arrow-left" color="#ABB0BF" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </VanNavBar>
</template>

<!-- <style lang="less">
:root {
  --van-nav-bar-background: rgba(28, 28, 28, 0.8);
  --van-nav-bar-text-color: #fff;
  --van-nav-bar-icon-color: #fff;
  --van-nav-bar-title-text-color: #fff;
}
</style> -->
