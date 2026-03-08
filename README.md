# Blog System (React + Vite + NestJS)

一个简单的全栈博客系统示例：

- 前端：React + Vite + TypeScript
- 后端：NestJS + TypeScript
- 功能：文章列表、发布、编辑、删除

## 项目结构

```text
blog-system/
  apps/
    frontend/   # React + Vite
    backend/    # NestJS API
```

## 快速开始

```bash
cd blog-system
npm install --workspaces
```

### 启动后端

```bash
npm run dev:backend
```

默认地址：`http://localhost:3000`

API 前缀：`/api`

- `GET /api/health`
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`

### 启动前端

新开一个终端：

```bash
cd blog-system
npm run dev:frontend
```

默认地址：`http://localhost:5173`

前端默认请求 `http://localhost:3000/api`。

如需修改，可在前端 `.env` 中设置：

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 后续可扩展

- 接入数据库（PostgreSQL / MySQL）
- 用户登录鉴权（JWT）
- 富文本编辑器
- 上传图片与文件
- 评论系统与标签分类
