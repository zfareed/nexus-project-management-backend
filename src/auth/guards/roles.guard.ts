import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard - Role-based Authorization Guard
 * 
 * This guard checks if the authenticated user has one of the required roles
 * to access a route. It works in conjunction with the @Roles() decorator.
 * 
 * @example
 * // In your controller:
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * adminOnlyRoute() {
 *   return { message: 'Admin access granted' };
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get the required roles from the route metadata
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Get the request object
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if user exists (should be populated by JwtAuthGuard)
        if (!user) {
            this.logger.warn('User not found in request. Make sure JwtAuthGuard is applied before RolesGuard.');
            throw new ForbiddenException('Access denied. User authentication required.');
        }

        // Check if user has the required role
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            this.logger.warn(
                `User ${user.userId} with role ${user.role} attempted to access route requiring roles: ${requiredRoles.join(', ')}`
            );
            throw new ForbiddenException(
                'Access denied. You do not have the required permissions to access this resource.'
            );
        }

        this.logger.log(`User ${user.userId} with role ${user.role} granted access`);
        return true;
    }
}
