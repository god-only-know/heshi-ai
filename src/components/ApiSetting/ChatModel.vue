<script lang="ts" setup>
import useApiSettingStore from '@/stores/modules/apiSetting'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const apiSettingStore = useApiSettingStore()
const { settingList, modelForm } = storeToRefs(apiSettingStore)
const configColumns = ref(settingList.value.map(item => ({ text: item.name, value: item.id })))
const pickerValue = ref([])
const showPicker = ref('')
const { t } = useI18n()

const scenes = ref([
  { key: 'summaryModel', label: t('apiSetting.scenes.summary') },
  { key: 'dynamicModel', label: t('apiSetting.scenes.dynamic') },
])
function openSettingList(key: string) {
  configColumns.value = settingList.value.map(item => ({ text: item.name, value: item.id }))
  showPicker.value = key
}
function onPickerConfirm({ selectedOptions }) {
  // 支持 Picker 返回对象或字符串
  const value = selectedOptions?.[0]?.value ?? ''
  const findItem = settingList.value.find(item => item.id === value)
  modelForm.value[showPicker.value] = findItem?.id
  console.log(modelForm.value, showPicker.value)
  showPicker.value = ''
}

function getModelText(key: string) {
  const modelId = modelForm.value[key]
  console.log(modelId)
  const findItem = settingList.value.find(item => item.id === modelId)

  return findItem?.name || t('apiSetting.configList')
}
</script>

<template>
  <!-- 主对话模型区 -->
  <van-cell-group inset>
    <van-cell :title="t('apiSetting.mainModel')" is-link @click="openSettingList('mainChatModel')">
      {{ getModelText('mainChatModel') }}
    </van-cell>

    <van-cell class="p-8 px-8">
      <van-checkbox v-model="modelForm.applyToAll">
        {{ t('apiSetting.applyToAll') }}
      </van-checkbox>
    </van-cell>
    <template v-if="!modelForm.applyToAll">
      <van-cell :title="t('apiSetting.otherModels')" />
      <van-cell
        v-for="scene in scenes" :key="scene.key" :title="scene.label" is-link
        @click="openSettingList(scene.key)"
      >
        {{ getModelText(scene.key) }}
      </van-cell>
    </template>
  </van-cell-group>
  <!-- Picker 弹窗 -->
  <van-popup :show="!!showPicker" position="bottom">
    <van-picker
      :model-value="pickerValue" :columns="configColumns" @confirm="onPickerConfirm"
      @cancel="showPicker = ''"
    />
  </van-popup>
</template>
