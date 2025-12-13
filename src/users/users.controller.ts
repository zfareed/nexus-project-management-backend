import {
    Controller,
    Get,
    Put,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes,
    Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto, UpdateUserDto, UserListDto } from './dto';
import { UserDto } from '../auth/dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma';

/**
 * UsersController - Handles all HTTP requests for user management
 * All routes are protected with JWT authentication and role-based authorization
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    /**
     * GET /users
     * Get all users with pagination and search
     * Only ADMINs can access this endpoint
     * Passwords are excluded from the response
     * 
     * @query page - Page number (default: 1)
     * @query limit - Items per page (default: 10)
     * @query search - Search query for name or email (optional)
     * @returns Paginated list of users
     */
    @Get()
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async findAll(@Query() queryDto: QueryUsersDto): Promise<UserListDto> {
        this.logger.log(
            `Fetching all users: page=${queryDto.page}, limit=${queryDto.limit}, search="${queryDto.search || ''}"`
        );
        return this.usersService.findAll(queryDto);
    }

    /**
     * GET /users/:id
     * Get a single user by ID
     * - ADMINs can view any user
     * - Regular USERs can only view their own profile
     * Password is excluded from the response
     * 
     * @param id - User ID
     * @returns User without password
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Request() req: any): Promise<UserDto> {
        this.logger.log(
            `User ${req.user.userId} (${req.user.role}) fetching user ${id}`
        );
        return this.usersService.findOne(id, req.user.userId, req.user.role);
    }

    /**
     * PUT /users/:id
     * Update a user by ID
     * - ADMINs can update name and role for any user
     * - Regular USERs can only update their own name (not role)
     * 
     * @param id - User ID
     * @param updateUserDto - Update data
     * @returns Updated user without password
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any,
    ): Promise<UserDto> {
        this.logger.log(
            `User ${req.user.userId} (${req.user.role}) updating user ${id}`
        );
        return this.usersService.update(
            id,
            updateUserDto,
            req.user.userId,
            req.user.role,
        );
    }
}
