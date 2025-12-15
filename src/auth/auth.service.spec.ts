import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');

const mockPrismaService = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
};

const mockJwtService = {
    sign: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;
    let prisma: typeof mockPrismaService;
    let jwtService: typeof mockJwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get(PrismaService);
        jwtService = module.get(JwtService);

        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        };

        it('should successfully register a new user', async () => {
            const hashedPassword = 'hashedPassword';
            const user = {
                id: '1',
                ...registerDto,
                password: hashedPassword,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const token = 'jwt-token';

            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            prisma.user.create.mockResolvedValue(user);
            jwtService.sign.mockReturnValue(token);

            const result = await service.register(registerDto);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: registerDto.name,
                    email: registerDto.email,
                    password: hashedPassword,
                    role: 'USER',
                },
            });
            expect(jwtService.sign).toHaveBeenCalled();
            expect(result).toEqual({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: registerDto.email });

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on unexpected error', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should successfully login user', async () => {
            const user = {
                id: '1',
                email: loginDto.email,
                password: 'hashedPassword',
                name: 'Test User',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const token = 'jwt-token';

            prisma.user.findUnique.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwtService.sign.mockReturnValue(token);

            const result = await service.login(loginDto);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
            expect(jwtService.sign).toHaveBeenCalled();
            expect(result).toEqual({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password valid is invalid', async () => {
            const user = {
                id: '1',
                email: loginDto.email,
                password: 'hashedPassword',
            };
            prisma.user.findUnique.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw InternalServerErrorException on unexpected error', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUser', () => {
        it('should return user details', async () => {
            const userId = '1';
            const user = {
                id: userId,
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prisma.user.findUnique.mockResolvedValue(user);

            const result = await service.validateUser(userId);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            expect(result).toEqual(user);
        });
    });

    describe('getCurrentUser', () => {
        it('should return current user details', async () => {
            const userId = '1';
            const user = {
                id: userId,
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prisma.user.findUnique.mockResolvedValue(user);

            const result = await service.getCurrentUser(userId);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            expect(result).toEqual(user);
        });

        it('should throw NotFoundException if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.getCurrentUser('1')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException on unexpected error', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await expect(service.getCurrentUser('1')).rejects.toThrow(InternalServerErrorException);
        });
    });
});
