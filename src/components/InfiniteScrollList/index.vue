<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  // 列表数据
  items: {
    type: Array,
    required: true,
  },
  // 是否有更多数据可加载
  hasMore: {
    type: Boolean,
    default: false,
  },
  // 是否正在加载
  loading: {
    type: Boolean,
    default: false,
  },
  // 加载更多的文本
  loadMoreText: {
    type: String,
    default: '',
  },
  // 是否启用向上加载（默认为true，向上加载更多历史数据）
  loadUpwards: {
    type: Boolean,
    default: true,
  },
  // 是否启用向下加载（默认为false，向下加载更多新数据）
  loadDownwards: {
    type: Boolean,
    default: false,
  },
  // 滚动阈值，当距离顶部或底部小于该值时触发加载
  threshold: {
    type: Number,
    default: 50,
  },
})

const emit = defineEmits(['loadMore'])

const { t } = useI18n()

// 列表容器引用
const listRef = ref<HTMLElement | null>(null)
// 记录加载前的滚动位置信息
const scrollPositionInfo = ref({
  firstVisibleElement: null as HTMLElement | null,
  offsetFromTop: 0,
  scrollHeight: 0,
})

// 处理滚动事件
function handleScroll() {
  if (!listRef.value || props.loading)
    return

  const { scrollTop, scrollHeight, clientHeight } = listRef.value

  // 向上加载更多（历史数据）
  if (props.loadUpwards && scrollTop <= props.threshold && props.hasMore) {
    // 记录当前第一个可见元素的位置信息
    saveScrollPosition()
    // 触发加载更多
    emit('loadMore', 'up')
  }

  // 向下加载更多（新数据）
  if (props.loadDownwards
    && scrollHeight - scrollTop - clientHeight <= props.threshold
    && props.hasMore) {
    emit('loadMore', 'down')
  }
}

// 保存滚动位置信息
function saveScrollPosition() {
  if (!listRef.value)
    return

  // 找到第一个可见的元素
  const elements = Array.from(listRef.value.children)
  // const scrollTop = listRef.value.scrollTop

  for (const element of elements) {
    const el = element as HTMLElement
    const rect = el.getBoundingClientRect()
    const elementTop = rect.top - listRef.value.getBoundingClientRect().top

    if (elementTop >= 0) {
      scrollPositionInfo.value = {
        firstVisibleElement: el,
        offsetFromTop: elementTop,
        scrollHeight: listRef.value.scrollHeight,
      }
      break
    }
  }
}

// 恢复滚动位置
function restoreScrollPosition() {
  if (!listRef.value || !scrollPositionInfo.value.firstVisibleElement)
    return

  // 计算新的滚动位置
  const { firstVisibleElement, offsetFromTop, scrollHeight } = scrollPositionInfo.value
  const newScrollHeight = listRef.value.scrollHeight
  const heightDiff = newScrollHeight - scrollHeight

  // 如果高度没有变化，不需要调整
  if (heightDiff <= 0)
    return

  // 找到之前记录的元素在新DOM中的位置
  const elementIndex = Array.from(listRef.value.children).indexOf(firstVisibleElement)
  if (elementIndex >= 0) {
    // 计算新的滚动位置
    const newElement = listRef.value.children[elementIndex] as HTMLElement
    const newPosition = newElement.offsetTop - offsetFromTop

    // 设置新的滚动位置
    listRef.value.scrollTop = newPosition
  }
  else {
    // 如果找不到元素，直接滚动到新增内容的底部
    listRef.value.scrollTop = heightDiff
  }
}

// 滚动到底部
function scrollToBottom() {
  if (!listRef.value)
    return
  listRef.value.scrollTop = listRef.value.scrollHeight
}

// 滚动到顶部
function scrollToTop() {
  if (!listRef.value)
    return
  listRef.value.scrollTop = 0
}

// 监听items变化，恢复滚动位置
watch(() => props.items.length, (newLength, oldLength) => {
  if (newLength > oldLength && props.loadUpwards) {
    // 使用nextTick确保DOM已更新
    nextTick(() => {
      restoreScrollPosition()
    })
  }
})

// 初始化
onMounted(() => {
  if (listRef.value) {
    listRef.value.addEventListener('scroll', handleScroll)
  }
})

// 清理
onUnmounted(() => {
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', handleScroll)
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom,
  scrollToTop,
})
</script>

<template>
  <div ref="listRef" class="h-full w-full relative overflow-y-auto">
    <!-- 加载更多提示 - 顶部 -->
    <div v-if="loadUpwards && hasMore" class="py-2 flex items-center justify-center">
      <slot v-if="loading" name="loading-indicator">
        <van-loading size="20px" />
      </slot>
      <slot v-else name="load-more-text">
        <div class="text-sm text-gray-500 cursor-pointer" @click="emit('loadMore', 'up')">
          {{ loadMoreText || t('components.infiniteScrollList.loadMore') }}
        </div>
      </slot>
    </div>

    <!-- 列表内容 -->
    <slot />

    <!-- 加载更多提示 - 底部 -->
    <div v-if="loadDownwards && hasMore" class="py-2 flex items-center justify-center">
      <slot v-if="loading" name="loading-indicator-bottom">
        <van-loading size="20px" />
      </slot>
      <slot v-else name="load-more-text-bottom">
        <div class="text-sm text-gray-500 cursor-pointer" @click="emit('loadMore', 'down')">
          {{ loadMoreText || t('components.infiniteScrollList.loadMore') }}
        </div>
      </slot>
    </div>
  </div>
</template>
