# Authentication Module

This module handles user authentication for the Nexus Project Management System.

## Available Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, string, 8-100 characters

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "createdAt": "2025-12-14T01:46:23.000Z",
    "updatedAt": "2025-12-14T01:46:23.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors
```json
{
  "statusCode": 400,
  "message": [
    "Email is required",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request",
  "timestamp": "2025-12-14T01:46:23.000Z"
}
```

- **409 Conflict** - Email already registered
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict",
  "timestamp": "2025-12-14T01:46:23.000Z"
}
```

- **500 Internal Server Error** - Server error
```json
{
  "statusCode": 500,
  "message": "An error occurred during registration",
  "error": "Internal Server Error",
  "timestamp": "2025-12-14T01:46:23.000Z"
}
```

## Features

✅ **Input Validation**: Comprehensive validation using class-validator
✅ **Password Hashing**: Secure password hashing with bcrypt (10 rounds)
✅ **Duplicate Prevention**: Checks for existing email before registration
✅ **Default Role**: Users are assigned USER role by default
✅ **JWT Generation**: Generates JWT token with 7-day expiration
✅ **Secure Response**: Password is never returned in the response
✅ **Error Handling**: Comprehensive error handling with detailed messages

## Environment Variables

Add these to your `.env` file:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## Testing

### Using cURL:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

### Using Postman or Thunder Client:

1. Method: POST
2. URL: `http://localhost:3000/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

## Security Considerations

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT secret should be changed in production
- Email uniqueness is enforced at the database level
- Input validation prevents malicious data
- Global exception filter prevents sensitive error information leakage
