<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant'
import api from '@/api/index'
import { v4 } from 'uuid'

const { t } = useI18n()

const settingList = ref<Api.ApiSetting.GetApiSettingsResult>([])
const modleList = ref<Api.LLMMoel.GetModelListResult>([])
const showPicker = ref('')
const pickerValue = ref([])
const formRef = ref(null)

const configColumns = ref([])
const defaultApi = {
  setting_id: '',
  setting_name: '',
  api_url: '',
  api_key: '',
  model: '',
}
const apiForm = ref<Api.ApiSetting.UpdateApiSettingParams>({ ...defaultApi, setting_id: v4() })

// 获取API设置列表
async function fetchApiSettings() {
  try {
    const res = await api.getApiSettings()
    if (res?.data) {
      settingList.value = res.data
      if (settingList.value.length > 0) {
        apiForm.value = { ...settingList.value[0] }
      }
    }
  }
  catch (error) {
    console.error('获取API设置列表失败:', error)
  }
}

onMounted(() => {
  fetchApiSettings()
})

function handleClickApiName() {
  configColumns.value = settingList.value.map(item => ({ text: item.setting_name, value: item.setting_id }))
  showPicker.value = 'api'
  pickerValue.value = [apiForm.value.setting_id]
}

function handleClickModelList() {
  if (modleList.value.length === 0) {
    showToast(t('apiSetting.noModels'))
    return
  }
  configColumns.value = modleList.value.map(c => ({ text: c.model_id, value: c.model_name }))
  showPicker.value = 'model'
  pickerValue.value = [apiForm.value.model]
}

function onPickerConfirm({ selectedOptions }) {
  // 支持 Picker 返回对象或字符串
  const value = selectedOptions?.[0]?.value ?? ''
  if (showPicker.value === 'api') {
    const findItem = settingList.value.find(item => item.setting_id === value)
    if (findItem) {
      apiForm.value = { ...findItem }
    }
  }
  if (showPicker.value === 'model') {
    apiForm.value.model = value
  }
  showPicker.value = ''
}

async function addSetting() {
  try {
    await formRef.value.validate()
    apiForm.value.setting_id = v4()
    const { setting_id, ...rest } = apiForm.value
    const res = await api.addApiSetting(rest)
    if (res?.data) {
      await fetchApiSettings()
      showSuccessToast(t('apiSetting.saveSuccess'))
    }
  }
  catch (err) {
    showFailToast(err?.[0]?.message)
  }
}

async function saveSetting() {
  try {
    await formRef.value.validate()
    const res = await api.updateApiSetting(apiForm.value)
    if (res?.data) {
      await fetchApiSettings()
      showSuccessToast(t('apiSetting.saveSuccess'))
    }
  }
  catch (err) {
    showFailToast(err?.[0]?.message)
  }
}

function deleteSetting() {
  showConfirmDialog({
    title: t('apiSetting.deleteConfirm'),
  }).then(async () => {
    await api.deleteApiSetting(apiForm.value.setting_id)
    await fetchApiSettings()
    showSuccessToast(t('apiSetting.deleteSuccess'))
  }).catch(() => {
    // 取消
  })
}

async function testModels() {
  showToast(t('apiSetting.testing'))

  const res = await api.testModelConnect({
    api_key: apiForm.value.api_key,
    url: apiForm.value.api_url,
    model: apiForm.value.model,
    messages: [
      {
        role: 'user',
        content: 'hello',
      },
    ],
  })
  if (res?.data?.choices?.[0]?.message) {
    showSuccessToast(t('apiSetting.testSuccess'))
  }
  else {
    showFailToast(res?.message)
  }
}

async function connectApi() {
  const res = await api.getModelList({
    api_key: apiForm.value.api_key,
    url: apiForm.value.api_url,
  })
  if (res?.data) {
    modleList.value = res.data || []
    showSuccessToast(t('apiSetting.connectSuccess'))
  }
  else {
    showFailToast(res?.message)
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <van-form ref="formRef">
      <!-- 配置选择 + 保存/删除 -->
      <div class="flex gap-3 items-center justify-between">
        <van-field
          v-model="apiForm.setting_name" right-icon="arrow-down" :placeholder="t('apiSetting.selectSetting')"
          class="flex-1" :rules="[{ required: true, message: t('apiSetting.selectSetting') }]"
          @click-right-icon="handleClickApiName"
        />
        <div class="flex gap-2">
          <van-button size="small" type="primary" @click="addSetting">
            {{ t('apiSetting.add') }}
          </van-button>
          <van-button size="small" type="warning" @click="saveSetting">
            {{ t('apiSetting.save') }}
          </van-button>
          <van-button size="small" plain color="#ff4949" @click="deleteSetting">
            {{ t('apiSetting.delete') }}
          </van-button>
        </div>
      </div>

      <!-- 自定义 URL / 密钥 -->
      <van-field
        v-model="apiForm.api_url" :placeholder="t('apiSetting.apiUrl')"
        :rules="[{ required: true, message: t('apiSetting.apiUrl') }]"
      />
      <van-field
        v-model="apiForm.api_key" :placeholder="t('apiSetting.apiKey')" type="password"
        :rules="[{ required: true, message: t('apiSetting.apiKey') }]"
      />

      <!-- 模型列表预览 + 测试/连接 -->
      <div class="flex gap-3 items-center">
        <van-field
          v-model="apiForm.model" readonly :placeholder="t('apiSetting.modelPreview')" class="flex-1" clickable
          :rules="[{ required: true, message: t('apiSetting.modelPreview') }]" @click="handleClickModelList"
        />
        <van-button size="small" @click="testModels">
          {{ t('apiSetting.test') }}
        </van-button>
        <van-button size="small" type="primary" @click="connectApi">
          {{ t('apiSetting.connect') }}
        </van-button>
      </div>
    </van-form>
    <ApiSettingChatModel :setting-list="settingList" />

    <!-- Picker 弹窗 -->
    <van-popup :show="!!showPicker" position="bottom">
      <van-picker
        :model-value="pickerValue" :columns="configColumns" @confirm="onPickerConfirm"
        @cancel="showPicker = ''"
      />
    </van-popup>
  </div>
</template>

<style scoped>
/* 简单样式微调，与项目统一样式保持一致 */
.bg-gray-100 {
  background: #f5f6f7;
}
</style>
