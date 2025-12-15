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
  Checkbox,
} from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { settingsService } from '../../services/settings.service';
import type { Branch } from '../../types/settings.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const BranchLocation = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getBranches();
      setBranches(data);
    } catch (error) {
      message.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBranch(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      postalCode: branch.postalCode,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      isDefault: branch.isDefault,
      description: branch.description,
    });
    setModalVisible(true);
  };

  const handleView = (branch: Branch) => {
    message.info(`Viewing details for ${branch.name}`);
  };

  const handleDelete = (branch: Branch) => {
    if (branch.isDefault) {
      message.error('Cannot delete the default branch');
      return;
    }

    Modal.confirm({
      title: 'Delete Branch',
      content: `Are you sure you want to delete ${branch.name}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await settingsService.deleteBranch(branch.id);
          message.success(`${branch.name} deleted successfully`);
          fetchBranches();
        } catch (error) {
          message.error('Failed to delete branch');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Check if setting as default when another default exists
      if (values.isDefault && !editingBranch) {
        const hasDefault = branches.some(b => b.isDefault);
        if (hasDefault) {
          message.warning('Another branch is already set as default. It will be updated.');
        }
      }

      if (editingBranch) {
        await settingsService.updateBranch(editingBranch.id, values);
        message.success('Branch updated successfully');
      } else {
        await settingsService.createBranch(values);
        message.success('Branch created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchBranches();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(`Failed to ${editingBranch ? 'update' : 'create'} branch`);
      }
    }
  };

  const getActionMenuItems = (branch: Branch): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View',
      onClick: () => handleView(branch),
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(branch),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      disabled: branch.isDefault,
      onClick: () => handleDelete(branch),
    },
  ];

  const columns: ColumnsType<Branch> = [
    {
      title: 'Branch name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Default' ? 'blue' : status === 'Active' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
    },
    {
      title: 'Assets',
      dataIndex: 'assets',
      key: 'assets',
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

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          Branch Locations
        </Title>
        <Button
          type="primary"
          icon={<EnvironmentOutlined />}
          onClick={handleAdd}
        >
          Add New Branch
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
        dataSource={filteredBranches}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: '16px' }}
      />

      <Text type="secondary">
        Total {filteredBranches.length} Branch{filteredBranches.length !== 1 ? 'es' : ''} Found
      </Text>

      {/* Add/Edit Branch Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>{editingBranch ? 'Edit' : 'Add New'} Branch Location</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            form.resetFields();
          }}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {editingBranch ? 'Update' : 'Add'} Branch Location
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>General Details</Title>

            <Form.Item
              label="Branch Name"
              name="name"
              rules={[{ required: true, message: 'Please enter branch name' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>

            <Form.Item
              label="Branch Address"
              name="address"
            >
              <Input placeholder="Enter Address" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={3} placeholder="Enter description" />
            </Form.Item>

            <Form.Item
              name="isDefault"
              valuePropName="checked"
            >
              <Checkbox>Mark as default</Checkbox>
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>Assign Manager</Title>

            <Form.Item
              label="Select User"
              name="manager"
              rules={[{ required: true, message: 'Please select a manager' }]}
            >
              <Select
                placeholder="Select User"
                options={[
                  { value: 'user1', label: 'John Doe (Admin)' },
                  { value: 'user2', label: 'Jane Smith (Manager)' },
                  { value: 'user3', label: 'Bob Johnson (Admin)' },
                ]}
              />
            </Form.Item>

            <Text type="secondary" style={{ fontSize: '12px' }}>
              Only admin users can be assigned as Branch managers
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
