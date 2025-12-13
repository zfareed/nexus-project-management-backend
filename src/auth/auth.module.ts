import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
                const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn as any,
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }

