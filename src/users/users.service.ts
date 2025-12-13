import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma';
import { QueryUsersDto, UpdateUserDto, UserListDto } from './dto';
import { UserDto } from '../auth/dto/user.dto';

/**
 * UsersService - Handles business logic for user management
 * Implements pagination, search, and role-based access control
 */
@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all users with pagination and search (Admin-only)
     * @param queryDto - Query parameters for pagination and search
     * @returns Paginated list of users without passwords
     */
    async findAll(queryDto: QueryUsersDto): Promise<UserListDto> {
        const { page = 1, limit = 10, search = '' } = queryDto;
        const skip = (page - 1) * limit;

        this.logger.log(`Fetching users: page=${page}, limit=${limit}, search="${search}"`);

        // Build search filter
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        // Get total count and users in parallel for better performance
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    // Explicitly exclude password
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        this.logger.log(`Found ${users.length} users out of ${total} total`);

        return {
            users: users as UserDto[],
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Get a single user by ID
     * - Admins can view any user
     * - Regular users can only view their own profile
     * 
     * @param id - User ID to fetch
     * @param requestingUserId - ID of the user making the request
     * @param requestingUserRole - Role of the user making the request
     * @returns User without password
     */
    async findOne(
        id: string,
        requestingUserId: string,
        requestingUserRole: string,
    ): Promise<UserDto> {
        this.logger.log(`User ${requestingUserId} (${requestingUserRole}) fetching user ${id}`);

        // Check authorization: Regular users can only view their own profile
        if (requestingUserRole !== UserRole.ADMIN && id !== requestingUserId) {
            this.logger.warn(
                `User ${requestingUserId} attempted to view another user's profile (${id})`
            );
            throw new ForbiddenException(
                'You do not have permission to view this user profile'
            );
        }

        // Fetch user
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Explicitly exclude password
            },
        });

        if (!user) {
            this.logger.warn(`User ${id} not found`);
            throw new NotFoundException('User not found');
        }

        this.logger.log(`Successfully fetched user ${id}`);
        return user as UserDto;
    }

    /**
     * Update a user by ID
     * - Admins can update name and role for any user
     * - Regular users can only update their own name (not role)
     * 
     * @param id - User ID to update
     * @param updateUserDto - Update data
     * @param requestingUserId - ID of the user making the request
     * @param requestingUserRole - Role of the user making the request
     * @returns Updated user without password
     */
    async update(
        id: string,
        updateUserDto: UpdateUserDto,
        requestingUserId: string,
        requestingUserRole: string,
    ): Promise<UserDto> {
        this.logger.log(
            `User ${requestingUserId} (${requestingUserRole}) updating user ${id}`,
        );

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            this.logger.warn(`User ${id} not found`);
            throw new NotFoundException('User not found');
        }

        // Authorization: Regular users can only update their own profile
        if (requestingUserRole !== UserRole.ADMIN && id !== requestingUserId) {
            this.logger.warn(
                `User ${requestingUserId} attempted to update another user's profile (${id})`
            );
            throw new ForbiddenException(
                'You do not have permission to update this user'
            );
        }

        // Regular users cannot update role (even their own)
        if (requestingUserRole !== UserRole.ADMIN && updateUserDto.role) {
            this.logger.warn(
                `User ${requestingUserId} attempted to update role without admin privileges`
            );
            throw new ForbiddenException(
                'Only administrators can update user roles'
            );
        }

        // Validate: Don't allow empty updates
        if (!updateUserDto.name && !updateUserDto.role) {
            throw new BadRequestException('At least one field (name or role) must be provided');
        }

        // Prepare update data
        const updateData: any = {};
        if (updateUserDto.name) {
            updateData.name = updateUserDto.name;
        }
        if (updateUserDto.role && requestingUserRole === UserRole.ADMIN) {
            updateData.role = updateUserDto.role;
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Explicitly exclude password
            },
        });

        this.logger.log(`Successfully updated user ${id}`);
        return updatedUser as UserDto;
    }
}
