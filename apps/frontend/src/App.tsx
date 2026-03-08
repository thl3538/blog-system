import {
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoonOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SunOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

type PostItem = {
  id: number;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type PostFormValues = {
  title: string;
  summary: string;
  content: string;
};

type ThemeMode = 'system' | 'light' | 'dark';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const emptyForm: PostFormValues = {
  title: '',
  summary: '',
  content: '',
};

const THEME_STORAGE_KEY = 'blog-system-theme';

const getSystemPrefersDark = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
};

function App() {
  const [form] = Form.useForm<PostFormValues>();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;

    const keyword = search.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.summary.toLowerCase().includes(keyword),
    );
  }, [posts, search]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/posts`);
      if (!response.ok) throw new Error('文章列表加载失败');

      const data = (await response.json()) as PostItem[];
      setPosts(data);

      if (!data.length) {
        setSelectedId(null);
        if (mode === 'edit') setMode('create');
        return;
      }

      const hasSelected = data.some((post) => post.id === selectedId);
      if (!hasSelected) setSelectedId(data[0].id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '网络异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    mediaQuery.addEventListener('change', onChange);
    setSystemPrefersDark(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const startCreate = () => {
    setMode('create');
    form.setFieldsValue(emptyForm);
  };

  const startEdit = () => {
    if (!selectedPost) return;

    setMode('edit');
    form.setFieldsValue({
      title: selectedPost.title,
      summary: selectedPost.summary,
      content: selectedPost.content,
    });
  };

  const cancelEdit = () => {
    if (selectedPost) {
      setMode('view');
    } else {
      setMode('create');
    }
    form.setFieldsValue(emptyForm);
  };

  const handleSubmit = async (values: PostFormValues) => {
    setSubmitting(true);

    try {
      const isEdit = mode === 'edit' && selectedPost;
      const url = isEdit
        ? `${API_BASE}/posts/${selectedPost.id}`
        : `${API_BASE}/posts`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(isEdit ? '更新失败' : '发布失败');
      }

      const saved = (await response.json()) as PostItem;
      message.success(isEdit ? '文章已更新' : '文章已发布');
      await fetchPosts();
      setSelectedId(saved.id);
      setMode('view');
      form.setFieldsValue(emptyForm);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!selectedPost) return;

    Modal.confirm({
      title: '确认删除文章吗？',
      content: `《${selectedPost.title}》删除后将无法恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const response = await fetch(`${API_BASE}/posts/${selectedPost.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          message.error('删除失败');
          return;
        }

        message.success('文章已删除');
        await fetchPosts();
        setMode('view');
      },
    });
  };

  const getPostItemClasses = (isActive: boolean) => {
    if (isActive) {
      return isDark
        ? 'border-blue-400 bg-blue-500/20 text-slate-100'
        : 'border-blue-500 bg-blue-50 text-slate-800';
    }

    return isDark
      ? 'border-slate-700 bg-slate-900/70 text-slate-100 hover:border-blue-400'
      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300';
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          borderRadius: 12,
          colorPrimary: '#2563eb',
        },
      }}
    >
      <div
        className={`min-h-screen px-4 py-6 transition-colors md:px-8 md:py-8 ${
          isDark ? 'bg-slate-950' : 'bg-slate-100'
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="!rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-cyan-500 !shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <Typography.Title level={3} className="!mb-1 !text-white">
                  博客管理台
                </Typography.Title>
                <Typography.Text className="!text-blue-100">
                  Ant Design + Tailwind 版前端 UI，支持跟随系统/手动切换主题。
                </Typography.Text>
              </div>

              <Space wrap>
                <Segmented<ThemeMode>
                  value={themeMode}
                  onChange={(value) => setThemeMode(value as ThemeMode)}
                  options={[
                    {
                      label: (
                        <span className="inline-flex items-center gap-1">
                          <DesktopOutlined /> 跟随系统
                        </span>
                      ),
                      value: 'system',
                    },
                    {
                      label: (
                        <span className="inline-flex items-center gap-1">
                          <SunOutlined /> 浅色
                        </span>
                      ),
                      value: 'light',
                    },
                    {
                      label: (
                        <span className="inline-flex items-center gap-1">
                          <MoonOutlined /> 深色
                        </span>
                      ),
                      value: 'dark',
                    },
                  ]}
                  className="!bg-white/15 [&_.ant-segmented-item-selected]:!bg-white [&_.ant-segmented-item-selected]:!text-blue-600 [&_.ant-segmented-item-label]:!text-white"
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => void fetchPosts()}
                  className="!border-white/40 !bg-white/10 !text-white hover:!bg-white/20"
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={startCreate}
                  className="!border-0 !bg-white !text-blue-600"
                >
                  新建文章
                </Button>
              </Space>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
            <Card
              title="文章列表"
              className="!rounded-2xl !border-0 !shadow-sm"
              extra={<Tag color="blue">{posts.length} 篇</Tag>}
            >
              <Space direction="vertical" size={12} className="!w-full">
                <Input.Search
                  placeholder="搜索标题或摘要"
                  allowClear
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <Spin spinning={loading}>
                  {filteredPosts.length ? (
                    <List
                      dataSource={filteredPosts}
                      renderItem={(post) => (
                        <List.Item className="!px-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(post.id);
                              setMode('view');
                            }}
                            className={`w-full rounded-xl border px-3 py-2 text-left transition ${getPostItemClasses(
                              selectedId === post.id,
                            )}`}
                          >
                            <div className="mb-1 line-clamp-1 font-semibold">
                              {post.title}
                            </div>
                            <div
                              className={`line-clamp-2 text-xs ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {post.summary}
                            </div>
                          </button>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="暂无匹配文章"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Spin>
              </Space>
            </Card>

            <div className="space-y-6">
              <Card
                className="!rounded-2xl !border-0 !shadow-sm"
                title={
                  <Space>
                    <EyeOutlined />
                    文章详情
                  </Space>
                }
                extra={
                  selectedPost ? (
                    <Space>
                      <Button icon={<EditOutlined />} onClick={startEdit}>
                        编辑
                      </Button>
                      <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                        删除
                      </Button>
                    </Space>
                  ) : null
                }
              >
                {selectedPost ? (
                  <div className="space-y-4">
                    <div>
                      <Typography.Title level={3} className="!mb-2">
                        {selectedPost.title}
                      </Typography.Title>
                      <Typography.Paragraph
                        className={`!mb-1 ${isDark ? '!text-slate-300' : '!text-slate-600'}`}
                      >
                        {selectedPost.summary}
                      </Typography.Paragraph>
                      <Space size={6} wrap>
                        <Tag color="geekblue">ID #{selectedPost.id}</Tag>
                        <Tag>
                          创建：{new Date(selectedPost.createdAt).toLocaleString()}
                        </Tag>
                        <Tag>
                          更新：{new Date(selectedPost.updatedAt).toLocaleString()}
                        </Tag>
                      </Space>
                    </div>

                    <Card
                      className={isDark ? '!bg-slate-900/60' : '!bg-slate-50'}
                    >
                      <Typography.Paragraph className="!mb-0 !whitespace-pre-wrap !text-[15px] !leading-7">
                        {selectedPost.content}
                      </Typography.Paragraph>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="请选择左侧文章，或先新建一篇"
                  />
                )}
              </Card>

              <Card
                className="!rounded-2xl !border-0 !shadow-sm"
                title={
                  <Space>
                    <FileTextOutlined />
                    {mode === 'edit' ? '编辑文章' : '写新文章'}
                  </Space>
                }
              >
                <Form<PostFormValues>
                  layout="vertical"
                  form={form}
                  initialValues={emptyForm}
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    label="标题"
                    name="title"
                    rules={[{ required: true, message: '请输入标题' }]}
                  >
                    <Input
                      maxLength={120}
                      placeholder="例如：用 NestJS 快速搭建博客 API"
                    />
                  </Form.Item>

                  <Form.Item
                    label="摘要"
                    name="summary"
                    rules={[{ required: true, message: '请输入摘要' }]}
                  >
                    <Input maxLength={300} placeholder="一句话说明这篇文章讲什么" />
                  </Form.Item>

                  <Form.Item
                    label="正文"
                    name="content"
                    rules={[{ required: true, message: '请输入正文内容' }]}
                  >
                    <Input.TextArea
                      rows={10}
                      placeholder="支持纯文本，可后续升级为 Markdown / 富文本编辑器"
                    />
                  </Form.Item>

                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      icon={<SaveOutlined />}
                    >
                      {mode === 'edit' ? '保存修改' : '发布文章'}
                    </Button>
                    <Button onClick={cancelEdit}>重置</Button>
                  </Space>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
