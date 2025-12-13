# Projects Module Architecture

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Request                              │
│              (HTTP Request with JWT Token)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Projects Controller                              │
│                  (projects.controller.ts)                            │
│                                                                       │
│  • POST   /projects              (Create)      [ADMIN]               │
│  • GET    /projects              (Get All)     [ALL]                 │
│  • GET    /projects/:id          (Get One)     [ALL]                 │
│  • PUT    /projects/:id          (Update)      [ADMIN]               │
│  • DELETE /projects/:id          (Delete)      [ADMIN]               │
│  • POST   /projects/:id/assign-users           [ADMIN]               │
│  • POST   /projects/:id/remove-users           [ADMIN]               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Authentication Layer                            │
│                                                                       │
│  ┌──────────────────┐           ┌─────────────────┐                 │
│  │  JwtAuthGuard    │──────────▶│  RolesGuard     │                 │
│  │  (Verify Token)  │           │  (Check Role)   │                 │
│  └──────────────────┘           └─────────────────┘                 │
│         │                                │                           │
│         │ Extracts:                      │ Validates:                │
│         │ • userId                       │ • User role = ADMIN/USER  │
│         │ • email                        │ • Required permissions    │
│         │ • role                         │                           │
└─────────┴────────────────────────────────┴───────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DTO Validation                                │
│                     (class-validator)                                │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐                 │
│  │ CreateProjectDto     │  │ UpdateProjectDto     │                 │
│  │ • name (required)    │  │ • name (optional)    │                 │
│  │ • description        │  │ • description        │                 │
│  │ • userIds[]          │  │ • userIds[]          │                 │
│  └──────────────────────┘  └──────────────────────┘                 │
│                                                                       │
│  ┌──────────────────────┐                                            │
│  │ AssignUsersDto       │                                            │
│  │ • userIds[] (req)    │                                            │
│  └──────────────────────┘                                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Projects Service                                │
│                   (projects.service.ts)                              │
│                                                                       │
│  Business Logic:                                                     │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ create(dto, userId)                                      │        │
│  │ • Validate user IDs exist                                │        │
│  │ • Create project with creator                            │        │
│  │ • Assign users if provided                               │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ findAll(userId, userRole)                                │        │
│  │ • If ADMIN: Return all projects                          │        │
│  │ • If USER: Return only assigned projects                 │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ findOne(id, userId, userRole)                            │        │
│  │ • Find project by ID                                     │        │
│  │ • If USER: Check if assigned                             │        │
│  │ • Include tasks and user details                         │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ update(id, dto)                                          │        │
│  │ • Validate project exists                                │        │
│  │ • Validate user IDs if provided                          │        │
│  │ • Replace user assignments if userIds provided           │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ remove(id)                                               │        │
│  │ • Validate project exists                                │        │
│  │ • Delete project (cascades to tasks & assignments)       │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ assignUsers(id, dto)                                     │        │
│  │ • Validate project exists                                │        │
│  │ • Validate user IDs exist                                │        │
│  │ • Add new assignments (skip duplicates)                  │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ removeUsers(id, dto)                                     │        │
│  │ • Validate project exists                                │        │
│  │ • Remove specified user assignments                      │        │
│  └─────────────────────────────────────────────────────────┘        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Prisma Service                                 │
│                     (Database Layer)                                 │
│                                                                       │
│  Database Operations:                                                │
│  • project.create()          → Insert new project                    │
│  • project.findMany()        → Get all/filtered projects             │
│  • project.findUnique()      → Get single project                    │
│  • project.update()          → Update project                        │
│  • project.delete()          → Delete project (cascade)              │
│  • projectUsers.createMany() → Assign users                          │
│  • projectUsers.deleteMany() → Remove users                          │
│  • user.findMany()           → Validate user existence               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                             │
│                                                                       │
│  Tables:                                                             │
│  • users                    (User accounts)                          │
│  • projects                 (Project data)                           │
│  • project_users            (Many-to-many: projects ↔ users)         │
│  • tasks                    (Project tasks)                          │
│  • task_history             (Task change history)                    │
└─────────────────────────────────────────────────────────────────────┘

## Access Control Matrix

┌───────────────────────┬─────────┬──────────────────────────────────┐
│ Endpoint              │ Role    │ Access Control                   │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ POST /projects        │ ADMIN   │ ✅ Can create any project        │
│                       │ USER    │ ❌ Forbidden                     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ GET /projects         │ ADMIN   │ ✅ Returns ALL projects          │
│                       │ USER    │ ✅ Returns ASSIGNED projects     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ GET /projects/:id     │ ADMIN   │ ✅ Can view ANY project          │
│                       │ USER    │ ✅ Can view ASSIGNED projects    │
│                       │         │ ❌ Forbidden if not assigned     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ PUT /projects/:id     │ ADMIN   │ ✅ Can update any project        │
│                       │ USER    │ ❌ Forbidden                     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ DELETE /projects/:id  │ ADMIN   │ ✅ Can delete any project        │
│                       │ USER    │ ❌ Forbidden                     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ POST /:id/assign      │ ADMIN   │ ✅ Can assign users              │
│                       │ USER    │ ❌ Forbidden                     │
├───────────────────────┼─────────┼──────────────────────────────────┤
│ POST /:id/remove      │ ADMIN   │ ✅ Can remove users              │
│                       │ USER    │ ❌ Forbidden                     │
└───────────────────────┴─────────┴──────────────────────────────────┘

## Data Flow Example: Create Project

1. **Client Request**
   ```json
   POST /projects
   Authorization: Bearer eyJhbGc...
   {
     "name": "Project Alpha",
     "description": "New project",
     "userIds": ["user-1-uuid", "user-2-uuid"]
   }
   ```

2. **JwtAuthGuard**
   - Extracts token from header
   - Verifies token signature and expiration
   - Attaches user data to request:
     ```javascript
     request.user = {
       userId: "admin-uuid",
       email: "admin@example.com",
       role: "ADMIN"
     }
     ```

3. **RolesGuard**
   - Checks if route requires roles: `@Roles(UserRole.ADMIN)`
   - Verifies `request.user.role === "ADMIN"`
   - ✅ Allows request / ❌ Returns 403 Forbidden

4. **DTO Validation**
   - Validates `name` is not empty and ≤ 255 chars
   - Validates `description` is optional string
   - Validates `userIds` are valid UUIDs
   - ✅ Passes validation / ❌ Returns 400 Bad Request

5. **Service Layer**
   - Checks if users in `userIds` exist in database
   - Creates project with `createdById = request.user.userId`
   - Creates `ProjectUsers` entries for each user ID
   - Returns formatted project object

6. **Response**
   ```json
   201 Created
   {
     "id": "project-uuid",
     "name": "Project Alpha",
     "description": "New project",
     "createdBy": { ... },
     "assignedUsers": [ ... ],
     "tasks": [],
     "taskCount": 0,
     "createdAt": "2025-12-14T...",
     "updatedAt": "2025-12-14T..."
   }
   ```

## Error Handling Flow

```
Request
   │
   ▼
Authentication Error? ──Yes──▶ 401 Unauthorized
   │                          "Invalid token"
   No
   │
   ▼
Authorization Error? ──Yes──▶ 403 Forbidden
   │                         "Access denied. You do not have required permissions"
   No
   │
   ▼
Validation Error? ──Yes──▶ 400 Bad Request
   │                      ["name is required", "Each user ID must be a valid UUID"]
   No
   │
   ▼
Resource Not Found? ──Yes──▶ 404 Not Found
   │                        "Project with ID ... not found"
   No
   │
   ▼
Service Error? ──Yes──▶ 400 Bad Request
   │                   "The following user IDs do not exist: ..."
   No
   │
   ▼
Success! ──▶ 200/201 with response body
```

## Module Dependencies

```
ProjectsModule
├── imports
│   ├── PrismaModule ──▶ Database access
│   └── AuthModule ──▶ Guards and decorators
├── controllers
│   └── ProjectsController ──▶ HTTP handlers
├── providers
│   └── ProjectsService ──▶ Business logic
└── exports
    └── ProjectsService ──▶ Available to other modules
```

## Database Relations

```
User (users table)
 │
 ├─── projectsCreated ──▶ Project.createdBy (1:many)
 │                       (One user creates many projects)
 │
 └─── projectsAssigned ──▶ ProjectUsers (many:many)
                          (Users assigned to multiple projects)

Project (projects table)
 │
 ├─── createdBy ──▶ User (many:1)
 │                 (Project created by one user)
 │
 ├─── users ──▶ ProjectUsers (many:many)
 │             (Project has many assigned users)
 │
 └─── tasks ──▶ Task (1:many)
               (Project has many tasks)

ProjectUsers (project_users table)
 ├─── project ──▶ Project
 └─── user ──▶ User
```

## File Organization

```
src/
├── app.module.ts              (Imports ProjectsModule)
├── projects/
│   ├── dto/
│   │   ├── create-project.dto.ts
│   │   ├── update-project.dto.ts
│   │   ├── assign-users.dto.ts
│   │   └── index.ts
│   ├── projects.controller.ts   (Route handlers)
│   ├── projects.service.ts      (Business logic)
│   ├── projects.module.ts       (Module definition)
│   ├── index.ts                 (Exports)
│   ├── README.md                (Usage guide)
│   ├── PROJECTS_API.md          (API docs)
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── ARCHITECTURE.md          (This file)
├── auth/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       └── roles.decorator.ts
└── prisma/
    └── prisma.service.ts
```
