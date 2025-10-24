<script setup lang="ts">
const props = defineProps<{
  tabs: Array<{
    name: string
    icon: string
    path: string
  }>
}>()
</script>

<template>
  <van-tabbar route placeholder>
    <van-tabbar-item v-for="item in props.tabs" :key="item.path" replace :to="item.path" :name="item.path">
      {{ item.name }}
      <template #icon>
        <div :class="item.icon" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>
