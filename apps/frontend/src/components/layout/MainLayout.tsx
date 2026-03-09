import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken, hasAuthToken } from '../../lib/auth';
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

function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const syncAuth = () => setAuthed(hasAuthToken());
    syncAuth();

    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  const logout = () => {
    clearAuthToken();
    setAuthed(false);
    navigate('/auth/login', { replace: true });
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
              <>
                <span className="juejin-user-badge">已登录</span>
                <button type="button" className="juejin-login-btn" onClick={logout}>
                  退出登录
                </button>
              </>
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
