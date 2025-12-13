# Prisma Setup - Quick Start Guide

## ✅ What's Been Done

1. ✅ Installed Prisma and Prisma Client
2. ✅ Initialized Prisma with PostgreSQL
3. ✅ Created comprehensive schema with all models
4. ✅ Added NestJS integration (PrismaService & PrismaModule)
5. ✅ Created seed file with sample data
6. ✅ Updated package.json with Prisma scripts

## 📋 Next Steps

### 1. Update Your .env File

Make sure your `.env` file has the DATABASE_URL (see `.env.example` for reference):

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexus-app?schema=public"
```

### 2. Create the Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE "nexus-app";
\q
```

Or use your existing PostgreSQL GUI tool.

### 3. Run First Migration

```bash
npm run prisma:migrate
```

When prompted, name it something like: `init` or `initial_schema`

### 4. (Optional) Seed the Database

```bash
npm run prisma:seed
```

This will populate the database with:
- **3 demo users** with real credentials (see `DEMO_CREDENTIALS.md`):
  - Admin: `admin@demo.com` / `admin@123`
  - User: `user@demo.com` / `user@123`
  - Test user: `jane@nexus.com` / `password123`
- 2 projects
- 4 tasks
- Task history entries

**Passwords are securely hashed using bcrypt.**

### 5. Import PrismaModule in AppModule

Update `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule, // Add this
    // ... other modules
  ],
})
export class AppModule {}
```

### 6. Use Prisma in Your Services

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Don't return password
      },
    });
  }
}
```

## 🛠 Available Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (WARNING: deletes data)
npm run prisma:reset

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## 📚 Key Files

- `prisma/schema.prisma` - Database schema definition
- `prisma.config.ts` - Prisma configuration (Prisma 7)
- `src/prisma/prisma.service.ts` - Prisma service for NestJS
- `src/prisma/prisma.module.ts` - Prisma module for NestJS
- `prisma/seed.ts` - Database seeding script
- `PRISMA_SCHEMA.md` - Full documentation

## 🔍 Schema Overview

### Models
1. **User** - System users with roles
2. **Project** - Project containers
3. **Task** - Work items with status and priority
4. **ProjectUsers** - Many-to-many join table
5. **TaskHistory** - Audit trail for task changes

### Enums
- `UserRole`: ADMIN, USER
- `TaskStatus`: TODO, IN_PROGRESS, DONE
- `TaskPriority`: LOW, MEDIUM, HIGH

### Key Features
- ✅ UUID primary keys
- ✅ Proper foreign key relations
- ✅ Cascade/Restrict delete behaviors
- ✅ Indexes for performance
- ✅ snake_case database naming
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Composite keys for join tables

## 🚨 Important Notes

1. **Prisma 7**: This project uses Prisma 7, which has `datasource.url` in `prisma.config.ts` instead of `schema.prisma`

2. **TypeORM Migration**: The project originally had TypeORM. You may want to:
   - Remove TypeORM dependencies if not needed
   - Update modules to use Prisma instead

3. **Password Hashing**: ✅ Bcrypt is already installed and configured for secure password hashing in the seed file. When implementing authentication:
   ```typescript
   import * as bcrypt from 'bcrypt';
   
   // Hash password
   const hashedPassword = await bcrypt.hash(plainPassword, 10);
   
   // Verify password
   const isValid = await bcrypt.compare(plainPassword, user.password);
   ```

4. **Migrations**: Always create migrations for schema changes:
   ```bash
   npm run prisma:migrate
   ```

## 📖 Documentation

See `PRISMA_SCHEMA.md` for comprehensive documentation including:
- Detailed model descriptions
- Relation explanations
- Usage examples
- Best practices
- Troubleshooting

## 🎯 Example Queries

```typescript
// Find user with projects and tasks
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    projectsAssigned: {
      include: { project: true }
    },
    tasksAssigned: true,
  },
});

// Create task with history
await prisma.$transaction([
  prisma.task.create({
    data: {
      title: 'New Task',
      projectId: project.id,
      assigneeId: user.id,
    },
  }),
  prisma.taskHistory.create({
    data: {
      taskId: task.id,
      updatedById: user.id,
      newStatus: 'TODO',
    },
  }),
]);

// Get high priority tasks
const urgentTasks = await prisma.task.findMany({
  where: {
    priority: 'HIGH',
    status: { not: 'DONE' },
  },
  include: {
    assignee: true,
    project: true,
  },
  orderBy: {
    dueDate: 'asc',
  },
});
```

## ❓ Need Help?

- Check `PRISMA_SCHEMA.md` for detailed documentation
- Visit [Prisma Docs](https://www.prisma.io/docs)
- Run `npx prisma studio` to explore your database visually

---

**Ready to go!** 🚀 Start with step 1 above.
