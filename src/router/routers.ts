import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/index.vue'),
  },
  {
    path: '/clochat',
    name: 'Clochat',
    component: () => import('@/pages/clochat/index.vue'),
    meta: {
      keepAlive: true,
    },
    redirect: '/clochat/chat',
    children: [
      {
        path: '/clochat/chat',
        name: 'Chat',
        meta: {
          title: 'clochat.navbar.chat',
          keepAlive: true,
        },
        component: () => import('@/pages/clochat/chat/index.vue'),
      },
      {
        path: '/clochat/chat/:id',
        name: 'ChatDetail',
        meta: {
          title: 'clochat.navbar.chatDetail',
          keepAlive: true,
          noTab: true,
        },
        component: () => import('@/pages/clochat/chat/detail.vue'),
      },
      {
        path: '/clochat/friend',
        name: 'Friend',
        meta: {
          title: 'clochat.navbar.friend',
          keepAlive: true,
        },
        component: () => import('@/pages/clochat/friend/index.vue'),
      },
      {
        path: '/clochat/activity',
        name: 'Activity',
        meta: {
          title: 'clochat.navbar.activity',
          keepAlive: true,
        },
        component: () => import('@/pages/clochat/activity/index.vue'),
      },
      {
        path: '/clochat/my',
        name: 'My',
        meta: {
          title: 'clochat.navbar.my',
          keepAlive: true,
        },
        component: () => import('@/pages/clochat/my/index.vue'),
      },
    ],
  },
  {
    path: '/charts',
    component: () => import('@/pages/charts/index.vue'),
  },
  {
    path: '/counter',
    component: () => import('@/pages/counter/index.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/login-test',
    name: 'LoginTest',
    component: () => import('@/pages/login-test/index.vue'),
  },
  {
    path: '/forgot-password',
    component: () => import('@/pages/forgot-password/index.vue'),
  },
  {
    path: '/mock',
    component: () => import('@/pages/mock/index.vue'),
  },
  {
    path: '/register',
    component: () => import('@/pages/register/index.vue'),
  },
  {
    path: '/scroll-cache',
    component: () => import('@/pages/scroll-cache/index.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/pages/settings/index.vue'),
  },
  {
    path: '/unocss',
    component: () => import('@/pages/unocss/index.vue'),
  },
]
export default routers
