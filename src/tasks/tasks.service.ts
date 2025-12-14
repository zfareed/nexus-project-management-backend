import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { UserRole, TaskStatus, TaskPriority } from '../generated/prisma';

/**
 * TasksService - Business logic for task operations
 * Handles authorization, validation, and database interactions
 */
@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new task (ADMIN only)
     * 
     * @param createTaskDto - Task data
     * @param userId - ID of the user creating the task
     * @returns Created task with related data
     */
    async create(createTaskDto: CreateTaskDto, userId: string) {
        this.logger.log(`Creating task: ${createTaskDto.title} by user: ${userId}`);

        // Verify project exists
        const project = await this.prisma.project.findUnique({
            where: { id: createTaskDto.projectId },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
        }

        // Verify assignee exists
        const assignee = await this.prisma.user.findUnique({
            where: { id: createTaskDto.assigneeId },
        });

        if (!assignee) {
            throw new NotFoundException(`User with ID ${createTaskDto.assigneeId} not found`);
        }

        // Create the task
        const task = await this.prisma.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                status: createTaskDto.status || TaskStatus.TODO,
                priority: createTaskDto.priority || TaskPriority.MEDIUM,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                projectId: createTaskDto.projectId,
                assigneeId: createTaskDto.assigneeId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create task history entry
        await this.prisma.taskHistory.create({
            data: {
                taskId: task.id,
                updatedById: userId,
                oldStatus: null,
                newStatus: task.status,
                oldPriority: null,
                newPriority: task.priority,
            },
        });

        this.logger.log(`Task created successfully: ${task.id}`);
        return {
            message: 'Task created successfully',
            task,
        };
    }

    /**
     * Get all tasks
     * - ADMINs see all tasks
     * - USERs see only their assigned tasks
     * 
     * @param userId - ID of the requesting user
     * @param userRole - Role of the requesting user
     * @returns List of tasks
     */
    async findAll(userId: string, userRole: UserRole) {
        this.logger.log(`Fetching tasks for user: ${userId} with role: ${userRole}`);

        const where = userRole === UserRole.ADMIN
            ? {} // Admin sees all tasks
            : { assigneeId: userId }; // Regular users see only their tasks

        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        this.logger.log(`Found ${tasks.length} tasks`);
        return {
            message: 'Tasks fetched successfully',
            count: tasks.length,
            tasks,
        };
    }

    /**
     * Get a single task by ID
     * - ADMINs can view any task
     * - USERs can only view their assigned tasks
     * 
     * @param id - Task ID
     * @param userId - ID of the requesting user
     * @param userRole - Role of the requesting user
     * @returns Task data
     */
    async findOne(id: string, userId: string, userRole: UserRole) {
        this.logger.log(`Fetching task: ${id} for user: ${userId}`);

        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                history: {
                    include: {
                        updatedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                },
            },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        // Regular users can only view their assigned tasks
        if (userRole === UserRole.USER && task.assigneeId !== userId) {
            throw new ForbiddenException('You can only view tasks assigned to you');
        }

        return {
            message: 'Task fetched successfully',
            task,
        };
    }

    /**
     * Update a task
     * - ADMINs can update any task
     * - USERs can only update their assigned tasks
     * 
     * @param id - Task ID
     * @param updateTaskDto - Updated task data
     * @param userId - ID of the user updating the task
     * @param userRole - Role of the requesting user
     * @returns Updated task
     */
    async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole) {
        this.logger.log(`Updating task: ${id} by user: ${userId}`);

        // Fetch existing task
        const existingTask = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        // Regular users can only update their assigned tasks
        if (userRole === UserRole.USER && existingTask.assigneeId !== userId) {
            throw new ForbiddenException('You can only update tasks assigned to you');
        }

        // Verify project existence if updating
        if (updateTaskDto.projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: updateTaskDto.projectId },
            });
            if (!project) {
                throw new NotFoundException(`Project with ID ${updateTaskDto.projectId} not found`);
            }
        }

        // Verify assignee existence if updating
        if (updateTaskDto.assigneeId) {
            const assignee = await this.prisma.user.findUnique({
                where: { id: updateTaskDto.assigneeId },
            });
            if (!assignee) {
                throw new NotFoundException(`User with ID ${updateTaskDto.assigneeId} not found`);
            }
        }

        // Update the task
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: {
                ...(updateTaskDto.title && { title: updateTaskDto.title }),
                ...(updateTaskDto.description !== undefined && { description: updateTaskDto.description }),
                ...(updateTaskDto.status && { status: updateTaskDto.status }),
                ...(updateTaskDto.priority && { priority: updateTaskDto.priority }),
                ...(updateTaskDto.dueDate !== undefined && {
                    dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
                }),
                ...(updateTaskDto.projectId && { projectId: updateTaskDto.projectId }),
                ...(updateTaskDto.assigneeId && { assigneeId: updateTaskDto.assigneeId }),
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create task history entry if status or priority changed
        if (updateTaskDto.status || updateTaskDto.priority) {
            await this.prisma.taskHistory.create({
                data: {
                    taskId: id,
                    updatedById: userId,
                    oldStatus: updateTaskDto.status ? existingTask.status : null,
                    newStatus: updateTaskDto.status || existingTask.status,
                    oldPriority: updateTaskDto.priority ? existingTask.priority : null,
                    newPriority: updateTaskDto.priority || existingTask.priority,
                },
            });
        }

        this.logger.log(`Task updated successfully: ${id}`);
        return {
            message: 'Task updated successfully',
            task: updatedTask,
        };
    }

    /**
     * Delete a task (ADMIN only)
     * 
     * @param id - Task ID
     * @returns Success message
     */
    async remove(id: string) {
        this.logger.log(`Deleting task: ${id}`);

        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        await this.prisma.task.delete({
            where: { id },
        });

        this.logger.log(`Task deleted successfully: ${id}`);
        return {
            message: 'Task deleted successfully',
            taskId: id,
        };
    }
}
