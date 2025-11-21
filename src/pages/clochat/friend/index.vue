<script lang="ts" setup>
import api from '@/api/index'
import router from '@/router'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Friend',
})
const { t } = useI18n()

// 使用ref存储数据
const friendList = ref<Clochat.FriendItem[]>([])
const loading = ref(false)

// 获取好友列表
async function fetchFriendList() {
  try {
    loading.value = true
    const response = await api.getFriends()
    friendList.value = response?.result || []
  }
  catch (err) {
    console.error('获取好友列表失败', err)
  }
  finally {
    loading.value = false
  }
}

// 处理发送聊天
async function handleSendChat(friend_id: string) {
  try {
    loading.value = true

    // 先查询是否已有聊天
    const chatResponse = await api.getChatByFriendId(friend_id)
    let chatItem = chatResponse?.result

    // 如果没有聊天，则创建新聊天
    if (!chatItem) {
      const newChatResponse = await api.addChat({
        friend_id,
      })
      chatItem = newChatResponse?.result
    }
    if (chatItem) {
      router.push({
        path: '/clochat/chat',
        query: {
          chat_id: chatItem.chat_id,
        },
      })
    }
    else {
      showNotify({ type: 'danger', message: t('clochat.notify.createChatFailed') })
    }
  }
  catch (err) {
    console.error('创建聊天失败', err)
    showNotify({ type: 'danger', message: t('clochat.notify.createChatFailed') })
  }
  finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  await fetchFriendList()
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar left-arrow />
    <div class="p-4 border-b-1 border-b-black/10 border-b-solid">
      <van-button
        type="primary" icon="plus"
        class="w-full"
      >
        导入角色
      </van-button>
    </div>
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="mx-auto my-4" />
    <div class="p-2 h-full overflow-y-auto">
      <div v-for="item in friendList" :key="item.friend_id" class="p-2 border-b-1 border-b-black/10 border-b-solid flex" @click="handleSendChat(item.friend_id)">
        <van-image
          width="2.5rem"
          height="2.5rem"
          :src="item.friend_avatar"
        />
        <div class="ml-4 flex flex-col">
          <div class="text-[14px]">
            {{ item.friend_name }}
          </div>
          <div class="text-[12px] text-black/50 mt-auto">
            {{ item.friend_introduce }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
