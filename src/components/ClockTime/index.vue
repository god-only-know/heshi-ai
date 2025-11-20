<script setup lang="ts">
import defaultAvatar from '@/assets/images/default-avatar.svg'
// 响应式数据
const currentHour = ref('')
const currentMinute = ref('')
const currentMonth = ref('')
const currentDay = ref('')
const currentMonthText = ref('')
const currentTimeText = ref('')

// 月份映射
const monthMap = {
  1: 'JAN',
  2: 'FEB',
  3: 'MAR',
  4: 'APR',
  5: 'MAY',
  6: 'JUN',
  7: 'JUL',
  8: 'AUG',
  9: 'SEP',
  10: 'OCT',
  11: 'NOV',
  12: 'DEC',
}

// 更新时间函数
function updateTime() {
  const now = new Date()

  // 更新小时和分钟
  currentHour.value = now.getHours().toString().padStart(2, '0')
  currentMinute.value = now.getMinutes().toString().padStart(2, '0')

  // 更新月份和日期
  const month = now.getMonth() + 1
  currentMonth.value = monthMap[month]
  currentDay.value = now.getDate().toString().padStart(2, '0')

  // 更新底部显示的月份和时间
  currentMonthText.value = monthMap[month]
  currentTimeText.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 初始化时间并设置定时更新
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<template>
  <div class="font-semibold p-4 flex flex-col items-center justify-center">
    <!-- 主时间显示 -->
    <div class="flex gap-1 items-center justify-center">
      <!-- 小时 -->
      <div class="px-3 py-6 rounded-2xl bg-[#595959] flex inset-shadow-[#0000004d] inset-shadow-sm items-center justify-center">
        <span class="text-4xl text-white font-bold">{{ currentHour }}</span>
      </div>

      <!-- 分隔冒号 -->
      <div class="text-4xl text-white font-bold">
        :
      </div>

      <!-- 中间图片 -->
      <div class="flex flex-col items-center justify-between">
        <!-- 顶部日期显示 -->
        <div class="text-sm mb-1">
          <span class="text-white/30 mr-1">
            {{ currentMonth }}
          </span>
          <span class="text-white">
            {{ currentDay }}
          </span>
        </div>
        <div class="p-1 rounded-xl bg-[#595959] h-14 w-14 inset-shadow-[#0000004d] inset-shadow-sm">
          <van-image :src="defaultAvatar" alt="avatar" height="100%" width="100%" fix="cover" />
        </div>
        <!-- 底部时间显示 -->
        <div class="text-sm text-gray-300 mt-1">
          <!-- <span class="text-white/30 mr-1">
            {{ currentMonthText }}
          </span> -->
          <span class="text-white">
            {{ currentTimeText }}
          </span>
        </div>
      </div>

      <!-- 分隔冒号 -->
      <div class="text-4xl text-white font-bold">
        :
      </div>

      <!-- 分钟 -->
      <div class="px-3 py-6 rounded-2xl bg-[#595959] flex inset-shadow-[#0000004d] inset-shadow-sm items-center justify-center">
        <span class="text-4xl text-white font-bold">{{ currentMinute }}</span>
      </div>
    </div>
  </div>
</template>
