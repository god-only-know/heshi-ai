<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouteCacheStore } from '@/stores'

defineOptions({
  name: 'Clochat',
})
const { t } = useI18n()
const tabs = [
  {
    path: '/clochat/chat',
    name: t('clochat.navbar.chat'),
    icon: 'i-carbon:chat',
  },
  {
    path: '/clochat/friend',
    name: t('clochat.navbar.friend'),
    icon: 'i-carbon:friendship',
  },
  {
    path: '/clochat/activity',
    name: t('clochat.navbar.activity'),
    icon: 'i-carbon:earth',
  },
  {
    path: '/clochat/my',
    name: t('clochat.navbar.my'),
    icon: 'i-carbon:user',
  },
]
const routeCacheStore = useRouteCacheStore()
const keepAliveRouteNames = computed(() => {
  return toRaw(routeCacheStore.routeCaches)
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <div class="flex flex-col h-[100vh] overflow-auto">
      <div class="flex-grow h-full">
        <keep-alive :include="keepAliveRouteNames">
          <component
            :is="Component"
          />
        </keep-alive>
      </div>
      <div v-if="!route.meta.noTab" class="h-[50px]">
        <TabBar :tabs="tabs" />
      </div>
    </div>
  </router-view>
</template>
