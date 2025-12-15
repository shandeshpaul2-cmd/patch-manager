import axios from 'axios';
import type {
  Asset,
  AssetLifeCycle,
  Hardware,
  Software,
  AuditLog,
  SoftwareInventory,
  SoftwareLicense,
  OSLicense,
  AddAssetFormData,
} from '../types/asset.types';

const API_BASE_URL = '/api';

export const assetService = {
  // Assets
  async getAssets(): Promise<Asset[]> {
    const response = await axios.get(`${API_BASE_URL}/assets`);
    return response.data;
  },

  async getAsset(id: string): Promise<Asset> {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}`);
    return response.data;
  },

  async createAsset(data: AddAssetFormData): Promise<Asset> {
    const response = await axios.post(`${API_BASE_URL}/assets`, data);
    return response.data;
  },

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    const response = await axios.put(`${API_BASE_URL}/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/assets/${id}`);
  },

  async bulkCreateAssets(data: AddAssetFormData[]): Promise<Asset[]> {
    const response = await axios.post(`${API_BASE_URL}/assets/bulk`, data);
    return response.data;
  },

  // Asset Details
  async getAssetLifeCycle(id: string): Promise<AssetLifeCycle> {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}/lifecycle`);
    return response.data;
  },

  async getAssetHardware(id: string): Promise<Hardware> {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}/hardware`);
    return response.data;
  },

  async getAssetSoftware(id: string): Promise<Software> {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}/software`);
    return response.data;
  },

  async getAssetAuditLog(id: string): Promise<AuditLog[]> {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}/audit-log`);
    return response.data;
  },

  async uploadAssetAttachment(id: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${API_BASE_URL}/assets/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Software Inventory
  async getSoftwareInventory(): Promise<SoftwareInventory[]> {
    const response = await axios.get(`${API_BASE_URL}/software-inventory`);
    return response.data;
  },

  async getSoftwareInventoryItem(id: string): Promise<SoftwareInventory> {
    const response = await axios.get(`${API_BASE_URL}/software-inventory/${id}`);
    return response.data;
  },

  async importSoftwareInventory(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${API_BASE_URL}/software-inventory/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Software License
  async getSoftwareLicenses(): Promise<SoftwareLicense[]> {
    const response = await axios.get(`${API_BASE_URL}/software-licenses`);
    return response.data;
  },

  async getSoftwareLicense(id: string): Promise<SoftwareLicense> {
    const response = await axios.get(`${API_BASE_URL}/software-licenses/${id}`);
    return response.data;
  },

  async createSoftwareLicense(data: Partial<SoftwareLicense>): Promise<SoftwareLicense> {
    const response = await axios.post(`${API_BASE_URL}/software-licenses`, data);
    return response.data;
  },

  async updateSoftwareLicense(id: string, data: Partial<SoftwareLicense>): Promise<SoftwareLicense> {
    const response = await axios.put(`${API_BASE_URL}/software-licenses/${id}`, data);
    return response.data;
  },

  async deleteSoftwareLicense(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/software-licenses/${id}`);
  },

  async importSoftwareLicenses(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${API_BASE_URL}/software-licenses/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // OS License
  async getOSLicenses(): Promise<OSLicense[]> {
    const response = await axios.get(`${API_BASE_URL}/os-licenses`);
    return response.data;
  },

  async getOSLicense(id: string): Promise<OSLicense> {
    const response = await axios.get(`${API_BASE_URL}/os-licenses/${id}`);
    return response.data;
  },

  async createOSLicense(data: Partial<OSLicense>): Promise<OSLicense> {
    const response = await axios.post(`${API_BASE_URL}/os-licenses`, data);
    return response.data;
  },

  async updateOSLicense(id: string, data: Partial<OSLicense>): Promise<OSLicense> {
    const response = await axios.put(`${API_BASE_URL}/os-licenses/${id}`, data);
    return response.data;
  },

  async deleteOSLicense(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/os-licenses/${id}`);
  },

  async importOSLicenses(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${API_BASE_URL}/os-licenses/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
