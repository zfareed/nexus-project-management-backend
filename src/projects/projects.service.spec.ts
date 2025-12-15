import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../generated/prisma';
import { CreateProjectDto, UpdateProjectDto, AssignUsersDto } from './dto';

const mockPrismaService = {
    project: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    user: {
        findMany: jest.fn(),
    },
    projectUsers: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
    },
};

describe('ProjectsService', () => {
    let service: ProjectsService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
        prisma = module.get(PrismaService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        const createProjectDto: CreateProjectDto = {
            name: 'Project A',
            description: 'Desc',
            userIds: ['user-1', 'user-2'],
        };
        const createdById = 'admin-id';

        it('should create project successfully', async () => {
            prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
            prisma.project.create.mockResolvedValue({
                id: 'proj-1',
                ...createProjectDto,
                createdBy: { id: createdById },
                users: [{ user: { id: 'user-1' } }, { user: { id: 'user-2' } }],
                _count: { tasks: 0 },
            });

            const result = await service.create(createProjectDto, createdById);

            expect(prisma.user.findMany).toHaveBeenCalled();
            expect(prisma.project.create).toHaveBeenCalled();
            expect(result.id).toBe('proj-1');
        });

        it('should throw BadRequestException if some users do not exist', async () => {
            prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]); // user-2 missing

            await expect(service.create(createProjectDto, createdById)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return all projects for ADMIN', async () => {
            prisma.project.findMany.mockResolvedValue([{ id: 'proj-1' }]);
            const result = await service.findAll('admin-id', UserRole.ADMIN);
            expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
            expect(result).toHaveLength(1);
        });

        it('should return assigned projects for USER', async () => {
            prisma.project.findMany.mockResolvedValue([{ id: 'proj-1' }]);
            const result = await service.findAll('user-1', UserRole.USER);
            expect(prisma.project.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { users: { some: { userId: 'user-1' } } } })
            );
            expect(result).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        const projectId = 'proj-1';

        it('should return project for ADMIN', async () => {
            prisma.project.findUnique.mockResolvedValue({
                id: projectId,
                users: []
            });

            const result = await service.findOne(projectId, 'admin', UserRole.ADMIN);
            expect(result.id).toBe(projectId);
        });

        it('should throw ForbiddenException if USER is not assigned', async () => {
            prisma.project.findUnique.mockResolvedValue({
                id: projectId,
                users: [{ userId: 'other-user' }]
            });

            await expect(service.findOne(projectId, 'user-1', UserRole.USER)).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if project not found', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            await expect(service.findOne(projectId, 'admin', UserRole.ADMIN)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const projectId = 'proj-1';
        const updateDto: UpdateProjectDto = { name: 'Updated Name', userIds: ['user-1'] };

        it('should update project successfully', async () => {
            prisma.project.findUnique.mockResolvedValue({ id: projectId }); // exists
            prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]); // users exist
            prisma.project.update.mockResolvedValue({
                id: projectId,
                name: 'Updated Name',
                users: [{ user: { id: 'user-1' } }]
            });

            const result = await service.update(projectId, updateDto);
            expect(prisma.project.update).toHaveBeenCalled();
            expect(result.name).toBe('Updated Name');
        });

        it('should throw NotFoundException if project does not exist', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            await expect(service.update(projectId, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete project successfully', async () => {
            prisma.project.findUnique.mockResolvedValue({ id: 'proj-1' });
            prisma.project.delete.mockResolvedValue({ id: 'proj-1' });

            await service.remove('proj-1');
            expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'proj-1' } });
        });
    });

    describe('assignUsers', () => {
        const projectId = 'proj-1';
        const dto: AssignUsersDto = { userIds: ['user-new'] };

        it('should assign new users', async () => {
            prisma.project.findUnique.mockResolvedValueOnce({ id: projectId }) // check exists
                .mockResolvedValueOnce({ id: projectId, users: [{ user: { id: 'user-new' } }] }); // return result

            prisma.user.findMany.mockResolvedValue([{ id: 'user-new' }]);
            prisma.projectUsers.findMany.mockResolvedValue([]); // no existing assignments

            await service.assignUsers(projectId, dto);
            expect(prisma.projectUsers.createMany).toHaveBeenCalled();
        });
    });

    describe('removeUsers', () => {
        const projectId = 'proj-1';
        const dto: AssignUsersDto = { userIds: ['user-old'] };

        it('should remove users', async () => {
            prisma.project.findUnique.mockResolvedValueOnce({ id: projectId }) // check exists
                .mockResolvedValueOnce({ id: projectId, users: [] }); // return result

            await service.removeUsers(projectId, dto);
            expect(prisma.projectUsers.deleteMany).toHaveBeenCalled();
        });
    });
});
