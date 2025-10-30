import request from '@/utils/request'
import { apiSettingService } from '@/server/services/api-setting.service'

export interface ModelListParams {
  url: string
  apiKey: string
}

// 获取模型列表
async function getModelList(data: Api.LLMMoel.GetModelListParams): Promise<Api.LLMMoel.GetModelListResult> {
  const { api_key, url } = data
  const requestUrl = `${url}/v1/models`
  const res = await request.get<any>(requestUrl, { headers: { Authorization: `Bearer ${api_key}` } })
  return (res.data || []).map(item => ({
    model_name: item.name,
    model_id: item.id,
  }))
}

// 测试模型连接
async function sendMessage(data: Api.LLMMoel.SendMessageParams): Promise<any> {
  const { api_key, api_url } = await apiSettingService.getApiSettingById(data.setting_id)
  const requestUrl = `${api_url}/chat/completions`
  return request.get(requestUrl, { headers: { Authorization: `Bearer ${api_key}` } })
}

// API映射表
export default [
  // 聊天记录相关
  {
    method: 'POST',
    path: '/api/llm-model/model-list',
    handler: getModelList,
  },
  {
    method: 'POST',
    path: '/api/llm-model/send-message',
    handler: sendMessage,
  },
]
