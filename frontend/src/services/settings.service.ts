import axios from 'axios';
import type {
  Branch,
  BranchFormData,
  User,
  UserFormData,
  InviteUserFormData,
  Role,
  RoleFormData,
  Policy,
  PolicyFormData,
} from '../types/settings.types';

const API_BASE_URL = '/api/settings';

export const settingsService = {
  // Branch Location APIs
  async getBranches(): Promise<Branch[]> {
    const response = await axios.get(`${API_BASE_URL}/branches`);
    return response.data;
  },

  async getBranch(id: string): Promise<Branch> {
    const response = await axios.get(`${API_BASE_URL}/branches/${id}`);
    return response.data;
  },

  async createBranch(data: BranchFormData): Promise<Branch> {
    const response = await axios.post(`${API_BASE_URL}/branches`, data);
    return response.data;
  },

  async updateBranch(id: string, data: Partial<BranchFormData>): Promise<Branch> {
    const response = await axios.put(`${API_BASE_URL}/branches/${id}`, data);
    return response.data;
  },

  async deleteBranch(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/branches/${id}`);
  },

  // User Management APIs
  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  async createUser(data: UserFormData): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/users`, data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
  },

  async inviteUser(data: InviteUserFormData): Promise<void> {
    await axios.post(`${API_BASE_URL}/users/invite`, data);
  },

  async resetPassword(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/users/${id}/reset-password`);
  },

  async suspendUser(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/users/${id}/suspend`);
  },

  async getAuditLog(id: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/users/${id}/audit-log`);
    return response.data;
  },

  // Role Management APIs
  async getRoles(): Promise<Role[]> {
    const response = await axios.get(`${API_BASE_URL}/roles`);
    return response.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await axios.get(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  },

  async createRole(data: RoleFormData): Promise<Role> {
    const response = await axios.post(`${API_BASE_URL}/roles`, data);
    return response.data;
  },

  async updateRole(id: string, data: Partial<RoleFormData>): Promise<Role> {
    const response = await axios.put(`${API_BASE_URL}/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/roles/${id}`);
  },

  // Policy Management APIs
  async getPolicies(): Promise<Policy[]> {
    const response = await axios.get(`${API_BASE_URL}/policies`);
    return response.data;
  },

  async getPolicy(id: string): Promise<Policy> {
    const response = await axios.get(`${API_BASE_URL}/policies/${id}`);
    return response.data;
  },

  async createPolicy(data: PolicyFormData): Promise<Policy> {
    const response = await axios.post(`${API_BASE_URL}/policies`, data);
    return response.data;
  },

  async updatePolicy(id: string, data: Partial<PolicyFormData>): Promise<Policy> {
    const response = await axios.put(`${API_BASE_URL}/policies/${id}`, data);
    return response.data;
  },

  async deletePolicy(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/policies/${id}`);
  },

  async clonePolicy(id: string): Promise<Policy> {
    const response = await axios.post(`${API_BASE_URL}/policies/${id}/clone`);
    return response.data;
  },

  async disablePolicy(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/policies/${id}/disable`);
  },

  async getAffectedUsers(id: string): Promise<User[]> {
    const response = await axios.get(`${API_BASE_URL}/policies/${id}/affected-users`);
    return response.data;
  },

  async getPolicyAudit(id: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/policies/${id}/audit`);
    return response.data;
  },
};
