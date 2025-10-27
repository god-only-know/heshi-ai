// 定义Friend模型
export interface FriendModel extends Clochat.FriendItem {}

// 定义表结构
export const friendTableSchema = 'friend_id, friend_name, friend_avatar, friend_introduce'

// 初始数据
export const initialFriends: FriendModel[] = [
  {
    friend_id: '1',
    friend_name: '小猫',
    friend_avatar: 'https://picsum.photos/200/300',
    friend_introduce: '小猫是一个可爱的小猫',
  },
  {
    friend_id: '2',
    friend_name: '小狗',
    friend_avatar: 'https://picsum.photos/200/301',
    friend_introduce: '小狗是一个可爱的小狗',
  },
  {
    friend_id: '3',
    friend_name: '小鸡',
    friend_avatar: 'https://picsum.photos/200/302',
    friend_introduce: '小狗是一个可爱的小鸡',
  },
]
