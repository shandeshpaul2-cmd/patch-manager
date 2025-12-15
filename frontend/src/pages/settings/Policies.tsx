import { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Dropdown,
  Tag,
  Typography,
  Modal,
  Form,
  message,
  Select,
  DatePicker,
  Switch,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { settingsService } from '../../services/settings.service';
import type { Policy, PolicyFormData } from '../../types/settings.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Policy type configuration templates
const POLICY_TYPES = [
  { value: 'password', label: 'Password Policy' },
  { value: 'security', label: 'Security Policy' },
  { value: 'backup', label: 'Backup Policy' },
  { value: 'update', label: 'Update Policy' },
  { value: 'access', label: 'Access Policy' },
  { value: 'compliance', label: 'Compliance Policy' },
];

export const Policies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orgUnitFilter, setOrgUnitFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getPolicies();
      setPolicies(data);
    } catch (error) {
      message.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = () => {
    setEditingPolicy(null);
    form.resetFields();
    setSelectedPolicyType('');
    setModalVisible(true);
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setSelectedPolicyType(policy.type);
    form.setFieldsValue({
      name: policy.name,
      type: policy.type,
      orgUnit: policy.orgUnit,
      description: policy.description,
      affectedRoles: policy.affectedRoles,
      effectiveDate: policy.effectiveDate ? dayjs(policy.effectiveDate) : undefined,
      status: policy.status === 'Active',
      ...policy.configuration,
    });
    setModalVisible(true);
  };

  const handleView = (policy: Policy) => {
    message.info(`Viewing details for ${policy.name}`);
  };

  const handleClone = async (policy: Policy) => {
    try {
      await settingsService.clonePolicy(policy.id);
      message.success(`${policy.name} cloned successfully`);
      fetchPolicies();
    } catch (error) {
      message.error('Failed to clone policy');
    }
  };

  const handleViewAffectedUsers = async (policy: Policy) => {
    try {
      const users = await settingsService.getAffectedUsers(policy.id);
      Modal.info({
        title: `Users Affected by ${policy.name}`,
        content: (
          <div>
            <p>Total: {users.length} users</p>
            <ul>
              {users.slice(0, 10).map((user) => (
                <li key={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </li>
              ))}
              {users.length > 10 && <li>...and {users.length - 10} more</li>}
            </ul>
          </div>
        ),
        width: 600,
      });
    } catch (error) {
      message.error('Failed to fetch affected users');
    }
  };

  const handleDisable = async (policy: Policy) => {
    Modal.confirm({
      title: 'Disable Policy',
      content: `Are you sure you want to disable ${policy.name}?`,
      okText: 'Disable',
      okType: 'danger',
      onOk: async () => {
        try {
          await settingsService.disablePolicy(policy.id);
          message.success(`${policy.name} disabled successfully`);
          fetchPolicies();
        } catch (error) {
          message.error('Failed to disable policy');
        }
      },
    });
  };

  const handleDelete = (policy: Policy) => {
    Modal.confirm({
      title: 'Delete Policy',
      content: `Are you sure you want to delete ${policy.name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await settingsService.deletePolicy(policy.id);
          message.success(`${policy.name} deleted successfully`);
          fetchPolicies();
        } catch (error) {
          message.error('Failed to delete policy');
        }
      },
    });
  };

  const handleViewAudit = async (policy: Policy) => {
    try {
      const audit = await settingsService.getPolicyAudit(policy.id);
      message.info(`Viewing audit history for ${policy.name}`);
    } catch (error) {
      message.error('Failed to fetch audit history');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Extract configuration fields based on policy type
      const configurationFields = getConfigurationFields(selectedPolicyType);
      const configuration: Record<string, any> = {};
      configurationFields.forEach((field) => {
        if (values[field.name] !== undefined) {
          configuration[field.name] = values[field.name];
        }
      });

      const policyData: PolicyFormData = {
        name: values.name,
        type: values.type,
        orgUnit: values.orgUnit,
        description: values.description,
        configuration,
        affectedRoles: values.affectedRoles || [],
        effectiveDate: values.effectiveDate ? values.effectiveDate.toISOString() : undefined,
        status: values.status ? 'Active' : 'Inactive',
      };

      if (editingPolicy) {
        await settingsService.updatePolicy(editingPolicy.id, policyData);
        message.success('Policy updated successfully');
      } else {
        await settingsService.createPolicy(policyData);
        message.success('Policy created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchPolicies();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(`Failed to ${editingPolicy ? 'update' : 'create'} policy`);
      }
    }
  };

  const getActionMenuItems = (policy: Policy): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View',
      onClick: () => handleView(policy),
    },
    {
      key: 'edit',
      label: 'Edit Policy',
      onClick: () => handleEdit(policy),
    },
    {
      key: 'clone',
      label: 'Clone Policy',
      icon: <CopyOutlined />,
      onClick: () => handleClone(policy),
    },
    {
      type: 'divider',
    },
    {
      key: 'affected-users',
      label: 'View Affected Users',
      onClick: () => handleViewAffectedUsers(policy),
    },
    {
      key: 'disable',
      label: 'Disable Policy',
      danger: true,
      onClick: () => handleDisable(policy),
    },
    {
      type: 'divider',
    },
    {
      key: 'audit',
      label: 'Audit History',
      onClick: () => handleViewAudit(policy),
    },
    {
      key: 'delete',
      label: 'Delete Policy',
      danger: true,
      onClick: () => handleDelete(policy),
    },
  ];

  const columns: ColumnsType<Policy> = [
    {
      title: 'Policy name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Policy Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const policyType = POLICY_TYPES.find((pt) => pt.value === type);
        return policyType ? policyType.label : type;
      },
    },
    {
      title: 'Org Unit',
      dataIndex: 'orgUnit',
      key: 'orgUnit',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Inactive' ? 'default' : 'orange'}>
          {status}
        </Tag>
      ),
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

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesOrgUnit = orgUnitFilter === 'all' || policy.orgUnit === orgUnitFilter;
    return matchesSearch && matchesOrgUnit;
  });

  const orgUnits = Array.from(new Set(policies.map((p) => p.orgUnit)));

  // Dynamic configuration fields based on policy type
  const getConfigurationFields = (policyType: string) => {
    switch (policyType) {
      case 'password':
        return [
          { name: 'minLength', label: 'Minimum Length', type: 'number', default: 8 },
          { name: 'requireUppercase', label: 'Require Uppercase', type: 'boolean', default: true },
          { name: 'requireLowercase', label: 'Require Lowercase', type: 'boolean', default: true },
          { name: 'requireNumbers', label: 'Require Numbers', type: 'boolean', default: true },
          { name: 'requireSpecialChars', label: 'Require Special Characters', type: 'boolean', default: true },
          { name: 'expiryDays', label: 'Password Expiry (days)', type: 'number', default: 90 },
          { name: 'preventReuse', label: 'Prevent Password Reuse', type: 'number', default: 5 },
        ];
      case 'security':
        return [
          { name: 'require2FA', label: 'Require Two-Factor Authentication', type: 'boolean', default: false },
          { name: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', default: 30 },
          { name: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', default: 5 },
          { name: 'lockoutDuration', label: 'Account Lockout Duration (minutes)', type: 'number', default: 30 },
          { name: 'ipWhitelist', label: 'IP Whitelist (comma-separated)', type: 'text' },
        ];
      case 'backup':
        return [
          { name: 'frequency', label: 'Backup Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'], default: 'Daily' },
          { name: 'retentionDays', label: 'Retention Period (days)', type: 'number', default: 30 },
          { name: 'autoBackup', label: 'Automatic Backup', type: 'boolean', default: true },
          { name: 'backupLocation', label: 'Backup Location', type: 'text' },
        ];
      case 'update':
        return [
          { name: 'autoUpdate', label: 'Automatic Updates', type: 'boolean', default: false },
          { name: 'updateSchedule', label: 'Update Schedule', type: 'select', options: ['Immediate', 'Scheduled', 'Manual'], default: 'Scheduled' },
          { name: 'requireApproval', label: 'Require Approval', type: 'boolean', default: true },
          { name: 'notifyUsers', label: 'Notify Users Before Update', type: 'boolean', default: true },
        ];
      case 'access':
        return [
          { name: 'allowRemoteAccess', label: 'Allow Remote Access', type: 'boolean', default: true },
          { name: 'allowMobileAccess', label: 'Allow Mobile Access', type: 'boolean', default: true },
          { name: 'restrictAccessHours', label: 'Restrict Access Hours', type: 'boolean', default: false },
          { name: 'accessStartTime', label: 'Access Start Time', type: 'text', default: '09:00' },
          { name: 'accessEndTime', label: 'Access End Time', type: 'text', default: '18:00' },
        ];
      case 'compliance':
        return [
          { name: 'auditLogging', label: 'Enable Audit Logging', type: 'boolean', default: true },
          { name: 'dataEncryption', label: 'Require Data Encryption', type: 'boolean', default: true },
          { name: 'dataRetentionDays', label: 'Data Retention Period (days)', type: 'number', default: 365 },
          { name: 'complianceStandard', label: 'Compliance Standard', type: 'select', options: ['GDPR', 'HIPAA', 'SOC2', 'ISO27001'], default: 'GDPR' },
        ];
      default:
        return [];
    }
  };

  const renderConfigurationFields = () => {
    if (!selectedPolicyType) {
      return (
        <Text type="secondary">Select a policy type to configure its settings</Text>
      );
    }

    const fields = getConfigurationFields(selectedPolicyType);

    return fields.map((field) => {
      switch (field.type) {
        case 'number':
          return (
            <Form.Item
              key={field.name}
              label={field.label}
              name={field.name}
              initialValue={field.default}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          );
        case 'boolean':
          return (
            <Form.Item
              key={field.name}
              label={field.label}
              name={field.name}
              valuePropName="checked"
              initialValue={field.default}
            >
              <Switch />
            </Form.Item>
          );
        case 'select':
          return (
            <Form.Item
              key={field.name}
              label={field.label}
              name={field.name}
              initialValue={field.default}
            >
              <Select
                options={field.options?.map((opt) => ({ value: opt, label: opt }))}
              />
            </Form.Item>
          );
        case 'text':
          return (
            <Form.Item
              key={field.name}
              label={field.label}
              name={field.name}
              initialValue={field.default}
            >
              <Input />
            </Form.Item>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          Policies
        </Title>
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={handleCreatePolicy}
        >
          Create New Policy
        </Button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <Select
          value={orgUnitFilter}
          onChange={setOrgUnitFilter}
          style={{ width: 220 }}
          options={[
            { value: 'all', label: 'All Org Units' },
            ...orgUnits.map((unit) => ({ value: unit, label: unit })),
          ]}
        />
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
        dataSource={filteredPolicies}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: '16px' }}
      />

      <Text type="secondary">
        Total {filteredPolicies.length} Polic{filteredPolicies.length !== 1 ? 'ies' : 'y'} Found
      </Text>

      {/* Create/Edit Policy Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
            <span>{editingPolicy ? 'Edit' : 'Create New'} Policy</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedPolicyType('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
              setSelectedPolicyType('');
            }}
          >
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {editingPolicy ? 'Update' : 'Create'} Policy
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
          onValuesChange={(changedValues) => {
            if (changedValues.type) {
              setSelectedPolicyType(changedValues.type);
            }
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              General Details
            </Title>

            <Form.Item
              label="Policy Name"
              name="name"
              rules={[{ required: true, message: 'Please enter policy name' }]}
            >
              <Input placeholder="Enter policy name" />
            </Form.Item>

            <Form.Item
              label="Policy Type"
              name="type"
              rules={[{ required: true, message: 'Please select policy type' }]}
            >
              <Select
                placeholder="Select policy type"
                options={POLICY_TYPES}
              />
            </Form.Item>

            <Form.Item
              label="Organization Unit"
              name="orgUnit"
              rules={[{ required: true, message: 'Please select organization unit' }]}
            >
              <Select
                placeholder="Select organization unit"
                options={[
                  { value: 'Gurugram', label: 'Gurugram (Default)' },
                  { value: 'Delhi', label: 'Delhi' },
                  { value: 'Mumbai', label: 'Mumbai' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Enter description" />
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Policy Configuration
            </Title>

            {renderConfigurationFields()}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Apply To
            </Title>

            <Form.Item
              label="Affected Roles"
              name="affectedRoles"
            >
              <Select
                mode="multiple"
                placeholder="Select roles"
                options={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Team Manager', label: 'Team Manager' },
                  { value: 'Employee', label: 'Employee' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Effective Date"
              name="effectiveDate"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
