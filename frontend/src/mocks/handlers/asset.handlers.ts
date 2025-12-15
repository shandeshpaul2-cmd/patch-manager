import { http, HttpResponse } from 'msw';
import type {
  Asset,
  AssetLifeCycle,
  Hardware,
  Software,
  AuditLog,
  SoftwareInventory,
  SoftwareLicense,
  OSLicense,
} from '../../types/asset.types';

// Mock Assets Data
const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'ASUS Laptop 01',
    assetId: 'ASSET0029',
    operationalStatus: 'Connected',
    status: 'In Use',
    operationalStatusSince: 'May 05, 2025 3:45pm',
    operationalStatusDuration: '2 day, 24 hrs, 15 min, 30 sec',
    assetType: 'Laptop',
    assetTag: 'LAP-001',
    serialNumber: 'XPS039542192893',
    branchLocation: 'Bangalore Karnataka India 560078',
    manufacturer: 'Asus',
    model: '32923GSHFA',
    purchaseDate: 'Feb 14, 2022',
    warrantyExpiry: 'Feb 17, 2027',
    owner: {
      name: 'Orgnas',
      email: 'flasetsi@orgnas.com',
      phone: '+91-9812356223',
    },
    osType: 'Windows 11 Pro',
    osVersion: '10.0.22621.2506',
    osBuild: 'LENOVO - 1160',
    architecture: '64-bit',
    ipAddress: '192.168.29.24',
    macAddress: '00:09:0F:FE:00:01',
    hostname: 'XPS039542192893',
    processor: {
      name: 'AMD Ryzen 5 7530U with Radeon Graphics',
      cores: 6,
      speed: '2.0GHz',
    },
    ram: {
      size: '16GB',
      type: 'DDR4',
    },
    storage: {
      type: 'SSD',
      size: '512GB',
    },
    performance: {
      systemUptime: '2 day, 24 hrs, 15 min, 30 sec',
      memoryUtilization: 32.01,
      cpuUtilization: 12,
      diskUtilization: 60.91,
    },
    location: {
      base: {
        address: 'Bangalore Karnataka India 560078',
        latitude: 12.9063,
        longitude: 77.5857,
      },
      installed: {
        address: 'Bangalore Karnataka India 560078',
        latitude: 12.9063,
        longitude: 77.5857,
      },
    },
    procurement: {
      amcCost: '₹5,000',
      amcExpiryDate: 'Sep 23, 2027',
      amcVendor: 'ASUS India',
      endOfLife: 'Jan 31, 2030',
      expiryDate: 'Sep 23, 2027',
      warrantyExpiryDate: 'Feb 17, 2027',
      warrantyYearAndMonth: '3 years 0 months',
    },
    cost: {
      age: '3 years 4 months',
      cost: '₹40,000',
      currency: 'INR',
      currentCost: '₹13,189',
      depreciationType: 'Straight Line',
      invoiceNumber: 'INV-2022-001',
      purchaseDate: 'Feb 14, 2022',
      salvageValue: '₹8,000',
    },
    alias: 'ASUS-LAP-01',
    ipVersion: 'IPv4',
    memorySize: '16GB',
    systemSKU: 'SKU-001',
    diskSize: '512GB',
    mac: '00:09:0F:FE:00:01',
    categoryId: 'cat-1',
    subCategoryId: 'subcat-1',
  },
  {
    id: '2',
    name: 'Dell Laptop 02',
    assetId: 'ASSET0030',
    operationalStatus: 'Connected',
    status: 'In Use',
    operationalStatusSince: 'May 05, 2025 3:45pm',
    operationalStatusDuration: '1 day, 12 hrs, 30 min, 15 sec',
    assetType: 'Laptop',
    assetTag: 'LAP-002',
    serialNumber: 'DELL123456789',
    branchLocation: 'Mumbai Maharashtra India 400001',
    manufacturer: 'Dell',
    model: 'XPS 15',
    purchaseDate: 'Mar 10, 2023',
    warrantyExpiry: 'Mar 10, 2026',
    owner: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+91-9876543210',
    },
    osType: 'Windows 11 Pro',
    osVersion: '10.0.22621.2506',
    osBuild: 'DELL - 2100',
    architecture: '64-bit',
    ipAddress: '192.168.29.25',
    macAddress: '00:09:0F:FE:00:02',
    hostname: 'DELL-XPS-15',
    processor: {
      name: 'Intel Core i7-12700H',
      cores: 8,
      speed: '2.3GHz',
    },
    ram: {
      size: '32GB',
      type: 'DDR5',
    },
    storage: {
      type: 'NVMe SSD',
      size: '1TB',
    },
    performance: {
      systemUptime: '1 day, 12 hrs, 30 min, 15 sec',
      memoryUtilization: 45.5,
      cpuUtilization: 25,
      diskUtilization: 72.3,
    },
    location: {
      base: {
        address: 'Mumbai Maharashtra India 400001',
        latitude: 19.076,
        longitude: 72.8777,
      },
      installed: {
        address: 'Mumbai Maharashtra India 400001',
        latitude: 19.076,
        longitude: 72.8777,
      },
    },
    procurement: {
      amcCost: '₹7,000',
      amcExpiryDate: 'Mar 10, 2026',
      amcVendor: 'Dell India',
      endOfLife: 'Mar 10, 2029',
      expiryDate: 'Mar 10, 2026',
      warrantyExpiryDate: 'Mar 10, 2026',
      warrantyYearAndMonth: '3 years 0 months',
    },
    cost: {
      age: '2 years 2 months',
      cost: '₹85,000',
      currency: 'INR',
      currentCost: '₹56,667',
      depreciationType: 'Straight Line',
      invoiceNumber: 'INV-2023-045',
      purchaseDate: 'Mar 10, 2023',
      salvageValue: '₹17,000',
    },
    alias: 'DELL-XPS-02',
    ipVersion: 'IPv4',
    memorySize: '32GB',
    systemSKU: 'SKU-002',
    diskSize: '1TB',
    mac: '00:09:0F:FE:00:02',
    categoryId: 'cat-1',
    subCategoryId: 'subcat-2',
  },
];

// Mock Asset Life Cycle Data
const mockAssetLifeCycle: AssetLifeCycle = {
  purchaseDate: 'Feb 14, 2022',
  purchaseValue: 40000,
  currentDate: 'Jun 20, 2025',
  currentValue: 13189,
  amcExpiryDate: 'Sep 23, 2027',
  warrantyExpiryDate: 'Feb 17, 2027',
  endOfLife: 'Jan 31, 2030',
  endOfLifeValue: 8000,
  depreciationTimeline: [
    { date: 'Feb 14, 2022', value: 40000, label: 'Purchased on' },
    { date: 'Jun 20, 2025', value: 13189, label: 'Today' },
    { date: 'Feb 17, 2027', value: 11000, label: 'Warranty Expiry Date' },
    { date: 'Sep 23, 2027', value: 10000, label: 'AMC Expiry Date' },
    { date: 'Jan 31, 2030', value: 8000, label: 'End Of Life' },
  ],
};

// Mock Hardware Data
const mockHardware: Hardware = {
  bios: {
    name: 'Lenovo',
    installDate: '2024-01-23 00:00:00',
    biosVersion: 'LENOVO - 1160',
    manufacturer: 'LENOVO',
    description: 'R2CET34W(1.16 )',
    secureBootState: 'Not Enabled/Supported',
    serialNumber: 'PF4XVPD7',
  },
  processor: {
    name: 'AMD Ryzen 5 7530U with Radeon Graphics',
    logicalProcessors: 12,
    manufacturer: 'AuthenticAMD',
    numberOfCores: 6,
    processorSpeed: '2.0GHz',
    secureBootState: 'B1965C4C-21B3-11B2-AB5C-AB1173A64E1',
  },
  baseBoard: {
    name: 'Lenovo',
    partNumber: 'NILL',
    productId: '21JRD005J1',
    serialNumber: 'L1HF44R00BE',
    tag: 'Base Board',
    version: 'ThinkPad',
  },
  storage: [
    {
      name: '5 Partition - 3,756 GB',
      drive: 'C: Drive',
      capacity: '256 GB',
      used: '50.24 MB',
      format: 'NTFC',
      type: 'SSD',
      serialNumber: '08F4870A',
    },
    {
      name: 'D: Drive',
      drive: 'D: Drive',
      capacity: '500 GB',
      used: '250 GB',
      format: 'NTFC',
      type: 'SSD',
      serialNumber: '08F4870B',
    },
    {
      name: 'J: New Volume',
      drive: 'J: New Volume',
      capacity: '1.0 TB',
      used: '1.0 TB',
      format: 'NTFC',
      type: 'SSD',
      serialNumber: '08F4870C',
    },
    {
      name: 'H: New Volume',
      drive: 'H: New Volume',
      capacity: '1.0 TB',
      used: '1.0 TB',
      format: 'NTFC',
      type: 'SSD',
      serialNumber: '08F4870A',
    },
    {
      name: 'K: New Volume',
      drive: 'K: New Volume',
      capacity: '1.0 TB',
      used: '1.0 TB',
      format: 'NTFC',
      type: 'SSD',
      serialNumber: '08F4870A',
    },
  ],
  memory: [
    {
      slot: 'Slot 1',
      name: 'Samsung - 2667',
      capacity: '8.00 GB',
      bankLabel: 'PO CHANNEL A',
      locator: 'DIMM 0',
      memoryType: 'Unknown',
      serialNumber: '00000000',
      partNumber: 'M463A1G43DB0-CWE',
    },
    {
      slot: 'Slot 1',
      name: 'Samsung - 2667',
      capacity: '8.00 GB',
      bankLabel: 'PO CHANNEL A',
      locator: 'DIMM 0',
      memoryType: 'Unknown',
      serialNumber: '00000000',
      partNumber: 'M463A1G43DB0-DHA',
    },
  ],
  networkAdapters: [
    {
      id: '1',
      name: '[00000004] Realtek PCIe GbE Family Controller',
      ipAddressV4: '',
      ipAddressV6: '',
      macAddress: '00:09:0F:FE:00:01',
      dhcpServer: '',
    },
    {
      id: '2',
      name: '[00000001] Fortinet Virtual Ethernet Adapter (NDIS 6.30)',
      ipAddressV4: '',
      ipAddressV6: '',
      macAddress: '00:09:0F:FE:00:01',
      dhcpServer: '',
    },
    {
      id: '3',
      name: '[00000004] Realtek PCIe GbE Family Controller',
      ipAddressV4: '',
      ipAddressV6: '',
      macAddress: '00:09:0F:FE:00:01',
      dhcpServer: '',
    },
  ],
  battery: {
    id: 'BAT-001',
    name: 'ASUS Internal Battery',
    health: '95%',
    cycleCount: 127,
    chargeLevel: 78,
    chargingStatus: 'Charging',
    batteryCapacity: '52.5Wh',
    estimatedRuntime: '5 hours 23 minutes',
    temperature: '32°C',
  },
};

// Mock Software Data
const mockSoftware: Software = {
  os: {
    name: 'Microsoft Windows 11 Pro',
    version: '10.0.22621.2506',
  },
  licenseDetails: {
    alias: 'ASUS-LAP-01',
    buildNumber: '22621',
    deviceType: 'Laptop',
    lastBootUpTime: '2025-05-05 03:45:00',
    licenseStatus: 'Licensed',
    osInstalledBy: 'Admin',
    partialProductKey: 'XXXXX',
    productKey: 'XXXXX-XXXXX-XXXXX-XXXXX',
    systemDrive: 'C:',
    version: '10.0.22621.2506',
    virtualMemory: '32 Gbyte',
    bootDevice: 'C:',
    description: 'Windows 11 Pro',
    hostname: 'XPS039542192893',
    licenseDescription: 'OEM License',
    manufacturer: 'Microsoft',
    osInstallDate: '2024-01-15',
    productId: '00326-10000-00000-AA123',
    systemDiscovery: 'Automated',
    windowsDirectory: 'C:\\Windows',
  },
  applications: Array.from({ length: 55 }, (_, i) => ({
    id: `app-${i + 1}`,
    name: 'Adobe Acrobat 64-Bit',
    vendor: 'Adobe',
    version: 'V203.00.204',
    patchStatus: i % 3 === 0 ? 'Not Available' : 'Available',
    lastPatched: 'June 06 2025',
    appInstalledOn: 'June 06 2025',
    icon: '🔴',
  })),
  services: Array.from({ length: 302 }, (_, i) => ({
    id: `service-${i + 1}`,
    name: `<Service Name>`,
    state: i % 5 === 0 ? 'Stopped' : 'Running',
    type: '<Service Type>',
    status: 'OK',
  })),
  systemEnvironment: {
    alias: 'ASUS-LAP-01',
    buildNumber: '22621',
    deviceType: 'Laptop',
    lastBootUpTime: '2025-05-05 03:45:00',
    licenseStatus: 'Licensed',
    osInstalledBy: 'Admin',
    partialProductKey: 'XXXXX',
    productKey: 'XXXXX-XXXXX-XXXXX-XXXXX',
    systemDrive: 'C:',
    version: '10.0.22621.2506',
    virtualMemory: '32 Gbyte',
    bootDevice: 'C:',
    description: 'Windows 11 Pro',
    hostname: 'XPS039542192893',
    licenseDescription: 'OEM License',
    manufacturer: 'Microsoft',
    osInstallDate: '2024-01-15',
    productId: '00326-10000-00000-AA123',
    systemDiscovery: 'Automated',
    windowsDirectory: 'C:\\Windows',
  },
};

// Mock Audit Log Data
const mockAuditLog: AuditLog[] = [
  {
    id: '1',
    timestamp: 'May 05, 2025 3:45pm',
    action: 'Asset Created',
    user: 'Admin User',
    details: 'Asset ASSET0029 created in the system',
  },
  {
    id: '2',
    timestamp: 'May 06, 2025 10:30am',
    action: 'Asset Updated',
    user: 'John Doe',
    details: 'Updated asset details - Changed owner information',
  },
  {
    id: '3',
    timestamp: 'May 07, 2025 2:15pm',
    action: 'Status Changed',
    user: 'System',
    details: 'Operational status changed to Connected',
  },
];

// Mock Software Inventory Data
const mockSoftwareInventory: SoftwareInventory[] = Array.from({ length: 85 }, (_, i) => ({
  id: `sw-${i + 1}`,
  softwareName: i === 0 ? 'Adobe Acrobat Reader' : `Software ${i + 1}`,
  version: '1.1.01',
  softwareType: 'Arch_arm_i64',
  manufacturer: i === 0 ? 'Apple' : `Manufacturer ${i + 1}`,
  totalInstances: Math.floor(Math.random() * 50) + 1,
}));

// Mock Software License Data
const mockSoftwareLicenses: SoftwareLicense[] = Array.from({ length: 85 }, (_, i) => ({
  id: `lic-${i + 1}`,
  licenseName: `License ${i + 1}`,
  softwareName: `Software ${i + 1}`,
  status: 'Allocated',
  licenseCount: 1,
  vendorName: `Vendor ${i + 1}`,
}));

// Mock OS License Data
const mockOSLicenses: OSLicense[] = Array.from({ length: 20 }, (_, i) => ({
  id: `os-lic-${i + 1}`,
  licenseName: `OS License ${i + 1}`,
  osType: i % 4 === 0 ? 'Windows 11 Pro' : i % 4 === 1 ? 'Windows 10' : i % 4 === 2 ? 'MacOS' : 'Linux',
  status: i % 3 === 0 ? 'Expired' : i % 2 === 0 ? 'Available' : 'Allocated',
  licenseCount: Math.floor(Math.random() * 50) + 1,
  vendorName: i % 2 === 0 ? 'Microsoft' : i % 3 === 0 ? 'Apple' : 'Linux Foundation',
  licenseKey: `KEY-${String(i + 1).padStart(4, '0')}-XXXX-XXXX`,
  purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  expiryDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  cost: `₹${Math.floor(Math.random() * 500000) + 50000}`,
}));

// MSW Handlers
export const assetHandlers = [
  // Get all assets
  http.get('/api/assets', () => {
    return HttpResponse.json(mockAssets);
  }),

  // Get single asset
  http.get('/api/assets/:id', ({ params }) => {
    const asset = mockAssets.find((a) => a.id === params.id);
    if (!asset) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    return HttpResponse.json(asset);
  }),

  // Create asset
  http.post('/api/assets', async ({ request }) => {
    const data = await request.json();
    const newAsset: Asset = {
      ...(data as any),
      id: String(mockAssets.length + 1),
      assetId: `ASSET${String(mockAssets.length + 1).padStart(4, '0')}`,
      operationalStatus: 'Disconnected',
      operationalStatusSince: new Date().toLocaleString(),
      operationalStatusDuration: '0 day, 0 hrs, 0 min, 0 sec',
    };
    mockAssets.push(newAsset);
    return HttpResponse.json(newAsset, { status: 201 });
  }),

  // Update asset
  http.put('/api/assets/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockAssets.findIndex((a) => a.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    mockAssets[index] = { ...mockAssets[index], ...(data as any) };
    return HttpResponse.json(mockAssets[index]);
  }),

  // Delete asset
  http.delete('/api/assets/:id', ({ params }) => {
    const index = mockAssets.findIndex((a) => a.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    mockAssets.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Bulk create assets
  http.post('/api/assets/bulk', async ({ request }) => {
    const data = (await request.json()) as any[];
    const newAssets = data.map((item, i) => ({
      ...item,
      id: String(mockAssets.length + i + 1),
      assetId: `ASSET${String(mockAssets.length + i + 1).padStart(4, '0')}`,
    }));
    mockAssets.push(...newAssets);
    return HttpResponse.json(newAssets, { status: 201 });
  }),

  // Get asset lifecycle
  http.get('/api/assets/:id/lifecycle', () => {
    return HttpResponse.json(mockAssetLifeCycle);
  }),

  // Get asset hardware
  http.get('/api/assets/:id/hardware', () => {
    return HttpResponse.json(mockHardware);
  }),

  // Get asset software
  http.get('/api/assets/:id/software', () => {
    return HttpResponse.json(mockSoftware);
  }),

  // Get asset audit log
  http.get('/api/assets/:id/audit-log', () => {
    return HttpResponse.json(mockAuditLog);
  }),

  // Upload asset attachment
  http.post('/api/assets/:id/attachments', () => {
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  // Get software inventory
  http.get('/api/software-inventory', () => {
    return HttpResponse.json(mockSoftwareInventory);
  }),

  // Get software inventory item
  http.get('/api/software-inventory/:id', ({ params }) => {
    const item = mockSoftwareInventory.find((s) => s.id === params.id);
    if (!item) {
      return HttpResponse.json({ error: 'Software not found' }, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  // Import software inventory
  http.post('/api/software-inventory/import', () => {
    return HttpResponse.json({ success: true, imported: 100 }, { status: 201 });
  }),

  // Get software licenses
  http.get('/api/software-licenses', () => {
    return HttpResponse.json(mockSoftwareLicenses);
  }),

  // Get software license
  http.get('/api/software-licenses/:id', ({ params }) => {
    const license = mockSoftwareLicenses.find((l) => l.id === params.id);
    if (!license) {
      return HttpResponse.json({ error: 'License not found' }, { status: 404 });
    }
    return HttpResponse.json(license);
  }),

  // Create software license
  http.post('/api/software-licenses', async ({ request }) => {
    const data = await request.json();
    const newLicense: SoftwareLicense = {
      ...(data as any),
      id: `lic-${mockSoftwareLicenses.length + 1}`,
    };
    mockSoftwareLicenses.push(newLicense);
    return HttpResponse.json(newLicense, { status: 201 });
  }),

  // Update software license
  http.put('/api/software-licenses/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockSoftwareLicenses.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'License not found' }, { status: 404 });
    }
    mockSoftwareLicenses[index] = { ...mockSoftwareLicenses[index], ...(data as any) };
    return HttpResponse.json(mockSoftwareLicenses[index]);
  }),

  // Delete software license
  http.delete('/api/software-licenses/:id', ({ params }) => {
    const index = mockSoftwareLicenses.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'License not found' }, { status: 404 });
    }
    mockSoftwareLicenses.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Import software licenses
  http.post('/api/software-licenses/import', () => {
    return HttpResponse.json({ success: true, imported: 50 }, { status: 201 });
  }),

  // Get OS licenses
  http.get('/api/os-licenses', () => {
    return HttpResponse.json(mockOSLicenses);
  }),

  // Get OS license
  http.get('/api/os-licenses/:id', ({ params }) => {
    const license = mockOSLicenses.find((l) => l.id === params.id);
    if (!license) {
      return HttpResponse.json({ error: 'OS License not found' }, { status: 404 });
    }
    return HttpResponse.json(license);
  }),

  // Create OS license
  http.post('/api/os-licenses', async ({ request }) => {
    const data = await request.json();
    const newLicense: OSLicense = {
      ...(data as any),
      id: `os-lic-${mockOSLicenses.length + 1}`,
    };
    mockOSLicenses.push(newLicense);
    return HttpResponse.json(newLicense, { status: 201 });
  }),

  // Update OS license
  http.put('/api/os-licenses/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockOSLicenses.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'OS License not found' }, { status: 404 });
    }
    mockOSLicenses[index] = { ...mockOSLicenses[index], ...(data as any) };
    return HttpResponse.json(mockOSLicenses[index]);
  }),

  // Delete OS license
  http.delete('/api/os-licenses/:id', ({ params }) => {
    const index = mockOSLicenses.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'OS License not found' }, { status: 404 });
    }
    mockOSLicenses.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Import OS licenses
  http.post('/api/os-licenses/import', () => {
    return HttpResponse.json({ success: true, imported: 20 }, { status: 201 });
  }),
];
