<script setup lang="ts">
import router from '@/router'
import { useUserStore } from '@/stores'
import defaultAvatar from '@/assets/images/default-avatar.svg'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isLogin = computed(() => !!userInfo.value.uid)

function login() {
  if (isLogin.value)
    return

  router.push({ name: 'Login', query: { redirect: 'Profile' } })
}
console.log('my')
</script>

<template>
  <div class="bg-white h-full">
    <VanCellGroup :inset="true">
      <van-cell center :is-link="!isLogin" @click="login">
        <template #title>
          <van-image :src="userInfo.avatar || defaultAvatar" round class="h-10 w-10" />
        </template>

        <template #value>
          <span v-if="isLogin">{{ userInfo.name }}</span>
          <span v-else>{{ $t('profile.login') }}</span>
        </template>
      </van-cell>
    </VanCellGroup>

    <VanCellGroup :inset="true" class="!mt-2">
      <van-cell :title="$t('profile.settings')" icon="setting-o" is-link to="/settings">
        <template #icon>
          <div class="i-carbon:settings text-gray-400 mr-5 self-center" />
        </template>
      </van-cell>
      <van-cell :title="$t('profile.docs')" is-link url="https://vue-zone.github.io/docs/heshi-ai/">
        <template #icon>
          <div class="i-carbon:doc text-gray-400 mr-5 self-center" />
        </template>
      </van-cell>
    </VanCellGroup>
  </div>
</template>
