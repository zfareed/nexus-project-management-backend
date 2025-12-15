# Database Schema - Entity Relationship Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │
│──────────────────────│
│ id (PK)              │──────┐
│ name                 │      │ createdBy (1:M)
│ email (UNIQUE)       │      │
│ password             │      │
│ role (enum)          │      ▼
│ createdAt            │  ┌──────────────────────┐
│ updatedAt            │  │     Project          │
└──────────────────────┘  │──────────────────────│
        │                 │ id (PK)              │
        │                 │ name                 │
        │                 │ description          │
        │ assignee (1:M)  │ createdById (FK)     │
        │                 │ createdAt            │
        │                 │ updatedAt            │
        │                 └──────────────────────┘
        │                         │
        │                         │ (1:M)
        │                         │
        ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│       Task           │  │   ProjectUsers       │
│──────────────────────│  │──────────────────────│
│ id (PK)              │  │ projectId (PK, FK) ──┼───┐
│ title                │  │ userId (PK, FK) ─────┼───┼──┐
│ description          │  └──────────────────────┘   │  │
│ status (enum)        │         INDEXES:            │  │
│ priority (enum)      │         - projectId         │  │
│ dueDate              │         - userId             │  │
│ projectId (FK) ──────┼─────────────────────────────┘  │
│ assigneeId (FK) ─────┼────────────────────────────────┘
│ createdAt            │
│ updatedAt            │
└──────────────────────┘

```

## Relationship Summary

### User Relationships
- **1:M** with Project (as creator) - `projectsCreated`
- **M:N** with Project (as member) - `projectsAssigned` (via ProjectUsers)
- **1:M** with Task (as assignee) - `tasksAssigned`


### Project Relationships
- **M:1** with User (creator) - `createdBy` - **CASCADE DELETE**
- **1:M** with Task - `tasks`
- **M:N** with User (members) - `users` (via ProjectUsers)

### ProjectUsers (Join Table)
- **M:1** with Project - **CASCADE DELETE**
- **M:1** with User - **CASCADE DELETE**
- **Composite PK**: [projectId, userId] - prevents duplicates

### Task Relationships
- **M:1** with Project - `project` - **CASCADE DELETE**
- **M:1** with User (assignee) - `assignee` - **RESTRICT DELETE**


## Delete Behaviors

### CASCADE (data is deleted when parent is deleted)
- Delete User → Deletes their Projects
- Delete Project → Deletes all Tasks in project
- Delete Project → Deletes all ProjectUsers entries


### RESTRICT (prevents deletion if references exist)
- Cannot delete User if they have Tasks assigned


## Enums

### UserRole
```
ADMIN  - Full system access
USER   - Standard user access
```

### TaskStatus
```
TODO        - Not started
IN_PROGRESS - Work in progress
DONE        - Completed
```

### TaskPriority
```
LOW    - Low priority
MEDIUM - Medium priority (default)
HIGH   - High priority
```

## Indexes (for Performance)

### User
- `email` (unique) - Authentication lookups

### Project
- `createdById` - Find projects by creator

### ProjectUsers
- `projectId` - Find users on a project
- `userId` - Find projects for a user
- Composite PK `[projectId, userId]`

### Task
- `projectId` - Find tasks in a project
- `assigneeId` - Find tasks for a user
- `status` - Filter by status
- `priority` - Filter by priority
- `dueDate` - Sort/filter by due date



## Data Flow Examples

### 1. Create a Project with Team
```
1. Admin creates Project
2. Admin assigns Users via ProjectUsers
3. Users can now create/view Tasks in Project
```



### 3. Delete a Project
```
1. Project is deleted
2. CASCADE → All Tasks in project deleted

4. CASCADE → All ProjectUsers entries deleted
```

### 4. Try to Delete a User
```
If user has Tasks assigned:
  ❌ RESTRICT prevents deletion
  
If user has no Tasks but created Projects:
  ✅ Projects are CASCADE deleted
     → Tasks in those projects CASCADE deleted

     → ProjectUsers CASCADE deleted
```

## Database Table Names (snake_case)

| Model        | Table Name     |
|--------------|----------------|
| User         | users          |
| Project      | projects       |
| ProjectUsers | project_users  |
| Task         | tasks          |


## Column Mapping

Prisma uses camelCase in code, snake_case in database:

| Prisma Field | Database Column  |
|--------------|------------------|
| createdAt    | created_at       |
| updatedAt    | updated_at       |
| createdById  | created_by_id    |
| assigneeId   | assignee_id      |
| projectId    | project_id       |
| userId       | user_id          |
| taskId       | task_id          |
| dueDate      | due_date         |


---

This schema provides a **solid foundation** for a project management system with:
✅ Proper relationships
✅ Data integrity via constraints
✅ Performance via indexes

✅ Flexible permissions via UserRoles
