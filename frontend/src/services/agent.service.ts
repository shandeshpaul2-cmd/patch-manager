import axios from 'axios';

type Agent = {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastConnectedTime: string;
  os: string;
  version: string;
};

type AgentDownload = {
  os: 'Windows 11' | 'MacOS' | 'Linux';
  version: string;
  releaseDate: string;
  downloadUrl: string;
};

const API_BASE_URL = '/api';

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await axios.get(`${API_BASE_URL}/agents`);
    return response.data;
  },

  async getAgentDownloads(): Promise<AgentDownload[]> {
    const response = await axios.get(`${API_BASE_URL}/agents/downloads`);
    return response.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/agents/${id}`);
  },
};
