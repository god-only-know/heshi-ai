import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { initialModelSettings } from '../models/api-setting.model'
// API设置服务类
export class ApiSettingService {
  // 获取所有API设置
  async getAllApiSettings(): Promise<Api.ApiSetting.GetApiSettingsResult> {
    return await db.apiSettings.toArray()
  }

  // 根据ID获取API设置
  async getApiSettingById(settingId: string): Promise<Api.ApiSetting.GetApiSettingDetailResult | undefined> {
    return await db.apiSettings.get(settingId)
  }

  // 添加API设置
  async addApiSetting(setting: Api.ApiSetting.AddApiSettingParams): Promise<Api.ApiSetting.AddApiSettingResult> {
    const settingId = uuidv4()
    const newSetting = {
      ...setting,
      setting_id: settingId,
    }
    await db.apiSettings.add(newSetting)
    return newSetting
  }

  // 更新API设置
  async updateApiSetting(setting: Api.ApiSetting.UpdateApiSettingParams): Promise<Api.ApiSetting.UpdateApiSettingResult> {
    await db.apiSettings.update(setting.setting_id, setting)
    return setting
  }

  // 删除API设置
  async deleteApiSetting(settingId: string): Promise<void> {
    await db.apiSettings.delete(settingId)
  }

  // 获取模型设置
  async getModelSetting(): Promise<Api.ApiSetting.GetModelSettingResult | undefined> {
    // 假设只有一个模型设置，ID为1
    const res = await db.modelSettings.toArray()
    const id = res?.[0]?.model_setting_id
    if (id) {
      const result = await db.modelSettings.get(id)
      const data = {
        model_setting_id: id,
        main_chat_setting: await db.apiSettings.get(result?.main_chat_setting_id),
        summary_setting: await db.apiSettings.get(result?.summary_setting_id),
        dynamic_setting: await db.apiSettings.get(result?.dynamic_setting_id),
        apply_to_all: result.apply_to_all,
      }
      return data
    }
    else {
      await db.modelSettings.add(initialModelSettings[0])
      return {
        model_setting_id: initialModelSettings[0].model_setting_id,
        main_chat_setting: null,
        summary_setting: null,
        dynamic_setting: null,
        apply_to_all: initialModelSettings[0].apply_to_all,
      }
    }
  }

  // 更新模型设置
  async updateModelSetting(setting: Api.ApiSetting.UpdateModelSettingParams): Promise<Api.ApiSetting.UpdateModelSettingResult> {
    const res = await db.modelSettings.toArray()
    const id = res?.[0]?.model_setting_id
    if (id) {
      await db.modelSettings.update(id, setting)
    }
    return this.getModelSetting()
  }
}

// 导出单例
export const apiSettingService = new ApiSettingService()
