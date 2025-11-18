<script lang="ts" setup>
import api from '@/api/index'
import { useI18n } from 'vue-i18n'
import useApiSettingStore from '@/stores/modules/apiSetting'
import { v4 } from 'uuid'
import ChatSettings from '@/components/ChatSettings/index.vue'
import { getChatRecordsPaginated } from '@/api/clochat'
import type { ChatRecordsPaginatedParams } from '@/api/clochat'

const route = useRoute()
const router = useRouter()
const apiSettingStore = useApiSettingStore()
const { t } = useI18n()

// 使用ref存储数据
const chatDetail = ref<Api.Clochat.getChatDetailResult>({
  chat_id: '',
  create_time: 0,
  friend_id: '',
  friend_name: '',
  friend_avatar: '',
  record_list: [],
})
const inputText = ref('')
const loading = ref(false)
const setting_id = ref('')
const historyListRef = ref<HTMLElement | null>(null)
const showSettings = ref(false)

// 分页加载相关
const chatRecordsParams = ref<ChatRecordsPaginatedParams>({
  chatId: '',
  page: 1,
  pageSize: 20,
})
const isLoadingMore = ref(false)
const hasMoreHistory = ref(false)
const isFirstLoad = ref(true)

// 获取聊天详情
async function fetchChatDetail() {
  const chatId = route.params.id as string
  if (!chatId) {
    return showNotify({ type: 'danger', message: t('clochat.notify.noChat') })
  }

  try {
    loading.value = true
    const response = await api.getChatDetail(chatId)
    chatDetail.value = response?.result

    // 设置聊天ID
    chatRecordsParams.value.chatId = chatId

    // 获取聊天记录
    await fetchChatRecords()
  }
  catch (err) {
    console.error(err)
    showNotify({ type: 'danger', message: err.message })
  }
  finally {
    loading.value = false
  }
}

// 获取聊天记录
async function fetchChatRecords() {
  if (!chatRecordsParams.value.chatId)
    return

  try {
    const response = await getChatRecordsPaginated(chatRecordsParams.value)
    if (response?.result) {
      const { records, hasMore } = response.result

      // 如果是第一页，直接替换记录列表
      if (chatRecordsParams.value.page === 1) {
        chatDetail.value.record_list = records
      }
      else {
        // 否则将新加载的记录添加到列表前面
        chatDetail.value.record_list = [...records, ...chatDetail.value.record_list]
      }

      // 更新是否有更多历史记录
      hasMoreHistory.value = hasMore
      isFirstLoad.value = false
    }
  }
  catch (err) {
    console.error('获取聊天记录失败', err)
  }
}

// 加载更多历史记录
async function loadMoreHistory() {
  if (isLoadingMore.value || !hasMoreHistory.value)
    return

  try {
    isLoadingMore.value = true

    // 增加页码
    chatRecordsParams.value.page = (chatRecordsParams.value.page || 1) + 1

    const response = await getChatRecordsPaginated(chatRecordsParams.value)
    if (response?.result) {
      const { records, hasMore } = response.result

      // 将新加载的记录添加到列表前面
      chatDetail.value.record_list = [...records, ...chatDetail.value.record_list]

      // 更新是否有更多历史记录
      hasMoreHistory.value = hasMore
    }
  }
  catch (err) {
    console.error('加载更多历史记录失败', err)
    // 恢复页码
    chatRecordsParams.value.page = (chatRecordsParams.value.page || 2) - 1
  }
  finally {
    isLoadingMore.value = false
  }
}

async function getModelId() {
  if (!apiSettingStore?.getMainChatModelId()) {
    await apiSettingStore.getModelSetting()
  }
  setting_id.value = apiSettingStore?.getMainChatModelId()
}

async function handleSendMessage() {
  if (!chatDetail.value?.chat_id || loading.value)
    return

  try {
    const user_message = inputText.value.trim()
    inputText.value = ''
    loading.value = true
    if (user_message !== '') {
      chatDetail.value.record_list.push({
        chat_record_id: v4(),
        content: user_message,
        type: 'user',
      })
    }
    scroolBottom()
    await api.sendMessage({
      setting_id: setting_id.value,
      chat_id: chatDetail.value.chat_id,
      user_message,
    })
    await fetchChatDetail()
  }
  catch (err) {
    console.error(err)
    showNotify({ type: 'danger', message: t('clochat.notify.sendMessageFailed') })
  }
  finally {
    loading.value = false
  }
}

function scroolBottom() {
  historyListRef.value?.scrollTo({
    top: historyListRef.value.scrollHeight,
  })
}

// 返回聊天列表
function handleBack() {
  router.push('/clochat/chat')
}

// 打开设置弹窗
function openSettings() {
  showSettings.value = true
}

// 关闭设置弹窗
function closeSettings() {
  showSettings.value = false
}

// 刷新聊天详情
function refreshChatDetail() {
  fetchChatDetail()
}

// 初始化
onMounted(async () => {
  getModelId()
  await fetchChatDetail()
  scroolBottom()
  // 添加下拉刷新事件监听
  if (historyListRef.value) {
    historyListRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  // 移除事件监听
  if (historyListRef.value) {
    historyListRef.value.removeEventListener('scroll', handleScroll)
  }
})

// 处理滚动事件
function handleScroll() {
  if (!historyListRef.value)
    return

  // 当滚动到顶部时，加载更多历史记录
  if (historyListRef.value.scrollTop === 0 && hasMoreHistory.value && !isLoadingMore.value) {
    loadMoreHistory()
  }
}

// 当路由参数变化时重新获取数据
watch(() => route.params.id, async (newId) => {
  // 只有当ID真正变化时才重新获取数据
  if (newId && newId !== chatRecordsParams.value.chatId) {
    // 重置分页参数
    chatRecordsParams.value = {
      chatId: newId as string,
      page: 1,
      pageSize: 20,
    }
    await fetchChatDetail()
    scroolBottom()
  }
}, { immediate: false }) // 设置immediate为false，避免初始化时重复调用
</script>

<template>
  <div class="mx-auto bg-white flex flex-col h-full max-w-[375px] w-full inset-0 fixed z-50">
    <NavBar :title="chatDetail?.friend_name" left-arrow @click-left-button="handleBack">
      <template #right>
        <van-icon name="ellipsis" size="20" @click="openSettings" />
      </template>
    </NavBar>

    <!-- 聊天设置组件 -->
    <ChatSettings
      :visible="showSettings"
      :chat-detail="chatDetail"
      @close="closeSettings"
      @refresh="refreshChatDetail"
    />
    <!-- 聊天记录列表 -->
    <div ref="historyListRef" class="p-4 flex flex-grow flex-col gap-4 overflow-y-auto">
      <!-- 加载更多提示 -->
      <div v-if="hasMoreHistory && chatDetail.record_list.length > 0" class="py-2 text-center">
        <van-loading v-if="isLoadingMore" size="24px" />
        <div v-else class="text-sm text-gray-500" @click="loadMoreHistory">
          {{ t('clochat.chat.loadMore') }}
        </div>
      </div>
      <div v-for="chat in chatDetail.record_list" :key="chat.chat_record_id">
        <div v-if="chat.type === 'user'" class="flex flex-row-reverse w-full">
          <van-image
            width="2.5rem"
            height="2.5rem"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            class="flex-shrink-0"
          />
          <div class="text-base text-white mr-2 px-3 py-1.5 rounded-2 bg-[#07C160] flex flex-wrap max-w-[70%] break-all text-pretty items-center">
            {{ chat.content }}
          </div>
        </div>
        <div v-else class="flex flex-row w-full">
          <van-image
            width="2.5rem"
            height="2.5rem"
            :src="chatDetail?.friend_avatar"
            class="flex-shrink-0"
          />
          <div class="text-base text-white ml-2 px-3 py-1.5 rounded-2 bg-[#777] flex flex-wrap max-w-[70%] break-all text-pretty items-center">
            {{ chat.content }}
          </div>
        </div>
      </div>
      <!-- 加载状态 -->
      <van-loading v-if="loading" class="mx-auto my-4" />
    </div>
    <!-- 对话输入框 -->
    <div class="p-2 border-t-1 border-t-white/10 border-t-solid flex flex-shrink-0">
      <van-field
        v-model="inputText"
        center
        :placeholder="t('clochat.chat.inputPlaceholder')"
        @keypress.enter="handleSendMessage"
      />
      <div
        class="ml-2 flex-shrink-0"
      >
        <van-button
          type="primary"
          icon="edit"
          @click="handleSendMessage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.a {
  flex-direction: row-reverse;
}
</style>
