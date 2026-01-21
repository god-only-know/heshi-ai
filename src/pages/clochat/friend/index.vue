<script lang="ts" setup>
import api from '@/api/index'
import router from '@/router'
import { useI18n } from 'vue-i18n'
import { showFailToast } from 'vant'
import CreateFriendDialog from '@/components/Clochat/CreateFriendDialog/index.vue'

defineOptions({
  name: 'Friend',
})
const { t } = useI18n()

// 使用ref存储数据
const friendList = ref<Clochat.FriendItem[]>([])
const loading = ref(false)
const showMenu = ref(false)
const showCreateDialog = ref(false)
const menuActions = [
  { text: '好友申请', icon: 'friends-o', handler: handleFriendRequest },
  { text: '世界书', icon: 'bookmark-o', handler: handleWorldBook },
  { text: '设置', icon: 'setting-o', handler: handleSettings },
]
const menuButtonRef = ref<HTMLElement | null>(null)

// 处理菜单选项点击
function handleMenuClick(action: { text: string, icon: string, handler: () => void }) {
  showMenu.value = false
  action.handler()
}

// 好友申请
function handleFriendRequest() {

}

// 世界书
function handleWorldBook() {
  router.push('/clochat/world-book')
}

// 设置
function handleSettings() {
  router.push('/clochat/settings')
}

// 打开创建角色对话框
function handleOpenCreateDialog() {
  showCreateDialog.value = true
}

// 处理角色创建成功
function handleFriendCreated() {
  // 刷新好友列表
  fetchFriendList()
}

// 获取好友列表
async function fetchFriendList() {
  try {
    loading.value = true
    const response = await api.getFriends()
    friendList.value = response?.data || []
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
    let chatItem = chatResponse?.data

    // 如果没有聊天，则创建新聊天
    if (!chatItem) {
      const newChatResponse = await api.addChat({
        friend_id,
      })
      chatItem = newChatResponse?.data
    }
    if (chatItem) {
      router.push({
        path: `/clochat/chat/${chatItem.chat_id}`,
      })
    }
    else {
      showFailToast(t('clochat.friend.createChatRecordFailed'))
    }
  }
  catch (err) {
    console.error('创建聊天失败', err)
    showFailToast(t('clochat.friend.createChatRecordFailed'))
  }
  finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 获取好友列表
  await fetchFriendList()
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <NavBar title="好友" left-arrow>
      <template #right>
        <div class="flex items-center">
          <div class="mr-4" @click="handleOpenCreateDialog">
            <van-icon name="plus" color="#ABB0BF" size="20" />
          </div>
          <div ref="menuButtonRef" @click="showMenu = true">
            <van-icon name="ellipsis" color="#ABB0BF" size="20" />
          </div>
        </div>
        <van-popover
          v-model:show="showMenu"
          :reference="menuButtonRef"
          placement="bottom-end"
          theme="light"
          trigger="manual"
        >
          <div class="p-1">
            <div
              v-for="(action, index) in menuActions"
              :key="index"
              class="p-2 rounded flex cursor-pointer items-center hover:bg-gray-100"
              @click="handleMenuClick(action)"
            >
              <van-icon :name="action.icon" class="mr-2" />
              <span>{{ action.text }}</span>
            </div>
          </div>
        </van-popover>
      </template>
    </NavBar>
    <!-- <div class="p-4 border-b-1 border-b-black/10 border-b-solid">
      <van-button
        type="primary" icon="plus"
        class="w-full"
      >
        导入角色
      </van-button>
    </div> -->
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

    <!-- 创建角色对话框组件 -->
    <CreateFriendDialog
      v-model:visible="showCreateDialog"
      @created="handleFriendCreated"
    />
  </div>
</template>
