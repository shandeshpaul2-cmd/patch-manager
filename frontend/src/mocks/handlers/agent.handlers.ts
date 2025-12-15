import { http, HttpResponse } from 'msw';

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

let mockAgents: Agent[] = [
  {
    id: '1',
    name: 'MacOS 01',
    status: 'Connected',
    lastConnectedTime: '45mins ago',
    os: 'MacOS',
    version: 'OS0.1',
  },
  {
    id: '2',
    name: 'Windows 01',
    status: 'Connected',
    lastConnectedTime: '45mins ago',
    os: 'Win',
    version: 'WIN0.1',
  },
];

const mockAgentDownloads: AgentDownload[] = [
  {
    os: 'Windows 11',
    version: '#####',
    releaseDate: '25/12/24',
    downloadUrl: '/downloads/windows-agent.exe',
  },
  {
    os: 'MacOS',
    version: '#####',
    releaseDate: '25/12/24',
    downloadUrl: '/downloads/macos-agent.dmg',
  },
  {
    os: 'Linux',
    version: '#####',
    releaseDate: '25/12/24',
    downloadUrl: '/downloads/linux-agent.deb',
  },
];

export const agentHandlers = [
  // Get all agents
  http.get('/api/agents', () => {
    return HttpResponse.json(mockAgents);
  }),

  // Get agent downloads
  http.get('/api/agents/downloads', () => {
    return HttpResponse.json(mockAgentDownloads);
  }),

  // Delete agent
  http.delete('/api/agents/:id', ({ params }) => {
    const { id } = params;
    mockAgents = mockAgents.filter((agent) => agent.id !== id);
    return HttpResponse.json({ success: true });
  }),
];
