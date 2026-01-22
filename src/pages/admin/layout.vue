<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { title: '用户管理', path: '/admin/users', icon: 'friends-o' },
  // 未来可以扩展更多菜单项
  // { title: '系统设置', path: '/admin/settings', icon: 'setting-o' },
]

const activeMenu = ref('/admin/users')

function handleMenuClick(path: string) {
  activeMenu.value = path
  router.push(path)
}

async function handleLogout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  })
    .then(async () => {
      await userStore.logout()
      router.replace('/login')
    })
    .catch(() => {})
}

// 监听路由变化更新activeMenu
watch(() => router.currentRoute.value.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })
</script>

<template>
  <div class="admin-layout flex flex-col h-screen">
    <!-- 顶部栏 -->
    <div class="top-bar bg-primary px-4 bg-black flex h-[50px] w-full shadow-md items-center justify-between">
      <div class="flex gap-3 items-center">
        <van-icon name="apps-o" size="24" color="#fff" />
        <span class="text-lg text-white font-bold">和识AI管理后台</span>
      </div>
      <div class="flex gap-3 items-center">
        <span class="text-sm text-white">{{ userStore.userInfo.nickname || userStore.userInfo.account }}</span>
        <van-button size="small" type="default" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏 -->
      <div class="sidebar border-r border-gray-200 bg-white w-[200px] shadow-md overflow-y-auto">
        <van-cell-group inset class="mt-2">
          <van-cell
            v-for="item in menuItems"
            :key="item.path"
            :title="item.title"
            :icon="item.icon"
            clickable
            :class="{ 'active-menu': activeMenu === item.path }"
            @click="handleMenuClick(item.path)"
          />
        </van-cell-group>
      </div>

      <!-- 内容区域 -->
      <div class="content p-4 bg-gray-50 flex-1 overflow-y-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.admin-layout {
  .sidebar {
    .active-menu {
      background-color: #f0f9ff;
      color: var(--van-primary-color);

      :deep(.van-cell__title) {
        color: var(--van-primary-color);
        font-weight: 600;
      }

      :deep(.van-icon) {
        color: var(--van-primary-color);
      }
    }
  }
}
</style>
