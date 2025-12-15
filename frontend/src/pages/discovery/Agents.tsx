import { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Dropdown,
  Tag,
  Space,
  Typography,
  Card,
  Modal,
  message,
} from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  DownloadOutlined,
  WindowsOutlined,
  AppleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { agentService } from '../../services/agent.service';

const { Title, Text } = Typography;

type Agent = {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastConnectedTime: string;
  os: string;
  version: string;
};

type AgentDownload = {
  os: 'Windows 11' | 'MacOS' | 'Linux';
  version: string;
  releaseDate: string;
  downloadUrl: string;
};

export const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [agentDownloads, setAgentDownloads] = useState<AgentDownload[]>([]);

  useEffect(() => {
    fetchAgents();
    fetchAgentDownloads();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (error) {
      message.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDownloads = async () => {
    try {
      const data = await agentService.getAgentDownloads();
      setAgentDownloads(data);
    } catch (error) {
      message.error('Failed to fetch agent downloads');
    }
  };

  const handleView = (agent: Agent) => {
    message.info(`Viewing details for ${agent.name}`);
  };

  const handleEdit = (agent: Agent) => {
    message.info(`Editing ${agent.name}`);
  };

  const handleDelete = (agent: Agent) => {
    Modal.confirm({
      title: 'Delete Agent',
      content: `Are you sure you want to delete ${agent.name}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await agentService.deleteAgent(agent.id);
          message.success(`${agent.name} deleted successfully`);
          fetchAgents();
        } catch (error) {
          message.error('Failed to delete agent');
        }
      },
    });
  };

  const handleDownloadAgent = (download: AgentDownload) => {
    message.success(`Downloading ${download.os} agent...`);
    // In real implementation, this would trigger a file download
    window.open(download.downloadUrl, '_blank');
  };

  const getActionMenuItems = (agent: Agent): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View',
      onClick: () => handleView(agent),
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(agent),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(agent),
    },
  ];

  const columns: ColumnsType<Agent> = [
    {
      title: 'Agent Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Connected' ? 'success' : 'default'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Connected', value: 'Connected' },
        { text: 'Disconnected', value: 'Disconnected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Connected Time',
      dataIndex: 'lastConnectedTime',
      key: 'lastConnectedTime',
      sorter: (a, b) => a.lastConnectedTime.localeCompare(b.lastConnectedTime),
    },
    {
      title: 'OS',
      dataIndex: 'os',
      key: 'os',
      filters: [
        { text: 'MacOS', value: 'MacOS' },
        { text: 'Windows', value: 'Win' },
        { text: 'Linux', value: 'Linux' },
      ],
      onFilter: (value, record) => record.os === value,
    },
    {
      title: 'Agent Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const getOSIcon = (os: string) => {
    if (os === 'Windows 11') return <WindowsOutlined style={{ fontSize: 32, color: '#0078d4' }} />;
    if (os === 'MacOS') return <AppleOutlined style={{ fontSize: 32, color: '#000' }} />;
    return <div style={{ fontSize: 32 }}>🐧</div>;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          Agents
        </Title>
        <Button onClick={() => setDownloadModalVisible(true)}>
          Download Agent
        </Button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredAgents}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: '16px' }}
      />

      <Text type="secondary">
        Total {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
      </Text>

      {/* Download Agents Modal */}
      <Modal
        title="Download Agents for Devices"
        open={downloadModalVisible}
        onCancel={() => setDownloadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {agentDownloads.map((download) => (
            <Card
              key={download.os}
              hoverable
              style={{ cursor: 'pointer' }}
              onClick={() => handleDownloadAgent(download)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {getOSIcon(download.os)}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{download.os}</div>
                    <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                      Version: {download.version}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Release: {download.releaseDate}
                  </Text>
                  <DownloadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </Modal>
    </div>
  );
};
