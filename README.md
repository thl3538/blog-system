# Blog System (React + Vite + NestJS + PostgreSQL)

一个简单的全栈博客系统：

- 前端：React + Vite + TypeScript
- 后端：NestJS + Prisma
- 数据库：PostgreSQL
- 功能：文章列表、发布、编辑、删除

## 项目结构

```text
blog-system/
  apps/
    frontend/         # React + Vite
    backend/          # NestJS API + Prisma
      prisma/
        schema.prisma
  docker-compose.yml  # 本地 PostgreSQL
```

## 1) 安装依赖

```bash
cd blog-system
npm install --workspaces
```

## 2) 启动数据库（Docker）

```bash
docker compose up -d
```

默认数据库连接：

- user: `blog`
- password: `blog`
- db: `blog_system`
- port: `5432`

## 3) 配置后端环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
```

## 4) 生成 Prisma Client + 执行迁移

```bash
cd apps/backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## 5) 启动后端

```bash
cd /path/to/blog-system
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

## 6) 启动前端

新开一个终端：

```bash
cd /path/to/blog-system
npm run dev:frontend
```

默认地址：`http://localhost:5173`

前端默认请求：`http://localhost:3000/api`

如需修改，可在 `apps/frontend/.env` 中设置：

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 常用命令

```bash
# 后端 Prisma 命令
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend -- --name init
npm run prisma:studio --workspace backend

# 构建
npm run build

# 测试（后端）
npm run test --workspace backend
```
