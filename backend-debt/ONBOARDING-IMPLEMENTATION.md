# User Onboarding API Implementation Guide

## API Contract
**Spec**: `backend-debt/auth-api.yaml` - OpenAPI 3.0 specification (source of truth)

## Endpoint Overview
```
POST /v1/user/onboarding
```

## Reference Implementation
**Frontend**: `frontend/src/pages/UserOnboarding.tsx`
**API Service**: `frontend/src/services/auth.service.ts`
**Mock Handlers**: `frontend/src/mocks/handlers/auth.handlers.ts:175-241` - Contains expected behavior
**Types**: `frontend/src/types/auth.types.ts` - TypeScript interfaces

## TDD Test Scenarios

### POST /v1/user/onboarding

**Success Case** (200)
```json
Request: {
  "name": "Sharma Patel",
  "contactNumber": "+919876543210",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
Response: {
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456789",
      "email": "sharma@mail.com",
      "firstName": "Sharma",
      "lastName": "Patel",
      "name": "Sharma Patel",
      "contactNumber": "+919876543210",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Onboarding completed successfully"
}
```

**Validation Tests**
- ❌ Missing name → 422 `{ "error": { "code": "VALIDATION_ERROR", "message": "Name is required" } }`
- ❌ Name too short (< 2 chars) → 422 `{ "error": { "code": "VALIDATION_ERROR", "message": "Name must be at least 2 characters" } }`
- ❌ Missing contactNumber → 422 `{ "error": { "code": "VALIDATION_ERROR", "message": "Contact number is required" } }`
- ❌ Invalid contactNumber format → 400 `{ "error": { "code": "INVALID_CONTACT_NUMBER", "message": "Please provide a valid contact number with country code" } }`
- ❌ Missing password → 422 `{ "error": { "code": "VALIDATION_ERROR", "message": "Password is required" } }`
- ❌ Password too short (< 8 chars) → 400 `{ "error": { "code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long" } }`
- ❌ Missing confirmPassword → 422 `{ "error": { "code": "VALIDATION_ERROR", "message": "Confirm password is required" } }`
- ❌ Passwords don't match → 400 `{ "error": { "code": "PASSWORD_MISMATCH", "message": "Password and confirm password do not match" } }`

**Business Logic Tests**
- ✅ First onboarding → Create user profile with all details
- ✅ Subsequent onboarding → Update existing user with onboarding details
- ✅ Parse full name → Extract firstName and lastName (split on first space)
- ✅ Generate tokens → Return accessToken and refreshToken after successful onboarding
- ❌ Already onboarded → 400 `{ "error": { "code": "ALREADY_ONBOARDED", "message": "User has already completed onboarding" } }`

**Security Requirements**
- Bcrypt/Argon2 password hashing (min 10 rounds)
- Validate contact number format: `+[country_code][10_digits]`
- Country code: 1-3 digits, phone number: exactly 10 digits
- JWT: HS256/RS256, accessToken expires in 15min, refreshToken in 7 days
- Store refreshToken in DB with user_id, device info, issued_at, expires_at
- NEVER return password hash in responses
- Rate limiting: 10 attempts per 15 minutes per IP

## Frontend Expectations

**localStorage Keys**:
- `accessToken` - JWT for API requests (set after onboarding)
- `refreshToken` - For token refresh (set after onboarding)

**Form Validation** (see `frontend/src/pages/UserOnboarding.tsx:86-177`):
- Name: Required, minimum 2 characters
- Contact Number: 10-digit pattern validation
- Country Code: Dropdown with +91 (default), +1, +44, +61
- Password: Required, minimum 8 characters
- Confirm Password: Must match password

**Auto-behaviors**:
- After successful onboarding, frontend stores tokens in localStorage
- Frontend navigates to `/dashboard` (see `frontend/src/pages/UserOnboarding.tsx:29`)
- Frontend sends success/error messages using Ant Design message API

## Database Schema Hints

```sql
users:
  - id (uuid, pk)
  - email (unique, indexed)
  - password_hash (bcrypt)
  - first_name
  - last_name
  - contact_number (unique, indexed)
  - role (enum: admin, user, manager)
  - is_onboarded (boolean, default: false)
  - onboarded_at (timestamp, nullable)
  - created_at
  - updated_at
  - is_active (boolean, default: true)

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

1. **Write tests first** for the endpoint (success + all error cases)
2. Update user model to include: first_name, last_name, contact_number, is_onboarded, onboarded_at
3. Implement validation utilities:
   - Name validation (min 2 characters)
   - Contact number validation (country code + 10 digits)
   - Password strength validation (min 8 characters)
   - Password matching validation
4. Implement name parsing utility (split full name into firstName/lastName)
5. Implement POST /v1/user/onboarding endpoint:
   - Validate all input fields
   - Check if user already onboarded
   - Hash password using bcrypt
   - Parse and store name parts
   - Update user record with onboarding details
   - Set is_onboarded = true, onboarded_at = current timestamp
   - Generate JWT tokens (accessToken + refreshToken)
   - Store refreshToken in database
   - Return user object with tokens
6. Add rate limiting middleware
7. Add integration tests with real DB
8. Add E2E tests matching frontend flows

## Mock Data Reference

See `frontend/src/mocks/handlers/auth.handlers.ts:175-241` for expected behavior:
- Test request: `{ name: "Sharma Patel", contactNumber: "+919876543210", password: "SecurePass123", confirmPassword: "SecurePass123" }`
- Expected validations: name presence, password presence, password matching, password length
- Expected response: user object with updated details + tokens + success message

## Contact Number Format

**Valid Formats**:
- `+919876543210` (India)
- `+19876543210` (USA/Canada)
- `+449876543210` (UK)
- `+619876543210` (Australia)

**Regex Pattern**: `^\+[0-9]{1,3}[0-9]{10}$`
- Must start with `+`
- Country code: 1-3 digits
- Phone number: exactly 10 digits
- No spaces, dashes, or parentheses

## Name Parsing Logic

```
Input: "Sharma Patel"
Output: firstName = "Sharma", lastName = "Patel"

Input: "John"
Output: firstName = "John", lastName = ""

Input: "Mary Jane Watson"
Output: firstName = "Mary", lastName = "Jane Watson"
```

Algorithm: Split on first space, first part is firstName, rest is lastName

## Notes

- Frontend base URL: `http://localhost:3000/v1` (see `frontend/.env`)
- CORS: Allow `http://localhost:5173`, `http://localhost:5174`
- All timestamps: ISO 8601 format
- All IDs: UUIDs recommended
- Error responses: Always JSON with `success: false` and `error` object containing `code` and `message`
- Success responses: Always JSON with `success: true`, `data` object, and `message`
- After onboarding, user should be able to login with their email and password
- The `is_onboarded` flag should be checked during login to ensure users complete onboarding
