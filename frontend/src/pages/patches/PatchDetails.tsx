import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Table,
  Divider,
  Space,
  Breadcrumb,
  message,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  MoreOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { patchService, type Patch, type AffectedSoftware, type FileDetail, type Vulnerability, type Endpoint } from '../../services/patch.service';
import { SeverityBadge, EndpointDetailsDrawer } from '../../components/patches';

const { Title, Text } = Typography;

export const PatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [patch, setPatch] = useState<Patch | null>(null);
  const [affectedSoftwares, setAffectedSoftwares] = useState<AffectedSoftware[]>([]);
  const [fileDetails, setFileDetails] = useState<FileDetail[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [endpointDrawerOpen, setEndpointDrawerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatchDetails(id);
    }
  }, [id]);

  const fetchPatchDetails = async (patchId: string) => {
    setLoading(true);
    try {
      const patchData = await patchService.getPatch(patchId);
      setPatch(patchData);

      // Fetch related data
      const [softwares, files, vulns, eps] = await Promise.all([
        patchService.getAffectedSoftwares(patchId),
        patchService.getFileDetails(patchId),
        patchService.getVulnerabilities(patchId),
        patchService.getEndpoints(patchId),
      ]);
      setAffectedSoftwares(softwares);
      setFileDetails(files);
      setVulnerabilities(vulns);
      setEndpoints(eps);
    } catch (error) {
      message.error('Failed to fetch patch details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/patches');
  };

  const handleEndpointClick = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    setEndpointDrawerOpen(true);
  };

  const handleEndpointDrawerClose = () => {
    setEndpointDrawerOpen(false);
    setSelectedEndpointId(null);
  };

  const renderDetailsTab = () => {
    if (!patch) return null;

    return (
      <div>
        <Card bordered={false} style={{ backgroundColor: '#f5f5f5', marginBottom: 16 }}>
          <Title level={5} style={{ marginTop: 0 }}>
            {patch.software} ({patch.kbNumber})
          </Title>
          <Text type="secondary">{patch.description}</Text>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={6}>
              <div>
                <Text type="secondary">Category</Text>
                <div><strong>{patch.category}</strong></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">Severity</Text>
                <div><SeverityBadge severity={patch.severity} /></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">Approval Status</Text>
                <div><Tag color="success">{patch.approvalStatus || 'N/A'}</Tag></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">Test Status</Text>
                <div><Tag color="error">{patch.testStatus || 'N/A'}</Tag></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={6}>
              <div>
                <Text type="secondary">Architecture</Text>
                <div><strong>{patch.architecture}</strong></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">Bulletin ID</Text>
                <div><strong>{patch.bulletinId}</strong></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">KB</Text>
                <div><strong>{patch.kbNumber}</strong></div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary">Reference URL</Text>
                <div><a href={patch.referenceUrl} target="_blank" rel="noopener noreferrer">View</a></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={6}>
              <div>
                <Text type="secondary">UUID</Text>
                <div><strong>{patch.patchId}</strong></div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card title="Patch Details" bordered={false} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <Text type="secondary">Tags</Text>
                <div>
                  {patch.tags?.map((tag) => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Released On</Text>
                <div><strong>{patch.releasedOn || patch.releaseDate}</strong></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <div>
                <Text type="secondary">Source</Text>
                <div><strong>{patch.source || 'N/A'}</strong></div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Status</Text>
                <div><strong>{patch.status || 'N/A'}</strong></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <div>
                <Text type="secondary">Reboot Required</Text>
                <div><strong>{patch.rebootRequired ? 'Yes' : 'No'}</strong></div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Download Status</Text>
                <div><strong>{patch.downloadStatus || 'N/A'}</strong></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <div>
                <Text type="secondary">Created At</Text>
                <div><strong>{patch.createdAt || 'N/A'}</strong></div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Downloaded On</Text>
                <div><strong>{patch.downloadedOn || 'N/A'}</strong></div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <div>
                <Text type="secondary">Last Updated At</Text>
                <div><strong>{patch.lastUpdatedAt || 'N/A'}</strong></div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Size</Text>
                <div><strong>{patch.size || 'N/A'}</strong></div>
              </div>
            </Col>
          </Row>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">CVE Number</Text>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {patch.cveNumbers?.map((cve) => (
                <Tag key={cve} color="blue">{cve}</Tag>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Supersede KB Details" bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Update Replace By</Text>
            <div><strong>{patch.supersededBy?.length ? 'No KBs Found' : 'No KBs Found'}</strong></div>
          </div>

          <div>
            <Text type="secondary">Update Replaces Following</Text>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {patch.supersedes?.map((kb) => (
                <Tag key={kb} color="blue">{kb}</Tag>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!patch) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>Patch not found</Title>
        <Button type="primary" onClick={handleBack}>
          Back to All Patches
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <a onClick={handleBack}>All Patches</a> },
            { title: patch.software },
          ]}
        />
      </div>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {patch.software}
          </Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />}>Edit</Button>
          <Button icon={<MoreOutlined />} />
        </Space>
      </div>

      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: 'details',
            label: 'Details',
            children: renderDetailsTab(),
          },
          {
            key: 'endpoints',
            label: 'Endpoints',
            children: (
              <Table
                dataSource={endpoints}
                rowKey="id"
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name: string, record: Endpoint) => (
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => handleEndpointClick(record.id)}
                      >
                        {name}
                      </Button>
                    ),
                  },
                  { title: 'OS', dataIndex: 'os', key: 'os' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'Online' ? 'success' : 'error'}>{status}</Tag>
                    ),
                  },
                  { title: 'Last Seen', dataIndex: 'lastSeen', key: 'lastSeen' },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 80,
                    render: (_: unknown, record: Endpoint) => (
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleEndpointClick(record.id)}
                        title="View Details"
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'affected-softwares',
            label: 'Affected Softwares',
            children: (
              <Table
                dataSource={affectedSoftwares}
                rowKey="id"
                columns={[
                  { title: 'Software Name', dataIndex: 'softwareName', key: 'softwareName', width: 300 },
                  { title: 'Version', dataIndex: 'version', key: 'version', width: 180 },
                  { title: 'Vendor', dataIndex: 'vendor', key: 'vendor', width: 200 },
                  { title: 'Platform', dataIndex: 'platform', key: 'platform', width: 120 },
                  { title: 'Installed On (Endpoints)', dataIndex: 'installedOn', key: 'installedOn', width: 180, align: 'center' as const },
                ]}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} affected softwares`,
                }}
              />
            ),
          },
          {
            key: 'file-details',
            label: 'File Details',
            children: (
              <Table
                dataSource={fileDetails}
                rowKey="id"
                columns={[
                  { title: 'File Name', dataIndex: 'fileName', key: 'fileName' },
                  { title: 'Version', dataIndex: 'version', key: 'version' },
                  { title: 'Size', dataIndex: 'size', key: 'size' },
                  { title: 'Path', dataIndex: 'path', key: 'path' },
                ]}
              />
            ),
          },
          {
            key: 'vulnerabilities',
            label: 'Vulnerabilities',
            children: (
              <Table
                dataSource={vulnerabilities}
                rowKey="id"
                columns={[
                  { title: 'CVE Number', dataIndex: 'cveNumber', key: 'cveNumber' },
                  {
                    title: 'Severity',
                    dataIndex: 'severity',
                    key: 'severity',
                    render: (severity) => <Tag color={severity === 'Critical' ? 'red' : 'orange'}>{severity}</Tag>,
                  },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  { title: 'Published Date', dataIndex: 'publishedDate', key: 'publishedDate' },
                ]}
              />
            ),
          },
        ]}
      />

      <EndpointDetailsDrawer
        open={endpointDrawerOpen}
        endpointId={selectedEndpointId}
        onClose={handleEndpointDrawerClose}
      />
    </div>
  );
};
