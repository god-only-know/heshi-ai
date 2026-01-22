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
    handler: async (params: { account: string, password: string }) => {
      const { account, password } = params
      const result = await userService.login(account, password)
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
    path: '/api/user/info',
    handler: async () => {
      const token = getToken()
      const userInfo = await userService.getUserInfo(token)
      return userInfo
    },
  },
  {
    method: 'POST',
    path: '/api/user/register',
    handler: async (params: { account: string, password: string, nickname?: string }) => {
      const { account, password, nickname } = params
      const result = await userService.register(account, password, nickname)
      return result
    },
  },
]

export default userApis
