# Users Module - File Structure

```
src/users/
│
├── dto/
│   ├── index.ts                    # Barrel export for all DTOs
│   ├── query-users.dto.ts          # Pagination & search query parameters
│   ├── update-user.dto.ts          # User update validation schema
│   └── user-list.dto.ts            # Paginated response structure
│
├── users.controller.ts             # HTTP route handlers (GET, PUT)
├── users.service.ts                # Business logic & authorization
├── users.module.ts                 # Module configuration
├── index.ts                        # Barrel export for module
│
├── README.md                       # Full documentation
├── USERS_API.md                    # Quick API reference
└── IMPLEMENTATION_SUMMARY.md       # Implementation overview
```

## Module Dependencies

```
UsersModule
├── PrismaModule              # Database access
├── JwtModule                 # JWT token verification
├── ConfigModule              # Environment configuration
└── Guards & Decorators
    ├── JwtAuthGuard          # JWT authentication
    ├── RolesGuard            # Role-based authorization
    └── @Roles() decorator    # Route-level role specification
```

## Data Flow

```
HTTP Request
    ↓
┌─────────────────────────────────────┐
│      UsersController                │
│  - Route handling                   │
│  - Request validation               │
│  - Guard application                │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      JwtAuthGuard                   │
│  - Verify JWT token                 │
│  - Extract user payload             │
│  - Attach to request                │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      RolesGuard                     │
│  - Check user role                  │
│  - Verify permissions               │
│  - Allow/deny access                │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      UsersService                   │
│  - Business logic                   │
│  - Additional authorization         │
│  - Database operations              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      PrismaService                  │
│  - Execute queries                  │
│  - Password exclusion               │
│  - Return data                      │
└─────────────────────────────────────┘
             ↓
        HTTP Response
```

## Endpoint Authorization Flow

### GET /users (List All)

```
Request → JwtAuthGuard → RolesGuard (ADMIN only) → Service → Response
```

### GET /users/:id (Get One)

```
Request → JwtAuthGuard → RolesGuard → Service (ownership check) → Response
                                           ↓
                                      if (ADMIN) → View any user
                                      if (USER)  → View own profile only
```

### PUT /users/:id (Update)

```
Request → JwtAuthGuard → RolesGuard → Service (ownership + field check) → Response
                                           ↓
                                      if (ADMIN) → Update name & role (any user)
                                      if (USER)  → Update name only (own profile)
```

## Security Layers

```
Layer 1: JWT Authentication
    ↓ (Token verification)
Layer 2: Role-Based Guard
    ↓ (Role check if @Roles() specified)
Layer 3: Service Authorization
    ↓ (Ownership verification)
Layer 4: Data Filtering
    ↓ (Password exclusion)
Response
```

## Key Components

### DTOs (Data Transfer Objects)

| DTO Name          | Purpose                           | Used In         |
|-------------------|-----------------------------------|-----------------|
| QueryUsersDto     | Pagination & search parameters    | GET /users      |
| UpdateUserDto     | User update validation            | PUT /users/:id  |
| UserListDto       | Paginated response structure      | GET /users      |
| UserDto           | Single user response (inherited)  | All endpoints   |

### Service Methods

| Method   | Parameters                                    | Returns    | Purpose                          |
|----------|-----------------------------------------------|------------|----------------------------------|
| findAll  | `queryDto: QueryUsersDto`                    | UserListDto| Paginated user list with search  |
| findOne  | `id, requestingUserId, requestingUserRole`   | UserDto    | Get single user with ownership   |
| update   | `id, updateDto, requestingUserId, role`      | UserDto    | Update with authorization        |

### Controller Routes

| Method | Route          | Guard                 | Roles | Description           |
|--------|----------------|-----------------------|-------|-----------------------|
| GET    | /users         | JwtAuth + RolesGuard  | ADMIN | List all users        |
| GET    | /users/:id     | JwtAuth + RolesGuard  | Any   | Get user by ID        |
| PUT    | /users/:id     | JwtAuth + RolesGuard  | Any   | Update user           |

## Validation Summary

### Query Parameters (GET /users)
```typescript
page?: number = 1      // Min: 1, Type: Integer
limit?: number = 10    // Min: 1, Type: Integer
search?: string        // Optional, case-insensitive
```

### Update Body (PUT /users/:id)
```typescript
name?: string          // 2-100 chars, optional
role?: UserRole        // ADMIN|USER, optional, admin-only
```

## Error Handling

| Status Code | Error Type           | Common Causes                          |
|-------------|----------------------|----------------------------------------|
| 400         | BadRequestException  | Invalid input, no fields provided      |
| 401         | UnauthorizedException| Missing/invalid JWT token              |
| 403         | ForbiddenException   | Insufficient permissions, wrong role   |
| 404         | NotFoundException    | User doesn't exist                     |

## Integration Checklist

- ✅ Module exported in `src/users/index.ts`
- ✅ Module imported in `src/app.module.ts`
- ✅ Routes prefixed with `/users`
- ✅ Uses existing auth infrastructure
- ✅ Compatible with Prisma schema
- ✅ Follows project conventions
- ✅ Comprehensive documentation included
- ✅ Type-safe implementation
- ✅ Logging enabled
- ✅ Security best practices applied

## Testing Checklist

### Authentication Tests
- [ ] Request without token returns 401
- [ ] Request with invalid token returns 401
- [ ] Request with valid token succeeds

### Authorization Tests (GET /users)
- [ ] Admin can list all users
- [ ] Regular user gets 403

### Authorization Tests (GET /users/:id)
- [ ] Admin can view any user
- [ ] User can view own profile
- [ ] User cannot view other profiles (403)

### Authorization Tests (PUT /users/:id)
- [ ] Admin can update any user's name
- [ ] Admin can update any user's role
- [ ] User can update own name
- [ ] User cannot update own role (403)
- [ ] User cannot update other users (403)

### Functionality Tests
- [ ] Pagination works correctly
- [ ] Search matches name and email
- [ ] Search is case-insensitive
- [ ] Total count is accurate
- [ ] Password never appears in responses
- [ ] Empty updates return 400
- [ ] Non-existent user returns 404

## Performance Considerations

1. **Parallel Queries**: Count and fetch run in parallel for pagination
2. **Indexed Fields**: Search uses indexed email field
3. **Field Selection**: Only necessary fields fetched (password excluded)
4. **Query Optimization**: Uses Prisma's optimized query builder

## Maintenance Notes

1. **Adding New Fields**: Update DTOs, service, and documentation
2. **Changing Validation**: Modify DTO validators
3. **Authorization Changes**: Update service layer checks
4. **New Endpoints**: Add to controller and document

---

**Created**: December 14, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
