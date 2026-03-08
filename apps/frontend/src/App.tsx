import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type PostItem = {
  id: number;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const emptyForm = {
  title: '',
  summary: '',
  content: '',
};

function App() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/posts`);
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }

      const data = (await response.json()) as PostItem[];
      setPosts(data);
      if (data.length && selectedId === null) {
        setSelectedId(data[0].id);
      }
      if (!data.length) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  const startCreate = () => {
    resetForm();
    setSelectedId(null);
  };

  const startEdit = () => {
    if (!selectedPost) return;
    setForm({
      title: selectedPost.title,
      summary: selectedPost.summary,
      content: selectedPost.content,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setError('标题、摘要、正文不能为空');
      return;
    }

    setError(null);

    try {
      const isUpdate = isEditing && selectedPost;
      const method = isUpdate ? 'PATCH' : 'POST';
      const url = isUpdate
        ? `${API_BASE}/posts/${selectedPost.id}`
        : `${API_BASE}/posts`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(isUpdate ? '更新文章失败' : '发布文章失败');
      }

      const saved = (await response.json()) as PostItem;
      await fetchPosts();
      setSelectedId(saved.id);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    const confirmed = window.confirm(`确认删除《${selectedPost.title}》吗？`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/posts/${selectedPost.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      await fetchPosts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>博客系统</h1>
          <button onClick={startCreate}>新建文章</button>
        </div>

        {loading ? <p>加载中...</p> : null}

        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                className={selectedId === post.id ? 'active' : ''}
                onClick={() => {
                  setSelectedId(post.id);
                  setIsEditing(false);
                }}
              >
                <strong>{post.title}</strong>
                <small>{post.summary}</small>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        {error ? <p className="error">{error}</p> : null}

        <section className="editor">
          <h2>{isEditing || !selectedPost ? '编辑文章' : '文章详情'}</h2>

          {isEditing || !selectedPost ? (
            <form onSubmit={handleSubmit}>
              <input
                placeholder="标题"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
              <input
                placeholder="摘要"
                value={form.summary}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, summary: event.target.value }))
                }
              />
              <textarea
                placeholder="正文（支持纯文本）"
                rows={12}
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
              <div className="actions">
                <button type="submit">{isEditing ? '保存修改' : '发布文章'}</button>
                <button type="button" onClick={resetForm}>
                  取消
                </button>
              </div>
            </form>
          ) : (
            <article className="article">
              <h2>{selectedPost.title}</h2>
              <p className="summary">{selectedPost.summary}</p>
              <pre>{selectedPost.content}</pre>
              <div className="meta">
                <span>创建：{new Date(selectedPost.createdAt).toLocaleString()}</span>
                <span>更新：{new Date(selectedPost.updatedAt).toLocaleString()}</span>
              </div>
              <div className="actions">
                <button onClick={startEdit}>编辑</button>
                <button onClick={handleDelete}>删除</button>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
