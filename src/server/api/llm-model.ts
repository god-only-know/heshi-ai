import request from '@/utils/request'
import { apiSettingService } from '@/server/services/api-setting.service'
import { chatRecordService } from '../services/chat-record.service'

export interface ModelListParams {
  url: string
  apiKey: string
}

// 获取模型列表
async function getModelList(data: Api.LLMMoel.GetModelListParams): Promise<Api.LLMMoel.GetModelListResult> {
  const { api_key, url } = data
  const requestUrl = `${url}/models`
  const res = await request.get<any>(requestUrl, { headers: { Authorization: `Bearer ${api_key}` } })
  return (res.data || []).map(item => ({
    model_name: item.id,
    model_id: item.id,
  }))
}

// 发送链接信息
async function sendTestMessage(data: Api.LLMMoel.SendTestMessageParams): Promise<any> {
  const { api_key, url, model, messages } = data
  const apiKey = api_key
  const apiUrl = url
  const params = {
    model,
    messages,
  }
  const requestUrl = `${apiUrl}/chat/completions`
  return postLLMModel(apiKey, requestUrl, params)
}
// 发送链接信息
async function sendMessage(data: Api.LLMMoel.SendMessageParams): Promise<any> {
  if (data.user_message !== '') {
    // 添加历史记录
    await chatRecordService.addChatRecord({
      chat_id: data.chat_id,
      content: data.user_message,
      type: 'user',
    })
  }
  // 获取历史记录
  const messages = await chatRecordService.getChatRecords(data.chat_id)
  const apiSetting = await apiSettingService.getApiSettingById(data.setting_id)
  const apiKey = apiSetting.api_key
  const apiUrl = apiSetting.api_url
  const params = {
    model: apiSetting.model,
    max_tokens: 2048,
    messages: messages.map(i => (
      {
        role: i.type,
        content: i.content,
      }
    )),
  }

  const requestUrl = `${apiUrl}/chat/completions`
  const res = await postLLMModel(apiKey, requestUrl, params)

  const content = res?.choices?.[0]?.message?.content
  await chatRecordService.addChatRecord({
    chat_id: data.chat_id,
    content,
    type: 'assistant',
  })
  return res
}

async function postLLMModel(apiKey, apiUrl, params): Promise<any> {
  const res = await request.post(apiUrl, params, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  return res
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
    path: '/api/llm-model/send-test-message',
    handler: sendTestMessage,
  },
  {
    method: 'POST',
    path: '/api/llm-model/send-message',
    handler: sendMessage,
  },
]
