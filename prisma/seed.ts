import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // Use @prisma/adapter-mariadb or SQLite if needed

// Create Prisma adapter for Postgres (replace if using another DB)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // -------------------------
  // Clean existing data
  // -------------------------
  console.log('🧹 Cleaning existing data...');
  await prisma.taskHistory.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectUsers.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------
  // Create users with hashed passwords
  // -------------------------
  console.log('👥 Creating users...');
  const adminPassword = await bcrypt.hash('admin@123', 10);
  const userPassword = await bcrypt.hash('user@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  const user1 = await prisma.user.create({
    data: {
      name: 'User Demo',
      email: 'user@demo.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Created user: ${user1.email}`);

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@nexus.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    },
  });
  console.log(`✅ Created user: ${user2.email}`);

  // -------------------------
  // Create projects
  // -------------------------
  console.log('📁 Creating projects...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website',
      createdById: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build native mobile apps for iOS and Android',
      createdById: admin.id,
    },
  });
  console.log(`✅ Created ${2} projects`);

  // -------------------------
  // Assign users to projects
  // -------------------------
  console.log('🔗 Assigning users to projects...');
  await prisma.projectUsers.createMany({
    data: [
      { projectId: project1.id, userId: user1.id },
      { projectId: project1.id, userId: user2.id },
      { projectId: project2.id, userId: user1.id },
    ],
  });
  console.log(`✅ Created project assignments`);

  // -------------------------
  // Create tasks
  // -------------------------
  console.log('📝 Creating tasks...');
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Homepage Mockup',
      description: 'Create high-fidelity mockups for the new homepage',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2025-12-20'),
      projectId: project1.id,
      assigneeId: user2.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Set up Development Environment',
      description: 'Configure development tools and dependencies',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date('2025-12-15'),
      projectId: project1.id,
      assigneeId: user1.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Research React Native Framework',
      description: 'Evaluate React Native for mobile app development',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2025-12-18'),
      projectId: project2.id,
      assigneeId: user1.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Design App UI/UX',
      description: 'Create wireframes and user flows for mobile app',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: project2.id,
      assigneeId: user2.id,
    },
  });
  console.log(`✅ Created ${4} tasks`);

  // -------------------------
  // Create task history
  // -------------------------
  console.log('📜 Creating task history...');
  await prisma.taskHistory.createMany({
    data: [
      {
        taskId: task1.id,
        updatedById: user2.id,
        oldStatus: 'TODO',
        newStatus: 'IN_PROGRESS',
        oldPriority: 'MEDIUM',
        newPriority: 'HIGH',
        timestamp: new Date('2025-12-13T10:00:00Z'),
      },
      {
        taskId: task2.id,
        updatedById: user1.id,
        oldStatus: 'IN_PROGRESS',
        newStatus: 'DONE',
        timestamp: new Date('2025-12-13T08:30:00Z'),
      },
    ],
  });
  console.log(`✅ Created task history entries`);

  // -------------------------
  // Summary
  // -------------------------
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Projects: ${await prisma.project.count()}`);
  console.log(`   - Project Assignments: ${await prisma.projectUsers.count()}`);
  console.log(`   - Tasks: ${await prisma.task.count()}`);
  console.log(`   - Task History: ${await prisma.taskHistory.count()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
