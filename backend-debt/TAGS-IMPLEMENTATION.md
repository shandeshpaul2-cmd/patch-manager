# Tags API Implementation Guide

## API Contract
**Spec**: `backend-debt/tags-api.yaml` - OpenAPI 3.0 specification (source of truth)

Refer to the OpenAPI YAML file for complete endpoint definitions, request/response schemas, and HTTP status codes.

## Endpoint Overview
```
GET    /v1/tags
POST   /v1/tags
GET    /v1/tags/{tagId}
PUT    /v1/tags/{tagId}
DELETE /v1/tags/{tagId}
GET    /v1/assets/{assetId}/tags
POST   /v1/assets/{assetId}/tags
DELETE /v1/assets/{assetId}/tags/{tagId}
GET    /v1/tags/{tagId}/assets
POST   /v1/tags/bulk-assign
POST   /v1/tags/bulk-remove
GET    /v1/tags/search
GET    /v1/tags/popular
```

## Reference Implementation

**Frontend Components**:
- `frontend/src/pages/assets/components/TagSelector.tsx` - Inline tag creation and selection
- `frontend/src/pages/assets/components/CreateTagModal.tsx` - Full tag form with advanced metadata
- `frontend/src/pages/assets/components/TagDisplay.tsx` - Tag display component

**API Service**: `frontend/src/services/tag.service.ts` (lines 1-70)
**Mock Handlers**: `frontend/src/mocks/handlers/tag.handlers.ts` - Contains all expected behaviors
**Types**: `frontend/src/types/asset.types.ts` (lines 45-72)

## Database Schema

### tags table
```sql
CREATE TABLE tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(100),
  owner VARCHAR(255),
  manager VARCHAR(255),
  priority ENUM('Critical', 'High', 'Medium', 'Low'),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  asset_count INT DEFAULT 0,
  usage_count INT DEFAULT 0,
  last_used TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  budget VARCHAR(100),
  compliance_required BOOLEAN DEFAULT FALSE,
  compliance_tags JSON,
  metadata JSON,

  INDEX idx_name (name),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_last_used (last_used DESC)
);
```

### asset_tags junction table (many-to-many)
```sql
CREATE TABLE asset_tags (
  asset_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(255),

  PRIMARY KEY (asset_id, tag_id),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

  INDEX idx_asset_id (asset_id),
  INDEX idx_tag_id (tag_id),
  INDEX idx_assigned_at (assigned_at DESC)
);
```

## TDD Test Scenarios

### POST /v1/tags - Create Tag

**Test 1: Create tag with required fields only**
```
Request:
{
  "name": "Production",
  "description": "Production environment assets"
}

Expected Response (201):
{
  "id": "tag-1000",
  "name": "Production",
  "description": "Production environment assets",
  "color": null,
  "icon": null,
  "owner": null,
  "manager": null,
  "priority": "Medium",
  "status": "Active",
  "assetCount": 0,
  "usageCount": 0,
  "createdAt": "2025-12-12T12:00:00Z",
  "budget": null,
  "complianceRequired": false,
  "complianceTags": []
}
```

**Test 2: Create tag with full metadata**
```
Request:
{
  "name": "Critical Infrastructure",
  "description": "Business-critical systems",
  "color": "volcano",
  "priority": "Critical",
  "owner": "Infrastructure Team",
  "manager": "Mike Davis",
  "status": "Active",
  "budget": "$500,000",
  "complianceRequired": true,
  "complianceTags": ["HIPAA", "SOC2"]
}

Expected Response (201): Tag object with all fields populated
```

**Test 3: Create tag with duplicate name**
```
Request:
{
  "name": "Production"  // Assume this tag already exists
}

Expected Response (409):
{
  "error": "Tag with this name already exists"
}
```

**Test 4: Create tag with missing name**
```
Request: {}

Expected Response (400):
{
  "error": "Tag name is required"
}
```

**Test 5: Create tag with name exceeding 255 characters**
```
Request:
{
  "name": "x" * 256
}

Expected Response (400):
{
  "error": "Tag name must be 255 characters or less"
}
```

### GET /v1/tags - List All Tags

**Test 1: Get all tags**
```
Expected Response (200):
[
  {
    "id": "tag-1",
    "name": "Production",
    "color": "red",
    "assetCount": 45,
    "usageCount": 120,
    ...
  },
  ...
]
```

**Test 2: Filter by status**
```
Request: GET /v1/tags?status=Active

Expected: Only tags with status="Active"
```

**Test 3: Filter by priority**
```
Request: GET /v1/tags?priority=Critical

Expected: Only tags with priority="Critical"
```

### GET /v1/tags/{tagId} - Get Single Tag

**Test 1: Get existing tag**
```
Request: GET /v1/tags/tag-1

Expected Response (200): Complete tag object
```

**Test 2: Get non-existent tag**
```
Request: GET /v1/tags/invalid-id

Expected Response (404):
{
  "error": "Tag not found"
}
```

### PUT /v1/tags/{tagId} - Update Tag

**Test 1: Update tag description**
```
Request: PUT /v1/tags/tag-1
{
  "description": "Updated description"
}

Expected Response (200):
{
  "id": "tag-1",
  ...
  "description": "Updated description",
  "updatedAt": "2025-12-12T13:00:00Z"
}
```

**Test 2: Update tag priority**
```
Request: PUT /v1/tags/tag-1
{
  "priority": "High"
}

Expected Response (200): Tag with updated priority
```

**Test 3: Update tag name to duplicate**
```
Request: PUT /v1/tags/tag-1
{
  "name": "Production"  // Assume another tag has this name
}

Expected Response (409):
{
  "error": "Tag with this name already exists"
}
```

**Test 4: Update non-existent tag**
```
Request: PUT /v1/tags/invalid-id
{
  "description": "..."
}

Expected Response (404):
{
  "error": "Tag not found"
}
```

### DELETE /v1/tags/{tagId} - Delete Tag

**Test 1: Delete existing tag**
```
Request: DELETE /v1/tags/tag-5

Expected Response (204): No content

Side Effects:
- Tag removed from tags table
- All asset_tags rows with this tag_id deleted
- assetCount updated for all affected tags
```

**Test 2: Delete non-existent tag**
```
Request: DELETE /v1/tags/invalid-id

Expected Response (404):
{
  "error": "Tag not found"
}
```

**Test 3: Delete tag and verify assets no longer have it**
```
Setup: Create asset with tag-5
Request: DELETE /v1/tags/tag-5
Request: GET /v1/assets/asset-1/tags

Expected: tag-5 is not in the list
```

### POST /v1/assets/{assetId}/tags - Assign Tags to Asset

**Test 1: Assign tags to asset**
```
Request: POST /v1/assets/asset-1/tags
{
  "tagIds": ["tag-1", "tag-2"]
}

Expected Response (200):
{
  "success": true
}

Side Effects:
- Remove all existing tags for asset-1
- Add tag-1 and tag-2 for asset-1
- Update tag.usageCount and tag.lastUsed for each tag
- Update tag.assetCount
```

**Test 2: Assign empty tag list (remove all tags)**
```
Request: POST /v1/assets/asset-1/tags
{
  "tagIds": []
}

Expected Response (200)

Side Effects:
- All asset_tags rows for asset-1 deleted
- Tag counts updated
```

**Test 3: Assign duplicate tags (should deduplicate)**
```
Request: POST /v1/assets/asset-1/tags
{
  "tagIds": ["tag-1", "tag-1", "tag-2"]
}

Expected Response (200)

Result: Only tag-1 and tag-2 assigned once each
```

**Test 4: Assign non-existent tag**
```
Request: POST /v1/assets/asset-1/tags
{
  "tagIds": ["tag-invalid"]
}

Expected Response (404):
{
  "error": "Tag not found (id: tag-invalid)"
}
```

**Test 5: Assign to non-existent asset**
```
Request: POST /v1/assets/invalid-id/tags
{
  "tagIds": ["tag-1"]
}

Expected Response (404):
{
  "error": "Asset not found"
}
```

### GET /v1/assets/{assetId}/tags - Get Tags for Asset

**Test 1: Get tags for asset with tags**
```
Request: GET /v1/assets/asset-1/tags

Expected Response (200):
[
  {
    "id": "tag-1",
    "name": "Production",
    ...
  },
  {
    "id": "tag-2",
    "name": "Development",
    ...
  }
]
```

**Test 2: Get tags for asset with no tags**
```
Request: GET /v1/assets/asset-2/tags

Expected Response (200): []
```

**Test 3: Get tags for non-existent asset**
```
Request: GET /v1/assets/invalid-id/tags

Expected Response (404):
{
  "error": "Asset not found"
}
```

### DELETE /v1/assets/{assetId}/tags/{tagId} - Remove Tag from Asset

**Test 1: Remove tag from asset**
```
Request: DELETE /v1/assets/asset-1/tags/tag-1

Expected Response (204)

Side Effects:
- asset_tags row deleted
- tag.assetCount decremented
```

**Test 2: Remove non-existent tag from asset (idempotent)**
```
Request: DELETE /v1/assets/asset-1/tags/tag-999

Expected Response (204)  // Still successful (idempotent)
```

**Test 3: Remove tag from non-existent asset**
```
Request: DELETE /v1/assets/invalid-id/tags/tag-1

Expected Response (404):
{
  "error": "Asset not found"
}
```

### GET /v1/tags/{tagId}/assets - Get Assets with Tag

**Test 1: Get assets with tag**
```
Request: GET /v1/tags/tag-1/assets

Expected Response (200):
[
  {
    "id": "asset-1",
    "name": "Server 01",
    ...
  },
  ...
]
```

**Test 2: Get assets for tag with no assets**
```
Request: GET /v1/tags/tag-unused/assets

Expected Response (200): []
```

### POST /v1/tags/bulk-assign - Bulk Assign Tags

**Test 1: Bulk assign tags to multiple assets**
```
Request: POST /v1/tags/bulk-assign
{
  "assetIds": ["asset-1", "asset-2", "asset-3"],
  "tagIds": ["tag-1", "tag-2"]
}

Expected Response (200):
{
  "success": true,
  "assigned": 6  // 3 assets × 2 tags
}

Side Effects:
- Create 6 asset_tags rows (if they don't exist)
- Update tag counts and usageCount
```

**Test 2: Bulk assign with overlapping assignments**
```
Setup: asset-1 already has tag-1
Request: POST /v1/tags/bulk-assign
{
  "assetIds": ["asset-1"],
  "tagIds": ["tag-1", "tag-2"]
}

Expected Response (200)

Result: No duplicate asset_tags entries (idempotent)
```

### POST /v1/tags/bulk-remove - Bulk Remove Tags

**Test 1: Bulk remove tags**
```
Request: POST /v1/tags/bulk-remove
{
  "assetIds": ["asset-1", "asset-2"],
  "tagIds": ["tag-1"]
}

Expected Response (200):
{
  "success": true,
  "removed": 2
}

Side Effects:
- Delete 2 asset_tags rows
- Update tag counts
```

### GET /v1/tags/search - Search Tags

**Test 1: Search by name**
```
Request: GET /v1/tags/search?q=prod

Expected: Tags with "prod" in name (case-insensitive)
["Production", "Product Development"]
```

**Test 2: Search by description**
```
Request: GET /v1/tags/search?q=critical

Expected: Tags with "critical" in description
["Critical Infrastructure"]
```

**Test 3: Search with no results**
```
Request: GET /v1/tags/search?q=nonexistent

Expected Response (200): []
```

### GET /v1/tags/popular - Get Popular Tags

**Test 1: Get top 10 most used tags**
```
Request: GET /v1/tags/popular

Expected Response (200): Top 10 tags sorted by usageCount DESC
```

**Test 2: Get top 5 tags**
```
Request: GET /v1/tags/popular?limit=5

Expected Response (200): Only 5 tags
```

**Test 3: Limit > total tags available**
```
Request: GET /v1/tags/popular?limit=1000

Expected: All tags (fewer than 1000)
```

## Implementation Order (TDD)

1. **Database Setup**
   - Create `tags` table
   - Create `asset_tags` junction table
   - Create indexes for performance

2. **Models & Validation**
   - Tag model with validation rules
   - Ensure unique name constraint
   - Validate enum fields (priority, status)

3. **Repositories**
   - TagRepository with CRUD methods
   - AssetTagRepository for junction table operations

4. **Unit Tests** (TDD - write tests first)
   - Tests for all repository methods
   - Tests for tag validation
   - Tests for unique name constraint

5. **Services**
   - TagService with business logic
   - Manage assetCount and usageCount
   - Update lastUsed timestamp

6. **Controllers/Routes**
   - Tag CRUD endpoints (GET /tags, POST /tags, etc.)
   - Asset-tag relationship endpoints

7. **Integration Tests**
   - Test tag creation and asset assignment
   - Test bulk operations
   - Test search and filtering

8. **API Tests**
   - Test all 13 endpoints
   - Test error handling
   - Test response formats match OpenAPI spec

9. **Performance Optimization**
   - Verify indexes are used
   - Implement query optimization
   - Add caching if needed

## Key Implementation Notes

### Tag Usage Tracking
When tags are assigned to assets:
1. Increment `tag.usageCount`
2. Update `tag.lastUsed` to current timestamp
3. Recalculate `tag.assetCount`

When tags are removed:
1. Decrement or recalculate `tag.assetCount`
2. Do NOT decrement usageCount (cumulative metric)

### Bulk Operations
For bulk assign/remove:
- Check for existing relationships (avoid duplicates)
- Update counts in a batch operation
- Return count of affected rows

### Uniqueness
- Tag names must be unique (database constraint)
- Return 409 Conflict if duplicate name

### Soft Deletes (Optional)
Consider soft deletes for audit trail, but the spec uses hard deletes. Implement hard deletes with cascade to asset_tags.

### Timestamps
- Use ISO 8601 format (2025-12-12T12:00:00Z)
- Store in UTC
- Auto-update `updated_at` on modifications

## Frontend Expectations

- Tag IDs stored as `tagIds: string[]` in Asset type
- Colors use Ant Design color names or hex codes
- Icons are icon names (optional)
- Tag creation/editing happens inline in asset forms
- Bulk operations available from asset list

## Security & Authorization

All endpoints require authentication. Implement role-based access:
- View tags: `authenticated-user`
- Create/edit tags: `asset-manager` role
- Delete tags: `admin` role

## Performance Considerations

### Indexing Strategy
- Primary key: `tags.id`
- Unique index: `tags.name`
- Composite index: `(asset_id, tag_id)` in asset_tags
- Search index: `tags.name` for text search
- Sort index: `tags.last_used` DESC for popular tags

### Query Optimization
```sql
-- Efficient: Get tags for asset with single query
SELECT t.* FROM tags t
JOIN asset_tags at ON t.id = at.tag_id
WHERE at.asset_id = ?;

-- Efficient: Get assets for tag
SELECT a.* FROM assets a
JOIN asset_tags at ON a.id = at.asset_id
WHERE at.tag_id = ?;

-- Batch update counts (after bulk operations)
UPDATE tags t
SET asset_count = (SELECT COUNT(*) FROM asset_tags WHERE tag_id = t.id)
WHERE t.id IN (...);
```

### Caching
- Cache popular tags (top 20) for 1 hour
- Invalidate cache on tag create/update/delete
- Cache tag list for 5 minutes

## Monitoring & Metrics

Track these for analytics:
- Most used tags (usageCount)
- Tags with most assets (assetCount)
- Recently added tags (createdAt)
- Tags with compliance requirements
- Compliance tag usage

## Migration Script

```sql
-- Create tags table
CREATE TABLE tags (...);

-- Create asset_tags junction table
CREATE TABLE asset_tags (...);

-- Add indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_status ON tags(status);
CREATE INDEX idx_asset_tags_asset ON asset_tags(asset_id);
CREATE INDEX idx_asset_tags_tag ON asset_tags(tag_id);

-- Verify data integrity
SELECT COUNT(*) FROM tags;
SELECT COUNT(*) FROM asset_tags;
```

## Rollback Plan

If rollback needed:
1. Drop `asset_tags` table
2. Drop `tags` table
3. Remove `tagIds` column from assets (if added)
4. Verify no references to tags in code

## Success Criteria

✅ All 13 endpoints implemented and tested
✅ Tag names are unique
✅ Asset-tag relationships correctly maintained
✅ Usage counts accurate
✅ Search works by name and description
✅ Popular tags sorted by usage
✅ Bulk operations work correctly
✅ Proper error handling (404, 409, 400)
✅ Response format matches OpenAPI spec
✅ Database indexes optimized
✅ Integration tests passing
