# Postman Testing Guide - Projects API

This guide shows you exactly how to test all Projects endpoints using Postman.

## 🚀 Quick Setup

### Step 1: Open Postman

1. Open Postman application
2. Create a new Collection named "Nexus Projects API"
3. Set the base URL variable

**Collection Variables:**
- Variable: `baseUrl`
- Value: `http://localhost:3000`

---

## 📋 Testing Flow

### TEST 1: Login as ADMIN (Get JWT Token)

This is the **FIRST** step - you need the token for all other requests!

**Request Setup:**
```
Method: POST
URL: {{baseUrl}}/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "some-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANT: Copy the `token` value!**

**Postman Automation (Optional):**
Go to the "Tests" tab and add this script to automatically save the token:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("authToken", response.token);
    console.log("Token saved:", response.token);
}
```

---

### TEST 2: Create a Project (ADMIN Only)

**Request Setup:**
```
Method: POST
URL: {{baseUrl}}/projects
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Note:** If you didn't use the automation script, replace `{{authToken}}` with your actual token

**Body (raw JSON):**
```json
{
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website"
}
```

**Or with user assignments:**
```json
{
  "name": "Mobile App Development",
  "description": "iOS and Android app development",
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T03:00:00.000Z",
  "updatedAt": "2025-12-14T03:00:00.000Z"
}
```

**Postman Automation (Save Project ID):**
In "Tests" tab:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("projectId", response.id);
    console.log("Project ID saved:", response.id);
}
```

---

### TEST 3: Get All Projects

**Request Setup:**
```
Method: GET
URL: {{baseUrl}}/projects
```

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**No Body needed**

**Expected Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Website Redesign Project",
    "description": "Complete redesign of company website",
    "createdBy": {
      "id": "admin-uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignedUsers": [],
    "tasks": [],
    "taskCount": 0,
    "createdAt": "2025-12-14T03:00:00.000Z",
    "updatedAt": "2025-12-14T03:00:00.000Z"
  }
  // ... more projects
]
```

**Note:** 
- ADMINs see ALL projects
- USERs see only assigned projects

---

### TEST 4: Get Single Project

**Request Setup:**
```
Method: GET
URL: {{baseUrl}}/projects/{{projectId}}
```

**Note:** Replace `{{projectId}}` with actual project ID or use the saved variable

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**No Body needed**

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T03:00:00.000Z",
  "updatedAt": "2025-12-14T03:00:00.000Z"
}
```

---

### TEST 5: Update Project (ADMIN Only)

**Request Setup:**
```
Method: PUT
URL: {{baseUrl}}/projects/{{projectId}}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Body (raw JSON):**
```json
{
  "name": "Website Redesign Project - Updated",
  "description": "Complete redesign with new branding guidelines"
}
```

**Or update just the name:**
```json
{
  "name": "New Project Name"
}
```

**Or update with user assignments:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "userIds": ["user-uuid-1"]
}
```

**Note:** When you include `userIds`, it **replaces ALL** existing user assignments

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign Project - Updated",
  "description": "Complete redesign with new branding guidelines",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T03:00:00.000Z",
  "updatedAt": "2025-12-14T03:15:00.000Z"  // Updated timestamp
}
```

---

### TEST 6: Assign Users to Project (ADMIN Only)

**First, you need a User ID. Create a test user:**

**Create Test User:**
```
Method: POST
URL: {{baseUrl}}/auth/register

Headers:
Content-Type: application/json

Body:
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test@123"
}
```

**Copy the user ID from the response!**

**Now Assign User to Project:**

**Request Setup:**
```
Method: POST
URL: {{baseUrl}}/projects/{{projectId}}/assign-users
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Body (raw JSON):**
```json
{
  "userIds": ["paste-user-id-here"]
}
```

**Or assign multiple users:**
```json
{
  "userIds": [
    "user-uuid-1",
    "user-uuid-2",
    "user-uuid-3"
  ]
}
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign Project - Updated",
  "description": "Complete redesign with new branding guidelines",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [
    {
      "id": "user-uuid",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "USER"
    }
  ],
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T03:00:00.000Z",
  "updatedAt": "2025-12-14T03:00:00.000Z"
}
```

---

### TEST 7: Test USER Access (Role-Based Access Control)

**Login as the test user:**

**Request Setup:**
```
Method: POST
URL: {{baseUrl}}/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "testuser@example.com",
  "password": "Test@123"
}
```

**Save the user's token in Tests tab:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("userToken", response.token);
}
```

**Now test GET all projects as USER:**

```
Method: GET
URL: {{baseUrl}}/projects

Headers:
Authorization: Bearer {{userToken}}
```

**Expected:** You'll only see the project you're assigned to!

**Try to create a project as USER (should fail):**

```
Method: POST
URL: {{baseUrl}}/projects

Headers:
Content-Type: application/json
Authorization: Bearer {{userToken}}

Body:
{
  "name": "This should fail",
  "description": "USER cannot create projects"
}
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

### TEST 8: Remove Users from Project (ADMIN Only)

**Switch back to ADMIN token!**

**Request Setup:**
```
Method: POST
URL: {{baseUrl}}/projects/{{projectId}}/remove-users
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Body (raw JSON):**
```json
{
  "userIds": ["user-uuid-to-remove"]
}
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign Project - Updated",
  "description": "Complete redesign with new branding guidelines",
  "createdBy": {
    "id": "admin-uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "assignedUsers": [],  // Now empty!
  "tasks": [],
  "taskCount": 0,
  "createdAt": "2025-12-14T03:00:00.000Z",
  "updatedAt": "2025-12-14T03:00:00.000Z"
}
```

---

### TEST 9: Delete Project (ADMIN Only)

**Request Setup:**
```
Method: DELETE
URL: {{baseUrl}}/projects/{{projectId}}
```

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**No Body needed**

**Expected Response (200 OK):**
```json
{
  "message": "Project deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Verify deletion - try to get the deleted project:**
```
Method: GET
URL: {{baseUrl}}/projects/{{projectId}}

Headers:
Authorization: Bearer {{authToken}}
```

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Project with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

---

## 🎯 Postman Collection Setup Guide

### Create a Complete Collection

1. **Create New Collection**: "Nexus Projects API"

2. **Add Collection Variables:**
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: (will be auto-filled by login)
   - `userToken`: (will be auto-filled by user login)
   - `projectId`: (will be auto-filled after creating project)

3. **Create Folders:**
   - Authentication
   - Projects - CRUD
   - Projects - User Management
   - Projects - Testing Access Control

4. **Add Requests:**

**Authentication Folder:**
- Login as Admin
- Login as User
- Register User

**Projects - CRUD Folder:**
- Create Project
- Get All Projects
- Get Project by ID
- Update Project
- Delete Project

**Projects - User Management Folder:**
- Assign Users to Project
- Remove Users from Project

**Projects - Testing Access Control Folder:**
- USER: Get All Projects (Limited)
- USER: Try to Create Project (Should Fail)
- USER: Try to Update Project (Should Fail)

---

## 🔧 Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Problem:** Getting 401 error on requests

**Solution:**
1. Check if token is included in Authorization header
2. Verify format: `Bearer YOUR_TOKEN` (with space after Bearer)
3. Token might be expired - login again to get fresh token

**In Postman:**
- Go to Headers tab
- Add: `Authorization` = `Bearer {{authToken}}`
- Make sure there's a space between "Bearer" and the token

### Issue 2: 403 Forbidden

**Problem:** Getting 403 error even with valid token

**Solution:**
- You're probably trying an ADMIN-only operation with a USER token
- Check the endpoint permissions (see Quick Reference below)
- Use ADMIN token for create/update/delete operations

### Issue 3: 404 Not Found

**Problem:** Project not found

**Solution:**
1. Verify the project ID is correct
2. Check if project was already deleted
3. Make sure you're using the correct `{{projectId}}` variable

### Issue 4: 400 Bad Request - Validation Error

**Problem:** Getting validation errors

**Solution:**
- Check the request body matches the expected format
- Ensure all required fields are present
- Verify userIds are valid UUID format
- Check that users exist in database before assigning

---

## 📊 Quick Reference

### Endpoints & Required Roles

| Endpoint | Method | ADMIN | USER |
|----------|--------|-------|------|
| `/projects` | POST | ✅ | ❌ |
| `/projects` | GET | ✅ (all) | ✅ (assigned only) |
| `/projects/:id` | GET | ✅ (any) | ✅ (if assigned) |
| `/projects/:id` | PUT | ✅ | ❌ |
| `/projects/:id` | DELETE | ✅ | ❌ |
| `/projects/:id/assign-users` | POST | ✅ | ❌ |
| `/projects/:id/remove-users` | POST | ✅ | ❌ |

### Required Headers

**All requests need:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**POST/PUT requests also need:**
```
Content-Type: application/json
```

---

## 🚀 Quick Test Sequence

**5-Minute Complete Test:**

1. ✅ Login as ADMIN → Save token
2. ✅ Create Project → Save project ID
3. ✅ Get all projects → Verify your project is listed
4. ✅ Get single project → Check details
5. ✅ Update project → Change name/description
6. ✅ Create test user → Save user ID
7. ✅ Assign user to project → Verify in response
8. ✅ Login as USER → Save user token
9. ✅ Get all projects as USER → Should only see assigned project
10. ✅ Try to create project as USER → Should fail (403)
11. ✅ Switch back to ADMIN token
12. ✅ Remove user from project → Verify removed
13. ✅ Delete project → Verify 404 on next GET

---

## 💡 Pro Tips

1. **Use Environment Variables**: Store tokens as collection/environment variables for easy switching

2. **Add Test Scripts**: Automate token saving and validation
   ```javascript
   // In Tests tab
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.token).to.exist;
   });
   ```

3. **Pre-request Scripts**: Auto-refresh expired tokens

4. **Organize Collections**: Use folders to group related requests

5. **Save Examples**: Save successful responses as examples for documentation

---

## 📝 Sample Postman Environment

Create an environment named "Nexus - Local" with these variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "adminEmail": "admin@example.com",
  "adminPassword": "Admin@123",
  "testUserEmail": "testuser@example.com",
  "testUserPassword": "Test@123",
  "authToken": "",
  "userToken": "",
  "projectId": ""
}
```

---

## 🎓 Learning Path

**Day 1:** Basic CRUD
- Login
- Create project
- Get projects
- Update project
- Delete project

**Day 2:** User Management
- Create users
- Assign users to projects
- Remove users from projects

**Day 3:** Access Control
- Test ADMIN vs USER permissions
- Verify role-based filtering
- Test forbidden operations

---

**Need more help?** 
- See [PROJECTS_API.md](./PROJECTS_API.md) for detailed API documentation
- See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick lookup
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for cURL examples

Happy testing! 🚀
