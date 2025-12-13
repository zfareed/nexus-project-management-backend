# Quick Testing Guide - Projects API

This guide will help you quickly test all the Projects CRUD endpoints.

## Prerequisites

1. **Server Running**: Make sure your NestJS server is running
   ```bash
   npm run start:dev
   ```

2. **Database Setup**: Ensure PostgreSQL is running and the database is migrated
   ```bash
   npm run prisma:migrate
   npm run prisma:seed    # Optional: seed test data
   ```

3. **Get Admin Token**: You need an ADMIN token to test most endpoints

## Step-by-Step Testing

### Step 1: Login as ADMIN

Get a JWT token by logging in with an admin account:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANT: Copy the `token` value - you'll need it for all subsequent requests!**

---

### Step 2: Create a Project (ADMIN Only)

Replace `YOUR_TOKEN` with the token from Step 1:

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Project Alpha\",\"description\":\"Testing project creation\",\"userIds\":[]}"
```

**Expected Response (201 Created):**
```json
{
  "id": "project-uuid",
  "name": "Test Project Alpha",
  "description": "Testing project creation",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

**⚠️ Copy the project `id` - you'll need it for Steps 4-8!**

---

### Step 3: Get All Projects

```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "project-uuid-1",
    "name": "Test Project Alpha",
    "description": "Testing project creation",
    "createdBy": { ... },
    "assignedUsers": [],
    "tasks": [],
    "taskCount": 0,
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  }
  // ... more projects
]
```

**Note:**
- As ADMIN: You see ALL projects
- As USER: You see only assigned projects

---

### Step 4: Get Single Project

Replace `PROJECT_ID` with the ID from Step 2:

```bash
curl -X GET http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "PROJECT_ID",
  "name": "Test Project Alpha",
  "description": "Testing project creation",
  "createdBy": { ... },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

### Step 5: Update Project (ADMIN Only)

```bash
curl -X PUT http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Project Name\",\"description\":\"This project has been updated\"}"
```

**Expected Response (200 OK):**
```json
{
  "id": "PROJECT_ID",
  "name": "Updated Project Name",
  "description": "This project has been updated",
  "createdBy": { ... },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..." // This should be newer
}
```

---

### Step 6: Get User IDs for Assignment

First, you need to get some user IDs to assign to the project. You can use the database or create a new user:

**Option A: Create a test user**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"Test@123\"}"
```

**Copy the user `id` from the response!**

**Option B: Check existing users** (if you have a users endpoint or use Prisma Studio):
```bash
npm run prisma:studio
# Navigate to Users table and copy a user ID
```

---

### Step 7: Assign Users to Project (ADMIN Only)

Replace `USER_ID_1` with an actual user ID:

```bash
curl -X POST http://localhost:3000/projects/PROJECT_ID/assign-users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userIds\":[\"USER_ID_1\"]}"
```

**Expected Response (200 OK):**
```json
{
  "id": "PROJECT_ID",
  "name": "Updated Project Name",
  "description": "This project has been updated",
  "createdBy": { ... },
  "assignedUsers": [
    {
      "id": "USER_ID_1",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

### Step 8: Test USER Access

Login as the user you just assigned:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser@example.com\",\"password\":\"Test@123\"}"
```

**Copy the user's token**

Now try to get all projects as USER:

```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response:**
- You should ONLY see the project you're assigned to
- Not all projects (unlike ADMIN)

Try to view the specific project:

```bash
curl -X GET http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response (200 OK):**
- You can view it because you're assigned

Try to update as USER (should fail):

```bash
curl -X PUT http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Trying to update\"}"
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions to access this resource.",
  "error": "Forbidden"
}
```

✅ **Perfect! This confirms role-based access control is working!**

---

### Step 9: Remove Users from Project (ADMIN Only)

Switch back to ADMIN token:

```bash
curl -X POST http://localhost:3000/projects/PROJECT_ID/remove-users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userIds\":[\"USER_ID_1\"]}"
```

**Expected Response (200 OK):**
```json
{
  "id": "PROJECT_ID",
  "name": "Updated Project Name",
  "description": "This project has been updated",
  "createdBy": { ... },
  "assignedUsers": [],  // Now empty!
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

### Step 10: Delete Project (ADMIN Only)

```bash
curl -X DELETE http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "message": "Project deleted successfully",
  "id": "PROJECT_ID"
}
```

Try to get the deleted project (should fail):

```bash
curl -X GET http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Project with ID PROJECT_ID not found",
  "error": "Not Found"
}
```

---

## Test Checklist

Use this checklist to verify all functionality:

### Basic CRUD
- [ ] ✅ Create project (ADMIN)
- [ ] ✅ Get all projects (ADMIN sees all)
- [ ] ✅ Get single project
- [ ] ✅ Update project (ADMIN)
- [ ] ✅ Delete project (ADMIN)

### User Assignment
- [ ] ✅ Assign users to project (ADMIN)
- [ ] ✅ Remove users from project (ADMIN)
- [ ] ✅ Create project with initial user assignments

### Access Control
- [ ] ✅ ADMIN can create projects
- [ ] ✅ USER cannot create projects (403)
- [ ] ✅ ADMIN sees all projects
- [ ] ✅ USER sees only assigned projects
- [ ] ✅ ADMIN can view any project
- [ ] ✅ USER can view assigned projects
- [ ] ✅ USER cannot view unassigned projects (403)
- [ ] ✅ ADMIN can update any project
- [ ] ✅ USER cannot update projects (403)
- [ ] ✅ ADMIN can delete any project
- [ ] ✅ USER cannot delete projects (403)

### Validation
- [ ] ✅ Create without name returns 400
- [ ] ✅ Invalid UUID returns 400
- [ ] ✅ Non-existent user IDs return 400
- [ ] ✅ Name exceeding 255 chars returns 400

### Error Handling
- [ ] ✅ Missing token returns 401
- [ ] ✅ Invalid token returns 401
- [ ] ✅ Insufficient permissions returns 403
- [ ] ✅ Non-existent project returns 404

---

## Quick Test Script (PowerShell)

Save this as `test-projects.ps1`:

```powershell
# Configuration
$baseUrl = "http://localhost:3000"
$adminEmail = "admin@example.com"
$adminPassword = "Admin@123"

# Login as admin
Write-Host "1. Logging in as ADMIN..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.token
Write-Host "   ✓ Got token: $($token.Substring(0,20))..." -ForegroundColor Green

# Create project
Write-Host "`n2. Creating project..." -ForegroundColor Cyan
$createResponse = Invoke-RestMethod -Uri "$baseUrl/projects" -Method Post `
    -Headers @{Authorization="Bearer $token"} `
    -Body (@{
        name = "Test Project $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        description = "Automated test project"
    } | ConvertTo-Json) -ContentType "application/json"

$projectId = $createResponse.id
Write-Host "   ✓ Created project: $projectId" -ForegroundColor Green

# Get all projects
Write-Host "`n3. Getting all projects..." -ForegroundColor Cyan
$projects = Invoke-RestMethod -Uri "$baseUrl/projects" `
    -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Found $($projects.Count) projects" -ForegroundColor Green

# Get single project
Write-Host "`n4. Getting project details..." -ForegroundColor Cyan
$project = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" `
    -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Project name: $($project.name)" -ForegroundColor Green

# Update project
Write-Host "`n5. Updating project..." -ForegroundColor Cyan
$updateResponse = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method Put `
    -Headers @{Authorization="Bearer $token"} `
    -Body (@{
        name = "Updated Test Project"
        description = "This project was updated via automation"
    } | ConvertTo-Json) -ContentType "application/json"
Write-Host "   ✓ Updated: $($updateResponse.name)" -ForegroundColor Green

# Delete project
Write-Host "`n6. Deleting project..." -ForegroundColor Cyan
$deleteResponse = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method Delete `
    -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ $($deleteResponse.message)" -ForegroundColor Green

Write-Host "`n✅ All tests completed successfully!" -ForegroundColor Green
```

Run it with:
```bash
.\test-projects.ps1
```

---

## Common Issues

### Issue: 401 Unauthorized
**Cause**: Invalid or expired token
**Solution**: Login again to get a fresh token

### Issue: 403 Forbidden
**Cause**: User doesn't have required role
**Solution**: Use an ADMIN account for admin-only operations

### Issue: 404 Not Found
**Cause**: Project doesn't exist or wrong ID
**Solution**: Verify the project ID is correct

### Issue: 400 Bad Request - "User IDs do not exist"
**Cause**: Trying to assign non-existent users
**Solution**: Create users first or use valid user IDs

---

## Next Steps

After verifying all endpoints work:

1. **Test edge cases**: Empty descriptions, special characters, very long names
2. **Test concurrent access**: Multiple users accessing same project
3. **Test performance**: Create many projects and measure response time
4. **Integration with frontend**: Build UI components to consume these APIs
5. **Write automated tests**: Create Jest tests for all endpoints

---

## Support

For detailed API documentation, see:
- [PROJECTS_API.md](./PROJECTS_API.md) - Complete API reference
- [README.md](./README.md) - Module overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

Happy testing! 🚀
