# Users API

This module handles user management operations for the Nexus Project Management System.

## Overview

All endpoints are protected with **JWT authentication**. Role-based authorization is enforced to ensure proper access control.

## Features

- ✅ JWT Authentication (required for all endpoints)
- ✅ Role-based Authorization (ADMIN vs USER)
- ✅ Pagination and Search (for user listing)
- ✅ Password Exclusion (passwords never exposed in responses)
- ✅ Profile Ownership (users can view/edit own profiles)
- ✅ Admin Controls (admins have full access)

## Endpoints

### 1. GET /users

**Get all users with pagination and search**

- **Authentication**: Required (JWT)
- **Authorization**: ADMIN only
- **Method**: GET

#### Query Parameters

| Parameter | Type   | Required | Default | Description                              |
|-----------|--------|----------|---------|------------------------------------------|
| page      | number | No       | 1       | Page number (1-indexed)                  |
| limit     | number | No       | 10      | Number of items per page                 |
| search    | string | No       | -       | Search query (searches name and email)   |

#### Response

```json
{
  "users": [
    {
      "id": "uuid",
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

#### Example Requests

```bash
# Get first page (10 users)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get page 2 with 20 users per page
curl -X GET "http://localhost:3000/users?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for users
curl -X GET "http://localhost:3000/users?search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. GET /users/:id

**Get a single user by ID**

- **Authentication**: Required (JWT)
- **Authorization**: 
  - ADMINs can view any user
  - Regular USERs can only view their own profile
- **Method**: GET

#### URL Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | User UUID   |

#### Response

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2023-12-14T00:00:00.000Z",
  "updatedAt": "2023-12-14T00:00:00.000Z"
}
```

#### Example Requests

```bash
# Admin viewing any user
curl -X GET http://localhost:3000/users/user-uuid-here \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# User viewing their own profile
curl -X GET http://localhost:3000/users/own-user-uuid \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

#### Error Responses

```json
// 403 Forbidden - User trying to view another user's profile
{
  "statusCode": 403,
  "message": "You do not have permission to view this user profile"
}

// 404 Not Found - User doesn't exist
{
  "statusCode": 404,
  "message": "User not found"
}
```

---

### 3. PUT /users/:id

**Update a user by ID**

- **Authentication**: Required (JWT)
- **Authorization**: 
  - ADMINs can update any user's name and role
  - Regular USERs can only update their own name (not role)
- **Method**: PUT

#### URL Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | User UUID   |

#### Request Body

```json
{
  "name": "Updated Name",     // Optional - Both ADMIN and USER can update
  "role": "ADMIN"             // Optional - Only ADMIN can update
}
```

#### Field Constraints

| Field | Type   | Constraints                          | Who Can Update |
|-------|--------|--------------------------------------|----------------|
| name  | string | 2-100 characters                     | ADMIN, USER    |
| role  | enum   | Must be "ADMIN" or "USER"            | ADMIN only     |

#### Response

```json
{
  "id": "uuid",
  "name": "Updated Name",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "2023-12-14T00:00:00.000Z",
  "updatedAt": "2023-12-14T00:00:00.000Z"
}
```

#### Example Requests

```bash
# User updating their own name
curl -X PUT http://localhost:3000/users/own-user-uuid \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name"
  }'

# Admin updating another user's name and role
curl -X PUT http://localhost:3000/users/other-user-uuid \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Updated Name",
    "role": "ADMIN"
  }'
```

#### Error Responses

```json
// 403 Forbidden - User trying to update another user
{
  "statusCode": 403,
  "message": "You do not have permission to update this user"
}

// 403 Forbidden - User trying to update role
{
  "statusCode": 403,
  "message": "Only administrators can update user roles"
}

// 400 Bad Request - No fields provided
{
  "statusCode": 400,
  "message": "At least one field (name or role) must be provided"
}

// 404 Not Found - User doesn't exist
{
  "statusCode": 404,
  "message": "User not found"
}
```

---

## Authorization Matrix

| Endpoint       | ADMIN                          | USER                           |
|----------------|--------------------------------|--------------------------------|
| GET /users     | ✅ View all users (paginated)  | ❌ Forbidden                   |
| GET /users/:id | ✅ View any user               | ✅ View own profile only       |
| PUT /users/:id | ✅ Update name & role (any)    | ✅ Update own name only        |

## Security Features

### 1. Password Protection
- Passwords are **never** included in API responses
- All queries explicitly exclude the password field
- Uses Prisma's `select` to ensure type-safe exclusion

### 2. JWT Authentication
- All endpoints require valid JWT token
- Token must be sent in `Authorization: Bearer <token>` header
- Tokens expire after 7 days (configurable)

### 3. Role-Based Authorization
- Uses `@Roles()` decorator to specify required roles
- `RolesGuard` enforces role requirements
- Proper error messages for unauthorized access

### 4. Input Validation
- DTOs with class-validator decorators
- Automatic validation via `ValidationPipe`
- Whitelisting to prevent unknown properties

### 5. Ownership Checks
- Regular users can only access/modify their own data
- Service layer performs additional authorization checks
- Admins bypass ownership restrictions

## Integration

### Adding to App Module

```typescript
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ... other modules
    UsersModule,
  ],
})
export class AppModule {}
```

## Dependencies

- `@nestjs/common` - Core NestJS decorators and utilities
- `@nestjs/jwt` - JWT authentication
- `class-validator` - Input validation
- `class-transformer` - Data transformation
- `PrismaService` - Database access

## Best Practices

1. **Always check authorization** before performing operations
2. **Never expose passwords** in responses
3. **Log important operations** for audit trails
4. **Use descriptive error messages** for better DX
5. **Implement pagination** for list endpoints to prevent performance issues

## Error Handling

All endpoints use standard NestJS exception filters and return consistent error responses:

- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Invalid input data

## Testing

Example test with cURL:

```bash
# 1. Login to get JWT token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Get all users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"

# 3. Get specific user
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer $TOKEN"

# 4. Update user
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```
