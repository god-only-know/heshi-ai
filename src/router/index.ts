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
  const requiresAuth = to.path === '/' || to.name === 'home' || to.meta.requiresAuth

  if (requiresAuth && !isLogin()) {
    // 未登录，重定向到登录页
    NProgress.done()
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  // 如果已登录但没有用户信息，先获取用户信息
  if (isLogin() && !userStore.userInfo?.uid) {
    try {
      await userStore.info()
    }
    catch (error) {
      // 获取用户信息失败（比如token过期），会被request.ts的401拦截器处理
      NProgress.done()
      return false
    }
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    if (!isLogin()) {
      NProgress.done()
      return {
        name: 'Login',
        query: { redirect: to.fullPath },
      }
    }

    // 确保已获取用户信息
    if (!userStore.userInfo?.uid) {
      try {
        await userStore.info()
      }
      catch (error) {
        // 获取用户信息失败，会被request.ts的401拦截器处理
        NProgress.done()
        return false
      }
    }

    // 检查是否是管理员
    if (userStore.userInfo?.role !== 'admin') {
      NProgress.done()
      // 非管理员，重定向到首页并提示
      return {
        name: 'home',
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
export default router
