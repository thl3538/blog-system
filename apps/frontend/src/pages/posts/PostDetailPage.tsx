import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Modal, Skeleton, Space, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import type { PostItem } from '../../types/post';

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostItem | null>(null);

  const fetchDetail = async () => {
    if (!postId || Number.isNaN(postId)) return;

    setLoading(true);
    try {
      const data = await postsApi.getById(postId);
      setPost(data);
    } catch (error) {
      const text = error instanceof HttpClientError ? error.message : '文章加载失败';
      message.error(text);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleDelete = () => {
    if (!post) return;

    Modal.confirm({
      title: '确认删除这篇文章？',
      content: `《${post.title}》删除后不可恢复。`,
      okType: 'danger',
      onOk: async () => {
        try {
          await postsApi.remove(post.id);
          message.success('文章已删除');
          navigate('/');
        } catch (error) {
          const text = error instanceof HttpClientError ? error.message : '删除失败';
          message.error(text);
        }
      },
    });
  };

  return (
    <MainLayout>
      <Card className="!border-slate-200 !shadow-none">
        <Space direction="vertical" size={14} className="!w-full">
          <Space>
            <Link to="/">
              <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
            </Link>
            {post ? (
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除文章
              </Button>
            ) : null}
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} title={{ width: '45%' }} />
          ) : post ? (
            <>
              <Typography.Title level={2} className="!mb-1">
                {post.title}
              </Typography.Title>
              <Typography.Paragraph className="!mb-2 !text-slate-600">
                {post.summary}
              </Typography.Paragraph>
              <Space wrap>
                <Tag color="blue">ID #{post.id}</Tag>
                <Tag>创建：{new Date(post.createdAt).toLocaleString()}</Tag>
                <Tag>更新：{new Date(post.updatedAt).toLocaleString()}</Tag>
              </Space>
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="prose max-w-none prose-slate prose-pre:overflow-x-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <Empty description="文章不存在或已被删除" />
          )}
        </Space>
      </Card>
    </MainLayout>
  );
}

export default PostDetailPage;
