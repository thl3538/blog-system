import { PlusOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: <ReadOutlined /> },
  { path: '/posts/new', label: '写文章', icon: <PlusOutlined /> },
  { path: '/guestbook', label: '留言', icon: <ReadOutlined /> },
];

function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f4f5f5]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Space size={12}>
            <Typography.Title level={5} className="!mb-0">
              稀土博客
            </Typography.Title>
            <Tag color="blue">Juejin 风格</Tag>
          </Space>

          <Space size={4}>
            {navItems.map((item) => {
              const active =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link to={item.path} key={item.path}>
                  <Button type={active ? 'primary' : 'text'} icon={item.icon}>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </Space>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export default MainLayout;
