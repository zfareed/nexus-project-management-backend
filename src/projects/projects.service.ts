import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AssignUsersDto } from './dto';
import { UserRole } from '../generated/prisma';

/**
 * ProjectsService - Handles all business logic for projects
 */
@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new project
     * @param createProjectDto - Project data
     * @param createdById - ID of the user creating the project
     */
    async create(createProjectDto: CreateProjectDto, createdById: string) {
        const { name, description, userIds } = createProjectDto;

        try {
            // Verify all user IDs exist if provided
            if (userIds && userIds.length > 0) {
                const users = await this.prisma.user.findMany({
                    where: { id: { in: userIds } },
                });

                if (users.length !== userIds.length) {
                    const foundIds = users.map(u => u.id);
                    const missingIds = userIds.filter(id => !foundIds.includes(id));
                    throw new BadRequestException(
                        `The following user IDs do not exist: ${missingIds.join(', ')}`
                    );
                }
            }

            // Create the project with assigned users
            const project = await this.prisma.project.create({
                data: {
                    name,
                    description,
                    createdById,
                    users: userIds && userIds.length > 0 ? {
                        create: userIds.map(userId => ({
                            userId,
                        })),
                    } : undefined,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            });

            this.logger.log(`Project created: ${project.id} by user: ${createdById}`);

            // Format the response
            return this.formatProjectResponse(project);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to create project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to create project');
        }
    }

    /**
     * Get all projects
     * For ADMINs: Returns all projects
     * For USERs: Returns only projects they are assigned to
     */
    async findAll(userId: string, userRole: UserRole) {
        try {
            const whereClause = userRole === UserRole.ADMIN
                ? {} // Admins see all projects
                : { users: { some: { userId } } }; // Users see only assigned projects

            const projects = await this.prisma.project.findMany({
                where: whereClause,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return projects.map(project => this.formatProjectResponse(project));
        } catch (error) {
            this.logger.error(`Failed to fetch projects: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to fetch projects');
        }
    }

    /**
     * Get a single project by ID
     * Checks if user has access to the project
     */
    async findOne(id: string, userId: string, userRole: UserRole) {
        try {
            const project = await this.prisma.project.findUnique({
                where: { id },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    tasks: {
                        include: {
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
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            });

            if (!project) {
                throw new NotFoundException(`Project with ID ${id} not found`);
            }

            // Check if user has access to this project
            if (userRole !== UserRole.ADMIN) {
                const isAssigned = project.users.some(pu => pu.userId === userId);
                if (!isAssigned) {
                    throw new ForbiddenException('You do not have access to this project');
                }
            }

            return this.formatProjectResponse(project);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Failed to fetch project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to fetch project');
        }
    }

    /**
     * Update a project by ID
     * Only ADMINs can update projects
     */
    async update(id: string, updateProjectDto: UpdateProjectDto) {
        const { name, description, userIds } = updateProjectDto;

        try {
            // Check if project exists
            const existingProject = await this.prisma.project.findUnique({
                where: { id },
            });

            if (!existingProject) {
                throw new NotFoundException(`Project with ID ${id} not found`);
            }

            // Verify all user IDs exist if provided
            if (userIds && userIds.length > 0) {
                const users = await this.prisma.user.findMany({
                    where: { id: { in: userIds } },
                });

                if (users.length !== userIds.length) {
                    const foundIds = users.map(u => u.id);
                    const missingIds = userIds.filter(id => !foundIds.includes(id));
                    throw new BadRequestException(
                        `The following user IDs do not exist: ${missingIds.join(', ')}`
                    );
                }
            }

            // Update project
            const project = await this.prisma.project.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(userIds && {
                        users: {
                            // Delete all existing assignments and create new ones
                            deleteMany: {},
                            create: userIds.map(userId => ({
                                userId,
                            })),
                        },
                    }),
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            });

            this.logger.log(`Project updated: ${id}`);
            return this.formatProjectResponse(project);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to update project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to update project');
        }
    }

    /**
     * Delete a project by ID
     * Only ADMINs can delete projects
     */
    async remove(id: string) {
        try {
            // Check if project exists
            const existingProject = await this.prisma.project.findUnique({
                where: { id },
            });

            if (!existingProject) {
                throw new NotFoundException(`Project with ID ${id} not found`);
            }

            await this.prisma.project.delete({
                where: { id },
            });

            this.logger.log(`Project deleted: ${id}`);
            return {
                message: 'Project deleted successfully',
                id,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to delete project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to delete project');
        }
    }

    /**
     * Assign users to a project
     * Only ADMINs can assign users
     */
    async assignUsers(id: string, assignUsersDto: AssignUsersDto) {
        const { userIds } = assignUsersDto;

        try {
            // Check if project exists
            const existingProject = await this.prisma.project.findUnique({
                where: { id },
            });

            if (!existingProject) {
                throw new NotFoundException(`Project with ID ${id} not found`);
            }

            // Verify all user IDs exist
            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
            });

            if (users.length !== userIds.length) {
                const foundIds = users.map(u => u.id);
                const missingIds = userIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(
                    `The following user IDs do not exist: ${missingIds.join(', ')}`
                );
            }

            // Get existing assignments
            const existingAssignments = await this.prisma.projectUsers.findMany({
                where: { projectId: id },
            });

            const existingUserIds = existingAssignments.map(pa => pa.userId);
            const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId));

            // Add new assignments
            if (newUserIds.length > 0) {
                await this.prisma.projectUsers.createMany({
                    data: newUserIds.map(userId => ({
                        projectId: id,
                        userId,
                    })),
                });
            }

            // Fetch updated project
            const project = await this.prisma.project.findUnique({
                where: { id },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            });

            this.logger.log(`Users assigned to project: ${id}`);
            return this.formatProjectResponse(project);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to assign users to project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to assign users to project');
        }
    }

    /**
     * Remove users from a project
     * Only ADMINs can remove users
     */
    async removeUsers(id: string, assignUsersDto: AssignUsersDto) {
        const { userIds } = assignUsersDto;

        try {
            // Check if project exists
            const existingProject = await this.prisma.project.findUnique({
                where: { id },
            });

            if (!existingProject) {
                throw new NotFoundException(`Project with ID ${id} not found`);
            }

            // Remove user assignments
            await this.prisma.projectUsers.deleteMany({
                where: {
                    projectId: id,
                    userId: { in: userIds },
                },
            });

            // Fetch updated project
            const project = await this.prisma.project.findUnique({
                where: { id },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            });

            this.logger.log(`Users removed from project: ${id}`);
            return this.formatProjectResponse(project);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to remove users from project: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to remove users from project');
        }
    }

    /**
     * Format project response to clean structure
     */
    private formatProjectResponse(project: any) {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            createdBy: project.createdBy,
            assignedUsers: project.users?.map((pu: any) => pu.user) || [],
            tasks: project.tasks || [],
            taskCount: project._count?.tasks || 0,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
}
