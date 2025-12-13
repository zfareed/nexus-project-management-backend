# Projects Module

This module provides complete CRUD functionality for managing projects in the Nexus Project Management System.

## Features

✅ **Complete CRUD Operations**
- Create new projects
- Get all projects (with role-based filtering)
- Get single project by ID
- Update existing projects
- Delete projects

✅ **User Assignment Management**
- Assign users during project creation
- Assign additional users to existing projects
- Remove users from projects
- Replace all user assignments

✅ **JWT Authentication**
- All endpoints protected with JWT authentication
- Token validation and verification

✅ **Role-Based Authorization**
- **ADMIN**: Full access to all operations and all projects
- **USER**: Can only view projects they're assigned to

✅ **Comprehensive Error Handling**
- Input validation
- User existence checks
- Access control validation
- Detailed error messages

## File Structure

```
src/projects/
├── dto/
│   ├── create-project.dto.ts    # DTO for creating projects
│   ├── update-project.dto.ts    # DTO for updating projects
│   ├── assign-users.dto.ts      # DTO for user assignment
│   └── index.ts                 # DTO exports
├── projects.controller.ts       # HTTP request handlers
├── projects.service.ts          # Business logic
├── projects.module.ts           # Module definition
├── index.ts                     # Module exports
├── PROJECTS_API.md             # API documentation
└── README.md                    # This file
```

## Quick Start

### 1. Import the Module

The module is already registered in `app.module.ts`:

```typescript
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    // ... other modules
    ProjectsModule,
  ],
})
export class AppModule { }
```

### 2. Authentication Required

All endpoints require a valid JWT token. Get one by logging in:

```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

### 3. Use the Token

Include the token in all project requests:

```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Available Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects` | ADMIN | Create a new project |
| GET | `/projects` | ALL | Get all projects (filtered by role) |
| GET | `/projects/:id` | ALL | Get a specific project |
| PUT | `/projects/:id` | ADMIN | Update a project |
| DELETE | `/projects/:id` | ADMIN | Delete a project |
| POST | `/projects/:id/assign-users` | ADMIN | Assign users to a project |
| POST | `/projects/:id/remove-users` | ADMIN | Remove users from a project |

## Usage Examples

### Create a Project

```bash
POST /projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

### Get All Projects

```bash
GET /projects
Authorization: Bearer YOUR_JWT_TOKEN
```

**Behavior:**
- **ADMIN users**: Returns all projects in the system
- **USER role**: Returns only projects they're assigned to

### Get Project by ID

```bash
GET /projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_JWT_TOKEN
```

**Behavior:**
- **ADMIN users**: Can view any project
- **USER role**: Can only view projects they're assigned to (403 otherwise)

### Update a Project

```bash
PUT /projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "userIds": ["user-uuid-1"]  // Replaces ALL existing assignments
}
```

### Delete a Project

```bash
DELETE /projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note:** This cascades and deletes all associated tasks and user assignments.

### Assign Users

```bash
POST /projects/550e8400-e29b-41d4-a716-446655440000/assign-users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

**Note:** Adds users without affecting existing assignments.

### Remove Users

```bash
POST /projects/550e8400-e29b-41d4-a716-446655440000/remove-users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "userIds": ["user-uuid-1"]
}
```

## Response Format

All successful responses return a project object:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Project Alpha",
  "description": "A comprehensive project management system",
  "createdBy": {
    "id": "user-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T02:43:45.123Z",
  "updatedAt": "2025-12-14T02:43:45.123Z"
}
```

## Validation Rules

### CreateProjectDto
- `name`: Required, string, max 255 characters
- `description`: Optional, string
- `userIds`: Optional, array of valid UUIDs

### UpdateProjectDto
- `name`: Optional, string, max 255 characters
- `description`: Optional, string
- `userIds`: Optional, array of valid UUIDs (replaces all)

### AssignUsersDto
- `userIds`: Required, non-empty array of valid UUIDs

## Access Control

### ADMIN Role
- ✅ Can create projects
- ✅ Can view all projects
- ✅ Can update any project
- ✅ Can delete any project
- ✅ Can assign/remove users to/from any project

### USER Role
- ❌ Cannot create projects
- ✅ Can view only assigned projects
- ✅ Can view details of assigned projects
- ❌ Cannot update projects
- ❌ Cannot delete projects
- ❌ Cannot assign/remove users

## Error Handling

The module provides detailed error responses:

```json
{
  "statusCode": 400,
  "message": "Error description or validation errors array",
  "error": "Bad Request"
}
```

Common status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found

## Dependencies

- **PrismaModule**: Database operations
- **AuthModule**: Authentication and authorization
- `class-validator`: DTO validation
- `class-transformer`: Request transformation

## Database Schema

The projects module uses the Prisma schema:

```prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  createdById String   @map("created_by_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  createdBy User           @relation("ProjectCreator", fields: [createdById], references: [id], onDelete: Cascade)
  tasks     Task[]
  users     ProjectUsers[]

  @@map("projects")
}

model ProjectUsers {
  projectId String @map("project_id")
  userId    String @map("user_id")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([projectId, userId])
  @@map("project_users")
}
```

## Testing

For detailed API testing instructions and examples, see [PROJECTS_API.md](./PROJECTS_API.md).

## Logging

The module includes comprehensive logging:
- Project creation/updates/deletions
- User assignment operations
- Error conditions
- Access control violations

All logs are tagged with `ProjectsController` or `ProjectsService` for easy filtering.

## Future Enhancements

Potential features to add:
- [ ] Project filtering and search
- [ ] Pagination for project lists
- [ ] Project archiving (soft delete)
- [ ] Project tags/categories
- [ ] Project status tracking
- [ ] Project templates
- [ ] Bulk operations

## Documentation

- **API Reference**: See [PROJECTS_API.md](./PROJECTS_API.md) for complete API documentation
- **Schema**: See `prisma/schema.prisma` for database schema
- **Auth**: See `src/auth/README.md` for authentication details

## Support

For issues or questions about the Projects module, please refer to the main project documentation or create an issue in the repository.
