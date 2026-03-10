import { ClockCircleOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  Skeleton,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { guestbookApi } from '../api/guestbook';
import MainLayout from '../components/layout/MainLayout';
import ServiceUnavailable from '../components/ServiceUnavailable';
import { HttpClientError, isServiceUnavailableError } from '../lib/http';
import type { CreateGuestbookMessagePayload, GuestbookMessage } from '../types/guestbook';
import './GuestbookPage.css';

function GuestbookPage() {
  const [form] = Form.useForm<CreateGuestbookMessagePayload>();
  const [items, setItems] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await guestbookApi.list();
      setServiceUnavailable(false);
      setItems(data);
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        setServiceUnavailable(true);
        setItems([]);
        return;
      }

      const text = error instanceof HttpClientError ? error.message : '留言加载失败';
      message.error(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  const submit = async (values: CreateGuestbookMessagePayload) => {
    setSubmitting(true);
    try {
      await guestbookApi.create(values);
      message.success('留言成功');
      form.resetFields();
      await fetchMessages();
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        setServiceUnavailable(true);
        return;
      }

      const text = error instanceof HttpClientError ? error.message : '留言失败';
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  const hotUsers = useMemo(() => {
    const counter = new Map<string, number>();
    items.forEach((item) => {
      counter.set(item.nickname, (counter.get(item.nickname) ?? 0) + 1);
    });

    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  return (
    <MainLayout>
      <div className="jj-guestbook-grid">
        <section className="jj-guestbook-main">
          <div className="jj-guestbook-feed-card">
            <div className="jj-guestbook-header">
              <div>
                <h2>
                  <MessageOutlined /> 留言墙
                </h2>
                <p>欢迎留下你的建议、想法或打卡信息，大家都会看到。</p>
              </div>
              <span>{items.length} 条留言</span>
            </div>

            <div className="jj-guestbook-form-wrap">
              <Form<CreateGuestbookMessagePayload>
                layout="vertical"
                form={form}
                initialValues={{ content: '' }}
                onFinish={submit}
              >
                <Form.Item
                  label="留言内容"
                  name="content"
                  rules={[{ required: true, message: '请输入留言内容' }]}
                >
                  <Input.TextArea
                    rows={5}
                    maxLength={1000}
                    placeholder="写下你的留言（昵称自动使用账号信息）..."
                    showCount
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={serviceUnavailable}
                  icon={<SendOutlined />}
                >
                  提交留言
                </Button>
              </Form>
            </div>

            <div className="jj-guestbook-list-wrap">
              {loading ? (
                <div className="jj-guestbook-loading">
                  <Skeleton active paragraph={{ rows: 7 }} title={{ width: '28%' }} />
                </div>
              ) : serviceUnavailable ? (
                <ServiceUnavailable compact onRetry={() => void fetchMessages()} />
              ) : items.length ? (
                <div className="jj-guestbook-list">
                  {items.map((item) => (
                    <article key={item.id} className="jj-message-item">
                      <Avatar style={{ backgroundColor: '#1e80ff' }}>
                        {item.nickname.slice(0, 1).toUpperCase()}
                      </Avatar>

                      <div className="jj-message-content">
                        <div className="head">
                          <strong>{item.nickname}</strong>
                          <span>
                            <ClockCircleOutlined /> {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p>{item.content}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="jj-guestbook-empty">
                  <Empty description="还没有留言，来写第一条吧" />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="jj-guestbook-sidebar">
          <div className="jj-side-card">
            <h4>互动小贴士</h4>
            <ul>
              <li>欢迎反馈产品体验与功能建议</li>
              <li>建议用简洁标题 + 具体描述</li>
              <li>文明交流，避免发布敏感内容</li>
            </ul>
          </div>

          <div className="jj-side-card">
            <h4>活跃留言者</h4>
            {hotUsers.length ? (
              <div className="jj-hot-users">
                {hotUsers.map((user, index) => (
                  <div key={user.name} className="jj-hot-user-item">
                    <span className="no">{index + 1}</span>
                    <span className="name">{user.name}</span>
                    <span className="count">{user.count} 条</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="jj-side-empty">还没有统计数据</p>
            )}
          </div>

          <div className="jj-side-card">
            <h4>公告</h4>
            <p>留言默认公开展示。你也可以在文章评论区继续深入讨论具体话题。</p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

export default GuestbookPage;
