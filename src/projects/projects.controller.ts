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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AssignUsersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma';

/**
 * ProjectsController - Handles all HTTP requests for projects
 * All routes are protected with JWT authentication
 */
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    private readonly logger = new Logger(ProjectsController.name);

    constructor(private readonly projectsService: ProjectsService) { }

    /**
     * POST /projects
     * Create a new project
     * Only ADMINs can create projects
     */
    @Post()
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
        this.logger.log(`Creating project: ${createProjectDto.name} by user: ${req.user.userId}`);
        return this.projectsService.create(createProjectDto, req.user.userId);
    }

    /**
     * GET /projects
     * Get all projects
     * - ADMINs see all projects
     * - USERs see only projects they are assigned to
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Request() req: any) {
        this.logger.log(`Fetching all projects for user: ${req.user.userId}`);
        return this.projectsService.findAll(req.user.userId, req.user.role);
    }

    /**
     * GET /projects/:id
     * Get a single project by ID
     * - ADMINs can view any project
     * - USERs can only view projects they are assigned to
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Request() req: any) {
        this.logger.log(`Fetching project: ${id} for user: ${req.user.userId}`);
        return this.projectsService.findOne(id, req.user.userId, req.user.role);
    }

    /**
     * PUT /projects/:id
     * Update a project by ID
     * Only ADMINs can update projects
     */
    @Put(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Request() req: any
    ) {
        this.logger.log(`Updating project: ${id} by user: ${req.user.userId}`);
        return this.projectsService.update(id, updateProjectDto);
    }

    /**
     * DELETE /projects/:id
     * Delete a project by ID
     * Only ADMINs can delete projects
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @Request() req: any) {
        this.logger.log(`Deleting project: ${id} by user: ${req.user.userId}`);
        return this.projectsService.remove(id);
    }

    /**
     * POST /projects/:id/assign-users
     * Assign users to a project
     * Only ADMINs can assign users
     */
    @Post(':id/assign-users')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async assignUsers(
        @Param('id') id: string,
        @Body() assignUsersDto: AssignUsersDto,
        @Request() req: any
    ) {
        this.logger.log(`Assigning users to project: ${id} by user: ${req.user.userId}`);
        return this.projectsService.assignUsers(id, assignUsersDto);
    }

    /**
     * POST /projects/:id/remove-users
     * Remove users from a project
     * Only ADMINs can remove users
     */
    @Post(':id/remove-users')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async removeUsers(
        @Param('id') id: string,
        @Body() assignUsersDto: AssignUsersDto,
        @Request() req: any
    ) {
        this.logger.log(`Removing users from project: ${id} by user: ${req.user.userId}`);
        return this.projectsService.removeUsers(id, assignUsersDto);
    }
}
