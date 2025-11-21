<script lang="ts" setup>
import api from '@/api/index'
import { useI18n } from 'vue-i18n'
import useApiSettingStore from '@/stores/modules/apiSetting'
import ChatSettings from '@/components/ChatSettings/index.vue'
import Popconfirm from '@/components/Popconfirm/index.vue'
import InfiniteScrollList from '@/components/InfiniteScrollList/index.vue'
import { addChatRecord, deleteChatRecord, getChatRecordsPaginated } from '@/api/clochat'
import type { ChatRecordsPaginatedParams } from '@/api/clochat'
import moment from 'moment'
import { showDialog, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'

defineOptions({
  name: 'ChatDetail',
})
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
const showSettings = ref(false)

// 长按菜单相关
const showActionMenu = ref(false)
const actionMenuPosition = ref({ x: 0, y: 0 })
const selectedMessageId = ref<string>('')
const selectedMessage = ref<any>(null)
const menuPlacement = ref<'start' | 'end' | null>(null)
const menuItems = ref([
  { text: t('clochat.chat.multiSelect'), action: 'multiSelect' },
  { text: t('clochat.chat.copy'), action: 'copy' },
  { text: t('clochat.chat.edit'), action: 'edit' },
  { text: t('clochat.chat.delete'), action: 'delete' },
  { text: t('clochat.chat.favorite'), action: 'favorite' },
])

// 编辑消息相关
const editingMessageId = ref<string>('')
const editingContent = ref('')

// 多选模式相关
const isMultiSelectMode = ref(false)
const selectedMessages = ref<Set<string>>(new Set())
const showBottomBar = ref(false)

// 缓冲区相关
const bufferMessageIds = ref<string[]>([])
const typingTimer = ref<number | null>(null)
const TYPING_DELAY = 2000 // 用户停止输入2秒后发送消息

// 分页加载相关
const chatRecordsParams = ref<ChatRecordsPaginatedParams>({
  chatId: '',
  page: 1,
  pageSize: 10,
})
const isLoadingMore = ref(false)
const hasMoreHistory = ref(false)
const isFirstLoad = ref(true)
const infiniteScrollListRef = ref<InstanceType<typeof InfiniteScrollList> | null>(null)

const chatMessageList = computed(() => {
  return chatDetail.value.record_list.map((record, index) => {
    let show_day = ''
    if (!moment(chatDetail.value.record_list[index - 1]?.create_time).isSame(moment(record.create_time), 'day')) {
      if (moment(record.create_time).isSame(moment(), 'day')) {
        show_day = t('clochat.chat.today')
      }
      else {
        show_day = moment(record.create_time).format('YYYY-MM-DD')
      }
    }
    return {
      ...record,
      create_time: moment(record.create_time).format('HH:mm'),
      is_show_status: record.type === 'user' && chatDetail.value.record_list[index + 1]?.type !== 'user',
      show_day,
    }
  })
})
// 获取聊天详情
async function fetchChatDetail() {
  const chatId = route.params.id as string
  if (!chatId) {
    return showFailToast(t('clochat.notify.noChat'))
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
    showFailToast(err.message)
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
    console.error(err)
  }
}

// 加载更多历史记录
async function loadMoreHistory(direction = 'up') {
  if (isLoadingMore.value || !hasMoreHistory.value)
    return

  try {
    isLoadingMore.value = true

    if (direction === 'up') {
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
  }
  catch (err) {
    console.error(err)
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
    showLoadingToast(t('clochat.notify.sending'))
    return
  }

  const user_message = inputText.value.trim()
  if (user_message === '') {
    showFailToast(t('clochat.notify.noMessage'))
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
    handleUserTyping()
  }
  catch (err) {
    console.error(err)
    showFailToast(t('clochat.notify.sendMessageFailed'))
  }
}

// 发送缓冲区内的所有消息
async function sendBufferedMessages() {
  if (loading.value || bufferMessageIds.value.length === 0)
    return

  try {
    loading.value = true

    // 发送消息并标记为已读
    const response = await api.sendMessage({
      setting_id: setting_id.value,
      chat_id: chatDetail.value.chat_id,
      user_message: '', // 不再通过这个字段发送消息
      message_ids: bufferMessageIds.value,
    })
    // 更新已读状态
    chatDetail.value.record_list.forEach((record) => {
      if (bufferMessageIds.value.includes(record.chat_record_id))
        record.is_read = true
    })

    // 清空缓冲区
    bufferMessageIds.value = []
    if (response?.result) {
      chatDetail.value.record_list.push(response?.result)
      scroolBottom()
    }
  }
  catch (err) {
    console.error(err)
    showFailToast(t('clochat.notify.sendMessageFailed'))
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
  infiniteScrollListRef.value?.scrollToBottom()
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

// 初始化
onMounted(async () => {
  getModelId()
  await fetchChatDetail()
  scroolBottom()
})
onBeforeRouteLeave(() => {
  resetTypingTimer()
  sendBufferedMessages()
})

// 长按消息处理
function handleLongPress(event: MouseEvent | TouchEvent, message: any) {
  const element = event.target as HTMLElement
  // 如果已经在多选模式，则添加到选中列表
  if (isMultiSelectMode.value) {
    toggleMessageSelection(message.chat_record_id)
    return
  }

  // 获取消息元素的位置信息
  const rect = element.getBoundingClientRect()
  // 设置选中的消息
  selectedMessageId.value = message.chat_record_id
  selectedMessage.value = message

  if (message.type === 'user') {
    actionMenuPosition.value = {
      x: rect.left + rect.width,
      y: rect.top,
    }
    menuPlacement.value = 'end'
  }
  else {
    actionMenuPosition.value = {
      x: rect.left,
      y: rect.top,
    }
    menuPlacement.value = 'start'
  }

  // 显示操作菜单
  showActionMenu.value = true

  // 阻止默认行为和冒泡
  event.preventDefault()
  event.stopPropagation()
}

// 关闭操作菜单
function closeActionMenu() {
  showActionMenu.value = false
}

// 处理菜单项选择
function handleMenuSelect(action: string) {
  switch (action) {
    case 'multiSelect':
      enterMultiSelectMode()
      break
    case 'copy':
      copyMessage()
      break
    case 'edit':
      editMessage()
      break
    case 'delete':
      deleteMessages()
      break
    case 'favorite':
      favoriteMessages()
      break
  }
}

// 复制消息
function copyMessage() {
  if (selectedMessage.value) {
    // 使用Clipboard API复制文本
    navigator.clipboard.writeText(selectedMessage.value.content)
      .then(() => {
        showToast(t('clochat.chat.copySuccess'))
        closeActionMenu()
      })
      .catch(() => {
        showToast(t('clochat.chat.copyFailed'))
      })
  }
}

// 编辑消息
function editMessage() {
  if (selectedMessage.value) {
    // 设置编辑状态
    editingMessageId.value = selectedMessage.value.chat_record_id
    editingContent.value = selectedMessage.value.content
    // 关闭菜单
    closeActionMenu()
    // 下一个渲染周期后聚焦输入框
    nextTick(() => {
      const editInput = document.querySelector('.edit-message-input') as HTMLInputElement
      if (editInput) {
        editInput.focus()
      }
    })
  }
}

// 保存编辑的消息
async function saveEditedMessage() {
  if (!editingMessageId.value || !editingContent.value.trim()) {
    cancelEditMessage()
    return
  }

  try {
    // 更新本地状态
    const messageIndex = chatDetail.value.record_list.findIndex(
      msg => msg.chat_record_id === editingMessageId.value,
    )

    if (messageIndex !== -1) {
      // 保存原始内容，以便在API调用失败时恢复
      const originalContent = chatDetail.value.record_list[messageIndex].content

      // 更新UI
      chatDetail.value.record_list[messageIndex].content = editingContent.value.trim()

      // 调用API更新数据库
      try {
        // 这里应该有一个API调用来更新消息内容
        // 由于没有实际的API，我们模拟一个成功的响应
        // 在实际项目中，应该替换为真正的API调用
        await api.updateChatRecord({
          chat_record_id: editingMessageId.value,
          content: editingContent.value.trim(),
        })

        // 模拟API调用成功
        await new Promise(resolve => setTimeout(resolve, 300))

        showSuccessToast(t('clochat.chat.editSuccess'))
      }
      catch (apiError) {
        console.error('API调用失败', apiError)
        // 恢复原始内容
        chatDetail.value.record_list[messageIndex].content = originalContent
        showFailToast(t('clochat.chat.editFailed'))
      }
    }

    // 退出编辑模式
    editingMessageId.value = ''
    editingContent.value = ''
  }
  catch (error) {
    console.error('编辑消息失败', error)
    showFailToast(t('clochat.chat.editFailed'))
  }
}

// 取消编辑消息
function cancelEditMessage() {
  editingMessageId.value = ''
  editingContent.value = ''
}

// 进入多选模式
function enterMultiSelectMode() {
  isMultiSelectMode.value = true
  showBottomBar.value = true
  closeActionMenu()

  // 将当前选中的消息添加到多选列表
  if (selectedMessageId.value) {
    selectedMessages.value.add(selectedMessageId.value)
  }
}

// 退出多选模式
function exitMultiSelectMode() {
  isMultiSelectMode.value = false
  showBottomBar.value = false
  selectedMessages.value.clear()
}

// 切换消息选中状态
function toggleMessageSelection(messageId: string) {
  if (selectedMessages.value.has(messageId)) {
    selectedMessages.value.delete(messageId)
  }
  else {
    selectedMessages.value.add(messageId)
  }

  // 如果没有选中的消息，退出多选模式
  if (selectedMessages.value.size === 0) {
    exitMultiSelectMode()
  }
}

// 删除消息
function deleteMessages() {
  showDialog({
    title: t('clochat.chat.deleteTitle'),
    message: isMultiSelectMode.value
      ? t('clochat.chat.deleteConfirmMultiple', { count: selectedMessages.value.size })
      : t('clochat.chat.deleteConfirmSingle'),
    showCancelButton: true,
  }).then(async () => {
    try {
      if (isMultiSelectMode.value) {
        // 多选模式下删除多条消息
        const deletePromises = Array.from(selectedMessages.value).map(messageId =>
          deleteChatRecord(messageId),
        )

        await Promise.all(deletePromises)

        // 更新UI
        chatDetail.value.record_list = chatDetail.value.record_list.filter(
          item => !selectedMessages.value.has(item.chat_record_id),
        )

        exitMultiSelectMode()
        showSuccessToast(t('clochat.chat.deleteSuccess'))
      }
      else {
        // 单选模式下删除单条消息
        await deleteChatRecord(selectedMessageId.value)

        // 更新UI
        chatDetail.value.record_list = chatDetail.value.record_list.filter(
          item => item.chat_record_id !== selectedMessageId.value,
        )

        closeActionMenu()
        showSuccessToast(t('clochat.chat.deleteSuccess'))
      }
    }
    catch (error) {
      console.error(error)
      showFailToast(t('clochat.chat.deleteFailed'))
    }
  }).catch(() => {
    // 取消删除
  })
}

// 收藏消息
function favoriteMessages() {
  if (isMultiSelectMode.value) {
    // 多选模式下收藏多条消息
    showSuccessToast(t('clochat.chat.favoriteMultipleSuccess', { count: selectedMessages.value.size }))
    exitMultiSelectMode()
  }
  else {
    // 单选模式下收藏单条消息
    showSuccessToast(t('clochat.chat.favoriteSuccess'))
    closeActionMenu()
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
      pageSize: 10,
    }
    await fetchChatDetail()
  }
  scroolBottom()
}, { immediate: false }) // 设置immediate为false，避免初始化时重复调用
</script>

<template>
  <div class="mx-auto bg-white flex flex-col h-full w-full">
    <NavBar :title="chatDetail?.friend_name || ''" left-arrow @click-left-button="handleBack">
      <template #right>
        <van-icon name="ellipsis" color="#ABB0BF" size="20" @click="openSettings" />
      </template>
    </NavBar>

    <!-- 聊天设置组件 -->
    <ChatSettings
      :visible="showSettings" :chat-detail="chatDetail" @close="closeSettings"
      @refresh="fetchChatDetail"
    />
    <!-- 聊天记录列表 -->
    <InfiniteScrollList
      ref="infiniteScrollListRef"
      class="p-4 flex flex-grow flex-col gap-4"
      :items="chatMessageList"
      :has-more="hasMoreHistory"
      :loading="isLoadingMore"
      @load-more="loadMoreHistory"
    >
      <div v-for="chat in chatMessageList" :key="chat.chat_record_id" class="flex items-center">
        <div v-if="isMultiSelectMode" class="mr-2">
          <van-checkbox
            :checked="selectedMessages.has(chat.chat_record_id)"
            @click.stop="toggleMessageSelection(chat.chat_record_id)"
          />
        </div>
        <div class="grow-1">
          <div v-if="chat.show_day" class="text-sm text-[#a6a6a699] my-1 text-center">
            {{ chat.show_day }}
          </div>
          <div v-if="chat.type === 'user'" class="flex flex-row-reverse w-full relative">
            <van-image width="2.5rem" height="2.5rem" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" round />
            <div
              v-if="editingMessageId === chat.chat_record_id"
              class="text-base text-[#606A82] leading-normal mr-2 px-3 py-2 rounded-2 bg-[#E5E5E5] flex flex-wrap max-w-[70%] break-all text-pretty items-center"
            >
              <div class="flex flex-col w-full">
                <textarea
                  v-model="editingContent"
                  class="edit-message-input text-base text-[#606A82] outline-none border-none bg-transparent w-full resize-none"
                  rows="2"
                />
                <div class="mt-2 flex justify-end">
                  <button
                    class="text-sm text-gray-500 mr-3"
                    @click="cancelEditMessage"
                  >
                    {{ t('clochat.chat.cancel') }}
                  </button>
                  <button
                    class="text-sm text-blue-500"
                    @click="saveEditedMessage"
                  >
                    {{ t('clochat.chat.save') }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              v-longpress="{
                onLongPress: (e) => handleLongPress(e, chat),
              }"
              class="text-base text-[#606A82] leading-normal mr-2 px-3 py-2 rounded-2 bg-[#E5E5E5] flex flex-wrap max-w-[70%] select-none break-all text-pretty items-center"
              :class="{ 'bg-[#D5D5D5]': isMultiSelectMode && selectedMessages.has(chat.chat_record_id) }"
            >
              {{ chat.content }}
            </div>
            <div class="text-xs text-[#a6a6a699] mr-2 self-center">
              {{ chat.create_time }}
            </div>
          </div>
          <div v-else class="flex flex-row w-full relative">
            <van-image width="2.5rem" height="2.5rem" :src="chatDetail?.friend_avatar" round />
            <div
              v-if="editingMessageId === chat.chat_record_id"
              class="text-base text-[#606A82] leading-normal ml-2 px-3 py-2 rounded-2 bg-[#F0F4FE] flex flex-wrap max-w-[70%] break-all text-pretty items-center"
            >
              <div class="flex flex-col w-full">
                <textarea
                  v-model="editingContent"
                  class="edit-message-input text-base text-[#606A82] outline-none border-none bg-transparent w-full resize-none"
                  rows="2"
                />
                <div class="mt-2 flex justify-end">
                  <button
                    class="text-sm text-gray-500 mr-3"
                    @click="cancelEditMessage"
                  >
                    {{ t('clochat.chat.cancel') }}
                  </button>
                  <button
                    class="text-sm text-blue-500"
                    @click="saveEditedMessage"
                  >
                    {{ t('clochat.chat.save') }}
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              v-longpress="{
                onLongPress: (e) => handleLongPress(e, chat),
              }"
              class="text-base text-[#606A82] leading-normal ml-2 px-3 py-2 rounded-2 bg-[#F0F4FE] flex flex-wrap max-w-[70%] select-none break-all text-pretty items-center"
              :class="{ 'bg-[#E0E4EE]': isMultiSelectMode && selectedMessages.has(chat.chat_record_id) }"
            >
              {{ chat.content }}
            </div>
            <div class="text-xs text-[#a6a6a699] ml-2 self-center">
              {{ chat.create_time }}
            </div>
          </div>
          <div
            v-if="chat.is_show_status"
            class="text-sm text-[#68646C] mr-12 flex items-center justify-end"
          >
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
      </div>
      <!-- 加载状态 -->
      <van-loading v-if="loading" class="mx-auto my-4" />
    </InfiniteScrollList>

    <!-- 长按操作菜单 -->
    <Popconfirm
      :visible="showActionMenu" :position="actionMenuPosition" :menu-items="menuItems"
      :placement="menuPlacement" @close="closeActionMenu" @select="handleMenuSelect"
    />

    <!-- 多选模式底部操作栏 -->
    <div
      v-if="showBottomBar"
      class="px-4 py-2 border-t-1 border-t-[#E8EAF3] border-t-solid flex flex-shrink-0 items-center justify-between"
    >
      <div class="text-blue-500" @click="exitMultiSelectMode">
        {{ t('clochat.chat.cancel') }}
      </div>
      <div class="flex">
        <div class="text-red-500 ml-4" @click="deleteMessages">
          {{ t('clochat.chat.delete') }} ({{ selectedMessages.size }})
        </div>
        <div class="text-blue-500 ml-4" @click="favoriteMessages">
          {{ t('clochat.chat.favorite') }} ({{ selectedMessages.size }})
        </div>
      </div>
    </div>

    <!-- 对话输入框 -->
    <div v-if="!showBottomBar" class="border-t-1 border-t-[#E8EAF3] border-t-solid flex flex-shrink-0 items-center">
      <van-field
        v-model="inputText" center :border="false" :placeholder="t('clochat.chat.inputPlaceholder')"
        class="!px-3 !py-4" autocomplete="off" @keypress.enter="handleSendMessage" @input="handleUserTyping"
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
