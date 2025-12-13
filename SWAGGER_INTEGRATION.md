# Integrating Swagger UI with NestJS

This guide will help you integrate interactive Swagger documentation directly into your NestJS application.

## 📦 Installation

```bash
npm install --save @nestjs/swagger
```

## 🔧 Configuration

### 1. Update `main.ts`

Add Swagger configuration to your `src/main.ts` file:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Nexus Project Management API')
    .setDescription(`
      RESTful API for the Nexus Project Management System.
      
      ## Authentication
      This API uses JWT (JSON Web Token) for authentication. After registering or logging in, 
      you will receive a JWT token. Click the "Authorize" button and enter your token in the format:
      Bearer <your_jwt_token>
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth() decorator
    )
    .addTag('Authentication', 'User registration, login, and profile endpoints')
    .addTag('Projects', 'Project management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addTag('Users', 'User management endpoints (Admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Nexus API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/api/docs`);
}
bootstrap();
```

## 🎨 Adding Decorators to Controllers (Optional Enhancement)

You can enhance your controllers with Swagger decorators for better documentation:

### Example: Auth Controller

```typescript
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email and password. Returns user info and JWT token.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'USER',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or email already exists' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login with email and password',
    description: 'Authenticate user with email and password. Returns user info and JWT token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully logged in' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile information.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
```

### Example: Projects Controller

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new project (Admin only)',
    description: 'Create a new project with optional user assignments.'
  })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User role not permitted' })
  async create(@Body() createProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all projects',
    description: 'Admins see all projects, Users see only assigned projects.'
  })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project (Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User role not permitted' })
  async update(@Param('id') id: string, @Body() updateProjectDto, @Request() req) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (Admin only)' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User role not permitted' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id);
  }
}
```

## 🎯 Enhancing DTOs with Swagger Decorators

Add `@ApiProperty()` decorators to your DTOs:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User\'s full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'User\'s email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'User\'s password (will be hashed)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 100,
    format: 'password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password: string;
}
```

## 🚀 Accessing Swagger UI

After implementing the changes:

1. **Start your application:**
   ```bash
   npm run start:dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000/api/docs
   ```

3. **You will see an interactive API documentation with:**
   - All endpoints organized by tags
   - Request/response schemas
   - "Try it out" functionality to test endpoints
   - Authentication support (click "Authorize" button)

## 🔐 Using Authentication in Swagger UI

1. Click the **"Authorize"** button (lock icon) at the top right
2. In the dialog, enter your JWT token in the format: `Bearer <your_token>`
3. Click **"Authorize"**
4. Now you can test protected endpoints directly from Swagger UI

## 📝 Best Practices

1. **Keep documentation up to date** - Update Swagger decorators when you change endpoints
2. **Provide examples** - Use the `example` property in `@ApiProperty()` decorators
3. **Document error responses** - Use multiple `@ApiResponse()` decorators for different status codes
4. **Use meaningful descriptions** - Help API consumers understand what each endpoint does
5. **Group related endpoints** - Use `@ApiTags()` to organize endpoints

## 🔗 Additional Resources

- [NestJS OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [NestJS Swagger Decorators](https://docs.nestjs.com/openapi/decorators)

## 🎉 Next Steps

1. Install `@nestjs/swagger` package
2. Update your `main.ts` with the Swagger configuration
3. Optionally add decorators to your controllers and DTOs
4. Start your application and visit `/api/docs`
5. Test your API directly from the Swagger UI!
