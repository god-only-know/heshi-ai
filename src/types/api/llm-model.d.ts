declare namespace Api {
  namespace LLMMoel {

    interface GetModelListParams {
      url: string
      api_key: string
    }
    type GetModelListResult = {
      model_name: string
      model_id: string
    }[]

    interface SendTestMessageParams {
      url: string
      api_key: string
      model: string
      messages?: {
        role: 'system' | 'user' | 'assistant'
        content: string
      }[]
    }
    interface SendMessageParams {
      setting_id: string
      chat_id: string
      user_message: string
      message_ids?: string[]
    }
    interface SendMessageResult {
      message: string
      [key: string]: any
    }
  }
}
