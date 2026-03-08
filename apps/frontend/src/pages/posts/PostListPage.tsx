import {
  ClockCircleOutlined,
  CommentOutlined,
  FireOutlined,
  LikeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Card,
  Empty,
  Input,
  List,
  Pagination,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import type { PostItem } from '../../types/post';

function PostListPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'createdAt' | 'title'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchList = async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    sortBy?: 'createdAt' | 'title';
    order?: 'asc' | 'desc';
  }) => {
    const nextPage = params?.page ?? page;
    const nextPageSize = params?.pageSize ?? pageSize;
    const nextKeyword = params?.keyword ?? keyword;
    const nextSortBy = params?.sortBy ?? sortBy;
    const nextOrder = params?.order ?? order;

    setLoading(true);
    try {
      const data = await postsApi.list({
        page: nextPage,
        pageSize: nextPageSize,
        keyword: nextKeyword,
        sortBy: nextSortBy,
        order: nextOrder,
      });

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setSortBy(data.sortBy);
      setOrder(data.order);
    } catch (error) {
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

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="!border-slate-200 !shadow-none" bodyStyle={{ padding: 0 }}>
          <div className="border-b border-slate-100 px-4 py-3">
            <Space direction="vertical" size={10} className="!w-full">
              <Input.Search
                allowClear
                placeholder="搜索文章标题/摘要"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onSearch={(value) => {
                  void fetchList({ page: 1, keyword: value });
                }}
              />

              <Space wrap size={8}>
                <Segmented<'createdAt' | 'title'>
                  size="small"
                  value={sortBy}
                  onChange={(value) => {
                    void fetchList({ page: 1, sortBy: value as 'createdAt' | 'title' });
                  }}
                  options={[
                    { label: '按创建时间', value: 'createdAt' },
                    { label: '按标题', value: 'title' },
                  ]}
                />
                <Segmented<'asc' | 'desc'>
                  size="small"
                  value={order}
                  onChange={(value) => {
                    void fetchList({ page: 1, order: value as 'asc' | 'desc' });
                  }}
                  options={[
                    { label: '升序', value: 'asc' },
                    { label: '降序', value: 'desc' },
                  ]}
                />
              </Space>
            </Space>
          </div>

          {loading ? (
            <div className="p-4">
              <Skeleton active paragraph={{ rows: 8 }} title={{ width: '35%' }} />
            </div>
          ) : items.length ? (
            <>
              <List
                dataSource={items}
                renderItem={(post) => (
                  <List.Item className="!border-b !border-slate-100 !px-4 !py-4 hover:!bg-slate-50/70">
                    <Link key={post.id} to={`/posts/${post.id}`} className="block w-full">
                      <Space direction="vertical" size={8} className="!w-full">
                        <Space size={10} className="!text-xs !text-slate-500">
                          <UserOutlined />
                          <span>用户 {post.id}</span>
                          <span>·</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </Space>

                        <Typography.Title
                          level={5}
                          className="!mb-0 line-clamp-2 transition-colors hover:!text-blue-600"
                        >
                          {post.title}
                        </Typography.Title>

                        <Typography.Paragraph className="!mb-0 line-clamp-2 !text-slate-500">
                          {post.summary}
                        </Typography.Paragraph>

                        <Space size={14} className="!text-xs !text-slate-500">
                          <span>
                            <LikeOutlined /> {post.likesCount}
                          </span>
                          <span>
                            <CommentOutlined /> {post.commentsCount}
                          </span>
                          <span>
                            <ClockCircleOutlined /> 更新于{' '}
                            {new Date(post.updatedAt).toLocaleDateString()}
                          </span>
                        </Space>
                      </Space>
                    </Link>
                  </List.Item>
                )}
              />

              <div className="flex justify-end px-4 py-4">
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
            </>
          ) : (
            <div className="p-8">
              <Empty description="暂无文章" />
            </div>
          )}
        </Card>

        <Space direction="vertical" size={12} className="!w-full">
          <Card className="!border-slate-200 !shadow-none" title="热门标签">
            <Space wrap>
              {['后端', '前端', 'AI', '数据库', '架构', '工程化'].map((tag) => (
                <Tag key={tag} className="cursor-pointer !rounded-full !px-3">
                  {tag}
                </Tag>
              ))}
            </Space>
          </Card>

          <Card className="!border-slate-200 !shadow-none" title="热门文章">
            <Space direction="vertical" className="!w-full" size={10}>
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-start gap-2 text-sm">
                  <span className="min-w-5 font-semibold text-orange-500">{rank}</span>
                  <span className="line-clamp-2 text-slate-700 hover:text-blue-600">
                    掘金风格交互实践：第 {rank} 条推荐位示例
                  </span>
                </div>
              ))}
            </Space>
          </Card>

          <Card className="!border-slate-200 !shadow-none" title="公告">
            <Space direction="vertical" size={6} className="!w-full text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 text-orange-500">
                <FireOutlined /> 本周上新：点赞 + 评论 + 留言
              </span>
              <span>欢迎体验新版本交互，反馈会优先处理。</span>
            </Space>
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
}

export default PostListPage;
