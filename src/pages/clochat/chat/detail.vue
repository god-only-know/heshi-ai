<script lang="ts" setup>
import api from '@/api/index'
import { useI18n } from 'vue-i18n'
import useApiSettingStore from '@/stores/modules/apiSetting'
import ChatSettings from '@/components/ChatSettings/index.vue'
import { addChatRecord, getChatRecordsPaginated } from '@/api/clochat'
import type { ChatRecordsPaginatedParams } from '@/api/clochat'
import moment from 'moment'

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

// 缓冲区相关
const bufferMessageIds = ref<string[]>([])
const typingTimer = ref<number | null>(null)
const TYPING_DELAY = 2000 // 用户停止输入2秒后发送消息

// 分页加载相关
const chatRecordsParams = ref<ChatRecordsPaginatedParams>({
  chatId: '',
  page: 1,
  pageSize: 20,
})
const isLoadingMore = ref(false)
const hasMoreHistory = ref(false)
const isFirstLoad = ref(true)
const chatId = route.params.id as string
// 获取聊天详情
async function fetchChatDetail() {
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

// 添加消息到缓冲区
async function addMessageToBuffer() {
  if (loading.value) {
    showNotify({ type: 'danger', message: t('clochat.notify.sending') })
    return
  }

  const user_message = inputText.value.trim()
  if (user_message === '') {
    showNotify({ type: 'danger', message: t('clochat.notify.noMessage') })
    return
  }

  try {
    // 清空输入框
    inputText.value = ''

    // 添加消息到数据库，标记为未读
    const response = await addChatRecord({
      chat_id: chatDetail.value.chat_id,
      content: user_message,
      type: 'user',
      is_read: false,
    })

    // 将消息ID添加到缓冲区
    if (response?.result) {
      bufferMessageIds.value.push(response.result.chat_record_id)

      // 添加到UI显示
      chatDetail.value.record_list.push({
        chat_record_id: response.result.chat_record_id,
        content: user_message,
        type: 'user',
        create_time: response.result.create_time,
      })

      scroolBottom()
    }

    // 重置输入监控
    resetTypingTimer()
  }
  catch (err) {
    console.error(err)
    showNotify({ type: 'danger', message: t('clochat.notify.sendMessageFailed') })
  }
}

// 发送缓冲区内的所有消息
async function sendBufferedMessages() {
  if (loading.value || bufferMessageIds.value.length === 0)
    return

  try {
    loading.value = true

    // 发送消息并标记为已读
    await api.sendMessage({
      setting_id: setting_id.value,
      chat_id: chatDetail.value.chat_id,
      user_message: '', // 不再通过这个字段发送消息
      message_ids: bufferMessageIds.value,
    })

    // 清空缓冲区
    bufferMessageIds.value = []

    // 刷新聊天详情
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

// 重置输入监控计时器
function resetTypingTimer() {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}
// 监控用户输入
function handleUserTyping() {
  if (bufferMessageIds.value.length > 0) {
  // 清除之前的计时器
    resetTypingTimer()

    // 设置新的计时器
    typingTimer.value = setTimeout(() => {
    // 如果缓冲区有消息，发送它们
      sendBufferedMessages()
    }, TYPING_DELAY) as unknown as number
  }
}

// 处理发送按钮点击
async function handleSendMessage() {
  await addMessageToBuffer()
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
onBeforeRouteLeave(() => {
  resetTypingTimer()
  sendBufferedMessages()
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
  }
  scroolBottom()
}, { immediate: false }) // 设置immediate为false，避免初始化时重复调用
</script>

<template>
  <div class="mx-auto bg-white flex flex-col h-full max-w-[375px] w-full inset-0 fixed z-50">
    <NavBar :title="chatDetail?.friend_name" left-arrow @click-left-button="handleBack">
      <template #right>
        <van-icon name="ellipsis" color="#ABB0BF" size="20" @click="openSettings" />
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
      <div v-for="(chat, index) in chatDetail.record_list" :key="chat.chat_record_id">
        <div v-if="chat.type === 'user'" class="flex flex-row-reverse w-full">
          <van-image
            width="2.5rem"
            height="2.5rem"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            round
          />
          <div class="text-base text-[#606A82] leading-normal mr-2 px-3 py-2 rounded-2 bg-[#E5E5E5] flex flex-wrap max-w-[70%] break-all text-pretty items-center">
            {{ chat.content }}
          </div>
          <div class="text-xs text-[#a6a6a699] mr-2 self-center">
            {{ moment(chat.create_time).format('HH:mm') }}
          </div>
        </div>
        <div v-else class="flex flex-row w-full">
          <van-image
            width="2.5rem"
            height="2.5rem"
            :src="chatDetail?.friend_avatar"
            round
          />
          <div class="text-base text-[#606A82] leading-normal ml-2 px-3 py-2 rounded-2 bg-[#F0F4FE] flex flex-wrap max-w-[70%] break-all text-pretty items-center">
            {{ chat.content }}
          </div>
          <div class="text-xs text-[#a6a6a699] ml-2 self-center">
            {{ moment(chat.create_time).format('HH:mm') }}
          </div>
        </div>
        <div v-if="chat.type === 'user' && chatDetail.record_list[index + 1]?.type !== 'user'" class="text-sm text-[#68646C] mr-12 flex items-center justify-end">
          <template v-if="chat.is_read">
            <div class="i-carbon:checkmark-filled text-[10px] mr-0.5" />
            {{ t('clochat.chat.isRead') }}
          </template>
          <template v-else>
            <div class="i-carbon:circle-outline text-[10px] mr-0.5" />
            {{ t('clochat.chat.isNotRead') }}
          </template>
        </div>
      </div>
      <!-- 加载状态 -->
      <van-loading v-if="loading" class="mx-auto my-4" />
    </div>
    <!-- 对话输入框 -->
    <div class="border-t-1 border-t-[#E8EAF3] border-t-solid flex flex-shrink-0 items-center">
      <van-field
        v-model="inputText"
        center
        :border="false"
        :placeholder="t('clochat.chat.inputPlaceholder')"
        class="!px-3 !py-4"
        @keypress.enter="handleSendMessage"
        @input="handleUserTyping"
      >
        <template #left-icon>
          <div class="i-carbon:add-filled text-[#ABB0BF] mr-1 h-6 w-6" />
        </template>
        <template #button>
          <div class="flex items-center">
            <div class="i-carbon:face-satisfied text-[#ABB0BF] ml-1 h-6 w-6" />
            <div class="i-carbon:send-filled text-[#ABB0BF] ml-1 h-6 w-6" @click="handleSendMessage" />
          </div>
        </template>
      </van-field>
    </div>
  </div>
</template>

<style scoped>
.a {
  flex-direction: row-reverse;
}
</style>
