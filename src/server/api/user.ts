import { userService } from '../services/user.service'
import { getToken } from '@/utils/auth'

interface ApiHandler {
  method: string
  path: string
  handler: (params: any) => Promise<any>
}

const userApis: ApiHandler[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    handler: async (params: { email: string, password: string }) => {
      const { email, password } = params
      const result = await userService.login(email, password)
      return result
    },
  },
  {
    method: 'POST',
    path: '/api/user/logout',
    handler: async () => {
      const token = getToken()
      await userService.logout(token)
      return { success: true }
    },
  },
  {
    method: 'GET',
    path: '/api/user/me',
    handler: async () => {
      const token = getToken()
      const userInfo = await userService.getUserInfo(token)
      return userInfo
    },
  },
  {
    method: 'POST',
    path: '/api/user/register',
    handler: async (params: { email: string, password: string, nickname?: string }) => {
      const { email, password, nickname } = params
      const result = await userService.register(email, password, nickname)
      return result
    },
  },
]

export default userApis
