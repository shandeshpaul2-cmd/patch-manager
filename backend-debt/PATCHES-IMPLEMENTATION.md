# Patches Module - Backend Implementation Guide

## Overview
This guide provides Test-Driven Development (TDD) scenarios and implementation details for the Patches module backend APIs. The frontend implementation is complete with MSW mocks. Follow this guide to implement the actual backend endpoints.

## Technology Stack
- **Framework**: Express.js / NestJS (choose based on project standard)
- **Database**: PostgreSQL with TypeORM / Prisma
- **Authentication**: JWT tokens (existing auth system)
- **Validation**: class-validator or Joi
- **Testing**: Jest + Supertest

## Database Schema

### Patches Table
```sql
CREATE TABLE patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software VARCHAR(500) NOT NULL,
  patch_id VARCHAR(100) UNIQUE NOT NULL,
  endpoints INTEGER DEFAULT 0,
  os VARCHAR(50) NOT NULL CHECK (os IN ('Windows', 'MacOS', 'Ubuntu', 'Linux')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'High', 'Medium', 'Low', 'UNSPECIFIED')),
  operational_status_since TIMESTAMP,
  platform VARCHAR(100),
  description TEXT,
  category VARCHAR(100),
  bulletin_id VARCHAR(100),
  kb_number VARCHAR(100),
  release_date DATE,
  reboot_required BOOLEAN DEFAULT false,
  support_uninstallation BOOLEAN DEFAULT false,
  architecture VARCHAR(50),
  reference_url TEXT,
  languages_supported TEXT[], -- PostgreSQL array
  tags TEXT[],
  approval_status VARCHAR(50),
  test_status VARCHAR(50),
  cve_numbers TEXT[],
  status VARCHAR(50),
  download_status VARCHAR(50),
  size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(100),
  released_on DATE,
  downloaded_on DATE,
  superseded_by TEXT[],
  supersedes TEXT[],
  INDEX idx_patches_severity (severity),
  INDEX idx_patches_os (os),
  INDEX idx_patches_category (category)
);
```

### Deployments Table
```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  deployment_id VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('INSTALL', 'ROLLBACK')),
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('INSTALLED', 'COMPLETED', 'IN_PROGRESS', 'FAILED')),
  pending INTEGER DEFAULT 0,
  succeeded INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  description TEXT,
  schedule TIMESTAMP,
  target_groups TEXT[],
  created_by VARCHAR(100),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_deployments_stage (stage),
  INDEX idx_deployments_type (type)
);
```

### Deployment Patches (Junction Table)
```sql
CREATE TABLE deployment_patches (
  deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
  patch_id UUID REFERENCES patches(id) ON DELETE CASCADE,
  PRIMARY KEY (deployment_id, patch_id)
);
```

### Patch Tests Table
```sql
CREATE TABLE patch_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  application_type VARCHAR(20) CHECK (application_type IN ('ALL', 'INCLUDE', 'EXCLUDE')),
  applications TEXT[],
  scope VARCHAR(50) CHECK (scope IN ('ALL_COMPUTERS', 'SCOPE', 'SPECIFIC_GROUPS')),
  computers TEXT[],
  groups TEXT[],
  status VARCHAR(50),
  created_by VARCHAR(100),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Zero Touch Configurations Table
```sql
CREATE TABLE zero_touch_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  application_type VARCHAR(20) CHECK (application_type IN ('ALL', 'INCLUDE', 'EXCLUDE')),
  applications TEXT[],
  scope VARCHAR(50) CHECK (scope IN ('ALL_COMPUTERS', 'SCOPE', 'SPECIFIC_GROUPS')),
  computers TEXT[],
  groups TEXT[],
  auto_deployment_rules JSONB NOT NULL,
  status VARCHAR(50),
  created_by VARCHAR(100),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Supporting Tables
```sql
CREATE TABLE affected_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patches(id) ON DELETE CASCADE,
  host_name VARCHAR(200),
  location VARCHAR(200),
  vendor VARCHAR(100),
  hardware_model VARCHAR(100)
);

CREATE TABLE file_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patches(id) ON DELETE CASCADE,
  file_name VARCHAR(200),
  version VARCHAR(50),
  size VARCHAR(50),
  path TEXT
);

CREATE TABLE vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patches(id) ON DELETE CASCADE,
  cve_number VARCHAR(50),
  severity VARCHAR(50),
  description TEXT,
  published_date DATE
);

CREATE TABLE endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patches(id) ON DELETE CASCADE,
  name VARCHAR(200),
  os VARCHAR(50),
  status VARCHAR(50),
  last_seen TIMESTAMP
);
```

---

## Test-Driven Development Scenarios

## Module 1: Patches CRUD Operations

### Test Scenario 1.1: Create Patch
**Endpoint**: `POST /api/patches`

**Given**: User is authenticated
**When**: User submits valid patch data
**Then**:
- Patch is created in database
- Returns 201 with patch object
- patch_id is auto-generated
- created_at timestamp is set

**Test Cases**:
```typescript
describe('POST /api/patches', () => {
  it('should create a new patch with valid data', async () => {
    const patchData = {
      software: '2025-08 Cumulative Update for Windows 10',
      platform: 'Windows',
      severity: 'CRITICAL',
      category: 'Security Updates',
      bulletinId: 'MS25-001',
      kbNumber: 'KB5041571',
      releaseDate: '2025-08-13',
      architecture: '64 BIT',
      referenceUrl: 'https://support.microsoft.com/kb/5041571',
      languagesSupported: ['English'],
      tags: ['Security'],
      rebootRequired: true,
      supportUninstallation: false
    };

    const response = await request(app)
      .post('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .send(patchData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.software).toBe(patchData.software);
    expect(response.body.patchId).toMatch(/ZPH-W-\d+/);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ software: 'Test' })
      .expect(400);

    expect(response.body.message).toContain('required');
  });

  it('should return 401 for unauthenticated requests', async () => {
    await request(app)
      .post('/api/patches')
      .send({})
      .expect(401);
  });
});
```

### Test Scenario 1.2: Get All Patches with Filtering
**Endpoint**: `GET /api/patches`

**Test Cases**:
```typescript
describe('GET /api/patches', () => {
  beforeEach(async () => {
    // Seed database with test patches
    await createTestPatches();
  });

  it('should return all patches', async () => {
    const response = await request(app)
      .get('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should filter patches by severity', async () => {
    const response = await request(app)
      .get('/api/patches?severity=CRITICAL')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.every(p => p.severity === 'CRITICAL')).toBe(true);
  });

  it('should filter patches by OS', async () => {
    const response = await request(app)
      .get('/api/patches?os=Windows')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.every(p => p.os === 'Windows')).toBe(true);
  });

  it('should search patches by software name', async () => {
    const response = await request(app)
      .get('/api/patches?search=Windows')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.every(p =>
      p.software.toLowerCase().includes('windows')
    )).toBe(true);
  });

  it('should paginate results', async () => {
    const response = await request(app)
      .get('/api/patches?page=1&limit=5')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.length).toBeLessThanOrEqual(5);
  });
});
```

### Test Scenario 1.3: Update Patch
**Endpoint**: `PUT /api/patches/:id`

**Test Cases**:
```typescript
describe('PUT /api/patches/:id', () => {
  let patchId: string;

  beforeEach(async () => {
    const patch = await createTestPatch();
    patchId = patch.id;
  });

  it('should update patch successfully', async () => {
    const updateData = {
      severity: 'High',
      testStatus: 'Tested',
      approvalStatus: 'Approved'
    };

    const response = await request(app)
      .put(`/api/patches/${patchId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.severity).toBe('High');
    expect(response.body.testStatus).toBe('Tested');
  });

  it('should return 404 for non-existent patch', async () => {
    await request(app)
      .put(`/api/patches/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ severity: 'Low' })
      .expect(404);
  });
});
```

### Test Scenario 1.4: Delete Patch
**Endpoint**: `DELETE /api/patches/:id`

**Test Cases**:
```typescript
describe('DELETE /api/patches/:id', () => {
  it('should delete patch and cascade related data', async () => {
    const patch = await createTestPatch();
    await createAffectedProducts(patch.id);

    await request(app)
      .delete(`/api/patches/${patch.id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(204);

    const deletedPatch = await Patch.findByPk(patch.id);
    expect(deletedPatch).toBeNull();
  });

  it('should return 404 for non-existent patch', async () => {
    await request(app)
      .delete(`/api/patches/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });
});
```

---

## Module 2: Patch Related Data

### Test Scenario 2.1: Get Affected Products
**Endpoint**: `GET /api/patches/:id/affected-products`

**Test Cases**:
```typescript
describe('GET /api/patches/:id/affected-products', () => {
  it('should return affected products for patch', async () => {
    const patch = await createTestPatch();
    await createAffectedProducts(patch.id, 3);

    const response = await request(app)
      .get(`/api/patches/${patch.id}/affected-products`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toHaveProperty('hostName');
    expect(response.body[0]).toHaveProperty('vendor');
  });

  it('should return empty array for patch with no affected products', async () => {
    const patch = await createTestPatch();

    const response = await request(app)
      .get(`/api/patches/${patch.id}/affected-products`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
```

### Test Scenario 2.2: Scan Endpoints
**Endpoint**: `POST /api/patches/:id/scan-endpoints`

**Test Cases**:
```typescript
describe('POST /api/patches/:id/scan-endpoints', () => {
  it('should initiate endpoint scan', async () => {
    const patch = await createTestPatch();
    const scanRequest = {
      scope: 'All End Points',
      endpointIds: []
    };

    const response = await request(app)
      .post(`/api/patches/${patch.id}/scan-endpoints`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(scanRequest)
      .expect(202);

    expect(response.body).toHaveProperty('message', 'Scan initiated');
    // Verify scan job was queued
  });

  it('should scan specific endpoints', async () => {
    const patch = await createTestPatch();
    const scanRequest = {
      scope: 'Specific Groups',
      endpointIds: ['endpoint-1', 'endpoint-2']
    };

    await request(app)
      .post(`/api/patches/${patch.id}/scan-endpoints`)
      .set('Authorization', `Bearer ${validToken}`)
      .send(scanRequest)
      .expect(202);
  });
});
```

---

## Module 3: Deployments

### Test Scenario 3.1: Create Deployment
**Endpoint**: `POST /api/deployments`

**Test Cases**:
```typescript
describe('POST /api/deployments', () => {
  it('should create deployment with patches', async () => {
    const patches = await createTestPatches(3);
    const deploymentData = {
      name: 'Critical Security Patches - Aug 2025',
      description: 'Deploy critical security patches',
      type: 'INSTALL',
      schedule: '2025-08-20T10:00:00Z',
      targetGroups: ['all', 'windows'],
      patches: patches.map(p => p.id)
    };

    const response = await request(app)
      .post('/api/deployments')
      .set('Authorization', `Bearer ${validToken}`)
      .send(deploymentData)
      .expect(201);

    expect(response.body.name).toBe(deploymentData.name);
    expect(response.body.deploymentId).toMatch(/DEP-\d+/);
    expect(response.body.stage).toBe('IN_PROGRESS');
  });

  it('should auto-generate deployment ID', async () => {
    const deploymentData = {
      name: 'Test Deployment',
      type: 'INSTALL',
      patches: []
    };

    const response = await request(app)
      .post('/api/deployments')
      .set('Authorization', `Bearer ${validToken}`)
      .send(deploymentData)
      .expect(201);

    expect(response.body.deploymentId).toBeTruthy();
  });
});
```

### Test Scenario 3.2: Execute Deployment
**Endpoint**: `POST /api/deployments/:id/execute`

**Test Cases**:
```typescript
describe('POST /api/deployments/:id/execute', () => {
  it('should execute deployment and update status', async () => {
    const deployment = await createTestDeployment();

    const response = await request(app)
      .post(`/api/deployments/${deployment.id}/execute`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(202);

    expect(response.body.message).toBe('Deployment execution initiated');

    // Verify deployment stage updated
    const updated = await Deployment.findByPk(deployment.id);
    expect(updated.stage).toBe('IN_PROGRESS');
  });
});
```

---

## Module 4: Patch Tests

### Test Scenario 4.1: Create Patch Test
**Endpoint**: `POST /api/patch-tests`

**Test Cases**:
```typescript
describe('POST /api/patch-tests', () => {
  it('should create patch test configuration', async () => {
    const testData = {
      name: 'Engineering Dept Test',
      description: 'Test patches on engineering computers',
      applicationType: 'ALL',
      scope: 'SPECIFIC_GROUPS',
      groups: ['Engineering']
    };

    const response = await request(app)
      .post('/api/patch-tests')
      .set('Authorization', `Bearer ${validToken}`)
      .send(testData)
      .expect(201);

    expect(response.body.name).toBe(testData.name);
    expect(response.body.status).toBe('Pending');
  });

  it('should validate application type and scope combination', async () => {
    const invalidData = {
      name: 'Test',
      applicationType: 'INCLUDE',
      scope: 'SCOPE'
      // Missing required applications and computers
    };

    await request(app)
      .post('/api/patch-tests')
      .set('Authorization', `Bearer ${validToken}`)
      .send(invalidData)
      .expect(400);
  });
});
```

### Test Scenario 4.2: Approve Patch Test
**Endpoint**: `PUT /api/patch-tests/:id/approve`

**Test Cases**:
```typescript
describe('PUT /api/patch-tests/:id/approve', () => {
  it('should approve patch test', async () => {
    const test = await createTestPatchTest();

    const response = await request(app)
      .put(`/api/patch-tests/${test.id}/approve`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.status).toBe('Approved');
  });

  it('should only allow approval by authorized users', async () => {
    const test = await createTestPatchTest();

    await request(app)
      .put(`/api/patch-tests/${test.id}/approve`)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(403);
  });
});
```

---

## Module 5: Zero Touch Configurations

### Test Scenario 5.1: Create Zero Touch Config
**Endpoint**: `POST /api/zero-touch-configs`

**Test Cases**:
```typescript
describe('POST /api/zero-touch-configs', () => {
  it('should create zero-touch configuration', async () => {
    const configData = {
      name: 'Auto-Deploy Critical Patches',
      description: 'Automatically deploy critical security patches',
      applicationType: 'ALL',
      scope: 'ALL_COMPUTERS',
      autoDeploymentRules: {
        severity: ['CRITICAL', 'High'],
        approvalRequired: false,
        schedule: 'Immediate'
      }
    };

    const response = await request(app)
      .post('/api/zero-touch-configs')
      .set('Authorization', `Bearer ${validToken}`)
      .send(configData)
      .expect(201);

    expect(response.body.name).toBe(configData.name);
    expect(response.body.status).toBe('Active');
  });

  it('should validate auto-deployment rules', async () => {
    const invalidConfig = {
      name: 'Test',
      autoDeploymentRules: {
        // Missing required severity field
        schedule: 'Immediate'
      }
    };

    await request(app)
      .post('/api/zero-touch-configs')
      .set('Authorization', `Bearer ${validToken}`)
      .send(invalidConfig)
      .expect(400);
  });
});
```

---

## Error Handling Scenarios

### Test Scenario E.1: Validation Errors
```typescript
describe('Validation Errors', () => {
  it('should return 400 for invalid severity value', async () => {
    const response = await request(app)
      .post('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ severity: 'INVALID' })
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field: 'severity' })
    );
  });

  it('should return 400 for invalid date format', async () => {
    await request(app)
      .post('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ releaseDate: 'invalid-date' })
      .expect(400);
  });
});
```

### Test Scenario E.2: Database Errors
```typescript
describe('Database Errors', () => {
  it('should return 409 for duplicate patch ID', async () => {
    await createTestPatch({ patchId: 'ZPH-W-1234' });

    await request(app)
      .post('/api/patches')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ patchId: 'ZPH-W-1234', /* other fields */ })
      .expect(409);
  });
});
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create PostgreSQL database schema
- [ ] Set up migrations
- [ ] Create seed data for testing
- [ ] Set up indexes for performance

### Phase 2: Core Patches API
- [ ] Implement POST /api/patches
- [ ] Implement GET /api/patches with filtering
- [ ] Implement GET /api/patches/:id
- [ ] Implement PUT /api/patches/:id
- [ ] Implement DELETE /api/patches/:id
- [ ] Write unit tests for all endpoints
- [ ] Write integration tests

### Phase 3: Patch Related Data
- [ ] Implement GET /api/patches/:id/affected-products
- [ ] Implement POST /api/patches/:id/scan-endpoints
- [ ] Implement GET /api/patches/:id/file-details
- [ ] Implement GET /api/patches/:id/vulnerabilities
- [ ] Implement GET /api/patches/:id/endpoints

### Phase 4: Deployments API
- [ ] Implement POST /api/deployments
- [ ] Implement GET /api/deployments
- [ ] Implement GET /api/deployments/:id
- [ ] Implement DELETE /api/deployments/:id
- [ ] Implement GET /api/deployments/:id/preview
- [ ] Implement POST /api/deployments/:id/execute
- [ ] Create background job for deployment execution

### Phase 5: Patch Tests API
- [ ] Implement POST /api/patch-tests
- [ ] Implement GET /api/patch-tests
- [ ] Implement GET /api/patch-tests/:id
- [ ] Implement PUT /api/patch-tests/:id/approve
- [ ] Implement DELETE /api/patch-tests/:id

### Phase 6: Zero Touch API
- [ ] Implement POST /api/zero-touch-configs
- [ ] Implement GET /api/zero-touch-configs
- [ ] Implement GET /api/zero-touch-configs/:id
- [ ] Implement PUT /api/zero-touch-configs/:id
- [ ] Implement DELETE /api/zero-touch-configs/:id
- [ ] Create scheduler for auto-deployments

### Phase 7: Integration & Performance
- [ ] Add request validation middleware
- [ ] Add error handling middleware
- [ ] Optimize database queries
- [ ] Add caching layer (Redis)
- [ ] Set up API rate limiting
- [ ] Add logging and monitoring

### Phase 8: Documentation & Deployment
- [ ] Generate Swagger documentation from OpenAPI spec
- [ ] Write API usage examples
- [ ] Create postman collection
- [ ] Set up CI/CD pipeline
- [ ] Deploy to staging environment
- [ ] Conduct load testing

---

## Performance Considerations

1. **Database Indexing**
   - Add indexes on frequently queried fields (severity, os, category)
   - Use composite indexes for multi-field filters
   - Monitor slow queries and optimize

2. **Caching Strategy**
   - Cache GET /api/patches results (TTL: 5 minutes)
   - Invalidate cache on POST/PUT/DELETE operations
   - Use Redis for distributed caching

3. **Pagination**
   - Default page size: 10
   - Maximum page size: 100
   - Use cursor-based pagination for large datasets

4. **Query Optimization**
   - Use eager loading for related data
   - Implement GraphQL for flexible data fetching
   - Add database connection pooling

---

## Security Considerations

1. **Authentication & Authorization**
   - Verify JWT tokens on all endpoints
   - Implement role-based access control
   - Restrict delete operations to admins only

2. **Input Validation**
   - Sanitize all user inputs
   - Validate file uploads (CSV/Excel for bulk add)
   - Prevent SQL injection with parameterized queries

3. **Rate Limiting**
   - Limit API requests per user per minute
   - Implement exponential backoff for retries
   - Block suspicious IP addresses

---

## Testing Strategy

1. **Unit Tests** (>80% coverage)
   - Test all service methods
   - Test validation logic
   - Test error handling

2. **Integration Tests**
   - Test all API endpoints
   - Test database transactions
   - Test authentication flows

3. **E2E Tests**
   - Test complete user workflows
   - Test deployment execution
   - Test zero-touch automation

4. **Load Tests**
   - Test with 1000+ concurrent users
   - Test with 100,000+ patches
   - Measure response times under load

---

## Deployment Notes

1. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/patchify
   JWT_SECRET=<secret-key>
   REDIS_URL=redis://localhost:6379
   API_PORT=3000
   ```

2. **Database Migrations**
   ```bash
   npm run migrate:up
   npm run seed
   ```

3. **Health Check Endpoint**
   ```
   GET /api/health
   Response: { status: 'ok', database: 'connected', redis: 'connected' }
   ```

---

## Support & Troubleshooting

For issues or questions:
1. Check API logs in `/var/log/patchify/api.log`
2. Review OpenAPI spec in `backend-debt/patches-api.yaml`
3. Contact backend team via Slack #patches-backend

---

**Implementation Timeline**: 3-4 weeks (1 week per phase for phases 1-4, 1 week for phases 5-8)
