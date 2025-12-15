// Branch Location Types
export type Branch = {
  id: string;
  name: string;
  status: 'Default' | 'Active' | 'Inactive';
  users: number;
  assets: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  manager: string;
  isDefault: boolean;
  description?: string;
};

export type BranchFormData = Omit<Branch, 'id' | 'users' | 'assets' | 'status'>;

// User Management Types
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  status: 'Active' | 'Invite Sent' | 'New Account' | 'In Active';
  lastLogin: string;
  avatar?: string;
  createdAt: string;
  gender?: 'Male' | 'Female' | 'Others';
  timezone?: string;
  password?: string;
  dashboard?: string;
  orgUnit?: string;
};

export type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  gender?: 'Male' | 'Female' | 'Others';
  timezone?: string;
  password?: string;
  dashboard?: string;
  orgUnit?: string;
};

export type InviteUserFormData = {
  email: string;
  role: string;
  orgUnit: string;
  dashboard?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  users: number;
  branch: string;
  permissions: Permission[];
  isSystem: boolean;
};

export type Permission = {
  module: string;
  actions: string[]; // ['view', 'create', 'edit', 'delete']
};

export type RoleFormData = {
  name: string;
  description: string;
  branch: string;
  permissions: Permission[];
  template?: string;
};

// Policy Types
export type Policy = {
  id: string;
  name: string;
  type: string;
  orgUnit: string;
  users: number;
  description: string;
  configuration: PolicyConfiguration;
  affectedRoles: string[];
  effectiveDate?: string;
  status: 'Active' | 'Inactive' | 'Draft';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type PolicyConfiguration = {
  // Password Policy
  resetDuration?: string;
  changeEveryDays?: number;
  lastNPasswordHistory?: number;
  minCharacterCount?: number;
  maxCharacterCount?: number;
  minUpperCaseCharacters?: number;
  minNumbers?: number;
  minSpecialCharacters?: number;

  // Other policy types can have different configurations
  [key: string]: any;
};

export type PolicyFormData = {
  name: string;
  type: string;
  branch: string;
  roles: string[];
  description: string;
  configuration: PolicyConfiguration;
};
