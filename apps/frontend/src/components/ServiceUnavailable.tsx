import { Button, Result } from 'antd';

type ServiceUnavailableProps = {
  onRetry?: () => void;
  compact?: boolean;
};

function ServiceUnavailable({ onRetry, compact = false }: ServiceUnavailableProps) {
  return (
    <div style={{ padding: compact ? 12 : 24 }}>
      <Result
        status="warning"
        title="服务暂不可用"
        subTitle="后端接口当前不可达，请确认后端服务已启动后重试。"
        extra={
          onRetry ? (
            <Button type="primary" onClick={onRetry}>
              立即重试
            </Button>
          ) : null
        }
      />
    </div>
  );
}

export default ServiceUnavailable;
