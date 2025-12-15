import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { UserRole, TaskStatus, TaskPriority } from '../generated/prisma';
import { CreateTaskDto, UpdateTaskDto } from './dto';

const mockPrismaService = {
    project: {
        findUnique: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('TasksService', () => {
    let service: TasksService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        prisma = module.get(PrismaService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        const createTaskDto: CreateTaskDto = {
            title: 'New Task',
            description: 'Description',
            projectId: 'project-1',
            assigneeId: 'user-1',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date().toISOString(),
        };
        const userId = 'admin-id';

        it('should create a task successfully', async () => {
            prisma.project.findUnique.mockResolvedValue({ id: 'project-1' });
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
            prisma.task.create.mockResolvedValue({
                id: 'task-1',
                ...createTaskDto,
                dueDate: new Date(createTaskDto.dueDate),
            });

            const result = await service.create(createTaskDto, userId);

            expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: createTaskDto.projectId } });
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: createTaskDto.assigneeId } });
            expect(prisma.task.create).toHaveBeenCalled();
            expect(result.message).toBe('Task created successfully');
            expect(result.task).toBeDefined();
        });

        it('should throw NotFoundException if project not found', async () => {
            prisma.project.findUnique.mockResolvedValue(null);

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if assignee not found', async () => {
            prisma.project.findUnique.mockResolvedValue({ id: 'project-1' });
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        const userId = 'user-1';

        it('should return all tasks for ADMIN', async () => {
            const userRole = UserRole.ADMIN;
            prisma.task.findMany.mockResolvedValue([{ id: 'task-1' }, { id: 'task-2' }]);

            const result = await service.findAll(userId, userRole);

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
            expect(result.count).toBe(2);
        });

        it('should return assigned tasks for USER', async () => {
            const userRole = UserRole.USER;
            prisma.task.findMany.mockResolvedValue([{ id: 'task-1' }]);

            const result = await service.findAll(userId, userRole);

            expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { assigneeId: userId } }));
            expect(result.count).toBe(1);
        });
    });

    describe('findOne', () => {
        const taskId = 'task-1';
        const userId = 'user-1';

        it('should return task for ADMIN', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: 'other-user' });
            const result = await service.findOne(taskId, userId, UserRole.ADMIN);
            expect(result.task.id).toBe(taskId);
        });

        it('should return task for USER if assigned', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: userId });
            const result = await service.findOne(taskId, userId, UserRole.USER);
            expect(result.task.id).toBe(taskId);
        });

        it('should throw ForbiddenException for USER if not assigned', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: 'other-user' });
            await expect(service.findOne(taskId, userId, UserRole.USER)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if task does not exist', async () => {
            prisma.task.findUnique.mockResolvedValue(null);
            await expect(service.findOne(taskId, userId, UserRole.ADMIN)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const taskId = 'task-1';
        const userId = 'user-1';
        const updateTaskDto: UpdateTaskDto = { title: 'Updated Title' };

        it('should update task successfully', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: userId });
            prisma.task.update.mockResolvedValue({ id: taskId, ...updateTaskDto });

            const result = await service.update(taskId, updateTaskDto, userId, UserRole.USER);

            expect(prisma.task.update).toHaveBeenCalled();
            expect(result.message).toBe('Task updated successfully');
        });

        it('should throw ForbiddenException if USER tries to update unassigned task', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: 'other-user' });
            await expect(service.update(taskId, updateTaskDto, userId, UserRole.USER)).rejects.toThrow(ForbiddenException);
        });

        it('should verify project existence if projectId provided', async () => {
            const dto = { projectId: 'new-project' };
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: userId });
            prisma.project.findUnique.mockResolvedValue(null);

            await expect(service.update(taskId, dto, userId, UserRole.USER)).rejects.toThrow(NotFoundException);
        });

        it('should verify assignee existence if assigneeId provided', async () => {
            const dto = { assigneeId: 'new-user' };
            prisma.task.findUnique.mockResolvedValue({ id: taskId, assigneeId: userId });
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.update(taskId, dto, userId, UserRole.USER)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        const taskId = 'task-1';

        it('should delete task successfully', async () => {
            prisma.task.findUnique.mockResolvedValue({ id: taskId });
            prisma.task.delete.mockResolvedValue({ id: taskId });

            const result = await service.remove(taskId);

            expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: taskId } });
            expect(result.message).toBe('Task deleted successfully');
        });

        it('should throw NotFoundException if task not found', async () => {
            prisma.task.findUnique.mockResolvedValue(null);
            await expect(service.remove(taskId)).rejects.toThrow(NotFoundException);
        });
    });
});
