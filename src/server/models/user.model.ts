import Dexie from 'dexie'
import type { EntityTable } from 'dexie'

export interface User {
  id?: number
  email: string
  password: string
  nickname?: string
  avatar?: string
  createdAt?: number
  updatedAt?: number
}

export interface LoginRecord {
  id?: number
  userId: number
  token: string
  loginAt: number
  expireAt: number
}

export class UserDatabase extends Dexie {
  users!: EntityTable<User, 'id'>
  loginRecords!: EntityTable<LoginRecord, 'id'>

  constructor() {
    super('UserDatabase')
    this.version(1).stores({
      users: '++id, email',
      loginRecords: '++id, userId, token',
    })
  }
}

export const userDb = new UserDatabase()
