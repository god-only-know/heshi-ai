<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { encryptWithRSA } from '@/utils/crypto'

const router = useRouter()
const userStore = useUserStore()
const email = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const message = ref('')

async function handleLogin() {
  try {
    loading.value = true
    message.value = '正在登录...'

    // 暂时不加密，直接使用明文密码测试
    console.log('使用明文密码登录:', password.value)

    // 调用登录
    await userStore.login({
      email: email.value,
      password: password.value, // 直接使用明文密码
    })

    message.value = '登录成功！'
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1000)
  }
  catch (error: any) {
    message.value = `登录失败: ${error.message}`
    console.error('登录错误:', error)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="padding: 20px; max-width: 400px; margin: 0 auto;">
    <h1 style="text-align: center;">
      登录测试页面
    </h1>

    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px;">用户名:</label>
      <input
        v-model="email"
        type="text"
        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
      >
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px;">密码:</label>
      <input
        v-model="password"
        type="password"
        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
      >
    </div>

    <button
      :disabled="loading"
      style="width: 100%; padding: 12px; background: #1989fa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      @click="handleLogin"
    >
      {{ loading ? '登录中...' : '登录' }}
    </button>

    <div v-if="message" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px;">
      {{ message }}
    </div>

    <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 4px;">
      <strong>默认账号:</strong><br>
      用户名: admin<br>
      密码: admin123
    </div>
  </div>
</template>
