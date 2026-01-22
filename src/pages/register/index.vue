<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FieldRule } from 'vant'
import { showNotify } from 'vant'
import { useUserStore } from '@/stores'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const postData = reactive({
  account: '',
  code: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const validatorPassword = (val: string) => val === postData.password

const rules = reactive({
  account: [
    { required: true, message: t('register.pleaseEnterEmail') },
  ],
  code: [
    { required: true, message: t('register.pleaseEnterCode') },
  ],
  nickname: [
    { required: true, message: t('register.pleaseEnterNickname') },
  ],
  password: [
    { required: true, message: t('register.pleaseEnterPassword') },
  ],
  confirmPassword: [
    { required: true, message: t('register.pleaseEnterConfirmPassword') },
    { required: true, validator: validatorPassword, message: t('register.passwordsDoNotMatch') },
  ] as FieldRule[],
})

async function register() {
  try {
    loading.value = true

    const res = await userStore.register()

    if (res.code === 0) {
      showNotify({ type: 'success', message: t('register.registerSuccess') })
      router.push({ name: 'Login' })
    }
  }
  finally {
    loading.value = false
  }
}

const isGettingCode = ref(false)

const buttonText = computed(() => {
  return isGettingCode.value ? t('register.gettingCode') : t('register.getCode')
})

async function getCode() {
  if (!postData.account) {
    showNotify({ type: 'warning', message: t('register.pleaseEnterEmail') })
    return
  }

  isGettingCode.value = true
  const res = await userStore.getCode()
  if (res.code === 0)
    showNotify({ type: 'success', message: `${t('register.sendCodeSuccess')}: ${res.data}` })

  isGettingCode.value = false
}
</script>

<template>
  <div class="p-4 text-center w-full">
    <div class="mb-12 mt-12">
      <h1 class="text-2xl font-bold">
        {{ $t('login.register') }}
      </h1>
    </div>
    <van-form :model="postData" :rules="rules" validate-trigger="onSubmit" @submit="register">
      <div class="rounded-3xl overflow-hidden">
        <van-field
          v-model.trim="postData.account"
          :rules="rules.account"
          name="account"
          :placeholder="$t('register.account')"
        />
      </div>

      <div class="mt-16 rounded-3xl overflow-hidden">
        <van-field
          v-model.trim="postData.code"
          :rules="rules.code"
          name="code"
          :placeholder="$t('register.code')"
        >
          <template #button>
            <van-button size="small" type="primary" plain @click="getCode">
              {{ buttonText }}
            </van-button>
          </template>
        </van-field>
      </div>

      <div class="mt-16 rounded-3xl overflow-hidden">
        <van-field
          v-model.trim="postData.nickname"
          :rules="rules.nickname"
          name="nickname"
          :placeholder="$t('register.nickname')"
        />
      </div>

      <div class="mt-16 rounded-3xl overflow-hidden">
        <van-field
          v-model.trim="postData.password"
          type="password"
          :rules="rules.password"
          name="password"
          :placeholder="$t('register.password')"
        />
      </div>

      <div class="mt-16 rounded-3xl overflow-hidden">
        <van-field
          v-model.trim="postData.confirmPassword"
          type="password"
          :rules="rules.confirmPassword"
          name="confirmPassword"
          :placeholder="$t('register.confirmPassword')"
        />
      </div>

      <div class="mt-16">
        <van-button
          :loading="loading"
          type="primary"
          native-type="submit"
          round block
        >
          {{ $t('register.confirm') }}
        </van-button>
      </div>
    </van-form>

    <GhostButton to="login" block class="mt-18">
      {{ $t('register.backToLogin') }}
    </GhostButton>
  </div>
</template>
