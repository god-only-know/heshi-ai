import { defineStore } from 'pinia'
import type { EnhancedRouteLocation } from '@/router/types'
import type { RouteLocationGeneric } from 'vue-router'

const useRouteCacheStore = defineStore('route-cache', () => {
  const routeCaches = ref<string[]>([])

  const addRoute = (route: EnhancedRouteLocation | RouteLocationGeneric) => {
    if (routeCaches.value.includes(String(route.name)))
      return

    if (route?.meta?.keepAlive)
      routeCaches.value.push(String(route.name))
  }

  return {
    routeCaches,
    addRoute,
  }
})

export default useRouteCacheStore
