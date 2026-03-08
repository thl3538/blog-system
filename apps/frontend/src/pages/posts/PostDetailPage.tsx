import {
  ArrowLeftOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  LikeFilled,
  LikeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import { getVisitorId } from '../../lib/visitor';
import type { CreateCommentPayload, PostComment, PostItem } from '../../types/post';

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const [commentForm] = Form.useForm<CreateCommentPayload>();

  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostItem | null>(null);
  const [likeState, setLikeState] = useState({ count: 0, liked: false });
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const visitorId = getVisitorId();

  const fetchDetail = async () => {
    if (!postId || Number.isNaN(postId)) return;

    setLoading(true);
    try {
      const [postData, likesData, commentsData] = await Promise.all([
        postsApi.getById(postId),
        postsApi.getLikeState(postId, visitorId),
        postsApi.listComments(postId),
      ]);

      setPost(postData);
      setLikeState(likesData);
      setComments(commentsData);
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

  const toggleLike = async () => {
    if (!post) return;

    try {
      const next = likeState.liked
        ? await postsApi.unlike(post.id, visitorId)
        : await postsApi.like(post.id, visitorId);

      setLikeState(next);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: next.count,
            }
          : prev,
      );
    } catch (error) {
      const text = error instanceof HttpClientError ? error.message : '点赞操作失败';
      message.error(text);
    }
  };

  const addComment = async (values: CreateCommentPayload) => {
    if (!post) return;

    setCommentSubmitting(true);
    try {
      await postsApi.addComment(post.id, values);
      message.success('评论成功');
      commentForm.resetFields();
      const nextComments = await postsApi.listComments(post.id);
      setComments(nextComments);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: nextComments.length,
            }
          : prev,
      );
    } catch (error) {
      const text = error instanceof HttpClientError ? error.message : '评论失败';
      message.error(text);
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="!border-slate-200 !shadow-none">
          <Space direction="vertical" size={14} className="!w-full">
            <Space>
              <Link to="/">
                <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
              </Link>
              {post ? (
                <>
                  <Link to={`/posts/${post.id}/edit`}>
                    <Button icon={<EditOutlined />}>编辑文章</Button>
                  </Link>
                  <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                    删除文章
                  </Button>
                </>
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

                <Space>
                  <Button
                    type={likeState.liked ? 'primary' : 'default'}
                    icon={likeState.liked ? <LikeFilled /> : <LikeOutlined />}
                    onClick={toggleLike}
                  >
                    点赞 {likeState.count}
                  </Button>
                  <Tag icon={<CommentOutlined />}>评论 {comments.length}</Tag>
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

        <Space direction="vertical" size={12} className="!w-full">
          <Card className="!border-slate-200 !shadow-none" title="发表评论">
            <Form<CreateCommentPayload>
              form={commentForm}
              layout="vertical"
              initialValues={{ nickname: '', content: '' }}
              onFinish={addComment}
            >
              <Form.Item
                label="昵称"
                name="nickname"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input maxLength={80} placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item
                label="评论内容"
                name="content"
                rules={[{ required: true, message: '请输入评论内容' }]}
              >
                <Input.TextArea rows={4} maxLength={1000} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={commentSubmitting} block>
                发送评论
              </Button>
            </Form>
          </Card>

          <Card className="!border-slate-200 !shadow-none" title={`评论（${comments.length}）`}>
            {comments.length ? (
              <List
                dataSource={comments}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size={4} className="!w-full">
                      <Space>
                        <Typography.Text strong>{item.nickname}</Typography.Text>
                        <Typography.Text type="secondary" className="text-xs">
                          {new Date(item.createdAt).toLocaleString()}
                        </Typography.Text>
                      </Space>
                      <Typography.Paragraph className="!mb-0 !whitespace-pre-wrap">
                        {item.content}
                      </Typography.Paragraph>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="还没有评论，来发第一条吧" />
            )}
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
}

export default PostDetailPage;
