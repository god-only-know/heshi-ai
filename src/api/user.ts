import request from '@/utils/request'

export interface LoginData {
  account: string
  password: string
}

export interface LoginRes {
  token: string
}

export interface UserState {
  uid?: number
  account?: string
  nickname?: string
  avatar?: string
  role?: 'user' | 'admin'
}

export function login(data: LoginData): Promise<any> {
  return request.post<LoginRes>('/user/login', data)
}

export function logout() {
  return request.post('/user/logout')
}

export function getUserInfo() {
  return request.get<UserState>('/user/info')
}
