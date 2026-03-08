import { Card, Skeleton, Space } from 'antd';

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="!rounded-2xl !border-0 !shadow-sm">
          <Skeleton active paragraph={{ rows: 1 }} title={{ width: '30%' }} />
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="!rounded-2xl !border-0 !shadow-sm">
            <Skeleton active paragraph={{ rows: 8 }} title={{ width: '40%' }} />
          </Card>

          <Space direction="vertical" className="!w-full" size={24}>
            <Card className="!rounded-2xl !border-0 !shadow-sm">
              <Skeleton active paragraph={{ rows: 6 }} title={{ width: '35%' }} />
            </Card>
            <Card className="!rounded-2xl !border-0 !shadow-sm">
              <Skeleton active paragraph={{ rows: 8 }} title={{ width: '35%' }} />
            </Card>
          </Space>
        </div>
      </div>
    </div>
  );
}

export default RouteFallback;
