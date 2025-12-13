import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly saltRounds = 10;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { name, email, password } = registerDto;

        try {
            // Check if user with email already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new ConflictException('Email already registered');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            // Create the user with default USER role
            const user = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER', // Default role
                },
            });

            // Generate JWT token
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            const token = this.jwtService.sign(payload);

            // Return user info (without password) and token
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            this.logger.error('Error during user registration', error);
            throw new InternalServerErrorException(
                'An error occurred during registration',
            );
        }
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        try {
            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            // Check if user exists
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Compare provided password with hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Generate JWT token
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            const token = this.jwtService.sign(payload);

            // Return user info (without password) and token
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            this.logger.error('Error during user login', error);
            throw new InternalServerErrorException(
                'An error occurred during login',
            );
        }
    }

    async validateUser(userId: string): Promise<any> {
        return this.prisma.user.findUnique({
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
    }
}
