import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/prose')
}

// 导出clochat相关API
export * from './clochat'
