import clochatApis from './clochat'
import apiSettingApis from './api-setting'
import llmModel from './llm-model'
import userApis from './user'
import type { InternalAxiosRequestConfig } from 'axios'
import { isEmpty } from 'lodash-es'

// 构建请求处理函数
const apiMap = [...clochatApis, ...apiSettingApis, ...llmModel, ...userApis].reduce((acc, api) => {
  const key = `${api.method} ${api.path}`
  acc[key] = api.handler
  return acc
}, {})
// 构建响应数据
function builder(data: unknown, message = 'success', code = 0) {
  // 响应体结构 - 使用data字段以匹配前端store的期望
  const responseBody = {
    message: '',
    timestamp: 0,
    data, // 使用data而不是result
    code: 0,
  }

  if (message !== undefined && message !== null)
    responseBody.message = message

  if (code !== undefined && code !== 0)
    responseBody.code = code

  responseBody.timestamp = new Date().getTime()
  return responseBody
}

function hasApiReuest(apiKey) {
  return !!apiMap[apiKey]
}
// 处理API请求并返回结果

async function handleApiRequest(apiKey: string, config: InternalAxiosRequestConfig) {
  try {
    // 精确匹配
    if (apiMap[apiKey]) {
      const requestParams = config.data || config.params

      // const promise = new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve(true)
      //   }, 1000)
      // })
      // await promise
      const response = await apiMap[apiKey](requestParams)
      const builtResponse = builder(response)

      console.groupCollapsed(`\x1B[34m 模拟请求 \x1B[0m | ${config.method?.toUpperCase()} ${config.url}`)
      if (requestParams && !isEmpty(requestParams)) {
        console.log('\x1B[36m%s\x1B[0m', '👉 请求参数:')
        console.dir(requestParams, { depth: null, colors: true })
      }
      console.log('\x1B[33m%s\x1B[0m', '✅ 响应数据:')
      console.dir(builtResponse, { depth: null, colors: true })
      console.groupEnd()

      return builtResponse
    }
    else {
      return false
    }

    return null
  }
  catch (error) {
    const errorData = builder(null, `请求处理失败:${error.message}`, 500)
    console.groupCollapsed(`\x1B[31m 模拟请求错误 \x1B[0m | ${config.method?.toUpperCase()} ${config.url}`)
    console.log('\x1B[36m%s\x1B[0m', '👉 请求参数:')
    console.dir(errorData, { depth: null, colors: true })
    console.log('\x1B[31m%s\x1B[0m', '❌ 错误信息:')
    console.error(error)
    console.groupEnd()

    return Promise.resolve(errorData)
  }
}

// 本地模式请求处理器
export function createLocalRequestHandler(config: InternalAxiosRequestConfig): Promise<any> {
  const { method = 'GET', url = '' } = config
  const apiKey = `${method.toUpperCase()} ${import.meta.env.VITE_APP_API_BASE_URL}${url}`

  if (hasApiReuest(apiKey)) {
    return Promise.resolve({
      ...config,
      adapter: async () => {
        // 处理API请求并返回结果
        const response = await handleApiRequest(apiKey, config)

        return {
          data: response,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      },
    })
  }
  return Promise.resolve(config)
}
