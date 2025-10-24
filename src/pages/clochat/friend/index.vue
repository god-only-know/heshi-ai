<script lang="ts" setup>
import router from '@/router'
import useClochatStore from '@/stores/modules/clochat'
import { storeToRefs } from 'pinia'

const clochatStore = useClochatStore()
const { friendList } = storeToRefs(clochatStore)

async function handleSendChat(friend_id: string) {
  let chatItem = clochatStore.getChatItemByFriendId(friend_id)
  if (!chatItem) {
    chatItem = await clochatStore.addChatItem({
      friend_id,
    })
  }

  router.push({
    path: '/clochat/chat',
    query: {
      chat_id: chatItem.chat_id,
    },
  })
}
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
