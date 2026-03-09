# 前端 UI 收尾验收报告（掘金高还原版）

更新时间：2026-03-09

## 1) 验收范围

- 首页（`/`）
- 文章详情页（`/posts/:id`）
- 写文章页（`/posts/new`）
- 编辑页（`/posts/:id/edit`）
- 留言页（`/guestbook`）
- 全局布局（顶部双层导航、页面主容器、侧栏 sticky 行为）

## 2) 验收结论

- [x] 风格统一：颜色、边框、阴影、圆角、字体层级已统一
- [x] 布局统一：主内容 + 右侧信息栏模式在多页一致
- [x] 交互统一：hover / focus / active 反馈风格一致
- [x] 响应式：移动端自动收敛侧栏，主内容可正常阅读
- [x] 工程质量：ESLint + Build 通过

## 3) 视觉对齐细节（本轮冲刺）

1. 全局设计变量（`index.css`）
   - 主色、文字层级、边框色、阴影、过渡时长统一为变量
2. 顶部导航（`MainLayout.css`）
   - 主导航激活下划线、搜索框聚焦态、按钮 hover 细节强化
3. 首页信息流（`PostListPage.css/.tsx`）
   - 卡片 hover 与标题强调
   - 文章项补充右侧缩略图位，信息密度更接近掘金
   - 右侧栏 sticky 跟随
4. 详情页（`PostDetailPage.css`）
   - 左侧互动按钮状态、正文内容区、评论区 hover 优化
   - 右侧栏 sticky 跟随
5. 编辑页（`PostEditorPage.css`）
   - 编辑器 focus ring、标题输入层级、侧栏 sticky 跟随
6. 留言页（`GuestbookPage.css`）
   - 留言项 hover、卡片层级、右侧栏 sticky 跟随

## 4) 验收命令

在仓库根目录执行：

```bash
npm run qa:frontend
```

其中包含：

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

## 5) 注意事项

- 前端页面依赖后端接口，若后端未启动会出现 `Network Error` 提示；
  该情况不影响 UI 结构和样式验收。

## 6) 结语

当前版本已完成“高还原 + 统一风格 + 收尾验收”。
如需继续 1:1 贴合官方站点，可进入下一阶段：

- 字号/行高逐像素标定
- 间距网格精调（8pt/4pt 体系）
- 动效曲线与时长（easing）逐项校准
- 暗色模式对齐
