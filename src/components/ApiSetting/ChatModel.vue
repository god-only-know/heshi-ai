<script lang="ts" setup>
import { ref } from 'vue'
import useApiSettingStore from '@/stores/modules/apiSetting'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  settingList: Api.ApiSetting.GetApiSettingsResult
}>()
const apiSettingStore = useApiSettingStore()
const { modelForm } = storeToRefs(apiSettingStore)
const configColumns = ref([])
const pickerValue = ref([])
const showPicker = ref('')
const { t } = useI18n()

apiSettingStore.getModelSetting()
const scenes = ref([
  { key: 'summaryModel', label: t('apiSetting.scenes.summary') },
  { key: 'dynamicModel', label: t('apiSetting.scenes.dynamic') },
])

function updateConfigColumns() {
  configColumns.value = props.settingList.map(item => ({ text: item.setting_name, value: item.setting_id }))
}

function openSettingList(key: string) {
  updateConfigColumns()
  showPicker.value = key
}

function onPickerConfirm({ selectedOptions }) {
  // 支持 Picker 返回对象或字符串
  const value = selectedOptions?.[0]?.value ?? ''
  const findItem = props.settingList.find(item => item.setting_id === value)

  if (findItem && showPicker.value) {
    // 根据选择的设置更新 store
    if (showPicker.value === 'mainChatModel') {
      apiSettingStore.setMainChatModel(findItem)
    }
    else if (showPicker.value === 'summaryModel') {
      apiSettingStore.setSummaryModel(findItem)
    }
    else if (showPicker.value === 'dynamicModel') {
      apiSettingStore.setDynamicModel(findItem)
    }
  }

  showPicker.value = ''
}

function getModelText(key: string) {
  const modelSetting = modelForm.value[key]

  return modelSetting?.setting_name || t('apiSetting.configList')
}

function handleApplyToAllChange(value: boolean) {
  apiSettingStore.setApplyToAll(value)
}
</script>

<template>
  <!-- 主对话模型区 -->
  <van-cell-group inset>
    <van-cell :title="t('apiSetting.mainModel')" is-link @click="openSettingList('mainChatModel')">
      {{ getModelText('mainChatModel') }}
    </van-cell>

    <van-cell class="p-8 px-8">
      <van-checkbox v-model="modelForm.applyToAll" @change="handleApplyToAllChange">
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
