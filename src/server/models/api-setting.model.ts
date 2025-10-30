// 定义 ApiSetting 模型
export interface ApiSettingModel {
  setting_id: string
  setting_name: string
  api_url: string
  api_key: string
  model: string
}

// 定义 ModelSetting 模型
export interface ModelSettingModel {
  model_setting_id: string
  main_chat_setting_id: string
  summary_setting_id: string
  dynamic_setting_id: string
  apply_to_all: boolean
}

// 定义表结构
export const apiSettingTableSchema = 'setting_id, setting_name, api_url, api_key, model'
export const modelSettingTableSchema = 'model_setting_id, main_chat_setting_id, summary_setting_id, dynamic_setting_id, apply_to_all'

// 初始数据
export const initialApiSettings: ApiSettingModel[] = [
  {
    setting_id: '1',
    setting_name: 'OpenAI',
    api_url: 'https://api.openai.com',
    api_key: '',
    model: 'gpt-3.5-turbo',
  },
]

export const initialModelSettings: ModelSettingModel[] = [
  {
    model_setting_id: '1',
    main_chat_setting_id: '',
    summary_setting_id: '',
    dynamic_setting_id: '',
    apply_to_all: false,
  },
]
