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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
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
@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
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
    @ApiOperation({ summary: 'Get all users with pagination and search (Admin only)' })
    @ApiResponse({ status: 200, description: 'Paginated list of users retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - User role not permitted' })
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
    @ApiOperation({ summary: 'Get a single user by ID' })
    @ApiParam({ name: 'id', description: 'User ID (UUID)' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - User cannot view other profiles' })
    @ApiResponse({ status: 404, description: 'User not found' })
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
    @ApiOperation({ summary: 'Update a user' })
    @ApiParam({ name: 'id', description: 'User ID (UUID)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - User cannot update other profiles or roles' })
    @ApiResponse({ status: 404, description: 'User not found' })
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
