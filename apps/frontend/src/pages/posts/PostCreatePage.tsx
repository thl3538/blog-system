import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, Segmented, Space, Upload, message } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import MainLayout from '../../components/layout/MainLayout';
import { HttpClientError } from '../../lib/http';
import type { PostPayload } from '../../types/post';
import './PostEditorPage.css';

type FormValues = PostPayload;
type EditorMode = 'live' | 'edit' | 'preview';

const DRAFT_KEY = 'blog-system-draft:create';

function PostCreatePage() {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('live');

  const content = Form.useWatch('content', form) ?? '';
  const allValues = Form.useWatch([], form) as FormValues | undefined;

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
      <div className="jj-editor-grid">
        <section className="jj-editor-main">
          <div className="jj-editor-toolbar">
            <Link to="/" className="jj-editor-back">
              <ArrowLeftOutlined /> 返回首页
            </Link>
            <div className="jj-editor-toolbar-right">
              {savedAt ? <span className="jj-editor-saved">草稿已保存：{savedAt}</span> : null}
              <button type="button" className="jj-editor-publish-tip">
                发布后可继续编辑
              </button>
            </div>
          </div>

          <div className="jj-editor-card">
            <Form<FormValues>
              layout="vertical"
              form={form}
              initialValues={{ title: '', summary: '', content: '' }}
              onFinish={submit}
              className="jj-editor-form"
            >
              <Form.Item
                className="jj-title-item"
                name="title"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input
                  maxLength={120}
                  className="jj-title-input"
                  placeholder="请输入文章标题..."
                />
              </Form.Item>

              <Form.Item
                label="文章摘要"
                name="summary"
                rules={[{ required: true, message: '请输入摘要' }]}
              >
                <Input maxLength={300} placeholder="一句话概括这篇文章（用于列表展示）" />
              </Form.Item>

              <div className="jj-editor-actions-row">
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
                <div data-color-mode="light" className="jj-editor-md-wrap">
                  <MDEditor
                    value={content}
                    onChange={(value) => form.setFieldValue('content', value ?? '')}
                    preview={editorMode}
                    previewOptions={{ remarkPlugins: [remarkGfm] }}
                    textareaProps={{ placeholder: '支持 Markdown：# 标题、- 列表、```代码块```' }}
                    height={560}
                  />
                </div>
              </Form.Item>

              <Space>
                <Link to="/">
                  <Button icon={<ArrowLeftOutlined />}>取消</Button>
                </Link>
                <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                  发布文章
                </Button>
              </Space>
            </Form>
          </div>
        </section>

        <aside className="jj-editor-sidebar">
          <div className="jj-editor-side-card">
            <h4>发布清单</h4>
            <ul>
              <li>标题明确，最好包含核心关键词</li>
              <li>摘要 60~120 字，描述核心价值</li>
              <li>正文尽量图文并茂，利于阅读体验</li>
              <li>结尾可加总结与实践建议</li>
            </ul>
          </div>

          <div className="jj-editor-side-card">
            <h4>推荐标签</h4>
            <div className="jj-editor-tags">
              {['前端', 'React', 'TypeScript', 'Node.js', 'AI', '架构设计'].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="jj-editor-side-card">
            <h4>创作提示</h4>
            <p>首段先讲结论，再展开细节。读者会更快判断内容是否匹配自己的需求。</p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

export default PostCreatePage;
