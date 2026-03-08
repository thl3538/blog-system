import { Button, Card, Empty, Form, Input, List, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { guestbookApi } from '../api/guestbook';
import MainLayout from '../components/layout/MainLayout';
import { HttpClientError } from '../lib/http';
import type { CreateGuestbookMessagePayload, GuestbookMessage } from '../types/guestbook';

function GuestbookPage() {
  const [form] = Form.useForm<CreateGuestbookMessagePayload>();
  const [items, setItems] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await guestbookApi.list();
      setItems(data);
    } catch (error) {
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
      const text = error instanceof HttpClientError ? error.message : '留言失败';
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="!border-slate-200 !shadow-none" title="写留言">
          <Form<CreateGuestbookMessagePayload>
            layout="vertical"
            form={form}
            initialValues={{ nickname: '', content: '' }}
            onFinish={submit}
          >
            <Form.Item
              label="昵称"
              name="nickname"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input maxLength={80} placeholder="请输入昵称" />
            </Form.Item>

            <Form.Item
              label="留言内容"
              name="content"
              rules={[{ required: true, message: '请输入留言内容' }]}
            >
              <Input.TextArea rows={6} maxLength={1000} placeholder="写下你的留言..." />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={submitting} block>
              提交留言
            </Button>
          </Form>
        </Card>

        <Card className="!border-slate-200 !shadow-none" title="留言列表">
          {items.length ? (
            <List
              loading={loading}
              dataSource={items}
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
            <Empty description="还没有留言，来写第一条吧" />
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

export default GuestbookPage;
