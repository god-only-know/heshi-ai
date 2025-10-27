/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
// declare interface AxiosResponse {
//   result: any
// }
// declare module 'axios' {
//   export interface AxiosResponse<T = any> {
//     result: T // 覆盖原有 data 字段，使用 result 作为数据载体
//   }
// }
