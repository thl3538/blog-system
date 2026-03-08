import { ClockCircleOutlined, CommentOutlined, LikeOutlined } from '@ant-design/icons';
import { Card, Empty, Input, Pagination, Segmented, Skeleton, Space, Typography, message } from 'antd';
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
        <Card className="!border-slate-200 !shadow-none">
          <Space direction="vertical" size={12} className="!w-full">
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

            {loading ? (
              <Skeleton active paragraph={{ rows: 7 }} title={{ width: '30%' }} />
            ) : items.length ? (
              <div className="space-y-3">
                {items.map((post) => (
                  <Link key={post.id} to={`/posts/${post.id}`} className="block">
                    <Card className="!border-slate-200 !shadow-none hover:!border-blue-400">
                      <Typography.Title level={5} className="!mb-1 line-clamp-1">
                        {post.title}
                      </Typography.Title>
                      <Typography.Paragraph className="!mb-2 line-clamp-2 !text-slate-600">
                        {post.summary}
                      </Typography.Paragraph>
                      <Space size={12} className="!text-xs !text-slate-500">
                        <span>
                          <ClockCircleOutlined />{' '}
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                        <span>ID #{post.id}</span>
                        <span>
                          <LikeOutlined /> {post.likesCount}
                        </span>
                        <span>
                          <CommentOutlined /> {post.commentsCount}
                        </span>
                      </Space>
                    </Card>
                  </Link>
                ))}

                <div className="flex justify-end">
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
              <Empty description="暂无文章" />
            )}
          </Space>
        </Card>

        <Card className="!border-slate-200 !shadow-none" title="推荐标签">
          <Space wrap>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">后端</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">前端</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">AI</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">工具</span>
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
}

export default PostListPage;
