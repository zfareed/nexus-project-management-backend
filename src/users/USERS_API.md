# User Management API Endpoints

## Quick Reference

### API Base URL
```
http://localhost:3000
```

### Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. GET /users - List All Users (Admin Only)

**Description**: Get paginated list of all users with optional search

**Authorization**: ADMIN only

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Request Example**:
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2023-12-14T00:00:00.000Z",
      "updatedAt": "2023-12-14T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

### 2. GET /users/:id - Get User by ID

**Description**: Get a specific user's profile

**Authorization**: 
- ADMINs can view any user
- Regular USERs can only view their own profile

**URL Parameters**:
- `id` (required): User ID (UUID)

**Request Examples**:
```bash
# Admin viewing any user
curl -X GET "http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# User viewing own profile
curl -X GET "http://localhost:3000/users/own-user-id" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2023-12-14T00:00:00.000Z",
  "updatedAt": "2023-12-14T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User trying to view another user's profile
- `404 Not Found`: User doesn't exist

---

### 3. PUT /users/:id - Update User

**Description**: Update user's name and/or role

**Authorization**: 
- ADMINs can update any user's name and role
- Regular USERs can only update their own name (not role)

**URL Parameters**:
- `id` (required): User ID (UUID)

**Request Body**:
```json
{
  "name": "Updated Name",    // Optional: 2-100 characters
  "role": "ADMIN"            // Optional: "ADMIN" or "USER" (admin only)
}
```

**Request Examples**:
```bash
# User updating own name
curl -X PUT "http://localhost:3000/users/own-user-id" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name"
  }'

# Admin updating user's role
curl -X PUT "http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "2023-12-14T00:00:00.000Z",
  "updatedAt": "2023-12-14T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: No fields provided or invalid data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User doesn't exist

---

## Authorization Matrix

| Endpoint       | ADMIN                          | USER                           |
|----------------|--------------------------------|--------------------------------|
| GET /users     | ✅ View all (paginated)        | ❌ Forbidden                   |
| GET /users/:id | ✅ View any user               | ✅ View own profile only       |
| PUT /users/:id | ✅ Update name & role (any)    | ✅ Update own name only        |

---

## Security Notes

1. **Passwords are never exposed** in any API response
2. **JWT tokens are required** for all endpoints
3. **Role-based access control** is enforced
4. **Users can only modify their own data** (except admins)
5. **Only admins can change roles**

---

## Common Error Codes

| Code | Meaning                      | Common Cause                           |
|------|------------------------------|----------------------------------------|
| 400  | Bad Request                  | Invalid input data                     |
| 401  | Unauthorized                 | Missing or invalid JWT token           |
| 403  | Forbidden                    | Insufficient permissions               |
| 404  | Not Found                    | User doesn't exist                     |

---

## Testing Flow

1. **Login as admin**:
```bash
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' \
  | jq -r '.token')
```

2. **List all users**:
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"
```

3. **Get specific user**:
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

4. **Update user**:
```bash
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","role":"ADMIN"}'
```

---

## Validation Rules

### Name Field
- **Type**: String
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Required**: No (optional in updates)

### Role Field
- **Type**: Enum
- **Values**: `ADMIN`, `USER`
- **Required**: No (optional in updates)
- **Who Can Update**: ADMIN only

### Query Parameters
- **page**: Integer, minimum 1
- **limit**: Integer, minimum 1
- **search**: String, case-insensitive

---

## Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Pagination is 1-indexed (first page is 1, not 0)
- Search is case-insensitive and matches partial strings
- Password field is never returned in any response
