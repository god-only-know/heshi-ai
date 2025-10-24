<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant'
import { getModelList } from '@/api/apiSetting'
import useApiSettingStore from '@/stores/modules/apiSetting'
import { storeToRefs } from 'pinia'
import { v4 } from 'uuid'

const apiSettingStore = useApiSettingStore()
const { settingList,
} = storeToRefs(apiSettingStore)
const { t } = useI18n()

const modleList = ref([])
const showPicker = ref('')
const pickerValue = ref([])
const formRef = ref(null)

const configColumns = ref([])
const defaultApi = {
  id: '',
  name: '',
  apiUrl: '',
  apiKey: '',
  model: '',
}
const apiForm = ref(settingList.value.length > 0 ? { ...settingList.value[0] } : { ...defaultApi, id: v4() })

function handleClickApiName() {
  configColumns.value = settingList.value.map(item => ({ text: item.name, value: item.id }))
  showPicker.value = 'api'
  pickerValue.value = [apiForm.value.id]
}
function handleClickModelList() {
  if (modleList.value.length === 0) {
    showToast(t('apiSetting.noModels'))
    return
  }
  configColumns.value = modleList.value.map(c => ({ text: c.id, value: c.id }))
  showPicker.value = 'model'
  pickerValue.value = [apiForm.value.model]
}
function onPickerConfirm({ selectedOptions }) {
  // 支持 Picker 返回对象或字符串
  const value = selectedOptions?.[0]?.value ?? ''
  if (showPicker.value === 'api') {
    const findItem = settingList.value.find(item => item.id === value)
    apiForm.value = {
      ...findItem,
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
    apiForm.value.id = v4()
    apiSettingStore.addApiSetting(apiForm.value)
    showSuccessToast(t('apiSetting.saveSuccess'))
  }
  catch (err) {
    showFailToast(err?.[0]?.message)
  }
}
async function saveSetting() {
  try {
    await formRef.value.validate()

    apiSettingStore.updateApiSetting(apiForm.value)
    showSuccessToast(t('apiSetting.saveSuccess'))
  }
  catch (err) {
    showFailToast(err?.[0]?.message)
  }
}

function deleteSetting() {
  showConfirmDialog({
    title: t('apiSetting.deleteConfirm'),

  }).then(() => {
    // apiSettingStore.deleteApiSetting(apiForm.value.id)
    showFailToast(t('apiSetting.deleteSuccess'))
    // apiForm.value =  settingList.value.length>0 ? {...settingList.value[0]} : { ...defaultApi,id:v4() }
  }).catch(() => {
    // 取消
  })
}

function testModels() {
  showToast(t('apiSetting.testing'))
}

async function connectApi() {
  const res = await getModelList({
    apiKey: apiForm.value.apiKey,
    url: apiForm.value.apiUrl,
  })
  console.log(res)
  if (res?.data) {
    modleList.value = res.data || []
    showSuccessToast(t('apiSetting.connectSuccess'))
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <van-form ref="formRef">
      <!-- 配置选择 + 保存/删除 -->
      <div class="flex gap-3 items-center justify-between">
        <van-field
          v-model="apiForm.name" right-icon="arrow-down" :placeholder="t('apiSetting.selectSetting')"
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
        v-model="apiForm.apiUrl" :placeholder="t('apiSetting.apiUrl')"
        :rules="[{ required: true, message: t('apiSetting.apiUrl') }]"
      />
      <van-field
        v-model="apiForm.apiKey" :placeholder="t('apiSetting.apiKey')" type="password"
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
    <ApiSettingChatModel />

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
