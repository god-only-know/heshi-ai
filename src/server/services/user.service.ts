import { v4 as uuidv4 } from 'uuid'
import { userDb } from '../models/user.model'
import type { User } from '../models/user.model'
import { decryptWithRSA } from '@/utils/crypto'

export class UserService {
  /**
   * 用户登录
   */
  async login(email: string, encryptedPassword: string) {
    try {
      // 解密密码（开发环境暂时跳过解密，直接使用明文密码）
      let password = encryptedPassword

      // 尝试解密，如果失败则认为是明文密码（用于测试）
      try {
        password = decryptWithRSA(encryptedPassword)
      }
      catch (decryptError) {
        console.log('解密失败，尝试使用明文密码')
        password = encryptedPassword
      }

      // 查找用户
      const user = await userDb.users.where('email').equals(email).first()

      if (!user) {
        throw new Error('用户不存在')
      }

      // 验证密码（这里简化处理，实际应该对比hash）
      // 注意：在真实场景中，数据库中应该存储密码的hash值，而不是明文
      if (user.password !== password) {
        throw new Error('密码错误')
      }

      // 生成token
      const token = uuidv4()
      const loginAt = Date.now()
      const expireAt = loginAt + 7 * 24 * 60 * 60 * 1000 // 7天后过期

      // 保存登录记录
      await userDb.loginRecords.add({
        userId: user.id!,
        token,
        loginAt,
        expireAt,
      })

      return {
        token,
        user: {
          uid: user.id,
          nickname: user.nickname || user.email,
          avatar: user.avatar || '',
        },
      }
    }
    catch (error: any) {
      throw new Error(error.message || '登录失败')
    }
  }

  /**
   * 注册用户
   */
  async register(email: string, encryptedPassword: string, nickname?: string) {
    try {
      // 解密密码
      const password = decryptWithRSA(encryptedPassword)

      // 检查用户是否已存在
      const existingUser = await userDb.users.where('email').equals(email).first()
      if (existingUser) {
        throw new Error('用户已存在')
      }

      // 创建用户
      const userId = await userDb.users.add({
        email,
        password, // 注意：实际应该存储hash值
        nickname: nickname || email,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      return {
        id: userId,
        email,
        nickname: nickname || email,
      }
    }
    catch (error: any) {
      throw new Error(error.message || '注册失败')
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(token: string) {
    try {
      // 查找登录记录
      const loginRecord = await userDb.loginRecords.where('token').equals(token).first()

      if (!loginRecord) {
        throw new Error('未登录或登录已过期')
      }

      // 检查token是否过期
      if (loginRecord.expireAt < Date.now()) {
        throw new Error('登录已过期')
      }

      // 获取用户信息
      const user = await userDb.users.get(loginRecord.userId)

      if (!user) {
        throw new Error('用户不存在')
      }

      return {
        uid: user.id,
        nickname: user.nickname || user.email,
        avatar: user.avatar || '',
      }
    }
    catch (error: any) {
      throw new Error(error.message || '获取用户信息失败')
    }
  }

  /**
   * 退出登录
   */
  async logout(token: string) {
    try {
      // 删除登录记录
      const loginRecord = await userDb.loginRecords.where('token').equals(token).first()
      if (loginRecord && loginRecord.id) {
        await userDb.loginRecords.delete(loginRecord.id)
      }
      return true
    }
    catch (error) {
      throw new Error('退出登录失败')
    }
  }

  /**
   * 初始化默认用户（用于测试）
   */
  async initDefaultUser() {
    try {
      const email = 'admin'
      const existingUser = await userDb.users.where('email').equals(email).first()

      if (!existingUser) {
        await userDb.users.add({
          email,
          password: 'admin123', // 默认密码
          nickname: '管理员',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        console.log('默认用户已创建: admin / admin123')
      }
    }
    catch (error) {
      console.error('初始化默认用户失败:', error)
    }
  }
}

export const userService = new UserService()
