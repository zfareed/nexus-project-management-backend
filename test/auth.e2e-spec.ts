import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        getCurrentUser: jest.fn(),
        logout: jest.fn(),
    };

    const mockPrismaService = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };

    const mockUserUserId = '550e8400-e29b-41d4-a716-446655440001';
    const mockUserEmail = 'test@example.com';
    const mockAuthToken = 'mock-jwt-token';

    const mockUser = {
        userId: mockUserUserId,
        email: mockUserEmail,
        role: 'USER',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(AuthService)
            .useValue(mockAuthService)
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = mockUser;
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        authService = moduleFixture.get<AuthService>(AuthService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('/auth/register (POST)', () => {
        it('should register a new user successfully', async () => {
            const registerDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const expectedResponse = {
                user: { id: mockUserUserId, email: mockUserEmail, name: 'Test User', role: 'USER' },
                token: mockAuthToken,
            };

            mockAuthService.register.mockResolvedValue(expectedResponse);

            return request(app.getHttpServer())
                .post('/auth/register')
                .send(registerDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(expectedResponse);
                    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
                });
        });

        it('should return 400 on invalid input', async () => {
            const invalidDto = {
                email: 'not-an-email',
                password: 'short',
            };

            return request(app.getHttpServer())
                .post('/auth/register')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('/auth/login (POST)', () => {
        it('should login user successfully', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            const expectedResponse = {
                user: { id: mockUserUserId, email: mockUserEmail, name: 'Test User', role: 'USER' },
                token: mockAuthToken,
            };

            mockAuthService.login.mockResolvedValue(expectedResponse);

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(expectedResponse);
                    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
                });
        });

        it('should return 400 on invalid input', async () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'invalid' })
                .expect(400);
        });
    });

    describe('/auth/me (GET)', () => {
        it('should return current user profile', async () => {
            const expectedProfile = {
                id: mockUserUserId,
                email: mockUserEmail,
                name: 'Test User',
                role: 'USER',
            };

            mockAuthService.getCurrentUser.mockResolvedValue(expectedProfile);

            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(expectedProfile);
                    expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(mockUserUserId);
                });
        });
    });

    describe('/auth/logout (POST)', () => {
        it('should logout user successfully', async () => {
            return request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .expect({ message: 'Logged out successfully' });
        });
    });
});
