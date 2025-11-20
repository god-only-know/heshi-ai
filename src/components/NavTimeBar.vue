<script setup lang="ts">
// 新增状态栏时间响应式数据
const currentTime = ref('')
const currentDate = ref('')

// 更新时间函数
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  currentDate.value = `${now.getMonth() + 1}/${now.getDate()} ${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
}

// 初始化时间并设置定时更新
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <!-- 新增：状态栏（参考样式） -->
  <div
    class="text-black/70 font-semibold px-4 py-2 flex h-[24px] items-center top-0 justify-between sticky z-10"
  >
    <span class="text-[12px]">{{ currentTime }}</span>
    <div class="text-[14px] flex gap-2 items-center">
      <div class="i-carbon:signal-strength" />
      <div class="i-carbon:wifi" />
      <div class="i-carbon:battery-full" />
    </div>
  </div>
</template>
