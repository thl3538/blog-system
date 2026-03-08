# Blog System (React + Vite + NestJS + MySQL)

一个简单的全栈博客系统：

- 前端：React + Vite + TypeScript
- 后端：NestJS + Prisma
- 数据库：MySQL
- 功能：文章列表、发布、编辑、删除

## 项目结构

```text
blog-system/
  apps/
    frontend/         # React + Vite
    backend/          # NestJS API + Prisma
      prisma/
        schema.prisma
```

## 1) 安装依赖

```bash
cd blog-system
npm install --workspaces
```

## 2) 准备 MySQL

请确保本机已有 MySQL，并创建数据库：

```sql
CREATE DATABASE blog_system;
```

默认连接字符串示例：

```text
mysql://root:password@localhost:3306/blog_system
```

## 3) 配置后端环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
```

## 4) 生成 Prisma Client + 同步表结构（不使用 migration）

```bash
npm run prisma:generate
npm run prisma:push
```

## 5) 启动后端

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
npm run prisma:generate
npm run prisma:push
npm run prisma:migrate   # 可选：未来需要 migration 再用
npm run prisma:studio
npm run build
npm run test --workspace backend
```
