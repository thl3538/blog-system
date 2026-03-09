import {
  ClockCircleOutlined,
  CommentOutlined,
  EyeOutlined,
  LikeOutlined,
  RiseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Empty, Pagination, Skeleton, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import ServiceUnavailable from '../../components/ServiceUnavailable';
import { HttpClientError, isServiceUnavailableError } from '../../lib/http';
import type { PostItem, PostStatus } from '../../types/post';
import './PostListPage.css';

const channelTabs = ['推荐', '最新', '热榜', '后端', '前端', 'AI', '阅读'];

const quickNavItems = [
  { label: '首页', active: true },
  { label: '沸点' },
  { label: '课程' },
  { label: '直播' },
  { label: '活动' },
  { label: '竞赛' },
  { label: 'AI Coding' },
];

const categoryPool = ['后端', '前端', '人工智能', '架构设计', '工程化', '开源'];
const authorPool = ['林北辰', '周南', '代码田螺', '阿晨同学', '木木前端', '严叔'];

const statusLabels: Record<PostStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

const getMeta = (post: PostItem) => {
  const category = categoryPool[post.id % categoryPool.length];
  const author = authorPool[post.id % authorPool.length];
  const minutes = (post.id * 7) % 59;
  const viewCount = Math.max(
    260,
    post.likesCount * 46 + post.commentsCount * 29 + post.id * 33,
  );

  return {
    category,
    author,
    minutes,
    viewCount,
  };
};

function PostListPage() {
  const [loading, setLoading] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [items, setItems] = useState<PostItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFeed, setActiveFeed] = useState<'recommend' | 'latest'>('recommend');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PostStatus>('PUBLISHED');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchList = async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: 'ALL' | PostStatus;
  }) => {
    const nextPage = params?.page ?? page;
    const nextPageSize = params?.pageSize ?? pageSize;
    const nextKeyword = params?.keyword ?? keyword;
    const nextStatus = params?.status ?? statusFilter;

    setLoading(true);
    try {
      const data = await postsApi.list({
        page: nextPage,
        pageSize: nextPageSize,
        keyword: nextKeyword,
        status: nextStatus === 'ALL' ? undefined : nextStatus,
        sortBy: 'createdAt',
        order: 'desc',
      });

      setServiceUnavailable(false);
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setStatusFilter(nextStatus);
      setKeyword(nextKeyword);
      setSearchInput(nextKeyword);
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        setServiceUnavailable(true);
        setItems([]);
        return;
      }

      const text =
        error instanceof HttpClientError ? error.message : '文章列表加载失败';
      message.error(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchList({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayItems = useMemo(() => {
    const nextItems = [...items];

    if (activeFeed === 'latest') {
      return nextItems.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    return nextItems.sort((a, b) => {
      const hotA = a.likesCount * 4 + a.commentsCount * 2;
      const hotB = b.likesCount * 4 + b.commentsCount * 2;
      return hotB - hotA;
    });
  }, [items, activeFeed]);

  const rankList = useMemo(
    () =>
      [...displayItems]
        .sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount))
        .slice(0, 5),
    [displayItems],
  );

  return (
    <MainLayout>
      <div className="jj-home-grid">
        <aside className="jj-quick-nav">
          <div className="jj-card jj-quick-nav-card">
            {quickNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`jj-quick-nav-item ${item.active ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="jj-feed-wrap">
          <div className="jj-card jj-feed-card">
            <div className="jj-feed-header">
              <div className="jj-feed-tabs">
                {channelTabs.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`jj-feed-tab ${
                      (index === 0 && activeFeed === 'recommend') ||
                      (index === 1 && activeFeed === 'latest')
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => {
                      if (index === 1) {
                        setActiveFeed('latest');
                        return;
                      }
                      if (index === 0) {
                        setActiveFeed('recommend');
                      }
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="jj-feed-actions">
                <div className="jj-status-filter" role="tablist" aria-label="文章状态筛选">
                  {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`jj-status-pill ${statusFilter === status ? 'is-active' : ''}`}
                      onClick={() => {
                        void fetchList({ page: 1, keyword: searchInput, status });
                      }}
                    >
                      {status === 'ALL' ? '全部' : statusLabels[status]}
                    </button>
                  ))}
                </div>

                <label className="jj-feed-search">
                  <SearchOutlined />
                  <input
                    value={searchInput}
                    placeholder="搜索文章标题/摘要"
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void fetchList({ page: 1, keyword: searchInput });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void fetchList({ page: 1, keyword: searchInput });
                    }}
                  >
                    搜索
                  </button>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="jj-feed-loading">
                <Skeleton active paragraph={{ rows: 10 }} title={{ width: '30%' }} />
              </div>
            ) : serviceUnavailable ? (
              <ServiceUnavailable
                compact
                onRetry={() => {
                  void fetchList({ page: 1, keyword: searchInput });
                }}
              />
            ) : displayItems.length ? (
              <div>
                {displayItems.map((post) => {
                  const meta = getMeta(post);

                  return (
                    <article key={post.id} className="jj-feed-item">
                      <Link to={`/posts/${post.id}`} className="jj-feed-link">
                        <div className="jj-feed-link-inner">
                          <div className="jj-feed-main">
                            <div className="jj-feed-item-meta">
                              <span>{meta.author}</span>
                              <span className="dot">·</span>
                              <span>{meta.category}</span>
                              <span className={`jj-item-status is-${post.status.toLowerCase()}`}>
                                {statusLabels[post.status]}
                              </span>
                              <span className="dot">·</span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString()} · {meta.minutes}分钟前
                              </span>
                            </div>

                            <h3>{post.title}</h3>
                            <p>{post.summary}</p>

                            <div className="jj-feed-item-stats">
                              <span>
                                <EyeOutlined /> {meta.viewCount}
                              </span>
                              <span>
                                <LikeOutlined /> {post.likesCount}
                              </span>
                              <span>
                                <CommentOutlined /> {post.commentsCount}
                              </span>
                              <span>
                                <ClockCircleOutlined /> {new Date(post.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="jj-feed-thumb" aria-hidden="true">
                            <span>{meta.category}</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}

                <div className="jj-feed-pagination">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    pageSizeOptions={[5, 10, 20, 50]}
                    onChange={(nextPage, nextPageSize) => {
                      void fetchList({
                        page: nextPage,
                        pageSize: nextPageSize,
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="jj-feed-empty">
                <Empty description="暂无文章，换个关键词试试" />
              </div>
            )}
          </div>
        </section>

        <aside className="jj-sidebar">
          <div className="jj-card jj-sign-card">
            <h4>下午好 👋</h4>
            <p>点亮社区荣誉值，持续创作更容易被推荐</p>
            <Link to="/posts/new">立即创作</Link>
          </div>

          <div className="jj-card jj-ad-card">
            <span>掘金专栏</span>
            <strong>2026 前端工程化趋势报告</strong>
            <p>从 AI 协作到性能优化，一次看全实战方法。</p>
          </div>

          <div className="jj-card jj-rank-card">
            <div className="jj-card-title">
              <RiseOutlined /> 作者榜
            </div>
            <div className="jj-rank-list">
              {rankList.map((post, index) => {
                const meta = getMeta(post);
                return (
                  <div key={post.id} className="jj-rank-item">
                    <span className="rank-no">{index + 1}</span>
                    <div>
                      <div className="name">{meta.author}</div>
                      <div className="desc">本周新增获赞 {post.likesCount + post.commentsCount}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="jj-card jj-tags-card">
            <div className="jj-card-title">热门标签</div>
            <div className="jj-tag-list">
              {['前端', 'TypeScript', 'Node.js', 'AI', '架构', 'React'].map((tag) => (
                <button key={tag} type="button" className="jj-tag-item">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

export default PostListPage;
