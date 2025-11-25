<script lang="ts" setup>
import { showFailToast, showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import defaultAvatarBase64 from '@/assets/images/default-avatar-base64.js'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import api from '@/api/index'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'created'])

const { t } = useI18n()

// 使用ref存储数据
const loading = ref(false)
const showCropperDialog = ref(false)
const showWorldBookPicker = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 创建角色相关数据
const friendForm = ref({
  avatarUrl: defaultAvatarBase64, // 直接使用base64格式的默认头像
  friendName: '',
  friendIntroduce: '',
  selectedWorldBook: '',
})

const worldBooks = ref([
  { id: '1', name: '世界书1', description: '这是世界书1的简要描述' },
  { id: '2', name: '世界书2', description: '这是世界书2的简要描述' },
  { id: '3', name: '世界书3', description: '这是世界书3的简要描述' },
])

// 裁剪相关数据
const imageSource = ref('')
const cropperRef = ref(null)

// 关闭创建角色对话框
function handleCloseDialog() {
  emit('update:visible', false)
  // 重置表单
  friendForm.value = {
    avatarUrl: defaultAvatarBase64,
    friendName: '',
    friendIntroduce: '',
    selectedWorldBook: '',
  }
}

// 处理头像上传
function handleAvatarUpload() {
  // 触发文件选择
  fileInputRef.value?.click()
}

// 处理文件选择
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showFailToast(t('clochat.friend.invalidImageFormat'))
      return
    }

    // 读取文件并显示裁剪对话框
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imageSource.value = e.target.result as string
        showCropperDialog.value = true
      }
    }
    reader.readAsDataURL(file)
  }

  // 重置文件输入，以便可以再次选择同一文件
  input.value = ''
}

// 完成裁剪
function completeCrop() {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult()

    // 将裁剪后的图像转换为base64
    const base64 = canvas.toDataURL('image/jpeg')
    friendForm.value.avatarUrl = base64

    // 关闭裁剪对话框
    showCropperDialog.value = false

    showSuccessToast(t('clochat.friend.cropSuccess'))
  }
}

// 取消裁剪
function cancelCrop() {
  showCropperDialog.value = false
}

// 确认创建角色
async function handleCreateFriend() {
  try {
    // 表单验证
    if (!friendForm.value.friendName) {
      showFailToast(t('clochat.friend.enterName'))
      return
    }

    loading.value = true

    // 调用API接口添加好友
    const response = await api.addFriend({
      friend_name: friendForm.value.friendName,
      friend_avatar: friendForm.value.avatarUrl,
      friend_introduce: friendForm.value.friendIntroduce || '',
    })

    if (response?.result) {
      showSuccessToast(t('clochat.friend.createSuccess'))
      handleCloseDialog()
      // 通知父组件创建成功
      emit('created')
    }
    else {
      showFailToast(t('clochat.friend.createFailed'))
    }
  }
  catch (err) {
    console.error(err)
    showFailToast(t('clochat.friend.createFailed'))
  }
  finally {
    loading.value = false
  }
}

// 选择世界书
function handleSelectWorldBook() {
  showWorldBookPicker.value = true
}

// 确认选择世界书
function confirmWorldBook(value: any) {
  friendForm.value.selectedWorldBook = value.value
  showWorldBookPicker.value = false
}
</script>

<template>
  <!-- 创建角色对话框 -->
  <div v-if="visible" class="bg-black/50 flex items-center inset-0 justify-center fixed z-2000">
    <div class="rounded-lg bg-white max-w-md w-90vw">
      <div class="p-4">
        <div class="text-lg font-bold mb-4 text-center">
          {{ t('clochat.friend.createRole') }}
        </div>

        <!-- 头像上传 -->
        <div class="mb-4 flex flex-col items-center">
          <div class="mb-2 text-center">
            {{ t('clochat.friend.avatar') }}
          </div>
          <div class="cursor-pointer relative" @click="handleAvatarUpload">
            <van-image width="80px" height="80px" :src="friendForm.avatarUrl" round />
            <div class="bg-primary text-white p-1 rounded-full bottom-0 right-0 absolute">
              <van-icon name="photograph" size="16" />
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ t('clochat.friend.supportFormats') }}
          </div>
          <input ref="fileInputRef" type="file" accept="image/png, image/jpeg, image/gif, image/webp" class="hidden" @change="handleFileChange">
        </div>

        <!-- 名称输入 -->
        <div class="mb-4">
          <van-field v-model="friendForm.friendName" :label="t('clochat.friend.name')" :placeholder="t('clochat.friend.enterName')" />
        </div>

        <!-- 角色描述 -->
        <div class="mb-4">
          <van-field v-model="friendForm.friendIntroduce" :label="t('clochat.friend.description')" type="textarea" :placeholder="t('clochat.friend.enterDescription')" rows="3" />
        </div>

        <!-- 关联世界书 -->
        <div class="mb-4">
          <van-cell :title="t('clochat.friend.worldBook')" :value="friendForm.selectedWorldBook ? worldBooks.find(book => book.id === friendForm.selectedWorldBook)?.name : t('clochat.friend.selectWorldBook')" is-link @click="handleSelectWorldBook" />
        </div>

        <!-- 世界书列表 -->
        <div v-if="friendForm.selectedWorldBook" class="mb-4 p-2 rounded bg-gray-100">
          <div class="font-bold">
            {{ worldBooks.find(book => book.id === friendForm.selectedWorldBook)?.name }}
          </div>
          <div class="text-sm text-gray-600">
            {{ worldBooks.find(book => book.id === friendForm.selectedWorldBook)?.description }}
          </div>
        </div>

        <!-- 按钮 -->
        <div class="mt-4 flex justify-around">
          <van-button plain @click="handleCloseDialog">
            {{ t('clochat.friend.cancel') }}
          </van-button>
          <van-button type="primary" @click="handleCreateFriend">
            {{ t('clochat.friend.confirm') }}
          </van-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 世界书选择器 -->
  <van-popup
    v-model:show="showWorldBookPicker"
    position="bottom"
    round
  >
    <van-picker
      :columns="worldBooks.map(book => ({ text: book.name, value: book.id }))"
      show-toolbar
      :title="t('clochat.friend.worldBook')"
      @confirm="confirmWorldBook"
      @cancel="showWorldBookPicker = false"
    />
  </van-popup>

  <!-- 图片裁剪对话框 -->
  <div v-show="showCropperDialog" class="bg-black/50 flex items-center inset-0 justify-center fixed z-2001">
    <div class="rounded-lg bg-white max-w-md w-90vw">
      <div class="p-4">
        <div class="text-lg font-bold mb-4 text-center">
          {{ t('clochat.friend.cropAvatar') }}
        </div>
        <div class="relative">
          <!-- 添加一个相对定位的中间容器 -->
          <Cropper
            ref="cropperRef"
            :src="imageSource"
            :stencil-props="{
              aspectRatio: 1,
              movable: true,
              resizable: true,
            }"
            class="h-80"
          />
        </div>
        <div class="mt-4 flex justify-around">
          <van-button plain @click="cancelCrop">
            {{ t('clochat.friend.cancel') }}
          </van-button>
          <van-button type="primary" @click="completeCrop">
            {{ t('clochat.friend.confirm') }}
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>
