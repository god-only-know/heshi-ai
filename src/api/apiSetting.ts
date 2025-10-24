import request from '@/utils/request'

export interface ModelListParams {
  url: string
  apiKey: string
}
export function getModelList(data: ModelListParams): Promise<any> {
  const { url, apiKey } = data
  const requestUrl = `${url}/v1/models`
  return request.get(requestUrl, { headers: { Authorization: `Bearer ${apiKey}` } })
}
export function testModelConnect(data: ModelListParams): Promise<any> {
  const { url, apiKey } = data
  const requestUrl = `${url}/v1/models`
  return request.get(requestUrl, { headers: { Authorization: `Bearer ${apiKey}` } })
}
