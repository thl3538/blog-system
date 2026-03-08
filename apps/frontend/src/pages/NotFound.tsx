import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-4">
      <Result
        status="404"
        title="页面不存在"
        subTitle="你访问的路径没有对应页面。"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}

export default NotFound;
