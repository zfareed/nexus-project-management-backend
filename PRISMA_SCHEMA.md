# Prisma Schema Documentation

This document describes the Prisma ORM schema for the Nexus Project Management system.

## Overview

The schema implements a comprehensive project management system with the following entities:
- **Users**: System users with role-based access
- **Projects**: Project containers
- **Tasks**: Individual work items
- **ProjectUsers**: Many-to-many relationship between users and projects
- **TaskHistory**: Audit trail for task changes

## Database Configuration

### Environment Setup

Make sure your `.env` file contains the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexus-app?schema=public"
```

### Prisma Configuration

The project uses **Prisma 7**, which separates configuration into:
- `prisma/schema.prisma`: Schema definitions
- `prisma.config.ts`: Database connection and migration settings

## Models

### User Model

Stores user information and authentication details.

**Fields:**
- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: UserRole enum (ADMIN | USER)
- `createdAt`: Timestamp
- `updatedAt`: Auto-updated timestamp

**Relations:**
- Can create many projects (`projectsCreated`)
- Can be assigned to many projects through `ProjectUsers`
- Can have many tasks assigned (`tasksAssigned`)
- Can create many task history entries

### Project Model

Represents a project container.

**Fields:**
- `id`: UUID primary key
- `name`: Project name
- `description`: Optional text description
- `createdById`: Reference to creator (User)
- `createdAt`: Timestamp
- `updatedAt`: Auto-updated timestamp

**Relations:**
- Created by one user (`createdBy`)
- Has many tasks
- Has many users through `ProjectUsers`

**Referential Actions:**
- When creator is deleted: CASCADE (delete project)

**Indexes:**
- `createdById` for faster creator lookups

### ProjectUsers (Join Table)

Many-to-many relationship between projects and users.

**Fields:**
- `projectId`: Reference to project
- `userId`: Reference to user

**Composite Primary Key:**
- `[projectId, userId]`: Ensures a user can't be added to the same project twice

**Referential Actions:**
- When project is deleted: CASCADE (remove assignment)
- When user is deleted: CASCADE (remove assignment)

**Indexes:**
- `projectId`: Fast project → users lookups
- `userId`: Fast user → projects lookups

### Task Model

Represents individual work items.

**Fields:**
- `id`: UUID primary key
- `title`: Task title
- `description`: Optional text description
- `status`: TaskStatus enum (TODO | IN_PROGRESS | DONE)
- `priority`: TaskPriority enum (LOW | MEDIUM | HIGH)
- `dueDate`: Optional due date
- `projectId`: Reference to project
- `assigneeId`: Reference to assigned user
- `createdAt`: Timestamp
- `updatedAt`: Auto-updated timestamp

**Relations:**
- Belongs to one project (`project`)
- Assigned to one user (`assignee`)
- Has many history entries (`history`)

**Referential Actions:**
- When project is deleted: CASCADE (delete task)
- When assignee is deleted: RESTRICT (prevent deletion if tasks assigned)

**Indexes:**
- `projectId`: Fast project → tasks queries
- `assigneeId`: Fast user → tasks queries
- `status`: Filter by status
- `priority`: Filter by priority
- `dueDate`: Sort/filter by due date

### TaskHistory Model

Audit trail for task changes.

**Fields:**
- `id`: UUID primary key
- `taskId`: Reference to task
- `updatedById`: Reference to user who made the change
- `oldStatus`: Previous status (nullable)
- `newStatus`: New status
- `oldPriority`: Previous priority (nullable)
- `newPriority`: New priority (nullable)
- `timestamp`: When change occurred

**Relations:**
- Belongs to one task (`task`)
- Created by one user (`updatedBy`)

**Referential Actions:**
- When task is deleted: CASCADE (delete history)
- When user is deleted: RESTRICT (preserve history)

**Indexes:**
- `taskId`: Fast task → history queries
- `updatedById`: Fast user → changes queries
- `timestamp`: Sort by time

## Enums

### UserRole
```prisma
enum UserRole {
  ADMIN
  USER
}
```

### TaskStatus
```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

### TaskPriority
```prisma
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

## Database Naming Conventions

The schema follows **snake_case** naming conventions for:
- Table names: `users`, `projects`, `tasks`, `project_users`, `task_history`
- Column names: `created_at`, `updated_at`, `created_by_id`, `assignee_id`, etc.

Prisma models use **PascalCase** and fields use **camelCase** in the application code.

## Migration Commands

### Create a new migration
```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name your_migration_name
```

### Deploy migrations (production)
```bash
npm run prisma:migrate:deploy
# or
npx prisma migrate deploy
```

### Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Open Prisma Studio (database GUI)
```bash
npm run prisma:studio
# or
npx prisma studio
```

### Reset database (WARNING: Deletes all data)
```bash
npm run prisma:reset
# or
npx prisma migrate reset
```

## Getting Started

1. **Set up your database**
   - Ensure PostgreSQL is running
   - Create the database: `nexus-app`
   - Update `.env` with your credentials

2. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

4. **Open Prisma Studio** (optional)
   ```bash
   npm run prisma:studio
   ```

## Usage in NestJS

### 1. Create a Prisma Service

Create `src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 2. Create a Prisma Module

Create `src/prisma/prisma.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 3. Import in App Module

Update `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  // ... other imports
})
export class AppModule {}
```

### 4. Use in Services

Example service using Prisma:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        projectsAssigned: {
          include: {
            project: true,
          },
        },
        tasksAssigned: true,
      },
    });
  }

  async create(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: 'USER',
      },
    });
  }

  async assignToProject(userId: string, projectId: string) {
    return this.prisma.projectUsers.create({
      data: {
        userId,
        projectId,
      },
    });
  }
}
```

## Best Practices

1. **Always use transactions** for related operations:
   ```typescript
   await prisma.$transaction([
     prisma.task.update({ where: { id }, data: { status: 'DONE' } }),
     prisma.taskHistory.create({
       data: {
         taskId: id,
         updatedById: userId,
         oldStatus: 'IN_PROGRESS',
         newStatus: 'DONE',
       },
     }),
   ]);
   ```

2. **Use select/include wisely** to avoid over-fetching:
   ```typescript
   const users = await prisma.user.findMany({
     select: {
       id: true,
       name: true,
       email: true,
       // Don't include password in general queries
     },
   });
   ```

3. **Leverage indexes** by filtering on indexed fields:
   ```typescript
   // Good - uses index
   const tasks = await prisma.task.findMany({
     where: { status: 'TODO', priority: 'HIGH' },
   });
   ```

4. **Use cascade carefully** - Only use CASCADE where data should truly be deleted together.

## Performance Optimization

The schema includes strategic indexes on:
- Foreign keys (`projectId`, `assigneeId`, `taskId`, etc.)
- Frequently filtered fields (`status`, `priority`)
- Sort fields (`dueDate`, `timestamp`)

## Security Considerations

1. **Password Storage**: Always hash passwords before storing (use bcrypt)
2. **RESTRICT on Users**: Prevents accidental deletion of users with active tasks/history
3. **Unique Email**: Enforced at database level
4. **Composite Key**: `ProjectUsers` prevents duplicate assignments

## Future Enhancements

Potential additions to consider:
- `Comments` model for task discussions
- `Attachments` model for file uploads
- `Labels/Tags` for better organization
- `Notifications` for user alerts
- Soft deletes with `deletedAt` field
- More granular permissions beyond ADMIN/USER

## Troubleshooting

### Migration Issues

If migrations fail:
```bash
# Check migration status
npx prisma migrate status

# Force reset (WARNING: Deletes data)
npx prisma migrate reset

# Deploy specific migration
npx prisma migrate deploy
```

### Connection Issues

- Verify DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Check database exists
- Verify credentials

### Type Generation Issues

If types are not updating:
```bash
# Regenerate client
npx prisma generate

# Restart TypeScript server in your IDE
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
