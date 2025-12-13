import { IsOptional, IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../generated/prisma';

/**
 * UpdateUserDto - DTO for updating user information
 * Used for PUT /users/:id endpoint
 * 
 * Regular users can only update their own name
 * Admins can update name and role for any user
 */
export class UpdateUserDto {
    /**
     * User's name
     * Length must be between 2 and 100 characters
     */
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    /**
     * User's role (ADMIN or USER)
     * Only admins can update this field
     */
    @IsOptional()
    @IsEnum(UserRole, { message: 'Role must be either ADMIN or USER' })
    role?: UserRole;
}
