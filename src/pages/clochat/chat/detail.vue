<script lang="ts" setup>
import * as api from '@/api'
import { useI18n } from 'vue-i18n'

// 定义组件属性
const props = defineProps<{
  chatId: string
}>()

// 定义组件事件
const emit = defineEmits<{
  back: []
}>()

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

// 获取聊天详情
async function fetchChatDetail() {
  if (!props.chatId) {
    return showNotify({ type: 'danger', message: t('clochat.notify.noChatId') })
  }

  try {
    loading.value = true
    const response = await api.getChatDetail(props.chatId)
    chatDetail.value = response?.result
  }
  catch (err) {
    console.error('获取聊天详情失败', err)
    showNotify({ type: 'danger', message: t('clochat.notify.fetchChatDetailFailed') })
  }
  finally {
    loading.value = false
  }
}

async function handleSendMessage() {
  if (!inputText.value.trim() || !chatDetail.value?.chat_id)
    return

  try {
    loading.value = true
    await api.addChatRecord({
      chat_id: chatDetail.value.chat_id,
      type: 'user',
      content: inputText.value,
    })
    await fetchChatDetail()
    inputText.value = ''
  }
  catch (err) {
    console.error('发送消息失败', err)
    showNotify({ type: 'danger', message: t('clochat.notify.sendMessageFailed') })
  }
  finally {
    loading.value = false
  }
}

// 返回聊天列表
function handleBack() {
  emit('back')
}

// 初始化
onMounted(() => {
  fetchChatDetail()
})

// 当chatId属性变化时重新获取数据
watch(() => props.chatId, (newChatId) => {
  if (newChatId) {
    fetchChatDetail()
  }
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar :title="chatDetail?.friend_name || '聊天'" left-arrow @click-left="handleBack">
      <template #right>
        <van-icon name="ellipsis" size="20" />
      </template>
    </NavBar>
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="mx-auto my-4" />
    <!-- 聊天记录列表 -->
    <div class="p-4 flex flex-grow flex-col gap-4 overflow-y-auto">
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
    </div>
    <!-- 对话输入框 -->
    <div class="p-2 border-t-1 border-t-white/10 border-t-solid flex">
      <van-field
        v-model="inputText"
        center
        placeholder="输入消息..."
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
