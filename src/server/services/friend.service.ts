import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { FriendModel } from '../models/friend.model'

// 好友服务类
export class FriendService {
  // 获取所有好友
  async getAllFriends(): Promise<FriendModel[]> {
    return await db.friends.toArray()
  }

  // 根据ID获取好友
  async getFriendById(friendId: string): Promise<FriendModel | undefined> {
    return await db.friends.get(friendId)
  }

  // 添加好友
  async addFriend(friend: Omit<FriendModel, 'friend_id'>): Promise<FriendModel> {
    const friendId = uuidv4()
    const newFriend = {
      ...friend,
      friend_id: friendId,
    }
    await db.friends.add(newFriend)
    return newFriend
  }

  // 更新好友信息
  async updateFriend(friend: FriendModel): Promise<FriendModel> {
    await db.friends.update(friend.friend_id, friend)
    return friend
  }

  // 删除好友
  async deleteFriend(friendId: string): Promise<void> {
    await db.friends.delete(friendId)
  }
}

// 导出单例
export const friendService = new FriendService()
