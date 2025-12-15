# Login API Implementation Guide

## API Contract
**Spec**: `backend-debt/auth-api.yaml` - OpenAPI 3.0 specification (source of truth)

## Endpoint Overview
```
POST /v1/auth/login
POST /v1/auth/logout
POST /v1/auth/refresh
GET  /v1/user/me
```

## Reference Implementation
**Frontend**: `frontend/src/pages/Login.tsx`
**API Service**: `frontend/src/services/auth.service.ts`
**Mock Handlers**: `frontend/src/mocks/handlers/auth.handlers.ts` - Contains expected behavior
**Types**: `frontend/src/types/auth.types.ts` - TypeScript interfaces

## TDD Test Scenarios

### POST /v1/auth/login

**Success Case** (200)
```json
Request: { "email": "test@example.com", "password": "password123" }
Response: {
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Validation Tests**
- ❌ Missing email → 400 `{ "error": "Email is required" }`
- ❌ Invalid email format → 400 `{ "error": "Invalid email format" }`
- ❌ Missing password → 400 `{ "error": "Password is required" }`
- ❌ Wrong credentials → 401 `{ "error": "Invalid email or password" }`
- ❌ Account locked/disabled → 403 `{ "error": "Account is disabled" }`

**Security Requirements**
- Bcrypt/Argon2 password hashing (min 10 rounds)
- Rate limiting: 5 attempts per 15 minutes per IP
- JWT: HS256/RS256, accessToken expires in 15min, refreshToken in 7 days
- Store refreshToken in DB with user_id, device info, issued_at, expires_at
- NEVER return password hash in responses

### POST /v1/auth/logout

**Success Case** (200)
```json
Request Headers: { "Authorization": "Bearer <accessToken>" }
Response: { "message": "Logged out successfully" }
```

**Tests**
- ✅ Valid token → invalidate refreshToken in DB
- ❌ Missing token → 401 `{ "error": "Authentication required" }`
- ❌ Invalid token → 401 `{ "error": "Invalid token" }`

### POST /v1/auth/refresh

**Success Case** (200)
```json
Request: { "refreshToken": "refresh_token_here" }
Response: {
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

**Tests**
- ✅ Valid refreshToken → issue new pair, invalidate old refreshToken
- ❌ Expired refreshToken → 401 `{ "error": "Refresh token expired" }`
- ❌ Invalid/tampered token → 401 `{ "error": "Invalid refresh token" }`
- ❌ Revoked token → 401 `{ "error": "Token has been revoked" }`

### GET /v1/user/me

**Success Case** (200)
```json
Request Headers: { "Authorization": "Bearer <accessToken>" }
Response: {
  "id": "user_id",
  "email": "test@example.com",
  "name": "Test User",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Tests**
- ✅ Valid token → return user data
- ❌ Missing token → 401
- ❌ Expired token → 401
- ❌ User deleted → 404

## Frontend Expectations

**localStorage Keys**:
- `accessToken` - JWT for API requests
- `refreshToken` - For token refresh

**Auto-behaviors**:
- Frontend sends `Authorization: Bearer <token>` on every API call (see `frontend/src/services/api.service.ts:19-24`)
- Frontend intercepts 401 responses → clears tokens → redirects to /login (see `frontend/src/services/api.service.ts:36-41`)

## Database Schema Hints

```sql
users:
  - id (uuid, pk)
  - email (unique, indexed)
  - password_hash (bcrypt)
  - name
  - created_at
  - updated_at
  - is_active (boolean)

refresh_tokens:
  - id (uuid, pk)
  - user_id (fk)
  - token_hash (indexed)
  - expires_at (indexed)
  - created_at
  - device_info (optional)
  - revoked_at (nullable)
```

## Implementation Order (TDD)

1. **Write tests first** for each endpoint (success + all error cases)
2. Implement user model + password hashing utilities
3. Implement JWT utilities (sign, verify, refresh)
4. Implement POST /v1/auth/login endpoint
5. Implement middleware: auth verification, rate limiting
6. Implement GET /v1/user/me endpoint
7. Implement POST /v1/auth/refresh endpoint
8. Implement POST /v1/auth/logout endpoint
9. Add integration tests with real DB
10. Add E2E tests matching frontend flows

## Mock Data Reference
See `frontend/src/mocks/handlers/auth.handlers.ts:4-11` for test user:
- Email: `test@example.com`
- Password: `password123` (hash this in backend)

## Notes
- Frontend base URL: `http://localhost:3000/v1` (see `frontend/.env`)
- CORS: Allow `http://localhost:5173`, `http://localhost:5174`
- All timestamps: ISO 8601 format
- All IDs: UUIDs recommended
- Error responses: Always JSON with `error` field
