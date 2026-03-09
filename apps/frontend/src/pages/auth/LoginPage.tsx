import { Button, Form, Input, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import MainLayout from '../../components/layout/MainLayout';
import { setAuthToken } from '../../lib/auth';
import { HttpClientError, isServiceUnavailableError } from '../../lib/http';
import type { LoginPayload } from '../../types/auth';
import './AuthPage.css';

function LoginPage() {
  const [form] = Form.useForm<LoginPayload>();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect =
    new URLSearchParams(location.search).get('redirect') ?? '/';

  const submit = async (values: LoginPayload) => {
    try {
      const data = await authApi.login(values);
      setAuthToken(data.accessToken);
      message.success('登录成功');
      navigate(redirect, { replace: true });
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        message.error('后端服务暂不可用，请稍后重试');
        return;
      }
      const text = error instanceof HttpClientError ? error.message : '登录失败';
      message.error(text);
    }
  };

  return (
    <MainLayout>
      <div className="jj-auth-shell">
        <div className="jj-auth-card">
          <h1 className="jj-auth-title">登录</h1>
          <p className="jj-auth-subtitle">登录后可发布/编辑文章</p>

          <Form<LoginPayload>
            form={form}
            layout="vertical"
            initialValues={{ email: '', password: '' }}
            onFinish={submit}
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 位' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form>

          <p className="jj-auth-footer">
            还没有账号？<Link to="/auth/register">去注册</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default LoginPage;
