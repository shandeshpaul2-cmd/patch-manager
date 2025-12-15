export type OperationalStatus = 'Connected' | 'Disconnected';
export type AssetStatus = 'In Use' | 'Available' | 'Under Maintenance' | 'Retired';
export type AssetType = 'Computer' | 'Server' | 'Mobile' | 'Printer' | 'Laptop' | 'Tablet';
export type OSType = 'Windows 11 Pro' | 'Windows 10' | 'MacOS' | 'Linux' | 'Android' | 'iOS';

// Category Types
export type Category = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  assetCount: number;
  owner?: string;
  manager?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  budget?: string;
  tags?: string[];
  status?: 'Active' | 'Inactive';
  maintenanceSchedule?: string;
  slaTarget?: string;
  complianceRequired?: boolean;
  complianceTags?: string[];
};

export type SubCategory = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  assetCount: number;
  criticality?: 'Critical' | 'High' | 'Medium' | 'Low';
  businessUnit?: string;
  department?: string;
  owner?: string;
  manager?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  status?: 'Active' | 'Inactive';
  uptime?: string;
  maintenanceWindow?: string;
  tags?: string[];
  customMetadata?: Record<string, any>;
};

// Tag Types
export type Tag = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  owner?: string;
  manager?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  status?: 'Active' | 'Inactive';
  assetCount: number;
  usageCount?: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt?: string;
  budget?: string;
  complianceRequired?: boolean;
  complianceTags?: string[];
  metadata?: Record<string, any>;
};

export type AssetTag = {
  assetId: string;
  tagId: string;
  assignedAt: string;
  assignedBy?: string;
};

export type Owner = {
  name: string;
  email: string;
  phone: string;
};

export type Location = {
  address: string;
  latitude: number;
  longitude: number;
};

export type Performance = {
  systemUptime: string;
  memoryUtilization: number;
  cpuUtilization: number;
  diskUtilization: number;
};

export type Processor = {
  name: string;
  cores: number;
  speed: string;
};

export type RAM = {
  size: string;
  type: string;
};

export type Storage = {
  type: string;
  size: string;
};

export type Procurement = {
  amcCost: string;
  amcExpiryDate: string;
  amcVendor: string;
  endOfLife: string;
  expiryDate: string;
  warrantyExpiryDate: string;
  warrantyYearAndMonth: string;
};

export type Cost = {
  age: string;
  cost: string;
  currency: string;
  currentCost: string;
  depreciationType: string;
  invoiceNumber: string;
  purchaseDate: string;
  salvageValue: string;
};

export type Asset = {
  id: string;
  name: string;
  assetId: string;
  operationalStatus: OperationalStatus;
  status: AssetStatus;
  operationalStatusSince: string;
  operationalStatusDuration: string;
  assetType: AssetType;
  assetTag: string;
  serialNumber: string;
  branchLocation: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  owner: Owner;
  osType: OSType;
  osVersion: string;
  osBuild: string;
  architecture: string;
  ipAddress: string;
  macAddress: string;
  hostname: string;
  processor: Processor;
  ram: RAM;
  storage: Storage;
  performance: Performance;
  location: {
    base: Location;
    installed: Location;
  };
  procurement: Procurement;
  cost: Cost;
  categoryId?: string;
  subCategoryId?: string;
  tagIds?: string[];
  alias?: string;
  ipVersion?: string;
  memorySize?: string;
  systemSKU?: string;
  diskSize?: string;
  mac?: string;
};

// Asset Life Cycle
export type DepreciationPoint = {
  date: string;
  value: number;
  label: string;
};

export type AssetLifeCycle = {
  purchaseDate: string;
  purchaseValue: number;
  currentDate: string;
  currentValue: number;
  amcExpiryDate: string;
  warrantyExpiryDate: string;
  endOfLife: string;
  endOfLifeValue: number;
  depreciationTimeline: DepreciationPoint[];
};

// Hardware
export type BIOS = {
  name: string;
  installDate: string;
  biosVersion: string;
  manufacturer: string;
  description: string;
  secureBootState: string;
  serialNumber: string;
};

export type ProcessorDetails = {
  name: string;
  logicalProcessors: number;
  manufacturer: string;
  numberOfCores: number;
  processorSpeed: string;
  secureBootState: string;
};

export type BaseBoard = {
  name: string;
  partNumber: string;
  productId: string;
  serialNumber: string;
  tag: string;
  version: string;
};

export type Drive = {
  name: string;
  drive: string;
  capacity: string;
  used: string;
  format: string;
  type: string;
  serialNumber: string;
};

export type MemorySlot = {
  slot: string;
  name: string;
  capacity: string;
  bankLabel: string;
  locator: string;
  memoryType: string;
  serialNumber: string;
  partNumber: string;
};

export type NetworkAdapter = {
  id: string;
  name: string;
  ipAddressV4?: string;
  ipAddressV6?: string;
  macAddress: string;
  dhcpServer?: string;
};

export type Battery = {
  id: string;
  name: string;
  health: string;
  cycleCount: number;
  chargeLevel: number;
  chargingStatus: 'Charging' | 'Discharging' | 'Not charging' | 'Unknown';
  batteryCapacity?: string;
  estimatedRuntime?: string;
  temperature?: string;
};

export type Hardware = {
  bios: BIOS;
  processor: ProcessorDetails;
  baseBoard: BaseBoard;
  storage: Drive[];
  memory: MemorySlot[];
  networkAdapters: NetworkAdapter[];
  battery?: Battery;
};

// Software
export type Application = {
  id: string;
  name: string;
  vendor: string;
  version: string;
  patchStatus: 'Available' | 'Not Available';
  lastPatched: string;
  appInstalledOn: string;
  icon?: string;
};

export type Service = {
  id: string;
  name: string;
  state: 'Running' | 'Stopped';
  type: string;
  status: 'OK' | 'Error' | 'Warning';
};

export type SystemEnvironment = {
  alias?: string;
  buildNumber: string;
  deviceType: string;
  lastBootUpTime: string;
  licenseStatus: string;
  osInstalledBy: string;
  partialProductKey: string;
  productKey: string;
  systemDrive: string;
  version: string;
  virtualMemory: string;
  hostname?: string;
  licenseDescription?: string;
  manufacturer?: string;
  osInstallDate?: string;
  productId?: string;
  systemDiscovery?: string;
  windowsDirectory?: string;
  bootDevice?: string;
  description?: string;
};

export type Software = {
  os: {
    name: string;
    version: string;
  };
  licenseDetails: {
    alias?: string;
    buildNumber: string;
    deviceType: string;
    lastBootUpTime: string;
    licenseStatus: string;
    osInstalledBy: string;
    partialProductKey: string;
    productKey: string;
    systemDrive: string;
    version: string;
    virtualMemory: string;
    bootDevice?: string;
    description?: string;
    hostname?: string;
    licenseDescription?: string;
    manufacturer?: string;
    osInstallDate?: string;
    productId?: string;
    systemDiscovery?: string;
    windowsDirectory?: string;
  };
  applications: Application[];
  services: Service[];
  systemEnvironment: SystemEnvironment;
};

// Audit Log
export type AuditLog = {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
};

// Software Inventory
export type SoftwareInventory = {
  id: string;
  softwareName: string;
  version: string;
  softwareType: string;
  manufacturer: string;
  totalInstances: number;
};

// Software License
export type SoftwareLicense = {
  id: string;
  licenseName: string;
  softwareName: string;
  status: 'Allocated' | 'Available' | 'Expired';
  licenseCount: number;
  vendorName: string;
  licenseKey?: string;
  purchaseDate?: string;
  expiryDate?: string;
  publisher?: string;
  cost?: string;
  notes?: string;
};

// OS License
export type OSLicense = {
  id: string;
  licenseName: string;
  osType: string;
  status: 'Allocated' | 'Available' | 'Expired';
  licenseCount: number;
  vendorName: string;
  licenseKey?: string;
  purchaseDate?: string;
  expiryDate?: string;
  publisher?: string;
  cost?: string;
  notes?: string;
};

// Add Asset Form Data
export type AddAssetFormData = {
  // Step 1 - Define Asset
  assetName: string;
  category: string;
  os: string;
  assetTags: string[];
  make: string;
  model: string;
  serialNumber: string;
  uuid: string;
  ownerTechnician: string;
  ownerTags: string[];
  endUserRequesters: string[];
  customerName: string;
  assignDevice: boolean;
  department?: string;
  managedBy?: string;
  usedBy?: string;
  baseLocation: string;
  installedLocation: string;
  installedDate: string;

  // Step 2 - OS Properties
  osType: string;
  osName: string;
  osVersion: string;
  osInstallDate: string;
  osInstallBy: string;
  buildNumber: string;
  productId: string;
  productKey: string;
  virtualNumber: string;

  // Step 3 - Additional Properties
  // Common Properties
  status: string;
  criticality: string;
  serviceStatus: string;
  operationalStatus: string;
  businessFunction: string;
  description: string;
  usageType: string;
  changeStateReason: string;
  retireReason: string;
  hostName: string;
  alias: string;

  // Cost Properties
  invoiceNo: string;
  partNo: string;
  cost: string;
  purchaseDate: string;
  depreciationType: string;
  salvageValue: string;
  salvageValuePercentage: string;

  // Procurement Properties
  warrantyYears: number;
  warrantyMonths: number;
  warrantyExpiryDate: string;
  expiryDate: string;
  purchaseVendor: string;
  amcVendor: string;
  amcCost: string;
  amcExpiryDate: string;
  leaseEndDate: string;
  disposalDate: string;
  reason: string;
  endOfLife: string;
  endOfSale: string;
  endOfSupport: string;
  endOfExtendedSupport: string;
  lastRenewalCost: string;
  nextSupportRenewalCost: string;
};
