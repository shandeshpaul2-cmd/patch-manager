import axios from 'axios';

export type Patch = {
  id: string;
  software: string;
  patchId: string;
  endpoints: number;
  os: 'Windows' | 'MacOS' | 'Ubuntu' | 'Linux';
  severity: 'CRITICAL' | 'High' | 'Medium' | 'Low' | 'UNSPECIFIED';
  operationalStatusSince: string;
  platform: string;
  description: string;
  category: string;
  bulletinId: string;
  kbNumber: string;
  releaseDate: string;
  rebootRequired: boolean;
  supportUninstallation: boolean;
  architecture: string;
  referenceUrl: string;
  languagesSupported: string[];
  tags: string[];
  approvalStatus?: string;
  testStatus?: string;
  cveNumbers?: string[];
  status?: string;
  downloadStatus?: string;
  size?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  source?: string;
  releasedOn?: string;
  downloadedOn?: string;
  supersededBy?: string[];
  supersedes?: string[];
};

export type AffectedSoftware = {
  id: string;
  softwareName: string;
  version: string;
  vendor: string;
  installedOn: number; // Number of endpoints with this software installed
  platform: string;
};

export type FileDetail = {
  id: string;
  fileName: string;
  version: string;
  size: string;
  path: string;
};

export type Vulnerability = {
  id: string;
  cveNumber: string;
  severity: string;
  description: string;
  publishedDate: string;
};

export type Endpoint = {
  id: string;
  name: string;
  os: string;
  status: string;
  lastSeen: string;
};

export type EndpointPatchStatus = 'Installed' | 'Missing' | 'Pending' | 'Failed';

export type EndpointRelatedPatch = {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'High' | 'Medium' | 'Low' | 'UNSPECIFIED';
  status: EndpointPatchStatus;
  kbNumber?: string;
};

export type EndpointDeployment = {
  id: string;
  patchId: string;
  patchName: string;
  date: string;
  status: 'Success' | 'Failed' | 'Pending';
};

export type EndpointDetails = {
  id: string;
  name: string;
  os: string;
  osVersion: string;
  status: 'Online' | 'Offline';
  lastSeen: string;

  // Agent info
  agentId?: string;
  agentName?: string;
  agentVersion?: string;
  agentStatus?: 'Connected' | 'Disconnected';

  // Asset link
  assetId?: string;
  assetName?: string;

  // Groups
  groups?: Array<{
    id: string;
    name: string;
  }>;

  // Network
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;

  // Hardware summary
  manufacturer?: string;
  model?: string;
  serialNumber?: string;

  // Location
  location?: string;
  department?: string;
  owner?: string;

  // Patch summary
  patchSummary: {
    total: number;
    installed: number;
    missing: number;
    failed: number;
    pending: number;
    lastScanDate: string;
  };

  // Related patches for this endpoint
  relatedPatches: EndpointRelatedPatch[];

  // Recent deployment history
  recentDeployments: EndpointDeployment[];
};

export type Deployment = {
  id: string;
  name: string;
  deploymentId: string;
  type: 'INSTALL' | 'ROLLBACK';
  stage: 'INSTALLED' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  pending: number;
  succeeded: number;
  failed: number;
  createdBy: string;
  createdOn: string;
};

export type PatchTest = {
  id: string;
  name: string;
  description: string;
  applicationType: 'ALL' | 'INCLUDE' | 'EXCLUDE';
  applications: string[];
  scope: 'ALL_COMPUTERS' | 'SCOPE' | 'SPECIFIC_GROUPS';
  computers: string[];
  groups: string[];
  status: string;
  createdBy: string;
  createdOn: string;
};

export type ZeroTouchConfig = {
  id: string;
  name: string;
  description: string;
  applicationType: 'ALL' | 'INCLUDE' | 'EXCLUDE';
  applications: string[];
  scope: 'ALL_COMPUTERS' | 'SCOPE' | 'SPECIFIC_GROUPS';
  computers: string[];
  groups: string[];
  autoDeploymentRules: {
    severity: string[];
    approvalRequired: boolean;
    schedule: string;
  };
  status: string;
  createdBy: string;
  createdOn: string;
};

const API_BASE_URL = '/api';

export const patchService = {
  // Patches
  async getPatches(): Promise<Patch[]> {
    const response = await axios.get(`${API_BASE_URL}/patches`);
    return response.data;
  },

  async getPatch(id: string): Promise<Patch> {
    const response = await axios.get(`${API_BASE_URL}/patches/${id}`);
    return response.data;
  },

  async createPatch(patch: Partial<Patch>): Promise<Patch> {
    const response = await axios.post(`${API_BASE_URL}/patches`, patch);
    return response.data;
  },

  async updatePatch(id: string, patch: Partial<Patch>): Promise<Patch> {
    const response = await axios.put(`${API_BASE_URL}/patches/${id}`, patch);
    return response.data;
  },

  async deletePatch(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/patches/${id}`);
  },

  async getAffectedSoftwares(patchId: string): Promise<AffectedSoftware[]> {
    const response = await axios.get(`${API_BASE_URL}/patches/${patchId}/affected-softwares`);
    return response.data;
  },

  async scanEndpoints(patchId: string, data: { scope: string; endpointIds: string[] }): Promise<void> {
    await axios.post(`${API_BASE_URL}/patches/${patchId}/scan-endpoints`, data);
  },

  async getFileDetails(patchId: string): Promise<FileDetail[]> {
    const response = await axios.get(`${API_BASE_URL}/patches/${patchId}/file-details`);
    return response.data;
  },

  async getVulnerabilities(patchId: string): Promise<Vulnerability[]> {
    const response = await axios.get(`${API_BASE_URL}/patches/${patchId}/vulnerabilities`);
    return response.data;
  },

  async getEndpoints(patchId: string): Promise<Endpoint[]> {
    const response = await axios.get(`${API_BASE_URL}/patches/${patchId}/endpoints`);
    return response.data;
  },

  async getEndpointDetails(endpointId: string): Promise<EndpointDetails> {
    const response = await axios.get(`${API_BASE_URL}/endpoints/${endpointId}`);
    return response.data;
  },

  // Deployments
  async getDeployments(): Promise<Deployment[]> {
    const response = await axios.get(`${API_BASE_URL}/deployments`);
    return response.data;
  },

  async getDeployment(id: string): Promise<Deployment> {
    const response = await axios.get(`${API_BASE_URL}/deployments/${id}`);
    return response.data;
  },

  async createDeployment(deployment: Partial<Deployment>): Promise<Deployment> {
    const response = await axios.post(`${API_BASE_URL}/deployments`, deployment);
    return response.data;
  },

  async deleteDeployment(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/deployments/${id}`);
  },

  async previewDeployment(id: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/deployments/${id}/preview`);
    return response.data;
  },

  async executeDeployment(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/deployments/${id}/execute`);
  },

  // Patch Tests
  async getPatchTests(): Promise<PatchTest[]> {
    const response = await axios.get(`${API_BASE_URL}/patch-tests`);
    return response.data;
  },

  async getPatchTest(id: string): Promise<PatchTest> {
    const response = await axios.get(`${API_BASE_URL}/patch-tests/${id}`);
    return response.data;
  },

  async createPatchTest(test: Partial<PatchTest>): Promise<PatchTest> {
    const response = await axios.post(`${API_BASE_URL}/patch-tests`, test);
    return response.data;
  },

  async approvePatchTest(id: string): Promise<void> {
    await axios.put(`${API_BASE_URL}/patch-tests/${id}/approve`);
  },

  async deletePatchTest(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/patch-tests/${id}`);
  },

  // Zero Touch
  async getZeroTouchConfigs(): Promise<ZeroTouchConfig[]> {
    const response = await axios.get(`${API_BASE_URL}/zero-touch-configs`);
    return response.data;
  },

  async getZeroTouchConfig(id: string): Promise<ZeroTouchConfig> {
    const response = await axios.get(`${API_BASE_URL}/zero-touch-configs/${id}`);
    return response.data;
  },

  async createZeroTouchConfig(config: Partial<ZeroTouchConfig>): Promise<ZeroTouchConfig> {
    const response = await axios.post(`${API_BASE_URL}/zero-touch-configs`, config);
    return response.data;
  },

  async updateZeroTouchConfig(id: string, config: Partial<ZeroTouchConfig>): Promise<ZeroTouchConfig> {
    const response = await axios.put(`${API_BASE_URL}/zero-touch-configs/${id}`, config);
    return response.data;
  },

  async deleteZeroTouchConfig(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/zero-touch-configs/${id}`);
  },
};
