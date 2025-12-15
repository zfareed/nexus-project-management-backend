# Tasks API Documentation

## Overview
The Tasks API provides full CRUD operations for managing tasks in the Nexus Project Management system. Tasks belong to projects and are assigned to users. All endpoints are protected with JWT authentication and implement role-based authorization.

## Authorization Rules

### ADMIN Role
- ✅ Create tasks
- ✅ View all tasks
- ✅ Update any task
- ✅ Delete any task

### USER Role
- ❌ Cannot create tasks
- ✅ View only assigned tasks
- ✅ Update only assigned tasks
- ❌ Cannot delete tasks

---

## Endpoints

### 1. Create Task
**POST** `/tasks`

Create a new task in the system.

**Authorization:** ADMIN only

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication to the API",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "projectId": "uuid-of-project",
  "assigneeId": "uuid-of-user"
}
```

**Field Validations:**
- `title` (required): String, max 255 characters
- `description` (optional): String
- `status` (optional): Enum - `TODO`, `IN_PROGRESS`, `DONE` (default: `TODO`)
- `priority` (optional): Enum - `LOW`, `MEDIUM`, `HIGH` (default: `MEDIUM`)
- `dueDate` (optional): ISO 8601 date string
- `projectId` (required): Valid UUID
- `assigneeId` (required): Valid UUID

**Success Response (201 Created):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "projectId": "uuid-of-project",
    "assigneeId": "uuid-of-user",
    "createdAt": "2025-12-14T03:20:28.000Z",
    "updatedAt": "2025-12-14T03:20:28.000Z",
    "project": {
      "id": "uuid-of-project",
      "name": "Authentication Module"
    },
    "assignee": {
      "id": "uuid-of-user",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Authorization header is missing"
}
```

**403 Forbidden (Non-Admin):**
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource."
}
```

**404 Not Found (Invalid Project/User):**
```json
{
  "statusCode": 404,
  "message": "Project with ID uuid-of-project not found"
}
```

**400 Bad Request (Validation Error):**
```json
{
  "statusCode": 400,
  "message": [
    "Task title is required",
    "Project ID must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

---

### 2. Get All Tasks
**GET** `/tasks`

Retrieve all tasks. Response is filtered based on user role.

**Authorization:** ADMIN or USER

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Behavior:**
- **ADMIN:** Returns all tasks in the system
- **USER:** Returns only tasks assigned to the user

**Success Response (200 OK):**
```json
{
  "message": "Tasks fetched successfully",
  "count": 2,
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication to the API",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-12-31T23:59:59.000Z",
      "projectId": "uuid-of-project",
      "assigneeId": "uuid-of-user",
      "createdAt": "2025-12-14T03:20:28.000Z",
      "updatedAt": "2025-12-14T03:20:28.000Z",
      "project": {
        "id": "uuid-of-project",
        "name": "Authentication Module"
      },
      "assignee": {
        "id": "uuid-of-user",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Design database schema",
      "description": "Create Prisma schema for all entities",
      "status": "DONE",
      "priority": "MEDIUM",
      "dueDate": null,
      "projectId": "uuid-of-project-2",
      "assigneeId": "uuid-of-user",
      "createdAt": "2025-12-13T10:15:00.000Z",
      "updatedAt": "2025-12-14T02:30:00.000Z",
      "project": {
        "id": "uuid-of-project-2",
        "name": "Database Design"
      },
      "assignee": {
        "id": "uuid-of-user",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

---

### 3. Get Task by ID
**GET** `/tasks/:id`

Retrieve a specific task by its ID.

**Authorization:** ADMIN or USER (can only view assigned tasks)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: UUID of the task

**Success Response (200 OK):**
```json
{
  "message": "Task fetched successfully",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "projectId": "uuid-of-project",
    "assigneeId": "uuid-of-user",
    "createdAt": "2025-12-14T03:20:28.000Z",
    "updatedAt": "2025-12-14T03:20:28.000Z",
    "project": {
      "id": "uuid-of-project",
      "name": "Authentication Module",
      "description": "Implement authentication and authorization"
    },
    "assignee": {
      "id": "uuid-of-user",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },

  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**403 Forbidden (USER trying to view non-assigned task):**
```json
{
  "statusCode": 403,
  "message": "You can only view tasks assigned to you"
}
```

---

### 4. Update Task
**PUT** `/tasks/:id`

Update an existing task.

**Authorization:** 
- ADMIN: Can update any task
- USER: Can only update assigned tasks

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: UUID of the task

**Request Body (all fields optional):**
```json
{
  "title": "Implement OAuth authentication",
  "description": "Add OAuth 2.0 support",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

**Field Validations:**
- `title` (optional): String, max 255 characters
- `description` (optional): String
- `status` (optional): Enum - `TODO`, `IN_PROGRESS`, `DONE`
- `priority` (optional): Enum - `LOW`, `MEDIUM`, `HIGH`
- `dueDate` (optional): ISO 8601 date string

**Success Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement OAuth authentication",
    "description": "Add OAuth 2.0 support",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-12-25T23:59:59.000Z",
    "projectId": "uuid-of-project",
    "assigneeId": "uuid-of-user",
    "createdAt": "2025-12-14T03:20:28.000Z",
    "updatedAt": "2025-12-14T08:45:00.000Z",
    "project": {
      "id": "uuid-of-project",
      "name": "Authentication Module"
    },
    "assignee": {
      "id": "uuid-of-user",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**403 Forbidden (USER trying to update non-assigned task):**
```json
{
  "statusCode": 403,
  "message": "You can only update tasks assigned to you"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "Status must be one of: TODO, IN_PROGRESS, DONE"
  ],
  "error": "Bad Request"
}
```

---

### 5. Delete Task
**DELETE** `/tasks/:id`

Delete a task permanently.

**Authorization:** ADMIN only

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: UUID of the task

**Success Response (200 OK):**
```json
{
  "message": "Task deleted successfully",
  "taskId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**403 Forbidden (Non-Admin):**
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource."
}
```

---

## Task Status Workflow

Tasks follow a simple workflow:

```
TODO → IN_PROGRESS → DONE
```

- **TODO**: Task is planned but not started
- **IN_PROGRESS**: Task is actively being worked on
- **DONE**: Task is completed

## Task Priority Levels

- **LOW**: Non-urgent tasks
- **MEDIUM**: Standard priority (default)
- **HIGH**: Urgent, important tasks



## Testing with cURL

### Create Task (Admin)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup CI/CD pipeline",
    "description": "Configure GitHub Actions for automated testing",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "projectId": "your-project-uuid",
    "assigneeId": "your-user-uuid"
  }'
```

### Get All Tasks
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Task by ID
```bash
curl -X GET http://localhost:3000/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Task
```bash
curl -X PUT http://localhost:3000/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }'
```

### Delete Task (Admin)
```bash
curl -X DELETE http://localhost:3000/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Notes

1. **Task Assignment**: Tasks must be assigned to a valid user during creation
2. **Project Association**: Tasks must belong to an existing project
3. **Cascading Deletes**: When a project is deleted, all associated tasks are deleted
4. **Restrict Deletes**: When a user is deleted, tasks assigned to them cannot be deleted (will throw an error)
5. **Automatic Timestamps**: `createdAt` and `updatedAt` are managed automatically

