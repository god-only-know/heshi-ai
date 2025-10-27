<script lang="ts" setup>
import * as api from '@/api'
// import useClochatStore from '@/stores/modules/clochat'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// const clochatStore = useClochatStore()
const route = useRoute()
const router = useRouter()

// 使用ref存储数据
const chatList = ref<Clochat.ChatItem[]>([])
const chatRecords = ref<Clochat.ChatRecordItem[]>([])
// const currentFriend = ref<Clochat.FriendItem | null>(null)
const inputText = ref('')
const currentChat = ref({
  chat_id: '',
  friend_id: '',
  friend_name: '',
  friend_avatar: '',
})
const loading = ref(false)

// 获取聊天列表
async function fetchChatList() {
  try {
    loading.value = true
    const response = await api.getChats()
    chatList.value = response?.result || []
  }
  catch (err) {
    console.error('获取聊天列表失败', err)
    showNotify({ type: 'danger', message: t('clochat.notify.fetchChatsFailed') })
  }
  finally {
    loading.value = false
  }
}

// 获取好友信息
// async function fetchFriendInfo(friendId: string) {
//   try {
//     loading.value = true
//     const response = await api.getFriendById(friendId)
//     currentFriend.value = response?.result || null
//   }
//   catch (err) {
//     console.error('获取好友信息失败', err)
//   }
//   finally {
//     loading.value = false
//   }
// }

// 获取聊天记录
async function getCurrentChatRecord() {
  if (!currentChat.value.chat_id) {
    if (chatList.value.length === 0) {
      await fetchChatList()
    }

    const chatItem = chatList.value?.[0]
    if (!chatItem)
      return showNotify({ type: 'danger', message: t('clochat.notify.noChat') })

    currentChat.value.chat_id = chatItem.chat_id
    currentChat.value.friend_id = chatItem.friend_id
  }

  try {
    loading.value = true
    const response = await api.getChatRecords(currentChat.value.chat_id)
    chatRecords.value = response?.result || []
  }
  catch (err) {
    console.error('获取聊天记录失败', err)
    showNotify({ type: 'danger', message: t('clochat.notify.fetchRecordsFailed') })
  }
  finally {
    loading.value = false
  }
}

async function handleSendMessage() {
  if (!inputText.value.trim())
    return

  try {
    loading.value = true
    await api.addChatRecord({
      chat_id: currentChat.value.chat_id,
      type: 'user',
      content: inputText.value,
    })
    await getCurrentChatRecord()
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

// 初始化
async function initChat() {
  if (route.query.chat_id) {
    currentChat.value.chat_id = route.query.chat_id as string

    try {
      loading.value = true
      const response = await api.getChatById(currentChat.value.chat_id)
      const chatItem = response?.result

      if (chatItem) {
        currentChat.value.friend_id = chatItem.friend_id
        currentChat.value.friend_id = chatItem.friend_name
      }
    }
    catch (err) {
      console.error('获取聊天信息失败', err)
    }
    finally {
      loading.value = false
    }
  }

  await getCurrentChatRecord()
}
function openMenu() {
  router.push({
    name: 'friend',
  })
}
onActivated(() => {
  initChat()
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar :title="currentChat.friend_name" left-arrow>
      <template #right>
        <van-icon name="ellipsis" size="20" @click="openMenu" />
      </template>
    </NavBar>
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="mx-auto my-4" />
    <!-- 聊天列表 -->
    <div class="p-4 flex flex-grow flex-col gap-4 overflow-y-auto">
      <div v-for="chat in chatRecords" :key="chat.chat_record_id">
        <div v-if=" chat.type === 'user'" class="flex flex-row-reverse w-full">
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
            :src="currentChat.friend_avatar"
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
