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

    interface SendMessageParams {
      setting_id: string
      messages: {
        role: 'system' | 'user' | 'assistant'
        content: string
      }[]
    }
    interface SendMessageResult {
      message: string
      [key: string]: any
    }
  }
}
