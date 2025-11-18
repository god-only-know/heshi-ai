import request from '@/utils/request'

// 获取模型列表
export function getModelList(data: Api.LLMMoel.GetModelListParams) {
  return request.post<Api.LLMMoel.GetModelListResult>('/llm-model/model-list', data)
}

// 发送连接信息
export function testModelConnect(data: Api.LLMMoel.SendTestMessageParams) {
  return request.post<Api.LLMMoel.SendMessageResult>('/llm-model/send-test-message', data)
}

// API设置相关API
export function getApiSettings() {
  return request.post<Api.ApiSetting.GetApiSettingsResult>('/api-settings/list')
}

export function getApiSettingDetail(setting_id: string) {
  return request.post<Api.ApiSetting.GetApiSettingDetailResult>('/api-settings/detail', { setting_id })
}

export function addApiSetting(data: Api.ApiSetting.AddApiSettingParams) {
  return request.post<Api.ApiSetting.AddApiSettingResult>('/api-settings', data)
}

export function updateApiSetting(data: Api.ApiSetting.UpdateApiSettingParams) {
  return request.post<Api.ApiSetting.UpdateApiSettingResult>('/api-settings/update', data)
}

export function deleteApiSetting(setting_id: string) {
  return request.post('/api-settings/delete', { setting_id })
}

// 模型设置相关API
export function getModelSetting() {
  return request.post<Api.ApiSetting.GetModelSettingResult>('/model-settings')
}

export function updateModelSetting(data: Api.ApiSetting.UpdateModelSettingParams) {
  return request.post<Api.ApiSetting.UpdateModelSettingResult>('/model-settings/update', data)
}
