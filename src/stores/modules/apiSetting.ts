import { defineStore } from 'pinia'
import api from '@/api/index'

interface ApiSettingState {
  modelForm: {
    mainChatModel: ApiSetting.SettingItem | null
    summaryModel: ApiSetting.SettingItem | null
    dynamicModel: ApiSetting.SettingItem | null
    applyToAll: boolean
  }
}

const useApiSettingStore = defineStore('apiSetting', () => {
  const modelForm = ref<ApiSettingState['modelForm']>({
    mainChatModel: null,
    summaryModel: null,
    dynamicModel: null,
    applyToAll: false,
  })
  // 获取模型设置
  async function getModelSetting() {
    const res = await api.getModelSetting()
    const { main_chat_setting, summary_setting, dynamic_setting, apply_to_all } = res?.data
    modelForm.value = {
      mainChatModel: main_chat_setting,
      summaryModel: summary_setting,
      dynamicModel: dynamic_setting,
      applyToAll: apply_to_all,
    }
  }
  // 更新模型设置
  async function updateModelSetting(data: Api.ApiSetting.UpdateModelSettingParams) {
    try {
      const res = await api.updateModelSetting(data)
      if (res?.data) {
        return res.data
      }
    }
    catch (error) {
      console.error('更新模型设置失败:', error)
    }
  }
  function getMainChatModelId() {
    return modelForm.value.mainChatModel?.setting_id || ''
  }
  // 设置主聊天模型
  function setMainChatModel(setting: ApiSetting.SettingItem | null) {
    modelForm.value.mainChatModel = setting
    updateModelSetting({
      main_chat_setting_id: setting?.setting_id,
    })
  }

  // 设置摘要模型
  function setSummaryModel(setting: ApiSetting.SettingItem | null) {
    modelForm.value.summaryModel = setting
    updateModelSetting({
      summary_setting_id: setting?.setting_id,
    })
  }

  // 设置动态模型
  function setDynamicModel(setting: ApiSetting.SettingItem | null) {
    modelForm.value.dynamicModel = setting
    updateModelSetting({
      dynamic_setting_id: setting?.setting_id,
    })
  }

  // 设置是否应用到所有
  function setApplyToAll(apply: boolean) {
    modelForm.value.applyToAll = apply
    updateModelSetting({
      apply_to_all: apply,
    })
  }

  return {
    modelForm,
    getMainChatModelId,
    getModelSetting,
    updateModelSetting,
    setMainChatModel,
    setSummaryModel,
    setDynamicModel,
    setApplyToAll,
  }
})

export default useApiSettingStore
