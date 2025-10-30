declare namespace ApiSetting {
  interface SettingItem {
    setting_id: string
    setting_name: string
    api_url: string
    api_key: string
    model: string
  }

  interface ModelSettingItem {
    model_setting_id: string
    main_chat_setting_id: string
    summary_setting_id: string
    dynamic_setting_id: string
    apply_to_all: boolean
  }
}
