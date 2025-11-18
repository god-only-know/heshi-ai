<script setup lang="ts">
import { useI18n } from 'vue-i18n'

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
</script>

<template>
  <div class="pb-[50px] flex flex-col h-[100vh] overflow-auto">
    <div class="flex-grow h-full">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            v-if="route.meta.keepAlive"
            :key="route.name"
          />
        </keep-alive>
        <component
          :is="Component"
          v-if="!route.meta.keepAlive"
          :key="route.name"
        />
      </router-view>
    </div>
    <TabBar :tabs="tabs" />
  </div>
</template>
