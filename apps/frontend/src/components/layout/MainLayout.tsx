import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { clearAuthToken, hasAuthToken } from '../../lib/auth';
import type { AuthUser } from '../../types/auth';
import './MainLayout.css';

type NavItem = {
  label: string;
  path?: string;
};

const navItems: NavItem[] = [
  { label: '首页', path: '/' },
  { label: '写文章', path: '/posts/new' },
  { label: '留言板', path: '/guestbook' },
  { label: '沸点' },
  { label: '课程' },
  { label: '直播' },
  { label: '活动' },
  { label: '插件' },
];

const topicTabs = [
  '综合',
  '关注',
  '后端',
  '前端',
  'Android',
  'iOS',
  '人工智能',
  '阅读',
  '代码人生',
];

const roleLabelMap = {
  ADMIN: '管理员',
  EDITOR: '编辑',
  AUTHOR: '作者',
} as const;

function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      const next = hasAuthToken();
      setAuthed(next);
      if (!next) {
        setUser(null);
      }
    };

    syncAuth();

    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!authed) return;

    let active = true;

    authApi
      .me()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
      })
      .catch(() => {
        if (!active) return;
        clearAuthToken();
        setAuthed(false);
        setUser(null);
      });

    return () => {
      active = false;
    };
  }, [authed]);

  const logout = () => {
    clearAuthToken();
    setAuthed(false);
    setUser(null);
    navigate('/auth/login', { replace: true });
  };

  const displayName = useMemo(() => {
    if (!user) return '已登录';
    return user.name?.trim() || user.email.split('@')[0] || '已登录';
  }, [user]);

  const userMenu: MenuProps = {
    items: [
      {
        key: 'role',
        label: user ? roleLabelMap[user.role] : '用户',
        disabled: true,
      },
      {
        key: 'email',
        label: user?.email ?? '-',
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: '退出登录',
      },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        logout();
      }
    },
  };

  return (
    <div className="juejin-shell">
      <header className="juejin-header">
        <div className="juejin-header-main">
          <div className="juejin-header-left">
            <Link to="/" className="juejin-logo" aria-label="掘金首页">
              <span className="juejin-logo-mark">掘</span>
              <span className="juejin-logo-text">稀土掘金</span>
            </Link>

            <nav className="juejin-nav" aria-label="主导航">
              {navItems.map((item) => {
                if (!item.path) {
                  return (
                    <button key={item.label} type="button" className="juejin-nav-item">
                      {item.label}
                    </button>
                  );
                }

                const active =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    to={item.path}
                    key={item.path}
                    className={`juejin-nav-item ${active ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="juejin-header-right">
            <label className="juejin-search">
              <SearchOutlined className="juejin-search-icon" />
              <input placeholder="探索稀土掘金" />
            </label>

            <Link to="/posts/new" className="juejin-creator-btn">
              创作者中心
            </Link>

            {authed ? (
              <Dropdown menu={userMenu} trigger={['click']}>
                <button type="button" className="juejin-user-menu" aria-label="用户菜单">
                  <Avatar size={30} style={{ backgroundColor: '#1e80ff' }}>
                    {displayName.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <span className="juejin-user-name">{displayName}</span>
                  <DownOutlined className="juejin-user-arrow" />
                </button>
              </Dropdown>
            ) : (
              <Link to="/auth/login" className="juejin-login-btn">
                登录 | 注册
              </Link>
            )}
          </div>
        </div>

        <div className="juejin-topic-wrap">
          <div className="juejin-topic-inner">
            {topicTabs.map((topic, index) => (
              <button
                key={topic}
                type="button"
                className={`juejin-topic-tab ${index === 0 ? 'is-active' : ''}`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="juejin-main">{children}</main>
    </div>
  );
}

export default MainLayout;
