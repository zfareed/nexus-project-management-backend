# Projects Module - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Start server
npm run start:dev

# 2. Login
POST /auth/login
{"email": "admin@example.com", "password": "Admin@123"}

# 3. Use token in all requests
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 Endpoints Summary

| Endpoint | Method | Auth | Description | 
|----------|--------|------|-------------|
| `/projects` | POST | ADMIN | Create project |
| `/projects` | GET | ALL | List projects |
| `/projects/:id` | GET | ALL | Get project |
| `/projects/:id` | PUT | ADMIN | Update project |
| `/projects/:id` | DELETE | ADMIN | Delete project |
| `/projects/:id/assign-users` | POST | ADMIN | Assign users |
| `/projects/:id/remove-users` | POST | ADMIN | Remove users |

## 🔑 Access Control

### ADMIN Can:
✅ Create, update, delete projects  
✅ View all projects  
✅ Assign/remove users  

### USER Can:
✅ View assigned projects only  
❌ Cannot create/update/delete  
❌ Cannot assign users  

## 📦 Request Examples

### Create Project
```json
POST /projects
{
  "name": "Project Alpha",
  "description": "Optional description",
  "userIds": ["uuid1", "uuid2"]  // Optional
}
```

### Update Project
```json
PUT /projects/:id
{
  "name": "New Name",              // Optional
  "description": "New description", // Optional
  "userIds": ["uuid1"]             // Optional, replaces all
}
```

### Assign Users
```json
POST /projects/:id/assign-users
{
  "userIds": ["uuid1", "uuid2"]  // Required, adds only
}
```

### Remove Users
```json
POST /projects/:id/remove-users
{
  "userIds": ["uuid1"]  // Required
}
```

## 📤 Response Format

```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Description",
  "createdBy": {
    "id": "uuid",
    "name": "User Name",
    "email": "email@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "email@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

## ⚠️ Common Errors

| Code | Error | Reason |
|------|-------|--------|
| 400 | Bad Request | Invalid input/validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Project doesn't exist |

## ✅ Validation Rules

### name
- ✅ Required  
- ✅ String  
- ✅ Max 255 characters  

### description
- ✅ Optional  
- ✅ String  

### userIds
- ✅ Optional (create/update)  
- ✅ Required (assign/remove)  
- ✅ Must be array of valid UUIDs  
- ✅ Users must exist in database  

## 🧪 Quick Test

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' \
  | jq -r '.token')

# Create
PROJECT_ID=$(curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Testing"}' \
  | jq -r '.id')

# Get all
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN"

# Update
curl -X PUT http://localhost:3000/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete
curl -X DELETE http://localhost:3000/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Documentation

- **[README.md](./README.md)** - Getting started guide
- **[PROJECTS_API.md](./PROJECTS_API.md)** - Complete API reference
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 🛠️ File Structure

```
src/projects/
├── dto/                          # Data Transfer Objects
│   ├── create-project.dto.ts
│   ├── update-project.dto.ts
│   ├── assign-users.dto.ts
│   └── index.ts
├── projects.controller.ts        # HTTP handlers
├── projects.service.ts           # Business logic
├── projects.module.ts            # Module definition
└── index.ts                      # Exports
```

## 🔐 Security Features

✅ JWT authentication on all routes  
✅ Role-based authorization  
✅ Input validation (class-validator)  
✅ SQL injection protection (Prisma ORM)  
✅ Access control (users can't view unassigned projects)  
✅ Secure error messages (no data leakage)  

## 🎯 Key Features

- Complete CRUD operations
- Role-based access control (ADMIN/USER)
- User assignment management
- Flexible user assignment (create, update, assign, remove)
- Cascade delete (removes tasks and assignments)
- Comprehensive error handling
- Detailed logging
- Full input validation

## 💡 Tips

1. **Always include Authorization header** with Bearer token
2. **ADMIN role** required for create/update/delete/assign operations
3. **userIds in update** replaces ALL assignments
4. **assign-users endpoint** adds without removing existing
5. **USERs only see assigned projects** in GET /projects
6. **Delete cascades** - removes all tasks and user assignments

## 🚨 Troubleshooting

### Can't create project
→ Ensure you're logged in as ADMIN

### Can't see project in list
→ As USER, you must be assigned to the project

### 400: User IDs do not exist
→ Create users first or verify UUIDs are correct

### 401: Token expired
→ Login again to get a fresh token

### 403: Access denied
→ Operation requires ADMIN role

## 📊 Database Schema

```
projects
├── id (UUID, PK)
├── name (String)
├── description (Text, nullable)
├── created_by_id (UUID, FK → users)
├── created_at (DateTime)
└── updated_at (DateTime)

project_users
├── project_id (UUID, FK → projects)
├── user_id (UUID, FK → users)
└── PK: [project_id, user_id]
```

## 🔄 Typical Workflow

1. **ADMIN creates project**
   ```
   POST /projects {"name": "New Project"}
   ```

2. **ADMIN assigns users**
   ```
   POST /projects/:id/assign-users {"userIds": ["uuid"]}
   ```

3. **USER views assigned projects**
   ```
   GET /projects (only sees assigned)
   ```

4. **USER views project details**
   ```
   GET /projects/:id (if assigned)
   ```

5. **ADMIN updates project**
   ```
   PUT /projects/:id {"name": "Updated"}
   ```

6. **ADMIN deletes when done**
   ```
   DELETE /projects/:id
   ```

## 🎓 Learning Resources

- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **JWT Docs**: https://jwt.io
- **class-validator**: https://github.com/typestack/class-validator

---

**Need help?** Check the full documentation in the files listed above!

**Ready to test?** See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for step-by-step instructions.

**Want to understand the design?** Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system diagrams.
