# Nexus Project Management API Documentation

## Overview

This document provides comprehensive information about the Nexus Project Management API, including authentication, endpoints, and usage examples.

## 📖 API Documentation Files

- **`swagger.yaml`** - OpenAPI 3.0 specification in YAML format
- **`swagger.json`** - OpenAPI 3.0 specification in JSON format (if needed)

## 🔑 Authentication

The API uses **JWT (JSON Web Token)** for authentication. 

### How to Authenticate

1. **Register** a new account or **Login** with existing credentials
2. You will receive a JWT token in the response
3. Include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Example Authentication Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# Response includes token:
# {
#   "user": {...},
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# 2. Use the token for authenticated requests
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 👥 Authorization & Roles

The API implements role-based access control (RBAC) with two roles:

### ADMIN Role
- Full access to all resources
- Can create, read, update, and delete all projects and tasks
- Can manage user roles
- Can assign/remove users from projects

### USER Role
- Limited access to assigned resources
- Can view only projects they are assigned to
- Can view and update only tasks assigned to them
- Cannot delete resources or change roles

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/auth/register` | Register a new user | No | - |
| POST | `/auth/login` | Login with credentials | No | - |
| GET | `/auth/me` | Get current user profile | Yes | All |
| POST | `/auth/logout` | Logout user | Yes | All |

### Project Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/projects` | Create a new project | Yes | ADMIN |
| GET | `/projects` | Get all projects | Yes | All* |
| GET | `/projects/:id` | Get a project by ID | Yes | All* |
| PUT | `/projects/:id` | Update a project | Yes | ADMIN |
| DELETE | `/projects/:id` | Delete a project | Yes | ADMIN |
| POST | `/projects/:id/assign-users` | Assign users to project | Yes | ADMIN |
| POST | `/projects/:id/remove-users` | Remove users from project | Yes | ADMIN |

*Users can only see projects they are assigned to

### Task Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/tasks` | Create a new task | Yes | ADMIN |
| GET | `/tasks` | Get all tasks | Yes | All* |
| GET | `/tasks/:id` | Get a task by ID | Yes | All* |
| PUT | `/tasks/:id` | Update a task | Yes | All** |
| DELETE | `/tasks/:id` | Delete a task | Yes | ADMIN |

*Users can only see tasks assigned to them  
**Users can only update tasks assigned to them

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get all users (paginated) | Yes | ADMIN |
| GET | `/users/:id` | Get a user by ID | Yes | All* |
| PUT | `/users/:id` | Update a user | Yes | All** |

*Users can only view their own profile  
**Users can only update their own profile (name only), admins can update any user

## 🔍 Query Parameters

### User List (`GET /users`)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 10 | Items per page |
| `search` | string | - | Search by name or email (case-insensitive) |

**Example:**
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=20&search=john" \
  -H "Authorization: Bearer <token>"
```

## 📝 Request/Response Examples

### Create a Project

**Request:**
```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of the company website",
    "userIds": ["550e8400-e29b-41d4-a716-446655440000"]
  }'
```

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Website Redesign",
  "description": "Complete redesign of the company website",
  "createdById": "770e8400-e29b-41d4-a716-446655440002",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Create a Task

**Request:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "JWT-based authentication system",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2024-02-01T00:00:00Z",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "assigneeId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (201 Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "title": "Implement user authentication",
  "description": "JWT-based authentication system",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-02-01T00:00:00Z",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### Update Task Status

**Request:**
```bash
curl -X PUT http://localhost:3000/tasks/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

**Response (200 OK):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "title": "Implement user authentication",
  "description": "JWT-based authentication system",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2024-02-01T00:00:00Z",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-16T09:30:00Z"
}
```

## 🎯 Data Models

### Enums

**UserRole:**
- `ADMIN`
- `USER`

**TaskStatus:**
- `TODO`
- `IN_PROGRESS`
- `DONE`

**TaskPriority:**
- `LOW`
- `MEDIUM`
- `HIGH`

### User Object

```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string (email)",
  "role": "UserRole",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### Project Object

```json
{
  "id": "string (uuid)",
  "name": "string",
  "description": "string | null",
  "createdById": "string (uuid)",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)",
  "createdBy": "User",
  "users": "ProjectUser[]",
  "tasks": "Task[]"
}
```

### Task Object

```json
{
  "id": "string (uuid)",
  "title": "string",
  "description": "string | null",
  "status": "TaskStatus",
  "priority": "TaskPriority",
  "dueDate": "string (date-time) | null",
  "projectId": "string (uuid)",
  "assigneeId": "string (uuid)",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)",
  "project": "Project",
  "assignee": "User",

}
```

## ⚠️ Error Responses

### Common HTTP Status Codes

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **400 Bad Request** - Validation error or invalid request
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - User doesn't have permission to access resource
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Validation Error Example

```json
{
  "statusCode": 400,
  "message": [
    "Name must be at least 2 characters long",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

## 🚀 Viewing the Documentation

### Option 1: Swagger UI (Recommended)

You can view the API documentation in an interactive Swagger UI:

1. **Install Swagger UI locally:**
   ```bash
   npm install -g swagger-ui-watcher
   ```

2. **View the documentation:**
   ```bash
   swagger-ui-watcher swagger.yaml
   ```

3. Open your browser to `http://localhost:8000`

### Option 2: Online Swagger Editor

1. Go to [https://editor.swagger.io/](https://editor.swagger.io/)
2. Click **File → Import file**
3. Upload the `swagger.yaml` file
4. View the interactive documentation

### Option 3: Integrate with NestJS (Future Enhancement)

You can integrate Swagger directly into your NestJS application:

```bash
npm install --save @nestjs/swagger
```

Then configure it in your `main.ts` file. See the NestJS Swagger documentation for details.

## 📊 Pagination Example

**Request:**
```bash
curl -X GET "http://localhost:3000/users?page=2&limit=5&search=doe" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 2,
  "limit": 5,
  "totalPages": 3
}
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store JWT tokens securely** (e.g., httpOnly cookies, secure storage)
3. **Don't expose sensitive data** (passwords are always excluded)
4. **Token expiration** - Tokens expire after a set time (check with your admin)
5. **Rate limiting** - API may be rate-limited to prevent abuse

## 📞 Support

For API support or questions, contact: support@nexus-pm.com

## 📄 License

MIT License - See LICENSE file for details
