<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', emoji: string): void
}>()
const visible = ref(props.visible)
// 表情列表 - 使用文本表情符号
const emojiList = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💩',
  '👻',
  '💀',
  '☠️',
  '👽',
  '👾',
]
watchEffect(() => {
  visible.value = props.visible
})
// 选择emoji
function selectEmoji(emoji: string) {
  emit('select', emoji)
}

// 关闭弹窗
function handleClose() {
  emit('close')
}
</script>

<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ height: '40%' }"
    @click-overlay="handleClose"
  >
    <div class="p-4 flex flex-col h-full">
      <div class="mb-4 flex shrink-0 items-center justify-between">
        <div class="text-lg font-bold">
          表情
        </div>
        <van-icon name="cross" @click="handleClose" />
      </div>
      <div class="gap-2 grid grid-cols-7 overflow-auto">
        <div
          v-for="emoji in emojiList"
          :key="emoji"
          class="text-2xl p-1 rounded flex cursor-pointer items-center justify-center hover:bg-gray-100"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </van-popup>
</template>
