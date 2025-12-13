# 🚀 Quick Start Guide - User Management API

## Prerequisites

✅ Server is running on `http://localhost:3000`  
✅ You have a JWT token (get one via `/auth/login`)

---

## 🎯 Quick Test Flow

### Step 1: Get Admin Token

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.com",
    "password": "Admin@123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

# Save the token
export ADMIN_TOKEN="paste_token_here"
```

### Step 2: List All Users (Admin Only)

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "users": [
    {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@nexus.com",
      "role": "ADMIN",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Step 3: Search Users

```bash
curl -X GET "http://localhost:3000/users?search=john" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Searches both name and email (case-insensitive)
```

### Step 4: Get Specific User

```bash
# Replace USER_ID with actual user ID from step 2
curl -X GET "http://localhost:3000/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Step 5: Update User (Admin)

```bash
# Admin updating user's role and name
curl -X PUT "http://localhost:3000/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "role": "ADMIN"
  }'

# Expected Response:
{
  "id": "uuid",
  "name": "John Updated",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 👤 Testing as Regular User

### Step 1: Get User Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@nexus.com",
    "password": "User@123"
  }'

export USER_TOKEN="paste_token_here"
```

### Step 2: Try to List All Users (Should Fail)

```bash
curl -X GET "http://localhost:3000/users" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 403 Forbidden
{
  "statusCode": 403,
  "message": "Access denied. You do not have the required permissions..."
}
```

### Step 3: View Own Profile (Should Succeed)

```bash
# Get your own user ID from login response, then:
curl -X GET "http://localhost:3000/users/YOUR_USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 200 OK with your profile
```

### Step 4: Try to View Another User (Should Fail)

```bash
curl -X GET "http://localhost:3000/users/OTHER_USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 403 Forbidden
{
  "statusCode": 403,
  "message": "You do not have permission to view this user profile"
}
```

### Step 5: Update Own Name (Should Succeed)

```bash
curl -X PUT "http://localhost:3000/users/YOUR_USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Name"
  }'

# Expected: 200 OK with updated profile
```

### Step 6: Try to Update Own Role (Should Fail)

```bash
curl -X PUT "http://localhost:3000/users/YOUR_USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'

# Expected: 403 Forbidden
{
  "statusCode": 403,
  "message": "Only administrators can update user roles"
}
```

---

## 🔍 Common Test Scenarios

### Pagination Test

```bash
# Get page 1 with 5 users
curl -X GET "http://localhost:3000/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get page 2
curl -X GET "http://localhost:3000/users?page=2&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Search Test

```bash
# Search by name
curl -X GET "http://localhost:3000/users?search=john" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Search by email
curl -X GET "http://localhost:3000/users?search=gmail.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Case-insensitive search
curl -X GET "http://localhost:3000/users?search=ADMIN" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Error Cases

```bash
# 1. No token
curl -X GET "http://localhost:3000/users"
# → 401 Unauthorized

# 2. Invalid token
curl -X GET "http://localhost:3000/users" \
  -H "Authorization: Bearer invalid_token"
# → 401 Unauthorized

# 3. User doesn't exist
curl -X GET "http://localhost:3000/users/non-existent-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# → 404 Not Found

# 4. Empty update
curl -X PUT "http://localhost:3000/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# → 400 Bad Request
```

---

## 📊 PowerShell Version (Windows)

If you're on Windows, use these commands:

```powershell
# Login and save token
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@nexus.com","password":"Admin@123"}'
$ADMIN_TOKEN = $response.token

# List all users
Invoke-RestMethod -Uri "http://localhost:3000/users?page=1&limit=10" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }

# Get specific user
Invoke-RestMethod -Uri "http://localhost:3000/users/USER_ID" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }

# Update user
Invoke-RestMethod -Uri "http://localhost:3000/users/USER_ID" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } `
  -Body '{"name":"Updated Name","role":"ADMIN"}'
```

---

## 🎨 Using Postman/Insomnia

### Setup

1. **Create Environment Variable**
   - Name: `base_url`
   - Value: `http://localhost:3000`

2. **Create Token Variable**
   - Name: `admin_token`
   - Initial Value: (paste token after login)

### Request Examples

**1. List Users**
```
GET {{base_url}}/users?page=1&limit=10
Headers:
  Authorization: Bearer {{admin_token}}
```

**2. Get User**
```
GET {{base_url}}/users/:id
Headers:
  Authorization: Bearer {{admin_token}}
```

**3. Update User**
```
PUT {{base_url}}/users/:id
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body (JSON):
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

---

## ✅ Verification Checklist

After implementation, verify these:

- [ ] GET /users returns paginated list (admin only)
- [ ] GET /users?search=xyz filters correctly
- [ ] GET /users/:id works for admin (any user)
- [ ] GET /users/:id works for user (own profile)
- [ ] GET /users/:id fails for user (other profile)
- [ ] PUT /users/:id allows admin to update name
- [ ] PUT /users/:id allows admin to update role
- [ ] PUT /users/:id allows user to update own name
- [ ] PUT /users/:id denies user updating role
- [ ] PUT /users/:id denies user updating others
- [ ] Passwords never appear in responses
- [ ] Invalid token returns 401
- [ ] Missing permissions return 403
- [ ] Non-existent user returns 404

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
# Rebuild the application
npm run build
```

### "User not found" error
```bash
# Check seeded users
npx prisma studio
# Or run seed script
npm run seed
```

### "Invalid token" error
```bash
# Get a fresh token
curl -X POST http://localhost:3000/auth/login ...
```

### Server not responding
```bash
# Check if server is running
npm run start:dev
```

---

## 📚 For More Details

- **Full Documentation**: `src/users/README.md`
- **API Reference**: `src/users/USERS_API.md`
- **Implementation Details**: `src/users/IMPLEMENTATION_SUMMARY.md`
- **File Structure**: `src/users/FILE_STRUCTURE.md`

---

**Ready to test!** 🎉

Start with the admin flow, then test as a regular user to see the authorization differences.
