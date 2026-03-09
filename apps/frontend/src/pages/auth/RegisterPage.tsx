import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import MainLayout from '../../components/layout/MainLayout';
import { setAuthToken } from '../../lib/auth';
import { HttpClientError, isServiceUnavailableError } from '../../lib/http';
import type { RegisterPayload } from '../../types/auth';
import './AuthPage.css';

type RegisterForm = RegisterPayload & {
  confirmPassword: string;
};

function RegisterPage() {
  const [form] = Form.useForm<RegisterForm>();
  const navigate = useNavigate();

  const submit = async (values: RegisterForm) => {
    try {
      const data = await authApi.register({
        email: values.email,
        password: values.password,
        name: values.name,
      });
      setAuthToken(data.accessToken);
      message.success('注册成功，已自动登录');
      navigate('/', { replace: true });
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        message.error('后端服务暂不可用，请稍后重试');
        return;
      }
      const text = error instanceof HttpClientError ? error.message : '注册失败';
      message.error(text);
    }
  };

  return (
    <MainLayout>
      <div className="jj-auth-shell">
        <div className="jj-auth-card">
          <h1 className="jj-auth-title">注册</h1>
          <p className="jj-auth-subtitle">创建账号后即可发布文章</p>

          <Form<RegisterForm>
            form={form}
            layout="vertical"
            initialValues={{ email: '', password: '', confirmPassword: '', name: '' }}
            onFinish={submit}
          >
            <Form.Item label="昵称" name="name">
              <Input placeholder="可选，展示名称" maxLength={50} />
            </Form.Item>

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
              <Input.Password placeholder="至少 6 位" />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入密码" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              注册并登录
            </Button>
          </Form>

          <p className="jj-auth-footer">
            已有账号？<Link to="/auth/login">去登录</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegisterPage;
