<script lang="ts" setup>
import api from '@/api/index'
import moment from 'moment'

const router = useRouter()
// 使用ref存储数据
const chatList = ref<Clochat.ChatItem []>([])
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
  }
  finally {
    loading.value = false
  }
}

// 处理点击聊天项
function handleChatItemClick(chatId: string) {
  router.push(`/clochat/chat/${chatId}`)
}

// 当组件被激活时刷新数据
onActivated(() => {
  fetchChatList()
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar title="对话" left-arrow />
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="mx-auto my-4" />

    <!-- 聊天列表 -->
    <div class="p-2 h-full overflow-y-auto">
      <div
        v-for="chat in chatList"
        :key="chat.chat_id"
        class="p-3 border-b-1 border-b-black/10 border-b-solid flex items-center"
        @click="handleChatItemClick(chat.chat_id)"
      >
        <van-image
          width="3rem"
          height="3rem"
          :src="chat.friend_avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          class="flex-shrink-0"
        />
        <div class="ml-3 flex flex-1 flex-col overflow-hidden">
          <div class="flex items-center justify-between">
            <div class="text-[16px] font-medium">
              {{ chat.friend_name || '未知好友' }}
            </div>
            <div v-if="chat.last_message_time" class="text-[12px] text-black/40">
              {{ moment(chat.last_message_time).format('MM月DD日 HH:mm') }}
            </div>
          </div>
          <div class="text-[14px] text-black/60 mt-1 truncate">
            {{ chat.last_message || '暂无消息' }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="chatList.length === 0 && !loading" class="text-black/40 p-4 text-center">
        暂无聊天记录，请先添加好友
      </div>
    </div>
  </div>
</template>
