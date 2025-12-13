import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma';

/**
 * TasksController - Handles all HTTP requests for tasks
 * All routes are protected with JWT authentication
 * 
 * Authorization rules:
 * - ADMINs can create, update, delete, and view all tasks
 * - Regular USERs can view and update only their assigned tasks
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    private readonly logger = new Logger(TasksController.name);

    constructor(private readonly tasksService: TasksService) { }

    /**
     * POST /tasks
     * Create a new task
     * Only ADMINs can create tasks
     */
    @Post()
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
        this.logger.log(`Creating task: ${createTaskDto.title} by user: ${req.user.userId}`);
        return this.tasksService.create(createTaskDto, req.user.userId);
    }

    /**
     * GET /tasks
     * Get all tasks
     * - ADMINs see all tasks
     * - USERs see only tasks assigned to them
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Request() req: any) {
        this.logger.log(`Fetching all tasks for user: ${req.user.userId}`);
        return this.tasksService.findAll(req.user.userId, req.user.role);
    }

    /**
     * GET /tasks/:id
     * Get a single task by ID
     * - ADMINs can view any task
     * - USERs can only view tasks assigned to them
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Request() req: any) {
        this.logger.log(`Fetching task: ${id} for user: ${req.user.userId}`);
        return this.tasksService.findOne(id, req.user.userId, req.user.role);
    }

    /**
     * PUT /tasks/:id
     * Update a task by ID
     * - ADMINs can update any task
     * - USERs can only update tasks assigned to them
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Request() req: any
    ) {
        this.logger.log(`Updating task: ${id} by user: ${req.user.userId}`);
        return this.tasksService.update(id, updateTaskDto, req.user.userId, req.user.role);
    }

    /**
     * DELETE /tasks/:id
     * Delete a task by ID
     * Only ADMINs can delete tasks
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @Request() req: any) {
        this.logger.log(`Deleting task: ${id} by user: ${req.user.userId}`);
        return this.tasksService.remove(id);
    }
}
