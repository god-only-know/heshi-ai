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
  email: '',
  password: '',
})

const rules = reactive({
  email: [
    { required: true, message: t('login.pleaseEnterEmail') },
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
      email: postData.email,
      password: encryptedPassword,
    })
    const { redirect, ...othersQuery } = router.currentRoute.value.query
    console.log('redirect:', redirect)
    router.push({
      path: redirect as string,
      query: {
        ...othersQuery,
      },
    })
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
          v-model="postData.email"
          :rules="rules.email"
          name="email"
          :placeholder="$t('login.email')"
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

    <GhostButton block to="register" class="mt-18">
      {{ $t('login.signUp') }}
    </GhostButton>

    <GhostButton block to="forgot-password">
      {{ $t('login.forgotPassword') }}
    </GhostButton>
  </div>
</template>
