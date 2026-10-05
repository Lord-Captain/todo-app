# Todo App — 全栈任务管理系统

一个具备**用户认证、数据隔离、分页筛选、乐观更新、完整测试覆盖**的全栈任务管理应用，采用前后端分离架构。

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize)
![Tests](https://img.shields.io/badge/tests-18%20passed-brightgreen)

## ✨ 功能特性

**用户系统**
- 注册 / 登录（JWT 无状态认证，bcrypt 密码哈希）
- 多用户数据隔离：每个用户只能访问自己的任务
- 登录接口限流（20 次/15 分钟），防暴力破解；登录失败统一提示，防用户名枚举

**任务管理**
- 增删改查 + 双击行内编辑
- 优先级（低/中/高）与截止日期（逾期红色高亮）
- 按状态筛选（全部/未完成/已完成）、多字段排序（创建时间/截止日期/优先级/名称）
- 分页加载（服务端分页，limit 上限 50）

**工程化**
- 后端四层架构：routes → controllers → services → models
- 声明式参数校验（express-validator）+ 统一错误处理中间件
- 乐观更新（先改界面再等服务器确认，失败自动回滚）
- 18 个接口单元测试（内存数据库隔离）+ 15 项端到端冒烟测试
- 优雅停机、安全响应头（helmet）、环境变量驱动配置

## 🏗️ 技术栈与架构

| 层 | 技术 |
|---|---|
| 前端 | React 19、Vite 7、React Router 7、TanStack Query 5 |
| 后端 | Node.js、Express 5、Sequelize 6 |
| 数据库 | SQLite（可平滑切换 PostgreSQL/MySQL） |
| 测试 | Jest、Supertest |
| 安全 | JWT、bcrypt、helmet、express-rate-limit |

```
┌──────────────┐  /api/**（Vite 开发代理）  ┌─────────────────────────────┐
│   React SPA  │ ────────────────────────► │  Express API                │
│              │   Authorization: Bearer   │  middleware: 鉴权/校验/限流   │
│ TanStack     │                           │  routes → controllers       │
│ Query 缓存   │ ◄──────────────────────── │     → services → models     │
│ + 乐观更新    │      JSON 响应             │     → SQLite (Sequelize)    │
└──────────────┘                           └─────────────────────────────┘
```

## 🚀 快速开始

**环境要求**：Node.js ≥ 18

**1. 启动后端**（端口 3001）

```bash
cd server
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev
```

**2. 启动前端**（端口 5173，另开一个终端）

```bash
cd client
npm install
npm run dev
```

打开 http://localhost:5173 ，注册一个账号即可使用。

## 🧪 运行测试

```bash
cd server
npm test                # 18 个接口单元测试（Jest + 内存 SQLite）
node smoke-test.js      # 15 项端到端冒烟测试（需先启动服务器）
```

## 📖 API 文档

所有接口均以 `/api` 为前缀；🔒 表示需要 `Authorization: Bearer <token>` 头。

### 认证

| 方法 | 路径 | 说明 | 请求体 |
|---|---|---|---|
| POST | `/api/auth/register` | 注册并返回 token | `{ username, password }` |
| POST | `/api/auth/login` | 登录并返回 token | `{ username, password }` |

> 用户名 3–30 位字母数字；密码至少 6 位。

### 任务

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | 🔒 `/api/todos` | 分页列表，查询参数：`page`、`limit`（1–50）、`status`（all/active/completed）、`sort`、`order` |
| POST | 🔒 `/api/todos` | 创建任务：`{ text, priority?, dueDate? }` |
| PATCH | 🔒 `/api/todos/:id` | 部分更新：`{ text?, completed?, priority?, dueDate? }` |
| DELETE | 🔒 `/api/todos/:id` | 删除任务 |

**响应示例**（`GET /api/todos?page=1&limit=10`）：

```json
{
  "todos": [
    {
      "id": 1,
      "text": "写单元测试",
      "completed": false,
      "priority": "high",
      "dueDate": "2026-11-01",
      "createdAt": "2026-10-05T10:00:00.000Z",
      "updatedAt": "2026-10-05T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

**错误格式**：所有错误统一返回 `{ "error": "描述信息" }`，状态码语义：`400` 参数校验失败、`401` 未认证/token 无效、`404` 资源不存在、`409` 冲突（如用户名已存在）、`429` 请求过于频繁。

## 📁 项目结构

```
todo-app/
├── client/                  # React 前端
│   └── src/
│       ├── api/             # HTTP 客户端与接口封装（自动携带 token）
│       ├── components/      # 表单/列表/筛选条/分页
│       ├── context/         # 认证状态（AuthProvider）
│       ├── hooks/           # useAuth
│       └── pages/           # 登录页 / 任务主页
└── server/                  # Express 后端
    ├── config/              # 环境变量、数据库连接
    ├── controllers/         # HTTP 进出（薄层）
    ├── services/            # 业务逻辑与数据访问
    ├── models/              # Sequelize 模型与关联
    ├── middleware/          # 鉴权、校验、限流、错误处理
    ├── routes/              # 路由定义 + 声明式校验规则
    ├── tests/               # Jest + Supertest 接口测试
    ├── app.js               # 应用装配（可被测试直接引入）
    └── server.js            # 启动入口 + 优雅停机
```

## 🔒 安全设计要点

- **密码安全**：bcrypt 哈希存储（自动加盐），对外输出剥离哈希字段
- **数据隔离**：所有任务查询强制携带 `userId` 条件，越权访问按 404 处理
- **注入防护**：ORM 参数化查询 + 排序字段白名单校验
- **限流**：认证接口独立限流，防暴力破解
- **信息收敛**：生产环境隐藏内部错误细节，登录失败不区分"用户不存在/密码错误"
- **密钥管理**：`.env` 不入库（`.gitignore`），生产环境未配置 `JWT_SECRET` 时拒绝启动

