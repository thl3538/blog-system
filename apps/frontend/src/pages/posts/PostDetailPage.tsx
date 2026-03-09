import {
  ArrowLeftOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LikeFilled,
  LikeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Skeleton,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import { getVisitorId } from '../../lib/visitor';
import type { CreateCommentPayload, PostComment, PostItem } from '../../types/post';
import './PostDetailPage.css';

const authorPool = ['林北辰', '周南', '代码田螺', '阿晨同学', '木木前端', '严叔'];

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

  const authorName = useMemo(() => {
    if (!post) return '-';
    return authorPool[post.id % authorPool.length];
  }, [post]);

  const readingMinutes = useMemo(() => {
    if (!post?.content) return 1;
    return Math.max(1, Math.round(post.content.length / 420));
  }, [post]);

  return (
    <MainLayout>
      <div className="jj-detail-grid">
        <aside className="jj-detail-actions">
          <button
            type="button"
            className={`jj-action-btn ${likeState.liked ? 'is-active' : ''}`}
            onClick={toggleLike}
            aria-label="点赞"
          >
            {likeState.liked ? <LikeFilled /> : <LikeOutlined />}
          </button>
          <span>{likeState.count}</span>

          <a href="#comments" className="jj-action-btn" aria-label="评论">
            <CommentOutlined />
          </a>
          <span>{comments.length}</span>

          <button type="button" className="jj-action-btn" aria-label="收藏">
            <StarOutlined />
          </button>
        </aside>

        <div className="jj-detail-main">
          <div className="jj-detail-card">
            <div className="jj-detail-tools">
              <Link to="/" className="jj-tool-link">
                <ArrowLeftOutlined /> 返回首页
              </Link>

              {post ? (
                <div className="jj-tool-right">
                  <Link to={`/posts/${post.id}/edit`} className="jj-tool-link">
                    <EditOutlined /> 编辑
                  </Link>
                  <button type="button" className="jj-tool-danger" onClick={handleDelete}>
                    <DeleteOutlined /> 删除
                  </button>
                </div>
              ) : null}
            </div>

            {loading ? (
              <div className="jj-detail-loading">
                <Skeleton active paragraph={{ rows: 14 }} title={{ width: '48%' }} />
              </div>
            ) : post ? (
              <>
                <header className="jj-article-header">
                  <h1>{post.title}</h1>
                  <p>{post.summary}</p>

                  <div className="jj-article-author-row">
                    <Avatar style={{ backgroundColor: '#1e80ff' }}>
                      {authorName.slice(0, 1)}
                    </Avatar>
                    <div className="author-meta">
                      <strong>{authorName}</strong>
                      <span>
                        发布于 {new Date(post.createdAt).toLocaleString()} · 更新于{' '}
                        {new Date(post.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <button type="button" className="follow-btn">
                      + 关注
                    </button>
                  </div>

                  <div className="jj-article-stats">
                    <span>
                      <EyeOutlined /> 阅读 {Math.max(post.id * 38, 680)}
                    </span>
                    <span>
                      <LikeOutlined /> 点赞 {likeState.count}
                    </span>
                    <span>
                      <CommentOutlined /> 评论 {comments.length}
                    </span>
                    <span>预计阅读 {readingMinutes} 分钟</span>
                  </div>
                </header>

                <article className="jj-article-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </article>
              </>
            ) : (
              <div className="jj-detail-empty">
                <Empty description="文章不存在或已被删除" />
              </div>
            )}
          </div>

          <section className="jj-detail-card jj-comments-card" id="comments">
            <div className="jj-comments-title">评论区（{comments.length}）</div>
            <Form<CreateCommentPayload>
              form={commentForm}
              layout="vertical"
              initialValues={{ nickname: '', content: '' }}
              onFinish={addComment}
              className="jj-comment-form"
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
                <Input.TextArea rows={4} maxLength={1000} placeholder="欢迎交流你的观点" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={commentSubmitting}>
                发表评论
              </Button>
            </Form>

            <div className="jj-comment-list">
              {comments.length ? (
                <List
                  dataSource={comments}
                  renderItem={(item) => (
                    <List.Item className="!px-0">
                      <div className="jj-comment-item">
                        <Avatar style={{ backgroundColor: '#c2c8d1' }}>
                          {item.nickname.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <div className="jj-comment-body">
                          <div className="head">
                            <strong>{item.nickname}</strong>
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{item.content}</p>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="还没有评论，来抢沙发吧" />
              )}
            </div>
          </section>
        </div>

        <aside className="jj-detail-sidebar">
          <div className="jj-detail-card jj-side-card">
            <div className="jj-side-title">关于作者</div>
            <div className="jj-author-box">
              <Avatar size={48} style={{ backgroundColor: '#1e80ff' }}>
                {authorName.slice(0, 1)}
              </Avatar>
              <div>
                <strong>{authorName}</strong>
                <p>持续在掘金分享前端与工程化实战。</p>
              </div>
            </div>
            <button type="button" className="jj-side-follow">
              关注作者
            </button>
          </div>

          <div className="jj-detail-card jj-side-card">
            <div className="jj-side-title">文章信息</div>
            <ul>
              <li>字数：{post?.content.length ?? 0}</li>
              <li>点赞：{likeState.count}</li>
              <li>评论：{comments.length}</li>
              <li>阅读：{post ? Math.max(post.id * 38, 680) : 0}</li>
            </ul>
          </div>

          <div className="jj-detail-card jj-side-card">
            <div className="jj-side-title">相关文章</div>
            <div className="jj-related-list">
              {[1, 2, 3, 4, 5].map((item) => (
                <Link to="/" key={item}>
                  掘金 UI 高还原技巧：第 {item} 期实践复盘
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

export default PostDetailPage;
