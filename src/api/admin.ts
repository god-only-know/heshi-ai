import request from '@/utils/request'

// 用户管理相关接口

export interface AdminUser {
  id: number
  account: string
  nickname: string
  avatar?: string
  role: 'user' | 'admin'
  status: 0 | 1
  created_at: string
  updated_at: string
}

export interface UserListParams {
  page?: number
  page_size?: number
  role?: 'user' | 'admin'
  status?: 0 | 1
}

export interface UserListResponse {
  list: AdminUser[]
  total: number
  page: number
  page_size: number
}

export interface UserStats {
  total_users: number
  active_users: number
  admin_users: number
  disabled_users: number
}

// 获取用户列表（管理员）
export function getUserList(params?: UserListParams) {
  return request.post<UserListResponse>('/admin/users/list', params)
}

// 获取用户统计（管理员）
export function getUserStats() {
  return request.post<UserStats>('/admin/users/stats')
}

// 更新用户状态（管理员）
export function updateUserStatus(userId: number, status: 0 | 1) {
  return request.post('/admin/users/status', { user_id: userId, status })
}

// 更新用户角色（管理员）
export function updateUserRole(userId: number, role: 'user' | 'admin') {
  return request.post('/admin/users/role', { user_id: userId, role })
}

// 删除用户（管理员）
export function deleteUser(userId: number) {
  return request.post('/admin/users/delete', { user_id: userId })
}

// 新增用户（管理员）
export function createUser(data: {
  account: string
  password: string
  nickname?: string
  role?: 'user' | 'admin'
}) {
  return request.post('/admin/users/create', data)
}
