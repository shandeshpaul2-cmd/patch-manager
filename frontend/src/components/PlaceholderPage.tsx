import { Typography } from 'antd';

const { Title, Text } = Typography;

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <div>
      <Title level={3} style={{ margin: 0, marginBottom: '24px' }}>
        {title}
      </Title>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <Text type="secondary" style={{ fontSize: '16px' }}>
          To be implemented
        </Text>
      </div>
    </div>
  );
};
