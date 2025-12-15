export type Agent = {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastConnectedTime: string;
  os: string;
  version: string;
};

export type AgentDownload = {
  os: 'Windows 11' | 'MacOS' | 'Linux';
  version: string;
  releaseDate: string;
  downloadUrl: string;
};
