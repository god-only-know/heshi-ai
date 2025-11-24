<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showToast } from 'vant'
import api from '@/api/index'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 获取路由参数
const chatId = ref(route.query.chatId as string)
const chatDetail = ref<Api.Clochat.getChatDetailResult>({
  chat_id: '',
  create_time: 0,
  friend_id: '',
  friend_name: '',
  friend_avatar: '',
})
const loading = ref(false)

// 获取聊天详情
async function fetchChatDetail() {
  if (!chatId.value) {
    showToast(t('clochat.notify.noChat'))
    return handleBack()
  }

  try {
    loading.value = true
    const response = await api.getChatDetail(chatId.value)
    chatDetail.value = response?.result
  }
  catch (err) {
    console.error(err)
    showToast(err.message)
    handleBack()
  }
  finally {
    loading.value = false
  }
}

// 返回上一页
function handleBack() {
  router.back()
}

// 查看聊天历史
function viewChatHistory() {
  // 这里可以实现查看聊天历史的功能，例如跳转到历史记录页面
  showToast(`${t('clochat.settings.viewHistory')}功能待实现`)
}

// 绑定世界书
function bindWorldBook() {
  // 这里可以实现绑定世界书的功能
  showToast(`${t('clochat.settings.bindWorldBook')}功能待实现`)
}

// 拉黑好友
function blockFriend() {
  showConfirmDialog({
    title: t('clochat.settings.blockConfirm'),
    message: t('clochat.settings.blockConfirmMessage', { name: chatDetail.value.friend_name }),
  }).then(async () => {
    try {
      // 这里可以调用拉黑好友的API
      // 由于目前没有拉黑API，这里只是模拟
      showToast(t('clochat.settings.blockSuccess'))
      handleBack()
    }
    catch (error) {
      console.error(error)
      showToast(t('clochat.settings.operationFailed'))
    }
  }).catch(() => {
    // 取消操作
  })
}

// 初始化
onMounted(() => {
  fetchChatDetail()
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar :title="t('clochat.settings.title')" left-arrow @click-left-button="handleBack" />

    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <van-loading />
    </div>

    <div v-else class="p-4 flex flex-col h-full">
      <!-- 角色信息 -->
      <div class="mb-6 flex items-center">
        <van-image
          :src="chatDetail.friend_avatar"
          width="4rem"
          height="4rem"
          round
          class="mr-3"
        />
        <div>
          <div class="text-lg font-bold">
            {{ chatDetail.friend_name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ chatDetail.friend_introduce || t('clochat.settings.noIntroduce') }}
          </div>
        </div>
      </div>

      <!-- 操作按钮列表 -->
      <div class="flex flex-1 flex-col space-y-3">
        <van-cell :title="t('clochat.settings.viewHistory')" is-link @click="viewChatHistory" />
        <van-cell :title="t('clochat.settings.bindWorldBook')" is-link @click="bindWorldBook" />
        <van-cell :title="t('clochat.settings.block')" is-link class="text-red-500" @click="blockFriend" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.van-cell) {
  padding: 16px 0;
  border-bottom: 1px solid rgba(200, 200, 200, 0.3);
  margin: 0 16px;
}
</style>
