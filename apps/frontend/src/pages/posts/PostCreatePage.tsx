import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Tabs, Typography, Upload, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import type { PostPayload } from '../../types/post';

type FormValues = PostPayload;

const DRAFT_KEY = 'blog-system-draft:create';

function PostCreatePage() {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const content = Form.useWatch('content', form) ?? '';
  const allValues = Form.useWatch([], form) as FormValues | undefined;

  const preview = useMemo(() => {
    if (!content.trim()) {
      return <Typography.Text type="secondary">暂无内容可预览</Typography.Text>;
    }

    return (
      <div className="prose max-w-none prose-slate prose-pre:overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }, [content]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw) as FormValues;
      form.setFieldsValue({
        title: draft.title ?? '',
        summary: draft.summary ?? '',
        content: draft.content ?? '',
      });
      if (draft.title || draft.summary || draft.content) {
        message.info('已恢复本地草稿');
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, [form]);

  useEffect(() => {
    if (!allValues || typeof window === 'undefined') return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(allValues));
      setSavedAt(new Date().toLocaleTimeString());
    }, 600);

    return () => window.clearTimeout(timer);
  }, [allValues]);

  const submit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const created = await postsApi.create(values);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DRAFT_KEY);
      }
      message.success('文章发布成功');
      navigate(`/posts/${created.id}`);
    } catch (error) {
      const text = error instanceof HttpClientError ? error.message : '发布失败';
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Card
        className="!border-slate-200 !shadow-none"
        title="写文章"
        extra={savedAt ? <Typography.Text type="secondary">草稿已保存：{savedAt}</Typography.Text> : null}
      >
        <Form<FormValues>
          layout="vertical"
          form={form}
          initialValues={{ title: '', summary: '', content: '' }}
          onFinish={submit}
        >
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

          <div className="mb-2">
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

          <Tabs
            items={[
              {
                key: 'write',
                label: '编辑 Markdown',
                children: (
                  <Form.Item
                    name="content"
                    rules={[{ required: true, message: '请输入正文内容' }]}
                  >
                    <Input.TextArea
                      rows={16}
                      placeholder="支持 Markdown：# 标题、- 列表、```代码块```"
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    {preview}
                  </div>
                ),
              },
            ]}
          />

          <Space>
            <Link to="/">
              <Button icon={<ArrowLeftOutlined />}>返回</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SaveOutlined />}
            >
              发布文章
            </Button>
          </Space>
        </Form>
      </Card>
    </MainLayout>
  );
}

export default PostCreatePage;
