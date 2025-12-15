import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TasksService } from '../src/tasks/tasks.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole, TaskStatus, TaskPriority } from '../src/generated/prisma';

describe('TasksController (e2e)', () => {
    let app: INestApplication;
    let tasksService: TasksService;

    const mockTasksService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockPrismaService = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };

    const mockUserUserId = '550e8400-e29b-41d4-a716-446655440001';
    const mockAdminUserId = '550e8400-e29b-41d4-a716-446655440002';

    const mockUser = {
        userId: mockUserUserId,
        email: 'user@example.com',
        role: UserRole.USER,
    };

    const mockAdmin = {
        userId: mockAdminUserId,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
    };

    // Default to User role for most tests, override in ADMIN tests if needed
    let currentUser = mockUser;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(TasksService)
            .useValue(mockTasksService)
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = currentUser;
                    return true;
                },
            })
            .overrideGuard(RolesGuard)
            .useValue({
                canActivate: () => true, // Bypass role checks here
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        tasksService = moduleFixture.get<TasksService>(TasksService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('/tasks (GET)', () => {
        it('should return all tasks for the current user', async () => {
            currentUser = mockUser;
            const expectedTasks = [
                { id: '550e8400-e29b-41d4-a716-446655440003', title: 'Task 1', assigneeId: mockUserUserId },
            ];
            mockTasksService.findAll.mockResolvedValue(expectedTasks);

            return request(app.getHttpServer())
                .get('/tasks')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(expectedTasks);
                    expect(mockTasksService.findAll).toHaveBeenCalledWith(mockUserUserId, mockUser.role);
                });
        });
    });

    describe('/tasks (POST)', () => {
        it('should create a task (Admin only)', async () => {
            currentUser = mockAdmin;

            const createTaskDto = {
                title: 'New Task',
                projectId: '550e8400-e29b-41d4-a716-446655440004',
                assigneeId: mockUserUserId,
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
            };

            const createdTask = {
                id: '550e8400-e29b-41d4-a716-446655440005',
                ...createTaskDto,
                createdAt: new Date().toISOString()
            };

            mockTasksService.create.mockResolvedValue(createdTask);

            return request(app.getHttpServer())
                .post('/tasks')
                .send(createTaskDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(createdTask);
                    expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto, mockAdminUserId);
                });
        });

        it('should fail with 400 if validation fails', async () => {
            currentUser = mockAdmin;
            return request(app.getHttpServer())
                .post('/tasks')
                .send({ title: '' }) // Invalid
                .expect(400);
        });
    });

    describe('/tasks/:id (GET)', () => {
        it('should return a single task', async () => {
            currentUser = mockUser;
            const taskId = '550e8400-e29b-41d4-a716-446655440005';
            const expectedTask = { id: taskId, title: 'Task 1' };

            mockTasksService.findOne.mockResolvedValue(expectedTask);

            return request(app.getHttpServer())
                .get(`/tasks/${taskId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(expectedTask);
                    expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId, mockUserUserId, mockUser.role);
                });
        });
    });

    describe('/tasks/:id (PUT)', () => {
        it('should update a task', async () => {
            currentUser = mockUser;
            const taskId = '550e8400-e29b-41d4-a716-446655440005';
            const updateTaskDto = { status: TaskStatus.IN_PROGRESS };
            const updatedTask = { id: taskId, title: 'Task 1', ...updateTaskDto };

            mockTasksService.update.mockResolvedValue(updatedTask);

            return request(app.getHttpServer())
                .put(`/tasks/${taskId}`)
                .send(updateTaskDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(updatedTask);
                    expect(mockTasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto, mockUserUserId, mockUser.role);
                });
        });
    });

    describe('/tasks/:id (DELETE)', () => {
        it('should delete a task (Admin only)', async () => {
            currentUser = mockAdmin;
            const taskId = '550e8400-e29b-41d4-a716-446655440005';
            const result = { message: 'Task deleted successfully' };

            mockTasksService.remove.mockResolvedValue(result);

            return request(app.getHttpServer())
                .delete(`/tasks/${taskId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(result);
                    expect(mockTasksService.remove).toHaveBeenCalledWith(taskId);
                });
        });
    });
});
