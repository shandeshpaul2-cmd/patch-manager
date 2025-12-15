# Agents API Implementation Guide

## API Contract
**Spec**: `backend-debt/agents-api.yaml` - OpenAPI 3.0 specification (source of truth)

## Endpoint Overview
```
GET    /api/agents
GET    /api/agents/downloads
DELETE /api/agents/{id}
```

## Reference Implementation
**Frontend**: `frontend/src/pages/discovery/Agents.tsx`
**API Service**: `frontend/src/services/agent.service.ts`
**Mock Handlers**: `frontend/src/mocks/handlers/agent.handlers.ts` - Contains expected behavior

## TDD Test Scenarios

### GET /api/agents

**Success Case** (200)
```json
Request Headers: { "Authorization": "Bearer <accessToken>" }
Response: [
  {
    "id": "1",
    "name": "MacOS 01",
    "status": "Connected",
    "lastConnectedTime": "45mins ago",
    "os": "MacOS",
    "version": "OS0.1"
  },
  {
    "id": "2",
    "name": "Windows 01",
    "status": "Connected",
    "lastConnectedTime": "45mins ago",
    "os": "Win",
    "version": "WIN0.1"
  }
]
```

**Tests**
- ✅ Valid token → return all agents with current status
- ❌ Missing token → 401 `{ "error": "Authentication required" }`
- ❌ Invalid token → 401 `{ "error": "Invalid token" }`
- ❌ Empty list → 200 `[]` (not an error)

### GET /api/agents/downloads

**Success Case** (200)
```json
Request Headers: { "Authorization": "Bearer <accessToken>" }
Response: [
  {
    "os": "Windows 11",
    "version": "#####",
    "releaseDate": "25/12/24",
    "downloadUrl": "/downloads/windows-agent.exe"
  },
  {
    "os": "MacOS",
    "version": "#####",
    "releaseDate": "25/12/24",
    "downloadUrl": "/downloads/macos-agent.dmg"
  },
  {
    "os": "Linux",
    "version": "#####",
    "releaseDate": "25/12/24",
    "downloadUrl": "/downloads/linux-agent.deb"
  }
]
```

**Tests**
- ✅ Valid token → return available agent downloads for all platforms
- ❌ Missing token → 401 `{ "error": "Authentication required" }`
- ❌ Invalid token → 401 `{ "error": "Invalid token" }`

### DELETE /api/agents/{id}

**Success Case** (200)
```json
Request Headers: { "Authorization": "Bearer <accessToken>" }
Request: DELETE /api/agents/1
Response: {
  "success": true,
  "message": "Agent deleted successfully"
}
```

**Tests**
- ✅ Valid ID → delete agent and return success
- ❌ Missing token → 401 `{ "error": "Authentication required" }`
- ❌ Invalid token → 401 `{ "error": "Invalid token" }`
- ❌ Agent not found → 404 `{ "error": "Agent not found" }`
- ❌ Invalid ID format → 400 `{ "error": "Invalid agent ID" }`

## Frontend Expectations

**API Base URL**: `/api` (see `frontend/src/services/agent.service.ts`)

**Auto-behaviors**:
- Frontend sends `Authorization: Bearer <token>` on every API call
- Frontend intercepts 401 responses → redirects to /login
- On DELETE success → removes agent from UI list
- On GET /agents → displays in table with status badges

## Database Schema Hints

```sql
agents:
  - id (uuid, pk)
  - name (string)
  - status (enum: 'Connected', 'Disconnected')
  - last_connected_at (timestamp)
  - os (string)
  - version (string)
  - user_id (fk, references users.id)
  - created_at (timestamp)
  - updated_at (timestamp)
  - ip_address (string, optional)
  - machine_id (string, unique, indexed)

agent_downloads:
  - id (uuid, pk)
  - os (enum: 'Windows 11', 'MacOS', 'Linux')
  - version (string)
  - release_date (date)
  - download_url (string)
  - file_size (bigint, optional)
  - checksum (string, optional)
  - created_at (timestamp)
```

## Implementation Order (TDD)

1. **Write tests first** for each endpoint (success + all error cases)
2. Implement agent model with status enum
3. Implement GET /api/agents endpoint (read-only)
4. Implement GET /api/agents/downloads endpoint (read-only)
5. Implement DELETE /api/agents/{id} endpoint
6. Add agent authentication/registration logic (for agents to connect)
7. Add agent heartbeat mechanism (to update last_connected_at)
8. Add integration tests with real DB
9. Add E2E tests matching frontend flows

## Mock Data Reference
See `frontend/src/mocks/handlers/agent.handlers.ts:17-35` for test agents:
- Agent 1: MacOS 01, Connected, version OS0.1
- Agent 2: Windows 01, Connected, version WIN0.1

## Notes
- Frontend base URL: `http://localhost:5174/api` (see MSW handlers)
- Backend should serve: `http://localhost:3000/api`
- CORS: Allow `http://localhost:5173`, `http://localhost:5174`
- All timestamps: ISO 8601 format or human-readable (e.g., "45mins ago")
- All IDs: UUIDs recommended
- Error responses: Always JSON with `error` field
- Status updates: Consider WebSocket/SSE for real-time agent status
- lastConnectedTime: Can be computed or stored as human-readable string
