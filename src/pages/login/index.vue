<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { encryptWithRSA } from '@/utils/crypto'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const dark = ref<boolean>(isDark.value)

watch(
  () => isDark.value,
  (newMode) => {
    dark.value = newMode
  },
)

const postData = reactive({
  account: '',
  password: '',
})

const rules = reactive({
  account: [
    { required: true, message: t('login.pleaseEnterAccount') },
  ],
  password: [
    { required: true, message: t('login.pleaseEnterPassword') },
  ],
})

async function login() {
  try {
    loading.value = true
    // 使用RSA加密密码
    const encryptedPassword = encryptWithRSA(postData.password)
    await userStore.login({
      account: postData.account,
      password: encryptedPassword,
    })
    const { redirect, ...othersQuery } = router.currentRoute.value.query
    console.log('redirect:', redirect)

    // 登录成功后跳转
    if (redirect && typeof redirect === 'string') {
      // 如果有redirect参数，跳转到指定页面
      router.push({
        path: redirect,
        query: {
          ...othersQuery,
        },
      })
    }
    else {
      // 否则跳转到首页
      router.push({ name: 'home' })
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-4 text-center w-full">
    <div class="mb-12 mt-12">
      <h1 class="text-2xl font-bold">
        {{ $t('login.login') }}
      </h1>
    </div>

    <van-form :model="postData" :rules="rules" validate-trigger="onSubmit" @submit="login">
      <div class="rounded-3xl overflow-hidden">
        <van-field
          v-model="postData.account"
          :rules="rules.account"
          name="account"
          :placeholder="$t('login.account')"
        />
      </div>

      <div class="mt-16 rounded-3xl overflow-hidden">
        <van-field
          v-model="postData.password"
          type="password"
          :rules="rules.password"
          name="password"
          :placeholder="$t('login.password')"
        />
      </div>

      <div class="mt-16">
        <van-button
          :loading="loading"
          type="primary"
          native-type="submit"
          round block
        >
          {{ $t('login.login') }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>
