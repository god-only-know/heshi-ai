import { createRouter, createWebHistory } from 'vue-router'
import routers from './routers'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import type { EnhancedRouteLocation } from './types'
import { useRouteCacheStore, useUserStore } from '@/stores'

import { isLogin } from '@/utils/auth'
import setPageTitle from '@/utils/set-page-title'

NProgress.configure({ showSpinner: true, parent: '#app' })
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes: routers,
})

router.beforeEach(async (to: EnhancedRouteLocation) => {
  NProgress.start()

  const routeCacheStore = useRouteCacheStore()
  const userStore = useUserStore()

  // Route cache
  if (to.redirectedFrom) {
    routeCacheStore.addRoute(to.redirectedFrom)
  }
  routeCacheStore.addRoute(to)

  // Set page title
  setPageTitle(String(to?.name))

  // 检查是否需要登录
  const requiresAuth = to.path === '/' || to.name === 'home'

  if (requiresAuth && !isLogin()) {
    // 未登录，重定向到登录页
    NProgress.done()
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  if (isLogin() && !userStore.userInfo?.uid)
    await userStore.info()
})

router.afterEach(() => {
  NProgress.done()
})
export default router
