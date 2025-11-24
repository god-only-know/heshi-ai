<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showToast } from 'vant'
import { blockFriend as blockFriendApi, clearChatHistory, getChatRecords, searchChatRecords, unblockFriend as unblockFriendApi } from '@/api/clochat'

const props = defineProps<{
  visible: boolean
  chatDetail: Api.Clochat.getChatDetailResult
}>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()
// 模拟世界书数据
const worldBooks = ref([
  { id: '1', name: '世界书1' },
  { id: '2', name: '世界书2' },
  { id: '3', name: '世界书3' },
])
const selectedWorldBook = ref('')
const selectedWorldBookName = ref('')
const showWorldBookPicker = ref(false)

// 聊天历史相关
const showHistoryView = ref(false)
const chatRecords = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const { t } = useI18n()
// 是否显示弹窗
const showPopup = ref(false)

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  showPopup.value = newVal
})

// 关闭弹窗
function handleClose() {
  showPopup.value = false
  emit('close')
}

// 查看聊天历史
async function viewChatHistory() {
  showHistoryView.value = true
  await fetchChatRecords()
}

// 返回设置页面
function backToSettings() {
  showHistoryView.value = false
  searchKeyword.value = ''
  isSearching.value = false
}

// 获取聊天记录
async function fetchChatRecords() {
  try {
    loading.value = true
    const response = await getChatRecords(props.chatDetail.chat_id)
    chatRecords.value = response?.result || []
  }
  catch (error) {
    console.error('获取聊天记录失败', error)
    showToast(t('clochat.settings.operationFailed'))
  }
  finally {
    loading.value = false
  }
}

// 搜索聊天记录
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    isSearching.value = false
    return
  }

  try {
    loading.value = true
    isSearching.value = true
    const response = await searchChatRecords(props.chatDetail.chat_id, searchKeyword.value)
    searchResults.value = response?.result || []
  }
  catch (error) {
    console.error('搜索聊天记录失败', error)
    showToast(t('clochat.settings.operationFailed'))
  }
  finally {
    loading.value = false
  }
}
// 清空关键字
function clearSearchKeyword() {
  searchKeyword.value = ''
  isSearching.value = false
}
// 高亮关键词
function highlightKeyword(text: string) {
  if (!searchKeyword.value || !isSearching.value)
    return text

  const regex = new RegExp(searchKeyword.value, 'gi')
  return text.replace(regex, match => `<span class="bg-yellow-300">${match}</span>`)
}

// 显示的记录列表
const displayRecords = computed(() => {
  return isSearching.value ? searchResults.value : chatRecords.value
})

// 显示世界书选择器
function showWorldBookSelector() {
  showWorldBookPicker.value = true
}

// 确认选择世界书
function confirmWorldBook(data: { selectedValues: string[], selectedIndexes: string[] }) {
  if (data && data.selectedValues && data.selectedValues.length > 0) {
    selectedWorldBook.value = data?.selectedValues?.[0] || ''
    selectedWorldBookName.value = worldBooks.value[data?.selectedIndexes?.[0]].name
    showToast(`已选择世界书: ${selectedWorldBookName.value}`)
  }
  showWorldBookPicker.value = false
}

// 取消选择世界书
function cancelWorldBookSelection() {
  showWorldBookPicker.value = false
}

// 清空聊天历史
function handleClearChatHistory() {
  showConfirmDialog({
    title: t('clochat.settings.clearHistoryConfirm'),
    message: t('clochat.settings.clearHistoryConfirmMessage', { name: props.chatDetail.friend_name }),
  }).then(async () => {
    try {
      // 调用清空聊天历史的API
      await clearChatHistory(props.chatDetail.chat_id)
      showToast(t('clochat.settings.clearHistorySuccess'))
      emit('refresh')
    }
    catch (error) {
      console.error(error)
      showToast(t('clochat.settings.operationFailed'))
    }
  }).catch(() => {
    // 取消操作
  })
}

// 导入聊天
function importChat() {
  showToast(`${t('clochat.settings.importChat')}功能待实现`)
}

// 导出聊天
function exportChat() {
  showToast(`${t('clochat.settings.exportChat')}功能待实现`)
}

// 拉黑好友
function handleBlockFriend() {
  showConfirmDialog({
    title: t('clochat.settings.blockConfirm'),
    message: t('clochat.settings.blockConfirmMessage', { name: props.chatDetail.friend_name }),
  }).then(async () => {
    try {
      // 调用拉黑好友的API
      await blockFriendApi(props.chatDetail.friend_id)
      showToast(t('clochat.settings.blockSuccess'))
      emit('refresh')
    }
    catch (error) {
      console.error(error)
      showToast(t('clochat.settings.operationFailed'))
    }
  }).catch(() => {
    // 取消操作
  })
}

// 取消拉黑好友
function handleUnblockFriend() {
  showConfirmDialog({
    title: t('clochat.settings.unblockConfirm'),
    message: t('clochat.settings.unblockConfirmMessage', { name: props.chatDetail.friend_name }),
  }).then(async () => {
    try {
      // 调用取消拉黑好友的API
      await unblockFriendApi(props.chatDetail.friend_id)
      showToast(t('clochat.settings.unblockSuccess'))
      emit('refresh')
    }
    catch (error) {
      console.error(error)
      showToast(t('clochat.settings.operationFailed'))
    }
  }).catch(() => {
    // 取消操作
  })
}

// 判断好友是否被拉黑
const isBlocked = computed(() => {
  return props.chatDetail.is_blocked_by_user || false
})
</script>

<template>
  <div v-if="showPopup" class="bg-white flex flex-col h-full inset-0 fixed z-50">
    <NavBar
      :title="showHistoryView ? t('clochat.settings.chatHistory') : t('clochat.settings.title')"
      left-arrow
      @click-left-button="showHistoryView ? backToSettings() : handleClose()"
    />

    <!-- 聊天设置视图 -->
    <div v-if="!showHistoryView" class="p-4 flex flex-1 flex-col overflow-y-auto">
      <!-- 角色信息 -->
      <div class="mb-6 flex items-center">
        <van-image
          :src="chatDetail.friend_avatar"
          width="3rem"
          height="3rem"
          round
          class="mr-3"
        />
        <div>
          <div class="text-base font-bold">
            {{ chatDetail.friend_name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ chatDetail.friend_introduce || t('clochat.settings.noIntroduce') }}
          </div>
        </div>
      </div>

      <!-- 操作按钮列表 -->
      <div class="flex flex-1 flex-col space-y-4">
        <!-- 绑定世界书 - 下拉单选框 -->
        <div class="px-4">
          <div class="text-base mb-2">
            {{ t('clochat.settings.bindWorldBook') }}
          </div>
          <van-button
            plain block
            class="text-left"
            @click="showWorldBookSelector"
          >
            {{ selectedWorldBookName || t('clochat.settings.selectWorldBooks') }}
            <van-icon name="arrow-down" class="mt-1 float-right" />
          </van-button>
        </div>

        <!-- 功能按钮组 -->
        <div class="px-4 gap-3 grid grid-cols-2">
          <van-button type="primary" @click="viewChatHistory">
            {{ t('clochat.settings.viewHistory') }}
          </van-button>
          <van-button
            :type="isBlocked ? 'default' : 'danger'"
            @click="isBlocked ? handleUnblockFriend() : handleBlockFriend()"
          >
            {{ isBlocked ? t('clochat.settings.unblock') : t('clochat.settings.block') }}
          </van-button>
          <van-button type="warning" @click="handleClearChatHistory">
            {{ t('clochat.settings.clearHistory') }}
          </van-button>
          <van-button @click="exportChat">
            {{ t('clochat.settings.exportChat') }}
          </van-button>
          <van-button class="col-span-2" @click="importChat">
            {{ t('clochat.settings.importChat') }}
          </van-button>
        </div>
      </div>

      <!-- 世界书选择弹窗 -->
      <van-popup
        v-model:show="showWorldBookPicker"
        position="bottom"
        round
      >
        <van-picker
          :columns="worldBooks.map(book => ({ text: book.name, value: book.id }))"
          :default-index="selectedWorldBook ? worldBooks.findIndex(book => book.id === selectedWorldBook) : 0"
          show-toolbar
          :title="t('clochat.settings.worldBooks')"
          @confirm="(value) => confirmWorldBook(value)"
          @cancel="cancelWorldBookSelection"
        />
      </van-popup>
    </div>

    <!-- 聊天历史视图 -->
    <div v-else class="flex flex-1 flex-col overflow-hidden">
      <!-- 搜索框 -->
      <div class="p-4 border-b border-gray-200">
        <van-search
          v-model="searchKeyword"
          :placeholder="t('clochat.settings.searchPlaceholder')"
          shape="round"
          @search="handleSearch"
          @clear="clearSearchKeyword"
        />
      </div>

      <!-- 聊天记录列表 -->
      <div class="p-4 flex-1 overflow-y-auto">
        <van-loading v-if="loading" class="mx-auto my-4" />

        <div v-else-if="displayRecords.length === 0" class="text-gray-500 py-8 text-center">
          {{ isSearching ? t('clochat.settings.noSearchResults') : t('clochat.settings.noHistory') }}
        </div>

        <div v-else class="flex flex-col gap-4">
          <div v-for="record in displayRecords" :key="record.chat_record_id" class="flex">
            <div
              v-if="record.type === 'user'"
              class="flex flex-row-reverse w-full"
            >
              <div class="text-white rounded-full bg-blue-500 flex h-8 w-8 items-center justify-center">
                {{ t('clochat.settings.user') }}
              </div>
              <div
                class="mr-2 px-3 py-2 rounded-lg bg-blue-100 max-w-[70%] break-all"
                v-html="isSearching ? highlightKeyword(record.content) : record.content"
              />
            </div>
            <div
              v-else
              class="flex flex-row w-full"
            >
              <div class="text-white rounded-full bg-green-500 flex h-8 w-8 items-center justify-center">
                {{ t('clochat.settings.assistant') }}
              </div>
              <div
                class="ml-2 px-3 py-2 rounded-lg bg-gray-100 max-w-[70%] break-all"
                v-html="isSearching ? highlightKeyword(record.content) : record.content"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
