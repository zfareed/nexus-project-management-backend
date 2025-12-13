# POST /auth/login Endpoint

## Overview
This endpoint authenticates a user with email and password, returning a JWT token and user information upon successful login.

## Endpoint Details
- **URL**: `POST /auth/login`
- **Status Code**: `200 OK` (on success)
- **Content-Type**: `application/json`

## Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Validation Rules
- **email**: Required, must be a valid email format
- **password**: Required, must be a string

## Response

### Success Response (200 OK)
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2025-12-14T02:14:11.000Z",
    "updatedAt": "2025-12-14T02:14:11.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

#### 401 Unauthorized
When email or password is invalid:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

#### 400 Bad Request
When validation fails:
```json
{
  "statusCode": 400,
  "message": [
    "Email is required",
    "Invalid email format",
    "Password is required"
  ],
  "error": "Bad Request"
}
```

#### 500 Internal Server Error
When an unexpected error occurs:
```json
{
  "statusCode": 500,
  "message": "An error occurred during login",
  "error": "Internal Server Error"
}
```

## Implementation Details

### Files Created/Modified

1. **src/auth/dto/login.dto.ts** (NEW)
   - Contains `LoginDto` class with validation decorators
   - Validates email format and password presence

2. **src/auth/auth.service.ts** (MODIFIED)
   - Added `login()` method
   - Validates user existence
   - Compares hashed password using bcrypt
   - Generates JWT token
   - Returns user info without password

3. **src/auth/auth.controller.ts** (MODIFIED)
   - Added `POST /auth/login` route
   - Includes validation pipe
   - Returns HTTP 200 on success

### Security Features

1. **Password Hashing**: Passwords are stored as bcrypt hashes and compared securely
2. **Generic Error Messages**: Returns "Invalid email or password" for both invalid email and password to prevent user enumeration
3. **Password Exclusion**: Password is never included in the response
4. **JWT Authentication**: Generates signed JWT with user ID, email, and role
5. **Input Validation**: Validates and sanitizes all input using class-validator

### Authentication Flow

1. Client sends email and password to `/auth/login`
2. Validation pipe validates the request body
3. Service finds user by email in database
4. If user doesn't exist, returns 401 Unauthorized
5. Compares provided password with stored bcrypt hash
6. If password doesn't match, returns 401 Unauthorized
7. Generates JWT token with user payload (id, email, role)
8. Returns user info (without password) and token

### Error Handling

- **UnauthorizedException**: For invalid credentials
- **InternalServerErrorException**: For unexpected errors
- Logger records all errors for debugging
- Specific error types are re-thrown to maintain proper HTTP status codes

## Testing Examples

### Using cURL
```bash
# Valid login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Invalid credentials
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}'

# Validation error
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":""}'
```

### Using Fetch API
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data.token); // JWT token
console.log(data.user); // User info
```

## JWT Token Usage

The returned token should be included in subsequent requests:

```bash
curl -X GET http://localhost:3000/protected-route \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Notes

- JWT expiration is configured in environment variables (`JWT_EXPIRES_IN`, default: 7 days)
- JWT secret is configured in environment variables (`JWT_SECRET`)
- The same `AuthResponseDto` is used for both login and register endpoints
- Password comparison is done asynchronously for better performance
