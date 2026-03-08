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
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Pagination,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
  Upload,
  message,
  theme as antdTheme,
} from 'antd';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { http } from '../lib/http';

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

type PostsListResponse = {
  items: PostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy?: 'createdAt' | 'title';
  order?: 'asc' | 'desc';
};

type ThemeMode = 'system' | 'light' | 'dark';
type EditorTab = 'write' | 'preview';
type AuthMode = 'login' | 'register';

type AuthUser = {
  id: number;
  email: string;
  role: string;
  name?: string | null;
};

type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
};

const emptyForm: PostFormValues = {
  title: '',
  summary: '',
  content: '',
};

const THEME_STORAGE_KEY = 'blog-system-theme';
const TOKEN_STORAGE_KEY = 'blog-system-token';
const USER_STORAGE_KEY = 'blog-system-user';
const DRAFT_STORAGE_PREFIX = 'blog-system-draft';

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

const getDraftStorageKey = (mode: 'view' | 'create' | 'edit', selectedId: number | null) => {
  if (mode === 'edit' && selectedId) {
    return `${DRAFT_STORAGE_PREFIX}:edit:${selectedId}`;
  }

  return `${DRAFT_STORAGE_PREFIX}:create`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const responseMessage = (error.response?.data as { message?: string } | undefined)
      ?.message;
    return responseMessage || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const renderMarkdown = (content: string) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,
      ul: ({ children }) => <ul className="mb-3 list-disc pl-6">{children}</ul>,
      ol: ({ children }) => <ol className="mb-3 list-decimal pl-6">{children}</ol>,
      h1: ({ children }) => <h1 className="mb-3 text-2xl font-semibold">{children}</h1>,
      h2: ({ children }) => <h2 className="mb-3 text-xl font-semibold">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-2 text-lg font-semibold">{children}</h3>,
      code: ({ children }) => (
        <code className="rounded bg-black/10 px-1.5 py-0.5 text-sm">{children}</code>
      ),
      pre: ({ children }) => (
        <pre className="mb-3 overflow-x-auto rounded-lg bg-black/10 p-3 text-sm">{children}</pre>
      ),
      img: ({ src, alt }) => (
        <img
          src={src ?? ''}
          alt={alt ?? ''}
          className="my-3 max-h-[360px] rounded-lg border border-slate-200 object-contain"
        />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

function BlogDashboard() {
  const [form] = Form.useForm<PostFormValues>();
  const [authForm] = Form.useForm<AuthFormValues>();
  const watchedForm = Form.useWatch([], form) as PostFormValues | undefined;
  const watchedContent = Form.useWatch('content', form) ?? '';

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortBy, setSortBy] = useState<'createdAt' | 'title'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [editorTab, setEditorTab] = useState<EditorTab>('write');
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);
  const isLoggedIn = Boolean(authUser);
  const currentDraftKey = useMemo(
    () => getDraftStorageKey(mode, selectedId),
    [mode, selectedId],
  );

  const loadDraft = (key: string): PostFormValues | null => {
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as PostFormValues;
      if (!parsed || typeof parsed !== 'object') return null;

      return {
        title: parsed.title ?? '',
        summary: parsed.summary ?? '',
        content: parsed.content ?? '',
      };
    } catch {
      return null;
    }
  };

  const syncAuthStorage = (payload: { accessToken: string; user: AuthUser } | null) => {
    if (typeof window === 'undefined') return;

    if (!payload) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  };

  const fetchProfile = async () => {
    try {
      const { data } = await http.get<AuthUser>('/auth/me');
      setAuthUser(data);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      setAuthUser(null);
      syncAuthStorage(null);
    }
  };

  const handleAuthSubmit = async (values: AuthFormValues) => {
    setAuthSubmitting(true);

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await http.post<{ accessToken: string; user: AuthUser }>(
        endpoint,
        values,
      );

      setAuthUser(data.user);
      syncAuthStorage(data);
      authForm.resetFields(['password']);
      message.success(authMode === 'login' ? '登录成功' : '注册成功并已登录');
    } catch (error) {
      message.error(getErrorMessage(error, authMode === 'login' ? '登录失败' : '注册失败'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    syncAuthStorage(null);
    message.success('已退出登录');
  };

  const fetchPosts = async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    sortBy?: 'createdAt' | 'title';
    order?: 'asc' | 'desc';
  }) => {
    const nextPage = params?.page ?? pagination.page;
    const nextPageSize = params?.pageSize ?? pagination.pageSize;
    const nextKeyword = params?.keyword ?? search;
    const nextSortBy = params?.sortBy ?? sortBy;
    const nextOrder = params?.order ?? order;

    setLoading(true);
    setLoadError(null);

    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(nextPageSize),
        sortBy: nextSortBy,
        order: nextOrder,
      });

      if (nextKeyword.trim()) {
        query.set('keyword', nextKeyword.trim());
      }

      const { data } = await http.get<PostsListResponse>(`/posts?${query.toString()}`);
      setPosts(data.items);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
      });
      setSortBy(data.sortBy ?? nextSortBy);
      setOrder(data.order ?? nextOrder);

      if (!data.items.length) {
        setSelectedId(null);
        if (mode === 'edit') setMode('create');
        return;
      }

      const hasSelected = data.items.some((post) => post.id === selectedId);
      if (!hasSelected) setSelectedId(data.items[0].id);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '文章列表加载失败');
      setLoadError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (rawUser) {
      try {
        setAuthUser(JSON.parse(rawUser) as AuthUser);
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      void fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchPosts({
      page: 1,
      pageSize: pagination.pageSize,
      keyword: '',
      sortBy,
      order,
    });
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

  useEffect(() => {
    if (mode === 'view' || !watchedForm) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(currentDraftKey, JSON.stringify(watchedForm));
      setDraftSavedAt(new Date().toLocaleTimeString());
    }, 800);

    return () => window.clearTimeout(timer);
  }, [watchedForm, mode, currentDraftKey]);

  const startCreate = () => {
    if (!isLoggedIn) {
      message.warning('请先登录再创建文章');
      return;
    }

    setMode('create');
    setEditorTab('write');

    const draft = loadDraft(getDraftStorageKey('create', null));
    form.setFieldsValue(draft ?? emptyForm);
    setDraftSavedAt(null);

    if (draft?.title || draft?.summary || draft?.content) {
      message.info('已恢复未发布草稿');
    }
  };

  const startEdit = () => {
    if (!isLoggedIn) {
      message.warning('请先登录再编辑文章');
      return;
    }

    if (!selectedPost) return;

    const base: PostFormValues = {
      title: selectedPost.title,
      summary: selectedPost.summary,
      content: selectedPost.content,
    };

    setMode('edit');
    setEditorTab('write');

    const editDraftKey = getDraftStorageKey('edit', selectedPost.id);
    const draft = loadDraft(editDraftKey);
    form.setFieldsValue(draft ?? base);
    setDraftSavedAt(null);

    if (draft?.title || draft?.summary || draft?.content) {
      message.info('已恢复该文章的本地草稿');
    }
  };

  const cancelEdit = () => {
    if (selectedPost) {
      setMode('view');
    } else {
      setMode('create');
    }

    setEditorTab('write');
    setDraftSavedAt(null);
    form.setFieldsValue(emptyForm);
  };

  const handleSubmit = async (values: PostFormValues) => {
    setSubmitting(true);

    try {
      const isEdit = mode === 'edit' && selectedPost;

      const { data: saved } = isEdit
        ? await http.patch<PostItem>(`/posts/${selectedPost.id}`, values)
        : await http.post<PostItem>('/posts', values);

      message.success(isEdit ? '文章已更新' : '文章已发布');

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(currentDraftKey);
      }

      await fetchPosts();
      setSelectedId(saved.id);
      setMode('view');
      setEditorTab('write');
      setDraftSavedAt(null);
      form.setFieldsValue(emptyForm);
    } catch (error) {
      message.error(getErrorMessage(error, '提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const insertImageToMarkdown = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const current = form.getFieldValue('content') ?? '';
      const next = `${current}${current ? '\n\n' : ''}![${file.name}](${dataUrl})`;
      form.setFieldValue('content', next);
      setEditorTab('write');
      message.success('图片已插入 Markdown');
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (!isLoggedIn) {
      message.warning('请先登录再删除文章');
      return;
    }

    if (!selectedPost) return;

    Modal.confirm({
      title: '确认删除文章吗？',
      content: `《${selectedPost.title}》删除后将无法恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/posts/${selectedPost.id}`);
          message.success('文章已删除');
          await fetchPosts();
          setMode('view');
        } catch (error) {
          message.error(getErrorMessage(error, '删除失败'));
        }
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
          isDark ? 'bg-slate-950' : 'bg-[#f4f5f5]'
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <Card
            className={`!rounded-xl !shadow-none ${
              isDark
                ? '!border-slate-700 !bg-slate-900'
                : '!border-slate-200 !bg-white'
            }`}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Typography.Title level={4} className="!mb-0">
                    稀土博客
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    参考掘金布局：信息流 + 详情 + 创作面板
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
                  />

                  <Button icon={<ReloadOutlined />} onClick={() => void fetchPosts()}>
                    刷新
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={startCreate}
                    disabled={!isLoggedIn}
                  >
                    写文章
                  </Button>
                </Space>
              </div>

              <Space wrap size={[8, 8]}>
                <Tag color="blue">综合</Tag>
                <Tag>后端</Tag>
                <Tag>前端</Tag>
                <Tag>人工智能</Tag>
                <Tag>阅读</Tag>
              </Space>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
            <Card
              title="文章列表"
              className="!rounded-2xl !border-0 !shadow-sm"
              extra={<Tag color="blue">共 {pagination.total} 篇</Tag>}
            >
              <Space direction="vertical" size={12} className="!w-full">
                <Input.Search
                  placeholder="搜索标题或摘要"
                  allowClear
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onSearch={(value) => {
                    void fetchPosts({
                      page: 1,
                      pageSize: pagination.pageSize,
                      keyword: value,
                    });
                  }}
                />

                <Space wrap size={8}>
                  <Segmented<'createdAt' | 'title'>
                    size="small"
                    value={sortBy}
                    onChange={(value) => {
                      const next = value as 'createdAt' | 'title';
                      setSortBy(next);
                      void fetchPosts({
                        page: 1,
                        pageSize: pagination.pageSize,
                        keyword: search,
                        sortBy: next,
                        order,
                      });
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
                      const next = value as 'asc' | 'desc';
                      setOrder(next);
                      void fetchPosts({
                        page: 1,
                        pageSize: pagination.pageSize,
                        keyword: search,
                        sortBy,
                        order: next,
                      });
                    }}
                    options={[
                      { label: '升序', value: 'asc' },
                      { label: '降序', value: 'desc' },
                    ]}
                  />
                </Space>

                {loadError ? (
                  <Alert
                    type="error"
                    showIcon
                    message="文章列表加载失败"
                    description={loadError}
                    action={
                      <Button
                        size="small"
                        onClick={() => {
                          void fetchPosts();
                        }}
                      >
                        重试
                      </Button>
                    }
                  />
                ) : null}

                {loading ? (
                  <Skeleton
                    active
                    paragraph={{ rows: 8 }}
                    title={{ width: '45%' }}
                  />
                ) : posts.length ? (
                  <>
                    <List
                      dataSource={posts}
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

                    <div className="flex justify-end pt-2">
                      <Pagination
                        current={pagination.page}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        size="small"
                        showSizeChanger
                        pageSizeOptions={[5, 10, 20, 50]}
                        onChange={(page, pageSize) => {
                          void fetchPosts({
                            page,
                            pageSize,
                            keyword: search,
                          });
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <Empty
                    description="暂无匹配文章"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Space>
            </Card>

            <div className="space-y-6">
              <Card
                className="!rounded-2xl !border-0 !shadow-sm"
                title="账号"
                extra={
                  isLoggedIn ? (
                    <Button size="small" onClick={handleLogout}>
                      退出
                    </Button>
                  ) : null
                }
              >
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Typography.Text strong>{authUser?.name || '未命名用户'}</Typography.Text>
                    <div className="text-sm text-slate-500">{authUser?.email}</div>
                    <Tag color="purple">{authUser?.role}</Tag>
                  </div>
                ) : (
                  <Form<AuthFormValues>
                    layout="vertical"
                    form={authForm}
                    onFinish={handleAuthSubmit}
                    initialValues={{ email: '', password: '', name: '' }}
                  >
                    <Segmented<AuthMode>
                      className="!mb-3"
                      value={authMode}
                      onChange={(value) => setAuthMode(value as AuthMode)}
                      options={[
                        { label: '登录', value: 'login' },
                        { label: '注册', value: 'register' },
                      ]}
                    />

                    <Form.Item
                      label="邮箱"
                      name="email"
                      rules={[{ required: true, message: '请输入邮箱' }]}
                    >
                      <Input placeholder="you@example.com" />
                    </Form.Item>

                    {authMode === 'register' ? (
                      <Form.Item
                        label="昵称"
                        name="name"
                        rules={[{ required: true, message: '请输入昵称' }]}
                      >
                        <Input placeholder="请输入昵称" />
                      </Form.Item>
                    ) : null}

                    <Form.Item
                      label="密码"
                      name="password"
                      rules={[{ required: true, message: '请输入密码（至少6位）' }]}
                    >
                      <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={authSubmitting} block>
                      {authMode === 'login' ? '登录' : '注册并登录'}
                    </Button>
                  </Form>
                )}
              </Card>

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

                    <Card className={isDark ? '!bg-slate-900/60' : '!bg-slate-50'}>
                      <div className="text-[15px]">{renderMarkdown(selectedPost.content)}</div>
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
                extra={
                  draftSavedAt ? (
                    <Typography.Text type="secondary" className="text-xs">
                      草稿已保存：{draftSavedAt}
                    </Typography.Text>
                  ) : null
                }
              >
                {!isLoggedIn ? (
                  <Alert
                    type="info"
                    showIcon
                    message="请先登录再发布或编辑文章"
                    description="登录后可使用 Markdown 编辑、自动草稿和插图能力。"
                  />
                ) : (
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

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <Segmented<EditorTab>
                      value={editorTab}
                      onChange={(value) => setEditorTab(value as EditorTab)}
                      options={[
                        { label: '编辑', value: 'write' },
                        { label: '预览', value: 'preview' },
                      ]}
                    />

                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        insertImageToMarkdown(file as File);
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>插入图片</Button>
                    </Upload>
                  </div>

                  <Form.Item
                    label="正文（Markdown）"
                    name="content"
                    rules={[{ required: true, message: '请输入正文内容' }]}
                  >
                    <Input.TextArea
                      rows={14}
                      className={editorTab === 'write' ? '' : '!hidden'}
                      placeholder="支持 Markdown，例如：# 标题、- 列表、```代码块```"
                    />
                  </Form.Item>

                  {editorTab === 'preview' ? (
                    <Card className={isDark ? '!bg-slate-900/60 !mb-6' : '!bg-slate-50 !mb-6'}>
                      {watchedContent.trim() ? (
                        <div className="text-[15px]">{renderMarkdown(watchedContent)}</div>
                      ) : (
                        <Typography.Text type="secondary">暂无内容可预览</Typography.Text>
                      )}
                    </Card>
                  ) : null}

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
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default BlogDashboard;
