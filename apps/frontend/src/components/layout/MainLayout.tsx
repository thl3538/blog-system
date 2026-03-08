import {
  FireOutlined,
  MessageOutlined,
  PlusOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Input, Space, Typography } from 'antd';
import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: <ReadOutlined /> },
  { path: '/posts/new', label: '写文章', icon: <PlusOutlined /> },
  { path: '/guestbook', label: '留言', icon: <MessageOutlined /> },
];

const topicTabs = ['综合', '后端', '前端', 'Android', 'iOS', '人工智能', '工具'];

function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f4f5f5] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Space size={14} className="min-w-0">
            <Typography.Title level={5} className="!mb-0 !text-blue-600">
              掘金博客
            </Typography.Title>

            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link to={item.path} key={item.path}>
                    <Button
                      type={active ? 'text' : 'text'}
                      className={active ? '!text-blue-600' : '!text-slate-600'}
                      icon={item.icon}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </Space>

          <Space size={10}>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="探索文章 / 标签"
              className="!hidden !w-56 md:!block"
            />
            <Link to="/posts/new">
              <Button type="primary" icon={<PlusOutlined />}>
                创作中心
              </Button>
            </Link>
            <Avatar style={{ backgroundColor: '#1677ff' }}>博</Avatar>
          </Space>
        </div>

        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex h-10 max-w-7xl items-center gap-4 overflow-x-auto px-4 text-sm text-slate-500">
            <Space size={6} className="!text-orange-500">
              <FireOutlined />
              热门
            </Space>
            {topicTabs.map((topic, index) => (
              <span
                key={topic}
                className={index === 0 ? 'cursor-pointer text-blue-600' : 'cursor-pointer hover:text-blue-600'}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export default MainLayout;
