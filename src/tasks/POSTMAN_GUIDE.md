# Tasks API - Postman Testing Guide

This guide will help you test the Tasks API endpoints using Postman.

## Prerequisites

1. **Postman** installed (or use Postman web)
2. **Server running** at `http://localhost:3000`
3. **Valid JWT tokens** for ADMIN and USER roles

## Getting JWT Tokens

Before testing tasks endpoints, you need to authenticate and get JWT tokens.

### 1. Login as ADMIN
```
POST http://localhost:3000/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Copy the token** - this is your `ADMIN_TOKEN`

### 2. Login as USER
```
POST http://localhost:3000/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Copy the token** - this is your `USER_TOKEN`

---

## Setting Up Postman

### Create Environment Variables

1. Click on **Environment** (top right)
2. Create a new environment called "Nexus Dev"
3. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `adminToken` | *paste your admin token* | *paste your admin token* |
| `userToken` | *paste your user token* | *paste your user token* |

4. **Save** and select "Nexus Dev" as active environment

---

## Testing Tasks Endpoints

### Test 1: Create Task (ADMIN Only)

**Request:**
```
POST {{baseUrl}}/tasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body (raw JSON):
{
  "title": "Implement user dashboard",
  "description": "Create a dashboard showing user statistics and recent activity",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "projectId": "YOUR_PROJECT_ID",
  "assigneeId": "YOUR_USER_ID"
}
```

**Important:** Replace `YOUR_PROJECT_ID` and `YOUR_USER_ID` with actual UUIDs from your database.

**Expected Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "generated-uuid",
    "title": "Implement user dashboard",
    "description": "Create a dashboard showing user statistics and recent activity",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "projectId": "...",
    "assigneeId": "...",
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T...",
    "project": {
      "id": "...",
      "name": "Project Name"
    },
    "assignee": {
      "id": "...",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Copy the task ID** for use in subsequent tests!

---

### Test 2: Get All Tasks (ADMIN)

**Request:**
```
GET {{baseUrl}}/tasks
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**
```json
{
  "message": "Tasks fetched successfully",
  "count": 5,
  "tasks": [
    {
      "id": "...",
      "title": "Task 1",
      "status": "TODO",
      "priority": "HIGH",
      ...
    },
    ...
  ]
}
```

**Note:** ADMIN sees ALL tasks in the system.

---

### Test 3: Get All Tasks (USER)

**Request:**
```
GET {{baseUrl}}/tasks
Authorization: Bearer {{userToken}}
```

**Expected Response (200):**
```json
{
  "message": "Tasks fetched successfully",
  "count": 2,
  "tasks": [
    {
      "id": "...",
      "title": "My Task 1",
      ...
    },
    ...
  ]
}
```

**Note:** USER only sees tasks assigned to them.

---

### Test 4: Get Task by ID (Assigned User)

**Request:**
```
GET {{baseUrl}}/tasks/YOUR_TASK_ID
Authorization: Bearer {{userToken}}
```

Replace `YOUR_TASK_ID` with an actual task ID.

**Expected Response (200):**
```json
{
  "message": "Task fetched successfully",
  "task": {
    "id": "...",
    "title": "...",
    "description": "...",
    "status": "TODO",
    "priority": "HIGH",
    "project": { ... },
    "assignee": { ... },
    "history": [
      {
        "id": "...",
        "taskId": "...",
        "updatedById": "...",
        "oldStatus": null,
        "newStatus": "TODO",
        "oldPriority": null,
        "newPriority": "HIGH",
        "timestamp": "...",
        "updatedBy": {
          "id": "...",
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

**Note:** Includes full task history!

---

### Test 5: Get Task by ID (Non-Assigned User) - Should Fail

**Request:**
```
GET {{baseUrl}}/tasks/TASK_NOT_ASSIGNED_TO_USER
Authorization: Bearer {{userToken}}
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "You can only view tasks assigned to you"
}
```

---

### Test 6: Update Task Status (Assigned User)

**Request:**
```
PUT {{baseUrl}}/tasks/YOUR_TASK_ID
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "status": "IN_PROGRESS",
  "description": "Started working on the implementation"
}
```

**Expected Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "...",
    "title": "...",
    "status": "IN_PROGRESS",
    "description": "Started working on the implementation",
    ...
  }
}
```

**Note:** A new history entry is created automatically!

---

### Test 7: Update Task (Non-Assigned User) - Should Fail

**Request:**
```
PUT {{baseUrl}}/tasks/TASK_NOT_ASSIGNED_TO_USER
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "status": "DONE"
}
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "You can only update tasks assigned to you"
}
```

---

### Test 8: Update Task Priority (ADMIN)

**Request:**
```
PUT {{baseUrl}}/tasks/ANY_TASK_ID
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body:
{
  "priority": "LOW",
  "status": "DONE"
}
```

**Expected Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    ...
    "status": "DONE",
    "priority": "LOW",
    ...
  }
}
```

**Note:** ADMIN can update ANY task!

---

### Test 9: Delete Task (USER) - Should Fail

**Request:**
```
DELETE {{baseUrl}}/tasks/YOUR_TASK_ID
Authorization: Bearer {{userToken}}
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource."
}
```

---

### Test 10: Delete Task (ADMIN)

**Request:**
```
DELETE {{baseUrl}}/tasks/YOUR_TASK_ID
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**
```json
{
  "message": "Task deleted successfully",
  "taskId": "..."
}
```

---

## Error Testing

### Test 11: Create Task with Invalid Data

**Request:**
```
POST {{baseUrl}}/tasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body:
{
  "title": "",
  "status": "INVALID_STATUS",
  "projectId": "not-a-uuid"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": [
    "Task title is required",
    "Status must be one of: TODO, IN_PROGRESS, DONE",
    "Project ID must be a valid UUID",
    "Assignee ID is required"
  ],
  "error": "Bad Request"
}
```

---

### Test 12: Create Task with Non-Existent Project

**Request:**
```
POST {{baseUrl}}/tasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body:
{
  "title": "Test Task",
  "projectId": "00000000-0000-0000-0000-000000000000",
  "assigneeId": "00000000-0000-0000-0000-000000000000"
}
```

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "Project with ID 00000000-0000-0000-0000-000000000000 not found"
}
```

---

### Test 13: Access Without Token

**Request:**
```
GET {{baseUrl}}/tasks
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Authorization header is missing"
}
```

---

### Test 14: Access with Invalid Token

**Request:**
```
GET {{baseUrl}}/tasks
Authorization: Bearer invalid-token-here
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

---

## Postman Collection Structure

Organize your requests in folders:

```
📁 Nexus Tasks API
  📁 1. Authentication
    - Login as Admin
    - Login as User
  📁 2. Tasks - Success Cases
    - Create Task (Admin)
    - Get All Tasks (Admin)
    - Get All Tasks (User)
    - Get Task by ID
    - Update Task Status
    - Update Task Priority
    - Delete Task (Admin)
  📁 3. Tasks - Authorization Tests
    - Get Non-Assigned Task (User)
    - Update Non-Assigned Task (User)
    - Delete Task (User) - Should Fail
    - Create Task (User) - Should Fail
  📁 4. Tasks - Validation Tests
    - Create with Invalid Data
    - Create with Non-Existent Project
    - Update with Invalid Status
  📁 5. Tasks - Error Cases
    - No Authorization Header
    - Invalid Token
    - Task Not Found
```

---

## Quick Test Sequence

**Recommended testing order:**

1. ✅ Login as ADMIN → Save token
2. ✅ Login as USER → Save token
3. ✅ ADMIN: Create task assigned to USER
4. ✅ USER: View all tasks (should see the created task)
5. ✅ USER: Update task status to IN_PROGRESS
6. ✅ USER: Get task by ID (should see history with 2 entries)
7. ✅ USER: Try to delete task (should fail)
8. ✅ ADMIN: Delete task (should succeed)

---

## Tips for Postman

1. **Use Variables**: Always use `{{baseUrl}}` instead of hardcoding
2. **Save Task IDs**: After creating a task, copy the ID and save it as an environment variable
3. **Check Status Codes**: Ensure responses match expected status codes
4. **Review History**: When fetching a task, check the history array
5. **Test Permissions**: Try operations with both ADMIN and USER tokens

---

## Getting UUIDs for Testing

### Get Project IDs
```
GET {{baseUrl}}/projects
Authorization: Bearer {{adminToken}}
```

Copy a project ID from the response.

### Get User IDs
You can get user IDs from:
- The login response (user.id)
- Creating a user
- Your database directly

---

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if token is valid/expired |
| 403 Forbidden | Check if user has correct role |
| 404 Not Found | Verify UUID exists in database |
| 400 Bad Request | Check request body validation |
| Server not responding | Ensure server is running on port 3000 |

---

## Expected Workflow

```
1. ADMIN creates task for DEVELOPER
2. DEVELOPER sees task in their list
3. DEVELOPER updates status: TODO → IN_PROGRESS
4. DEVELOPER works on task
5. DEVELOPER updates status: IN_PROGRESS → DONE
6. ADMIN reviews completed task
7. ADMIN deletes or archives task
```

Each status change creates a history entry!

---

## Next Steps

After testing manually:
1. Export Postman collection
2. Create automated tests using Newman
3. Set up CI/CD with automated API tests
4. Monitor task history for audit purposes
