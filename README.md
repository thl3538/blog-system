# Blog System (React + Vite + NestJS + MySQL)

一个可持续迭代的全栈博客系统：

- 前端：React + Vite + TypeScript + Ant Design + Tailwind
- 后端：NestJS + Prisma + JWT + RBAC
- 数据库：MySQL
- 编辑体验：集成开源 Markdown 编辑器（@uiw/react-md-editor）、插图、自动本地草稿
- 互动功能：点赞、评论、留言
- 工程化：GitHub Actions CI、Dockerfile、一键部署脚本

## 项目结构

```text
blog-system/
  apps/
    frontend/
    backend/
  scripts/
  .github/workflows/
```

## 本地开发

### 1) 安装依赖

```bash
cd blog-system
npm install --workspaces
```

### 2) 配置环境变量

```bash
cp apps/backend/.env.development.example apps/backend/.env
cp apps/frontend/.env.development.example apps/frontend/.env
```

### 3) 准备 MySQL

请确保本机已有 MySQL，并创建数据库：

```sql
CREATE DATABASE blog_system;
```

### 4) 生成 Prisma Client + 推表（不走 migration）

```bash
npm run prisma:generate
npm run prisma:push
```

### 5) 启动服务

```bash
npm run dev:backend
npm run dev:frontend
```

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`

## 主要 API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`（需 Bearer Token）
- `GET /api/posts?page=1&pageSize=10&keyword=nest&sortBy=createdAt&order=desc&status=PUBLISHED`
- `GET /api/posts/:id`
- `POST /api/posts`（需登录，角色：ADMIN/EDITOR/AUTHOR）
- `PATCH /api/posts/:id`（需登录，角色：ADMIN/EDITOR）
- `DELETE /api/posts/:id`（需登录，角色：ADMIN/EDITOR）
- `GET /api/posts/:id/likes?visitorId=visitor_xxx`
- `POST /api/posts/:id/likes`
- `DELETE /api/posts/:id/likes`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `GET /api/guestbook/messages`
- `POST /api/guestbook/messages`

## 工程化（第5步）

### CI（GitHub Actions）

工作流文件：`.github/workflows/ci.yml`

CI 会自动执行：
1. `npm ci`
2. Prisma Client 生成
3. lint
4. build
5. backend test

### Docker 部署（前后端一键）

1. 准备生产环境变量：

```bash
cp apps/backend/.env.production.example apps/backend/.env.production
cp apps/frontend/.env.production.example apps/frontend/.env.production
```

2. 一键部署：

```bash
npm run deploy
```

3. 停止服务：

```bash
npm run deploy:down
```

部署后默认地址：
- 前端：`http://localhost:8080`
- 后端健康检查：`http://localhost:3000/api/health`

## 常用命令

```bash
npm run lint
npm run build
npm run test
npm run ci
npm run prisma:generate
npm run prisma:push
npm run prisma:studio
```
