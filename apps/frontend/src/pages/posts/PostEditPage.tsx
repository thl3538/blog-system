import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Segmented,
  Skeleton,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useMemo, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import type { PostPayload } from '../../types/post';

type FormValues = PostPayload;
type EditorMode = 'live' | 'edit' | 'preview';

function PostEditPage() {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = Number(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [exists, setExists] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>('live');

  const content = Form.useWatch('content', form) ?? '';
  const allValues = Form.useWatch([], form) as FormValues | undefined;

  const draftKey = useMemo(() => `blog-system-draft:edit:${postId}`, [postId]);

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setExists(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const post = await postsApi.getById(postId);

        let values: FormValues = {
          title: post.title,
          summary: post.summary,
          content: post.content,
        };

        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(draftKey);
          if (raw) {
            try {
              const draft = JSON.parse(raw) as FormValues;
              values = {
                title: draft.title ?? values.title,
                summary: draft.summary ?? values.summary,
                content: draft.content ?? values.content,
              };
              message.info('已恢复该文章本地草稿');
            } catch {
              window.localStorage.removeItem(draftKey);
            }
          }
        }

        form.setFieldsValue(values);
        setExists(true);
      } catch (error) {
        const text = error instanceof HttpClientError ? error.message : '文章加载失败';
        message.error(text);
        setExists(false);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [draftKey, form, postId]);

  useEffect(() => {
    if (!allValues || typeof window === 'undefined' || !exists) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(allValues));
      setSavedAt(new Date().toLocaleTimeString());
    }, 600);

    return () => window.clearTimeout(timer);
  }, [allValues, draftKey, exists]);

  const submit = async (values: FormValues) => {
    if (!postId || Number.isNaN(postId)) return;

    setSubmitting(true);
    try {
      const updated = await postsApi.update(postId, values);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(draftKey);
      }
      message.success('文章更新成功');
      navigate(`/posts/${updated.id}`);
    } catch (error) {
      const text = error instanceof HttpClientError ? error.message : '更新失败';
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Card
        className="!border-slate-200 !shadow-none"
        title="编辑文章"
        extra={
          savedAt ? (
            <Typography.Text type="secondary">草稿已保存：{savedAt}</Typography.Text>
          ) : null
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} title={{ width: '35%' }} />
        ) : !exists ? (
          <Empty description="文章不存在或已被删除" />
        ) : (
          <Form<FormValues> layout="vertical" form={form} onFinish={submit}>
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input maxLength={120} placeholder="请输入文章标题" />
            </Form.Item>

            <Form.Item
              label="摘要"
              name="summary"
              rules={[{ required: true, message: '请输入摘要' }]}
            >
              <Input maxLength={300} placeholder="一句话概括这篇文章" />
            </Form.Item>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Segmented<EditorMode>
                value={editorMode}
                onChange={(value) => setEditorMode(value as EditorMode)}
                options={[
                  { label: '分栏预览', value: 'live' },
                  { label: '仅编辑', value: 'edit' },
                  { label: '仅预览', value: 'preview' },
                ]}
              />

              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = String(reader.result ?? '');
                    const current = form.getFieldValue('content') ?? '';
                    const next = `${current}${current ? '\n\n' : ''}![${file.name}](${dataUrl})`;
                    form.setFieldValue('content', next);
                    message.success('图片已插入 Markdown');
                  };
                  reader.readAsDataURL(file as File);
                  return false;
                }}
              >
                <Button>插入图片</Button>
              </Upload>
            </div>

            <Form.Item
              label="正文（Markdown）"
              name="content"
              rules={[{ required: true, message: '请输入正文内容' }]}
            >
              <div data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={(value) => form.setFieldValue('content', value ?? '')}
                  preview={editorMode}
                  previewOptions={{ remarkPlugins: [remarkGfm] }}
                  textareaProps={{ placeholder: '支持 Markdown：# 标题、- 列表、```代码块```' }}
                  height={460}
                />
              </div>
            </Form.Item>

            <Space>
              <Link to={`/posts/${postId}`}>
                <Button icon={<ArrowLeftOutlined />}>返回详情</Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                保存修改
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </MainLayout>
  );
}

export default PostEditPage;
