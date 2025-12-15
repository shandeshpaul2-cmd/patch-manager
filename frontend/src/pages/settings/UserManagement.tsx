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
  Tabs,
  Space,
  Checkbox,
} from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  UserAddOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { settingsService } from '../../services/settings.service';
import type { User, UserFormData, InviteUserFormData } from '../../types/settings.types';
import { AvatarWithInitials } from '../../components/AvatarWithInitials';
import { RolesAndPrivileges } from './RolesAndPrivileges';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getUsers();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleInviteUser = () => {
    inviteForm.resetFields();
    setInviteModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      branch: user.branch,
      role: user.role,
      gender: user.gender,
      timezone: user.timezone,
      orgUnit: user.orgUnit,
      dashboard: user.dashboard,
    });
    setAddModalVisible(true);
  };

  const handleView = (user: User) => {
    message.info(`Viewing details for ${user.firstName} ${user.lastName}`);
  };

  const handleResetPassword = (user: User) => {
    Modal.confirm({
      title: 'Reset Password',
      content: `Are you sure you want to reset password for ${user.firstName} ${user.lastName}? A password reset link will be sent to their email.`,
      okText: 'Reset Password',
      okType: 'primary',
      onOk: async () => {
        try {
          await settingsService.resetPassword(user.id);
          message.success('Password reset link sent successfully');
        } catch (error) {
          message.error('Failed to send password reset link');
        }
      },
    });
  };

  const handleSuspend = (user: User) => {
    Modal.confirm({
      title: 'Suspend Account',
      content: `Are you sure you want to suspend ${user.firstName} ${user.lastName}'s account?`,
      okText: 'Suspend',
      okType: 'danger',
      onOk: async () => {
        try {
          await settingsService.suspendUser(user.id);
          message.success(`${user.firstName} ${user.lastName}'s account suspended`);
          fetchUsers();
        } catch (error) {
          message.error('Failed to suspend account');
        }
      },
    });
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await settingsService.deleteUser(user.id);
          message.success(`${user.firstName} ${user.lastName} deleted successfully`);
          fetchUsers();
        } catch (error) {
          message.error('Failed to delete user');
        }
      },
    });
  };

  const handleViewAuditLog = (user: User) => {
    message.info(`Viewing audit log for ${user.firstName} ${user.lastName}`);
  };

  const handleSubmitUser = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        await settingsService.updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await settingsService.createUser(values);
        message.success('User created successfully');
      }

      setAddModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
      }
    }
  };

  const handleSubmitInvite = async () => {
    try {
      const values = await inviteForm.validateFields();
      await settingsService.inviteUser(values);
      message.success('Invitation sent successfully');
      setInviteModalVisible(false);
      inviteForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Failed to send invitation');
      }
    }
  };

  const getActionMenuItems = (user: User): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View',
      onClick: () => handleView(user),
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(user),
    },
    {
      key: 'reset-password',
      label: 'Reset Password',
      onClick: () => handleResetPassword(user),
    },
    {
      type: 'divider',
    },
    {
      key: 'suspend',
      label: 'Suspend Account',
      danger: true,
      onClick: () => handleSuspend(user),
    },
    {
      key: 'delete',
      label: 'Delete User',
      danger: true,
      onClick: () => handleDelete(user),
    },
    {
      type: 'divider',
    },
    {
      key: 'audit-log',
      label: 'View Audit Log',
      onClick: () => handleViewAuditLog(user),
    },
  ];

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      key: 'name',
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, record) => (
        <Space size="middle">
          <AvatarWithInitials
            firstName={record.firstName}
            lastName={record.lastName}
            size="default"
          />
          <span>{`${record.firstName} ${record.lastName}`}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'Active': 'blue',
          'Invite Sent': 'green',
          'New Account': 'green',
          'In Active': 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
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

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesBranch = branchFilter === 'all' || user.branch === branchFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesBranch && matchesRole && matchesStatus;
  });

  // Extract unique values for filter dropdowns
  const branches = Array.from(new Set(users.map((u) => u.branch)));
  const roles = Array.from(new Set(users.map((u) => u.role)));
  const statuses = Array.from(new Set(users.map((u) => u.status)));

  const usersTab = (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Select
          value={branchFilter}
          onChange={setBranchFilter}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: 'All Branches' },
            ...branches.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: 'All Roles' },
            ...roles.map((r) => ({ value: r, label: r })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: 'All Status' },
            ...statuses.map((s) => ({ value: s, label: s })),
          ]}
        />
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Button icon={<MailOutlined />} onClick={handleInviteUser}>
            Send Invite
          </Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddUser}>
            Add New User
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: '16px' }}
      />

      <Text type="secondary">
        Total {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''} Found
      </Text>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          User Management
        </Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'users',
            label: 'Users',
            children: usersTab,
          },
          {
            key: 'roles',
            label: 'Roles and Privileges',
            children: <RolesAndPrivileges />,
          },
        ]}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserAddOutlined style={{ color: '#1890ff' }} />
            <span>{editingUser ? 'Edit' : 'Add New'} User</span>
          </div>
        }
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setAddModalVisible(false);
              form.resetFields();
            }}
          >
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitUser}>
            {editingUser ? 'Update' : 'Add'} User
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              General Details
            </Title>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </div>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item label="Phone Number" name="phone">
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item label="Gender" name="gender">
                <Select
                  placeholder="Select gender"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Others', label: 'Others' },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Timezone" name="timezone">
                <Select
                  placeholder="Select timezone"
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'IST', label: 'Asia/Kolkata (IST)' },
                    { value: 'PST', label: 'America/Los_Angeles (PST)' },
                    { value: 'EST', label: 'America/New_York (EST)' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          {!editingUser && (
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px' }}>
                Password Setup
              </Title>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: !editingUser, message: 'Please enter password' }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                Password must be at least 8 characters with uppercase, lowercase, number, and
                special character
              </Text>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Assign Org unit and roles
            </Title>

            <Form.Item
              label="Select Branch"
              name="branch"
              rules={[{ required: true, message: 'Please select a branch' }]}
            >
              <Select
                placeholder="Select Branch"
                options={[
                  { value: 'Gurugram', label: 'Gurugram (Default)' },
                  { value: 'Delhi', label: 'Delhi' },
                  { value: 'Mumbai', label: 'Mumbai' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Select Role"
              name="role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                placeholder="Select Role"
                options={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Team Manager', label: 'Team Manager' },
                  { value: 'Employee', label: 'Employee' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Organizational Unit" name="orgUnit">
              <Select
                placeholder="Select Org Unit"
                options={[
                  { value: 'IT', label: 'IT Department' },
                  { value: 'HR', label: 'HR Department' },
                  { value: 'Finance', label: 'Finance Department' },
                ]}
              />
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Additional Details
            </Title>

            <Form.Item label="Default Dashboard" name="dashboard">
              <Select
                placeholder="Select Dashboard"
                options={[
                  { value: 'overview', label: 'Overview Dashboard' },
                  { value: 'patches', label: 'Patches Dashboard' },
                  { value: 'assets', label: 'Assets Dashboard' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Invite User Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailOutlined style={{ color: '#1890ff' }} />
            <span>Invite New User</span>
          </div>
        }
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false);
          inviteForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setInviteModalVisible(false);
              inviteForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitInvite}>
            Send Invite
          </Button>,
        ]}
        width={600}
      >
        <Form form={inviteForm} layout="vertical" style={{ marginTop: '24px' }}>
          <Form.Item
            label="Organizational Unit"
            name="orgUnit"
            rules={[{ required: true, message: 'Please select org unit' }]}
          >
            <Select
              placeholder="Select Org Unit"
              options={[
                { value: 'Gurugram', label: 'Gurugram (Default)' },
                { value: 'Delhi', label: 'Delhi' },
                { value: 'Mumbai', label: 'Mumbai' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select Role"
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Team Manager', label: 'Team Manager' },
                { value: 'Employee', label: 'Employee' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Default Dashboard"
            name="dashboard"
            rules={[{ required: true, message: 'Please select dashboard' }]}
          >
            <Select
              placeholder="Select Dashboard"
              options={[
                { value: 'overview', label: 'Overview Dashboard' },
                { value: 'patches', label: 'Patches Dashboard' },
                { value: 'assets', label: 'Assets Dashboard' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Personal Message (Optional)" name="message">
            <TextArea rows={3} placeholder="Add a personal message to the invitation" />
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '12px' }}>
            An invitation email will be sent to the user with a link to set up their account.
            The invitation will expire in 7 days.
          </Text>
        </Form>
      </Modal>
    </div>
  );
};
