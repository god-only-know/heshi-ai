declare namespace Api {
  namespace ApiSetting {

    interface SettingItem {
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }
    // 获取API设置列表返回结果
    type GetApiSettingsResult = Array<{
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }>

    // 获取API设置详情参数
    interface GetApiSettingDetailParams {
      setting_id: string
    }

    // 获取API设置详情返回结果
    interface GetApiSettingDetailResult {
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }

    // 添加API设置参数
    interface AddApiSettingParams {
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }

    // 添加API设置返回结果
    interface AddApiSettingResult {
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }

    // 更新API设置参数
    interface UpdateApiSettingParams {
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }

    // 更新API设置返回结果
    interface UpdateApiSettingResult {
      setting_id: string
      setting_name: string
      api_url: string
      api_key: string
      model: string
    }

    // 删除API设置参数
    interface DeleteApiSettingParams {
      setting_id: string
    }

    // 获取模型设置返回结果
    interface GetModelSettingResult {
      model_setting_id: string
      main_chat_setting: SettingItem
      summary_setting: SettingItem
      dynamic_setting: SettingItem
      apply_to_all: boolean
    }

    // 更新模型设置参数
    interface UpdateModelSettingParams {
      model_setting_id?: string
      main_chat_setting_id?: string
      summary_setting_id?: string
      dynamic_setting_id?: string
      apply_to_all?: boolean
    }

    // 更新模型设置返回结果
    interface UpdateModelSettingResult {
      model_setting_id: string
      main_chat_setting: SettingItem
      summary_setting: SettingItem
      dynamic_setting: SettingItem
      apply_to_all: boolean
    }
  }
}
