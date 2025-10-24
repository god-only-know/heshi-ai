<script lang="ts" setup>
import useClochatStore from '@/stores/modules/clochat'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const clochatStore = useClochatStore()
const { chatList } = storeToRefs(clochatStore)
const route = useRoute()
const router = useRouter()

const chatRecords = ref<Clochat.ChatRecordItem[]>([])
const inputText = ref('')
const currentChat = ref({
  chat_id: '',
  friend_id: '',
})

// 获取聊天记录
function getCurrentChatRecord() {
  if (!currentChat.value.chat_id) {
    const chatItem = chatList.value?.[0]
    if (!chatItem)
      return showNotify({ type: 'danger', message: t('clochat.notify.noChat') })
    currentChat.value.chat_id = chatItem.chat_id
    currentChat.value.friend_id = chatItem.friend_id
  }
  const records = clochatStore.getChatRecordList(currentChat.value.chat_id)
  chatRecords.value = records
}
const currentFriendName = computed(() => {
  const data = clochatStore.getFriendItemById(currentChat.value.friend_id)
  return data?.friend_name || ''
})

async function handleSendMessage() {
  await clochatStore.addChatRecordItem({
    chat_id: currentChat.value.chat_id,
    type: 'user',
    content: inputText.value,
  })
  getCurrentChatRecord()
  inputText.value = ''
}

// 初始化
function initChat() {
  if (route.query.chat_id) {
    currentChat.value.chat_id = route.query.chat_id as string
    const chatItem = clochatStore.getChatItemById(currentChat.value.chat_id)
    currentChat.value.friend_id = chatItem.friend_id
  }
  getCurrentChatRecord()
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
    <NavBar :title="currentFriendName" left-arrow>
      <template #right>
        <van-icon name="ellipsis" size="20" @click="openMenu" />
      </template>
    </NavBar>
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
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
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
