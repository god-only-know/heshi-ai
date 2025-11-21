<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouteCacheStore } from './stores'

const { t } = useI18n()

useHead({
  title: () => t('app.name'),
  meta: [
    {
      name: 'description',
      content: () => t('app.description'),
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#0B0A0A' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})

const routeCacheStore = useRouteCacheStore()

const keepAliveRouteNames = computed(() => {
  return toRaw(routeCacheStore.routeCaches)
})
const mode = computed(() => {
  return isDark.value ? 'dark' : 'light'
})
</script>

<template>
  <van-config-provider :theme="mode">
    <transition-group name="slide">
      <router-view v-slot="{ Component, route }">
        <transition name="slide">
          <section v-if="route.path" class="app-wrapper">
            <keep-alive :include="keepAliveRouteNames">
              <component
                :is="Component"
              />
            </keep-alive>
          </section>
        </transition>
      </router-view>
    </transition-group>
  </van-config-provider>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  position: relative;
  height: 100vh;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: absolute;
  width: 100%;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
