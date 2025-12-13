import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            this.logger.warn('Authorization header missing');
            throw new UnauthorizedException('Authorization header is missing');
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            this.logger.warn('Invalid authorization header format');
            throw new UnauthorizedException('Invalid authorization header format');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
            const payload = this.jwtService.verify(token, { secret });

            // Attach the payload to the request object
            request.user = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                this.logger.warn('Token has expired');
                throw new UnauthorizedException('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                this.logger.warn('Invalid token');
                throw new UnauthorizedException('Invalid token');
            } else {
                this.logger.error('Token verification failed', error);
                throw new UnauthorizedException('Token verification failed');
            }
        }
    }
}
