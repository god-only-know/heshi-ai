import { apiSettingService } from '@/server/services/api-setting.service'

// API设置相关API
/** 获取API设置列表 */
function getApiSettings() {
  return apiSettingService.getAllApiSettings()
}

/** 获取API设置详情 */
function getApiSettingDetail(data: Api.ApiSetting.GetApiSettingDetailParams) {
  return apiSettingService.getApiSettingById(data.setting_id)
}

/** 添加API设置 */
function addApiSetting(data: Api.ApiSetting.AddApiSettingParams) {
  return apiSettingService.addApiSetting(data)
}

/** 更新API设置 */
function updateApiSetting(data: Api.ApiSetting.UpdateApiSettingParams) {
  return apiSettingService.updateApiSetting(data)
}

/** 删除API设置 */
function deleteApiSetting(data: Api.ApiSetting.DeleteApiSettingParams) {
  return apiSettingService.deleteApiSetting(data.setting_id)
}

/** 获取模型设置 */
function getModelSetting() {
  return apiSettingService.getModelSetting()
}

/** 更新模型设置 */
function updateModelSetting(data: Api.ApiSetting.UpdateModelSettingParams) {
  return apiSettingService.updateModelSetting(data)
}

// API映射表
export default [
  // API设置相关
  {
    method: 'POST',
    path: '/api/api-settings/list',
    handler: getApiSettings,
  },
  {
    method: 'POST',
    path: '/api/api-settings/detail',
    handler: getApiSettingDetail,
  },
  {
    method: 'POST',
    path: '/api/api-settings',
    handler: addApiSetting,
  },
  {
    method: 'POST',
    path: '/api/api-settings/update',
    handler: updateApiSetting,
  },
  {
    method: 'POST',
    path: '/api/api-settings/delete',
    handler: deleteApiSetting,
  },

  // 模型设置相关
  {
    method: 'POST',
    path: '/api/model-settings',
    handler: getModelSetting,
  },
  {
    method: 'POST',
    path: '/api/model-settings/update',
    handler: updateModelSetting,
  },
]
