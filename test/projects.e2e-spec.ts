import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ProjectsService } from '../src/projects/projects.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '../src/generated/prisma';

describe('ProjectsController (e2e)', () => {
    let app: INestApplication;
    let projectsService: ProjectsService;

    const mockProjectsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        assignUsers: jest.fn(),
        removeUsers: jest.fn(),
    };

    const mockPrismaService = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };

    const mockAdminUserId = '550e8400-e29b-41d4-a716-446655440001';
    const mockUserUserId = '550e8400-e29b-41d4-a716-446655440002';

    const mockAdmin = {
        userId: mockAdminUserId,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
    };

    const mockUser = {
        userId: mockUserUserId,
        email: 'user@example.com',
        role: UserRole.USER,
    };

    let currentUser = mockAdmin;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ProjectsService)
            .useValue(mockProjectsService)
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
                canActivate: () => true,
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        projectsService = moduleFixture.get<ProjectsService>(ProjectsService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('/projects (POST)', () => {
        it('should create a project', async () => {
            currentUser = mockAdmin;
            const createProjectDto = {
                name: 'New Project',
                description: 'Test Description',
            };
            const createdProject = { id: '550e8400-e29b-41d4-a716-446655440003', ...createProjectDto };

            mockProjectsService.create.mockResolvedValue(createdProject);

            return request(app.getHttpServer())
                .post('/projects')
                .send(createProjectDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(createdProject);
                    expect(mockProjectsService.create).toHaveBeenCalledWith(createProjectDto, mockAdminUserId);
                });
        });

        it('should validation fail for invalid project data', async () => {
            return request(app.getHttpServer())
                .post('/projects')
                .send({ name: '' })
                .expect(400);
        });
    });

    describe('/projects (GET)', () => {
        it('should return all projects', async () => {
            currentUser = mockUser;
            const projects = [{ id: '550e8400-e29b-41d4-a716-446655440003', name: 'Test Project' }];
            mockProjectsService.findAll.mockResolvedValue(projects);

            return request(app.getHttpServer())
                .get('/projects')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(projects);
                    expect(mockProjectsService.findAll).toHaveBeenCalledWith(mockUserUserId, mockUser.role);
                });
        });
    });

    describe('/projects/:id (GET)', () => {
        it('should return a single project', async () => {
            currentUser = mockUser;
            const projectId = '550e8400-e29b-41d4-a716-446655440003';
            const project = { id: projectId, name: 'Test Project' };
            mockProjectsService.findOne.mockResolvedValue(project);

            return request(app.getHttpServer())
                .get(`/projects/${projectId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(project);
                    expect(mockProjectsService.findOne).toHaveBeenCalledWith(projectId, mockUserUserId, mockUser.role);
                });
        });
    });

    describe('/projects/:id (PUT)', () => {
        it('should update a project', async () => {
            currentUser = mockAdmin;
            const projectId = '550e8400-e29b-41d4-a716-446655440003';
            const updateProjectDto = { name: 'Updated Name' };
            const updatedProject = { id: projectId, name: 'Updated Name' };

            mockProjectsService.update.mockResolvedValue(updatedProject);

            return request(app.getHttpServer())
                .put(`/projects/${projectId}`)
                .send(updateProjectDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(updatedProject);
                    expect(mockProjectsService.update).toHaveBeenCalledWith(projectId, updateProjectDto);
                });
        });
    });

    describe('/projects/:id (DELETE)', () => {
        it('should delete a project', async () => {
            currentUser = mockAdmin;
            const projectId = '550e8400-e29b-41d4-a716-446655440003';
            const result = { message: 'Project deleted successfully' };

            mockProjectsService.remove.mockResolvedValue(result);

            return request(app.getHttpServer())
                .delete(`/projects/${projectId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(result);
                    expect(mockProjectsService.remove).toHaveBeenCalledWith(projectId);
                });
        });
    });

    describe('/projects/:id/assign-users (POST)', () => {
        it('should assign users to project', async () => {
            currentUser = mockAdmin;
            const projectId = '550e8400-e29b-41d4-a716-446655440003';
            const assignDto = { userIds: ['550e8400-e29b-41d4-a716-446655440002'] }; // Real UUID
            const result = { message: 'Users assigned successfully' };

            mockProjectsService.assignUsers.mockResolvedValue(result);

            return request(app.getHttpServer())
                .post(`/projects/${projectId}/assign-users`)
                .send(assignDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(result);
                    expect(mockProjectsService.assignUsers).toHaveBeenCalledWith(projectId, assignDto);
                });
        });
    });

    describe('/projects/:id/remove-users (POST)', () => {
        it('should remove users from project', async () => {
            currentUser = mockAdmin;
            const projectId = '550e8400-e29b-41d4-a716-446655440003';
            const removeDto = { userIds: ['550e8400-e29b-41d4-a716-446655440002'] };
            const result = { message: 'Users removed successfully' };

            mockProjectsService.removeUsers.mockResolvedValue(result);

            return request(app.getHttpServer())
                .post(`/projects/${projectId}/remove-users`)
                .send(removeDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(result);
                    expect(mockProjectsService.removeUsers).toHaveBeenCalledWith(projectId, removeDto);
                });
        });
    });
});
