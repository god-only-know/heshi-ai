# 登录系统实现说明

## 概述

本项目已经实现了完整的登录功能，包括：

1. RSA非对称加密的密码传输
2. 本地IndexedDB数据库存储用户信息
3. Token认证机制
4. 路由守卫保护

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 技术实现

### 1. 加密模块 (`src/utils/crypto.ts`)

- 使用 `jsencrypt` 库实现RSA非对称加密
- 公钥用于前端加密密码
- 私钥用于后端解密密码（注意：实际生产环境中私钥应该只在服务器端）
- 易于迁移到Go服务，只需要使用相同的RSA密钥对即可

### 2. 数据模型 (`src/server/models/user.model.ts`)

- User模型：存储用户信息（email、password、nickname等）
- LoginRecord模型：存储登录记录和token

### 3. 用户服务 (`src/server/services/user.service.ts`)

提供以下功能：

- `login()`: 用户登录，验证密码并生成token
- `register()`: 用户注册
- `getUserInfo()`: 获取用户信息
- `logout()`: 退出登录
- `initDefaultUser()`: 初始化默认用户（admin/admin123）

### 4. 本地API (`src/server/api/user.ts`)

实现以下接口：

- `POST /auth/login` - 用户登录
- `POST /user/logout` - 退出登录
- `GET /user/me` - 获取当前用户信息
- `POST /user/register` - 用户注册

### 5. 路由配置

- 添加了 `/login` 路由指向登录页面
- 在路由守卫中添加了认证检查：访问 `/` (home) 需要登录

### 6. 登录页面 (`src/pages/login/index.vue`)

- 使用RSA加密用户输入的密码
- 调用本地API进行登录
- 登录成功后跳转到首页或redirect参数指定的页面

## 工作流程

1. **用户访问首页** → 路由守卫检查登录状态 → 未登录则重定向到 `/login`
2. **用户输入账号密码** → 前端使用RSA公钥加密密码
3. **提交登录请求** → 本地server接收加密密码 → 使用RSA私钥解密
4. **验证用户信息** → 查询IndexedDB数据库 → 验证密码
5. **生成token** → 保存登录记录 → 返回token给前端
6. **前端保存token** → 存储到localStorage → 跳转到首页
7. **后续请求** → 自动携带token → 验证身份

## 迁移到Go服务

当需要迁移到独立的Go服务时：

1. **生成相同的RSA密钥对**：
   - 将 `src/utils/crypto.ts` 中的公钥和私钥复制到Go服务
   - 前端继续使用公钥加密
   - Go服务使用私钥解密

2. **实现对应的API接口**：

   ```go
   POST /api/auth/login
   POST /api/user/logout
   GET /api/user/me
   POST /api/user/register
   ```

3. **数据库迁移**：
   - 将IndexedDB中的用户数据迁移到Go服务的数据库（MySQL/PostgreSQL等）
   - 保持数据结构一致

4. **关闭本地模式**：
   - 修改 `src/utils/request.ts` 中的 `useLocalMode` 为 `false`
   - 所有请求将发送到配置的API地址

## 注意事项

1. **安全性**：
   - 当前私钥存储在前端仅用于开发演示
   - 生产环境中私钥必须只存在于服务器端
   - 建议在生产环境中重新生成RSA密钥对

2. **密码存储**：
   - 当前为简化演示，密码以明文存储在IndexedDB
   - 生产环境应该存储密码的hash值（使用bcrypt等）

3. **Token管理**：
   - Token有效期为7天
   - 可以根据需要调整过期时间

## 测试

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:3001`
3. 自动跳转到登录页面
4. 使用默认账号登录：admin / admin123
5. 登录成功后跳转到首页
