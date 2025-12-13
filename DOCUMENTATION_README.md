# 📚 Documentation Files Overview

This directory contains comprehensive API documentation for the Nexus Project Management System.

## 📄 Documentation Files

### 1. **swagger.yaml**
- **Format:** OpenAPI 3.0 specification (YAML)
- **Purpose:** Complete API specification with all endpoints, schemas, and authentication
- **Use Cases:**
  - Import into Swagger UI for interactive documentation
  - Import into Swagger Editor for visualization
  - Use as source of truth for API contracts
  - Generate API clients using OpenAPI generators

### 2. **API_DOCUMENTATION.md**
- **Format:** Markdown guide
- **Purpose:** Human-readable API documentation with examples
- **Contents:**
  - Authentication flow
  - All endpoint descriptions
  - Request/response examples
  - Query parameters documentation
  - Error handling guide
  - Security best practices

### 3. **SWAGGER_INTEGRATION.md**
- **Format:** Markdown guide
- **Purpose:** Step-by-step guide to integrate Swagger UI into your NestJS app
- **Contents:**
  - Installation instructions
  - Configuration code
  - Controller decorator examples
  - DTO enhancement examples
  - Best practices

### 4. **Nexus_PM_API.postman_collection.json**
- **Format:** Postman Collection v2.1
- **Purpose:** Ready-to-use API testing collection
- **Features:**
  - All endpoints organized by category
  - Automatic token management
  - Collection variables for IDs
  - Pre-filled example requests
  - Test scripts for automation

## 🚀 Quick Start

### Option 1: View Documentation Online

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Click **File → Import file**
3. Upload `swagger.yaml`
4. Explore the interactive documentation

### Option 2: View Documentation Locally

```bash
# Install Swagger UI watcher
npm install -g swagger-ui-watcher

# View documentation
swagger-ui-watcher swagger.yaml

# Open browser to http://localhost:8000
```

### Option 3: Integrate with NestJS

Follow the instructions in `SWAGGER_INTEGRATION.md` to add Swagger UI directly to your NestJS application.

### Option 4: Test with Postman

1. Open Postman
2. Click **Import**
3. Select `Nexus_PM_API.postman_collection.json`
4. Update the `base_url` variable if needed
5. Start testing!

## 🔑 Authentication Setup

### For Swagger UI

1. Login or register using the `/auth/register` or `/auth/login` endpoints
2. Copy the JWT token from the response
3. Click the **"Authorize"** button (🔒 icon)
4. Enter: `Bearer <your_token>`
5. Click **Authorize**

### For Postman

1. Import the collection
2. Use the **"Register New User"** or **"Login"** request
3. The token is automatically saved to collection variables
4. All subsequent requests will use this token

## 📊 Available Endpoints

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (Protected)

### Projects (Protected)
- `POST /projects` - Create project (Admin)
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project (Admin)
- `DELETE /projects/:id` - Delete project (Admin)
- `POST /projects/:id/assign-users` - Assign users (Admin)
- `POST /projects/:id/remove-users` - Remove users (Admin)

### Tasks (Protected)
- `POST /tasks` - Create task (Admin)
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task (Admin)

### Users (Protected)
- `GET /users` - Get all users with pagination (Admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user

## 🎯 Role-Based Access

| Endpoint | ADMIN | USER |
|----------|-------|------|
| Create Project | ✅ | ❌ |
| View Projects | All | Assigned only |
| Update Project | ✅ | ❌ |
| Delete Project | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| View Tasks | All | Assigned only |
| Update Task | All | Assigned only |
| Delete Task | ✅ | ❌ |
| List Users | ✅ | ❌ |
| View User | Any user | Own profile |
| Update User | Any user | Own profile |

## 🔍 Query Parameters

### GET /users
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `search` (string) - Search by name or email

## 📝 Response Formats

### Success Response
```json
{
  "id": "uuid",
  "name": "Resource name",
  ...
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Validation Error Response
```json
{
  "statusCode": 400,
  "message": [
    "Field validation error 1",
    "Field validation error 2"
  ],
  "error": "Bad Request"
}
```

## 🌐 Environment Variables

Update Postman collection variables:
- `base_url` - API base URL (default: `http://localhost:3000`)
- `jwt_token` - JWT token (auto-set after login)
- `user_id` - Current user ID (auto-set after login)
- `project_id` - Last created project ID (auto-set)
- `task_id` - Last created task ID (auto-set)

## 💡 Tips

1. **Keep token fresh** - Tokens may expire, re-authenticate if you get 401 errors
2. **Use admin account** - Create an admin user to test all endpoints
3. **Check role permissions** - Some endpoints are admin-only
4. **Validate data** - API validates all inputs, check error messages
5. **Test error cases** - Try invalid data to see error responses

## 🛠️ Tools & Resources

### Recommended Tools
- [Postman](https://www.postman.com/) - API testing
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive documentation
- [Swagger Editor](https://editor.swagger.io/) - Online spec editor
- [curl](https://curl.se/) - Command-line testing

### Online Resources
- [OpenAPI 3.0 Spec](https://swagger.io/specification/)
- [JWT.io](https://jwt.io/) - Decode JWT tokens
- [NestJS Documentation](https://docs.nestjs.com/)

## 🎉 Next Steps

1. ✅ Import Postman collection
2. ✅ Register a new user or login
3. ✅ Test authentication endpoints
4. ✅ Test CRUD operations
5. ✅ Try different user roles
6. ✅ Test error cases
7. ✅ Integrate Swagger UI (optional)

## 📞 Support

For questions or issues:
- Email: support@nexus-pm.com
- Check API logs for detailed error messages
- Review validation errors in response

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**API Base URL:** http://localhost:3000
