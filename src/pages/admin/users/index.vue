<script setup lang="ts">
import type { AdminUser, UserListParams } from '@/api/admin'
import { createUser, deleteUser, getUserList, getUserStats, updateUserRole, updateUserStatus } from '@/api/admin'
import { showConfirmDialog, showNotify } from 'vant'
import { encryptWithRSA } from '@/utils/crypto'

// 统计数据
const stats = ref({
  total_users: 0,
  active_users: 0,
  admin_users: 0,
  disabled_users: 0,
})

// 新增用户相关
const showCreateUser = ref(false)
const createUserForm = ref({
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'admin',
})
const createUserLoading = ref(false)

// 用户列表
const userList = ref<AdminUser[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 查询参数
const queryParams = ref<UserListParams>({
  page: 1,
  page_size: 20,
  role: undefined,
  status: undefined,
})

const total = ref(0)

// 筛选条件
const showFilter = ref(false)
const roleFilter = ref<'user' | 'admin' | ''>('')
const statusFilter = ref<0 | 1 | ''>('')

// 加载统计数据
async function loadStats() {
  try {
    const { data } = await getUserStats()
    stats.value = data
  }
  catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载用户列表
async function loadUserList() {
  if (loading.value || finished.value)
    return

  loading.value = true
  try {
    const { data } = await getUserList(queryParams.value)
    if (queryParams.value.page === 1) {
      userList.value = data.list
    }
    else {
      userList.value.push(...data.list)
    }
    total.value = data.total

    // 判断是否加载完毕
    if (userList.value.length >= data.total) {
      finished.value = true
    }

    queryParams.value.page = (queryParams.value.page || 1) + 1
  }
  catch (error: any) {
    showNotify({ type: 'danger', message: error.message || '加载用户列表失败' })
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 刷新列表
function onRefresh() {
  finished.value = false
  queryParams.value.page = 1
  userList.value = []
  loadUserList()
  loadStats()
}

// 应用筛选
function applyFilter() {
  queryParams.value.role = roleFilter.value || undefined
  queryParams.value.status = statusFilter.value === '' ? undefined : statusFilter.value
  showFilter.value = false
  onRefresh()
}

// 重置筛选
function resetFilter() {
  roleFilter.value = ''
  statusFilter.value = ''
  queryParams.value.role = undefined
  queryParams.value.status = undefined
  showFilter.value = false
  onRefresh()
}

// 切换用户状态
async function toggleUserStatus(user: AdminUser) {
  const newStatus = user.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'

  showConfirmDialog({
    title: '确认操作',
    message: `确定要${statusText}用户 ${user.nickname || user.account} 吗？`,
  })
    .then(async () => {
      try {
        await updateUserStatus(user.id, newStatus)
        user.status = newStatus
        showNotify({ type: 'success', message: `${statusText}成功` })
        await loadStats()
      }
      catch (error: any) {
        showNotify({ type: 'danger', message: error.message || `${statusText}失败` })
      }
    })
    .catch(() => {})
}

// 切换用户角色
async function toggleUserRole(user: AdminUser) {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const roleText = newRole === 'admin' ? '管理员' : '普通用户'

  showConfirmDialog({
    title: '确认操作',
    message: `确定要将用户 ${user.nickname || user.account} 设置为${roleText}吗？`,
  })
    .then(async () => {
      try {
        await updateUserRole(user.id, newRole)
        user.role = newRole
        showNotify({ type: 'success', message: '角色更新成功' })
        await loadStats()
      }
      catch (error: any) {
        showNotify({ type: 'danger', message: error.message || '角色更新失败' })
      }
    })
    .catch(() => {})
}

// 删除用户
async function handleDeleteUser(user: AdminUser) {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除用户 ${user.nickname || user.account} 吗？此操作不可恢复！`,
  })
    .then(async () => {
      try {
        await deleteUser(user.id)
        showNotify({ type: 'success', message: '删除成功' })
        onRefresh()
      }
      catch (error: any) {
        showNotify({ type: 'danger', message: error.message || '删除失败' })
      }
    })
    .catch(() => {})
}

// 打开新增用户弹窗
function openCreateUser() {
  createUserForm.value = {
    nickname: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  }
  showCreateUser.value = true
}

// 提交新增用户
async function handleCreateUser() {
  // 验证表单
  if (!createUserForm.value.nickname || !createUserForm.value.nickname.trim()) {
    showNotify({ type: 'warning', message: '请输入用户名称' })
    return
  }

  if (!createUserForm.value.password || createUserForm.value.password.length < 6) {
    showNotify({ type: 'warning', message: '密码长度不能少于6位' })
    return
  }

  if (createUserForm.value.password !== createUserForm.value.confirmPassword) {
    showNotify({ type: 'warning', message: '两次输入的密码不一致' })
    return
  }

  createUserLoading.value = true
  try {
    // 加密密码
    const encryptedPassword = encryptWithRSA(createUserForm.value.password)

    await createUser({
      account: createUserForm.value.nickname, // 使用昵称作为账号
      password: encryptedPassword,
      nickname: createUserForm.value.nickname,
      role: createUserForm.value.role,
    })

    showNotify({ type: 'success', message: '新增用户成功' })
    showCreateUser.value = false
    onRefresh()
  }
  catch (error: any) {
    showNotify({ type: 'danger', message: error.message || '新增用户失败' })
  }
  finally {
    createUserLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadStats()
  loadUserList()
})
</script>

<template>
  <div class="admin-users">
    <!-- 统计卡片 -->
    <div class="mb-4 gap-4 grid grid-cols-2 md:grid-cols-4">
      <van-card class="bg-blue-50">
        <template #title>
          <div class="text-center">
            <div class="text-2xl text-blue-600 font-bold">
              {{ stats.total_users }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              总用户数
            </div>
          </div>
        </template>
      </van-card>
      <van-card class="bg-green-50">
        <template #title>
          <div class="text-center">
            <div class="text-2xl text-green-600 font-bold">
              {{ stats.active_users }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              活跃用户
            </div>
          </div>
        </template>
      </van-card>
      <van-card class="bg-purple-50">
        <template #title>
          <div class="text-center">
            <div class="text-2xl text-purple-600 font-bold">
              {{ stats.admin_users }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              管理员
            </div>
          </div>
        </template>
      </van-card>
      <van-card class="bg-red-50">
        <template #title>
          <div class="text-center">
            <div class="text-2xl text-red-600 font-bold">
              {{ stats.disabled_users }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              禁用用户
            </div>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        用户列表 ({{ total }})
      </h2>
      <div class="flex gap-2">
        <van-button type="success" size="small" icon="plus" @click="openCreateUser">
          新增用户
        </van-button>
        <van-button type="primary" size="small" icon="filter-o" @click="showFilter = true">
          筛选
        </van-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadUserList"
      >
        <van-card
          v-for="user in userList"
          :key="user.id"
          class="mb-2"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex gap-2 items-center">
                <span class="font-semibold">{{ user.nickname || '未设置昵称' }}</span>
                <van-tag v-if="user.role === 'admin'" type="danger" size="medium">
                  管理员
                </van-tag>
                <van-tag v-if="user.status === 0" type="warning" size="medium">
                  已禁用
                </van-tag>
              </div>
            </div>
          </template>
          <template #desc>
            <div class="text-sm text-gray-600 mt-2">
              <div>邮箱: {{ user.account }}</div>
              <div>ID: {{ user.id }}</div>
              <div>创建时间: {{ new Date(user.created_at).toLocaleString() }}</div>
            </div>
          </template>
          <template #footer>
            <div class="mt-2 flex gap-2">
              <van-button
                size="small"
                :type="user.status === 1 ? 'warning' : 'success'"
                @click="toggleUserStatus(user)"
              >
                {{ user.status === 1 ? '禁用' : '启用' }}
              </van-button>
              <van-button
                size="small"
                :type="user.role === 'admin' ? 'default' : 'primary'"
                @click="toggleUserRole(user)"
              >
                {{ user.role === 'admin' ? '设为普通用户' : '设为管理员' }}
              </van-button>
              <van-button
                size="small"
                type="danger"
                @click="handleDeleteUser(user)"
              >
                删除
              </van-button>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>

    <!-- 筛选弹出层 -->
    <van-popup v-model:show="showFilter" position="bottom" round>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">
          筛选条件
        </h3>
        <van-form>
          <van-field name="radio" label="用户角色">
            <template #input>
              <van-radio-group v-model="roleFilter" direction="horizontal">
                <van-radio name="">
                  全部
                </van-radio>
                <van-radio name="user">
                  普通用户
                </van-radio>
                <van-radio name="admin">
                  管理员
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field name="radio" label="用户状态">
            <template #input>
              <van-radio-group v-model="statusFilter" direction="horizontal">
                <van-radio name="">
                  全部
                </van-radio>
                <van-radio :name="1">
                  正常
                </van-radio>
                <van-radio :name="0">
                  禁用
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-form>
        <div class="mt-4 flex gap-2">
          <van-button block type="default" @click="resetFilter">
            重置
          </van-button>
          <van-button block type="primary" @click="applyFilter">
            应用
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 新增用户弹出层 -->
    <van-popup v-model:show="showCreateUser" position="bottom" round :style="{ height: '70%' }">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">
          新增用户
        </h3>
        <van-form>
          <van-field
            v-model="createUserForm.nickname"
            label="用户名称"
            placeholder="请输入用户名称（作为登录账号）"
            required
            clearable
          />
          <van-field
            v-model="createUserForm.password"
            type="password"
            label="密码"
            placeholder="请输入密码（不少于6位）"
            required
            clearable
          />
          <van-field
            v-model="createUserForm.confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            required
            clearable
          />
          <van-field name="radio" label="用户角色">
            <template #input>
              <van-radio-group v-model="createUserForm.role" direction="horizontal">
                <van-radio name="user">
                  普通用户
                </van-radio>
                <van-radio name="admin">
                  管理员
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-form>
        <div class="mt-4 flex gap-2">
          <van-button block type="default" @click="showCreateUser = false">
            取消
          </van-button>
          <van-button block type="primary" :loading="createUserLoading" @click="handleCreateUser">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.admin-users {
  :deep(.van-card) {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}
</style>
