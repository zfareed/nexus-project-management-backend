# Tasks Module - README

## Overview

The Tasks module provides comprehensive task management functionality for the Nexus Project Management System. It implements full CRUD operations with JWT authentication and role-based authorization.

## Features

✅ **Complete CRUD Operations**
- Create tasks (Admin only)
- Read tasks (role-filtered)
- Update tasks (permission-based)
- Delete tasks (Admin only)

✅ **Role-Based Access Control**
- Admins have full control
- Users can view and update only assigned tasks

✅ **Automatic Task History Tracking**
- Status changes logged
- Priority changes logged
- Audit trail with user and timestamp

✅ **Data Validation**
- Comprehensive input validation
- UUID validation for relations
- Enum validation for status/priority

✅ **Error Handling**
- Clear error messages
- Proper HTTP status codes
- Validation feedback

## Architecture

```
tasks/
├── dto/
│   ├── create-task.dto.ts      # Task creation validation
│   ├── update-task.dto.ts      # Task update validation
│   └── index.ts                # DTO exports
├── tasks.controller.ts          # HTTP request handlers
├── tasks.service.ts             # Business logic
├── tasks.module.ts              # Module definition
├── index.ts                     # Module exports
├── TASKS_API.md                 # Full API documentation
├── QUICK_REFERENCE.md           # Quick reference guide
└── README.md                    # This file
```

## Task Model

```prisma
model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  projectId   String
  assigneeId  String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  project  Project
  assignee User
  history  TaskHistory[]
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

## Usage

### For Admins

**Create a Task:**
```typescript
POST /tasks
{
  "title": "Implement authentication",
  "description": "Add JWT auth to API",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid"
}
```

**View All Tasks:**
```typescript
GET /tasks
// Returns all tasks in the system
```

**Update Any Task:**
```typescript
PUT /tasks/:id
{
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

**Delete Any Task:**
```typescript
DELETE /tasks/:id
```

### For Regular Users

**View Assigned Tasks:**
```typescript
GET /tasks
// Returns only tasks assigned to you
```

**View Specific Task:**
```typescript
GET /tasks/:id
// Only if task is assigned to you
```

**Update Assigned Task:**
```typescript
PUT /tasks/:id
{
  "status": "IN_PROGRESS",
  "description": "Updated progress notes"
}
// Only works for tasks assigned to you
```

## Authorization Flow

1. **JWT Auth Guard**: Validates JWT token and extracts user info
2. **Roles Guard**: Checks if user has required role for endpoint
3. **Service Layer**: Performs additional permission checks based on task assignment

## Task History

The system automatically tracks changes:

```typescript
// When you create a task
{
  updatedById: "admin-id",
  oldStatus: null,
  newStatus: "TODO",
  oldPriority: null,
  newPriority: "MEDIUM",
  timestamp: "2025-12-14T03:20:28.000Z"
}

// When you update status
{
  updatedById: "user-id",
  oldStatus: "TODO",
  newStatus: "IN_PROGRESS",
  oldPriority: null,
  newPriority: "HIGH",
  timestamp: "2025-12-14T08:30:00.000Z"
}
```

## Common Scenarios

### Scenario 1: Admin Creates Task for User
```bash
# Admin creates task
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review code",
    "projectId": "project-uuid",
    "assigneeId": "developer-uuid"
  }'

# User can now see and update it
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer USER_TOKEN"
```

### Scenario 2: User Updates Their Task
```bash
# User updates task status
curl -X PUT http://localhost:3000/tasks/task-uuid \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# History is automatically created
# Old status: TODO -> New status: IN_PROGRESS
```

### Scenario 3: User Tries to Access Non-Assigned Task
```bash
# User tries to view task assigned to someone else
curl -X GET http://localhost:3000/tasks/other-task-uuid \
  -H "Authorization: Bearer USER_TOKEN"

# Response: 403 Forbidden
# "You can only view tasks assigned to you"
```

## Integration with Projects

Tasks are tightly coupled with projects:

1. **Task Creation**: Must reference an existing project
2. **Project Deletion**: Cascades to delete all tasks
3. **Task Assignment**: Users should typically be assigned to the project first

## Integration with Users

Tasks track the assignee:

1. **User Assignment**: Task must be assigned to a valid user
2. **User Deletion**: Restricted if user has assigned tasks (to prevent orphaned tasks)
3. **User Permissions**: Regular users can only manage their assigned tasks

## Error Handling

The module provides clear error messages:

| Status | Scenario | Example Message |
|--------|----------|-----------------|
| 400 | Validation error | "Task title is required" |
| 401 | Missing auth | "Authorization header is missing" |
| 403 | Insufficient permissions | "You can only update tasks assigned to you" |
| 404 | Task not found | "Task with ID xxx not found" |
| 404 | Project not found | "Project with ID xxx not found" |

## Best Practices

1. **Always validate UUIDs** before making requests
2. **Use appropriate status transitions** (TODO → IN_PROGRESS → DONE)
3. **Set realistic due dates** in ISO 8601 format
4. **Assign tasks to project members** for better organization
5. **Check user permissions** before attempting operations
6. **Monitor task history** for audit purposes

## Testing

See `TASKS_API.md` for detailed cURL examples and response formats.

## Documentation Files

- **TASKS_API.md**: Complete API reference with examples
- **QUICK_REFERENCE.md**: At-a-glance endpoint and permission reference
- **README.md**: This overview document

## Related Modules

- **Auth Module**: Provides JWT authentication
- **Projects Module**: Projects contain tasks
- **Prisma Module**: Database access layer
