# Projects API Endpoints

This document describes all available endpoints for the Projects module. All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Table of Contents
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Endpoints](#endpoints)
  - [Create Project](#create-project)
  - [Get All Projects](#get-all-projects)
  - [Get Project by ID](#get-project-by-id)
  - [Update Project](#update-project)
  - [Delete Project](#delete-project)
  - [Assign Users to Project](#assign-users-to-project)
  - [Remove Users from Project](#remove-users-from-project)

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, use the `/auth/login` or `/auth/register` endpoints.

---

## Authorization

The Projects API implements role-based access control:

- **ADMIN**: Full access to all projects and operations
- **USER**: Can only view projects they are assigned to

### Permissions by Endpoint:
- **Create Project**: ADMIN only
- **Get All Projects**: ADMIN (all projects), USER (assigned projects only)
- **Get Project by ID**: ADMIN (any project), USER (assigned projects only)
- **Update Project**: ADMIN only
- **Delete Project**: ADMIN only
- **Assign/Remove Users**: ADMIN only

---

## Endpoints

### Create Project

Create a new project and optionally assign users to it.

**Endpoint**: `POST /projects`  
**Authorization**: ADMIN only  
**Content-Type**: `application/json`

#### Request Body

```json
{
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name (max 255 characters) |
| `description` | string | No | Detailed project description |
| `userIds` | string[] | No | Array of user IDs to assign to the project |

#### Success Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T02:43:45.123Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "statusCode": 400,
  "message": [
    "Project name is required",
    "Each user ID must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

**400 Bad Request** - User IDs don't exist
```json
{
  "statusCode": 400,
  "message": "The following user IDs do not exist: 550e8400-e29b-41d4-a716-446655440099",
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User is not an ADMIN
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

#### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Alpha",
    "description": "A comprehensive project management system",
    "userIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

---

### Get All Projects

Retrieve all projects. ADMINs see all projects, USERs see only projects they are assigned to.

**Endpoint**: `GET /projects`  
**Authorization**: ADMIN, USER  
**Content-Type**: `application/json`

#### Request

No request body needed.

#### Success Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Project Alpha",
    "description": "A comprehensive project management system",
    "createdBy": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignedUsers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER"
      }
    ],
    "tasks": [],
    "taskCount": 5,
    "createdAt": "2025-12-14T02:43:45.123Z",
    "updatedAt": "2025-12-14T02:43:45.123Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Project Beta",
    "description": "Another exciting project",
    "createdBy": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignedUsers": [],
    "tasks": [],
    "taskCount": 0,
    "createdAt": "2025-12-14T03:00:00.123Z",
    "updatedAt": "2025-12-14T03:00:00.123Z"
  }
]
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### Example Request (cURL)

```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Project by ID

Retrieve a specific project by its ID. ADMINs can view any project, USERs can only view projects they are assigned to.

**Endpoint**: `GET /projects/:id`  
**Authorization**: ADMIN (any project), USER (assigned projects only)  
**Content-Type**: `application/json`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | The project ID |

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  ],
  "tasks": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Implement authentication",
      "description": "Add JWT authentication to the API",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-12-20T00:00:00.000Z",
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-12-14T02:43:45.123Z",
      "updatedAt": "2025-12-14T02:43:45.123Z"
    }
  ],
  "taskCount": 5,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T02:43:45.123Z"
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User not assigned to project
```json
{
  "statusCode": 403,
  "message": "You do not have access to this project",
  "error": "Forbidden"
}
```

**404 Not Found** - Project doesn't exist
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440099 not found",
  "error": "Not Found"
}
```

#### Example Request (cURL)

```bash
curl -X GET http://localhost:3000/projects/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Project

Update an existing project. Can update name, description, and assigned users.

**Endpoint**: `PUT /projects/:id`  
**Authorization**: ADMIN only  
**Content-Type**: `application/json`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | The project ID |

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "name": "Project Alpha - Updated",
  "description": "Updated project description",
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Note**: When updating `userIds`, it will replace ALL existing user assignments with the new list.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated project name (max 255 characters) |
| `description` | string | No | Updated project description |
| `userIds` | string[] | No | New list of user IDs (replaces existing) |

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha - Updated",
  "description": "Updated project description",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 5,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T04:00:00.123Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "statusCode": 400,
  "message": [
    "Project name must not exceed 255 characters"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User is not an ADMIN
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

**404 Not Found** - Project doesn't exist
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440099 not found",
  "error": "Not Found"
}
```

#### Example Request (cURL)

```bash
curl -X PUT http://localhost:3000/projects/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Alpha - Updated",
    "description": "Updated project description"
  }'
```

---

### Delete Project

Delete a project by its ID. This will also delete all associated tasks and user assignments (cascade delete).

**Endpoint**: `DELETE /projects/:id`  
**Authorization**: ADMIN only  
**Content-Type**: `application/json`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | The project ID |

#### Success Response (200 OK)

```json
{
  "message": "Project deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User is not an ADMIN
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

**404 Not Found** - Project doesn't exist
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440099 not found",
  "error": "Not Found"
}
```

#### Example Request (cURL)

```bash
curl -X DELETE http://localhost:3000/projects/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Assign Users to Project

Assign additional users to a project without removing existing assignments.

**Endpoint**: `POST /projects/:id/assign-users`  
**Authorization**: ADMIN only  
**Content-Type**: `application/json`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | The project ID |

#### Request Body

```json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userIds` | string[] | Yes | Array of user IDs to assign (must be valid UUIDs) |

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 5,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T02:43:45.123Z"
}
```

**Note**: If a user is already assigned, they won't be duplicated.

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "statusCode": 400,
  "message": [
    "At least one user ID must be provided",
    "Each user ID must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

**400 Bad Request** - User IDs don't exist
```json
{
  "statusCode": 400,
  "message": "The following user IDs do not exist: 550e8400-e29b-41d4-a716-446655440099",
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User is not an ADMIN
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

**404 Not Found** - Project doesn't exist
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440099 not found",
  "error": "Not Found"
}
```

#### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/projects/550e8400-e29b-41d4-a716-446655440000/assign-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

---

### Remove Users from Project

Remove users from a project.

**Endpoint**: `POST /projects/:id/remove-users`  
**Authorization**: ADMIN only  
**Content-Type**: `application/json`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | The project ID |

#### Request Body

```json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userIds` | string[] | Yes | Array of user IDs to remove (must be valid UUIDs) |

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "createdBy": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 5,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T02:43:45.123Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "statusCode": 400,
  "message": [
    "At least one user ID must be provided",
    "Each user ID must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden** - User is not an ADMIN
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

**404 Not Found** - Project doesn't exist
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440099 not found",
  "error": "Not Found"
}
```

#### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/projects/550e8400-e29b-41d4-a716-446655440000/remove-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

---

## Common Response Fields

All project responses include:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Project UUID |
| `name` | string | Project name |
| `description` | string | Project description |
| `createdBy` | object | User who created the project |
| `assignedUsers` | array | List of users assigned to the project |
| `tasks` | array | List of tasks (only in GET by ID) |
| `taskCount` | number | Total number of tasks |
| `createdAt` | string | ISO 8601 timestamp |
| `updatedAt` | string | ISO 8601 timestamp |

---

## Testing the Endpoints

### Step 1: Get Authentication Token

First, login to get a JWT token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

### Step 2: Use the Token

Use the token from the login response in subsequent requests:

```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Handling

All endpoints follow consistent error response patterns:

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error type (Bad Request, Unauthorized, Forbidden, Not Found)"
}
```

Common HTTP status codes:
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Notes

1. **Cascade Deletes**: When a project is deleted, all associated tasks and user assignments are automatically deleted.

2. **User Assignment**: 
   - Use `userIds` in CREATE/UPDATE to replace all assignments
   - Use `/assign-users` to add users without affecting existing ones
   - Use `/remove-users` to remove specific users

3. **Access Control**:
   - ADMINs have full access to all projects
   - USERs can only see and access projects they're assigned to
   - Only ADMINs can create, update, delete, or manage user assignments

4. **UUID Format**: All IDs must be valid UUID v4 strings.

5. **Date Format**: All dates use ISO 8601 format (e.g., `2025-12-14T02:43:45.123Z`).
