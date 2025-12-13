# Tasks Module - Quick Reference

## Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/tasks` | ✅ | ADMIN | Create a new task |
| GET | `/tasks` | ✅ | ALL | Get all tasks (filtered by role) |
| GET | `/tasks/:id` | ✅ | ALL | Get task by ID |
| PUT | `/tasks/:id` | ✅ | ALL | Update task (permission-based) |
| DELETE | `/tasks/:id` | ✅ | ADMIN | Delete task |

## Access Control Matrix

| Operation | ADMIN | USER (Assigned) | USER (Not Assigned) |
|-----------|-------|-----------------|---------------------|
| Create | ✅ | ❌ | ❌ |
| View All | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ❌ |
| Update Any | ✅ | ❌ | ❌ |
| Update Own | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |

## Task Fields

```typescript
{
  id: string;              // Auto-generated UUID
  title: string;           // Required, max 255 chars
  description?: string;    // Optional
  status: TaskStatus;      // TODO | IN_PROGRESS | DONE (default: TODO)
  priority: TaskPriority;  // LOW | MEDIUM | HIGH (default: MEDIUM)
  dueDate?: Date;          // Optional
  projectId: string;       // Required, must exist
  assigneeId: string;      // Required, must exist
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}
```

## Quick Examples

### Create Task
```bash
POST /tasks
{
  "title": "Fix bug in login",
  "status": "TODO",
  "priority": "HIGH",
  "projectId": "uuid",
  "assigneeId": "uuid"
}
```

### Update Task Status
```bash
PUT /tasks/:id
{
  "status": "IN_PROGRESS"
}
```

## Key Features

1. **Auto Task History**: Status/priority changes are automatically logged
2. **Role-Based Access**: Different permissions for ADMIN vs USER
3. **Data Validation**: Comprehensive input validation with helpful error messages
4. **Relations**: Tasks link to projects and users
5. **Cascading Deletes**: Deleting a project removes its tasks
6. **Protected Assignee**: Cannot delete users with assigned tasks

## Common Responses

**Success (201/200):**
```json
{
  "message": "Task created successfully",
  "task": { /* task data */ }
}
```

**Error (400):**
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

**Error (403):**
```json
{
  "statusCode": 403,
  "message": "You can only update tasks assigned to you"
}
```

**Error (404):**
```json
{
  "statusCode": 404,
  "message": "Task with ID xxx not found"
}
```
