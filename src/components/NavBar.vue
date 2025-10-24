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
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
function onBack() {
  router.replace('/')
}
const title = computed(() => {
  return props.title || (route.meta?.title && t(route.meta?.title))
})
</script>

<template>
  <VanNavBar
    :title="title" :fixed="true" :left-arrow="props.leftArrow" placeholder clickable
    @click-left="onBack"
  >
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
