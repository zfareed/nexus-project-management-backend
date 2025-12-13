import { IsString, IsOptional, MaxLength, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing project
 * All fields are optional since this is a partial update
 */
export class UpdateProjectDto {
    @ApiPropertyOptional({
        description: 'Name of the project',
        example: 'Website Redesign v2',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
    name?: string;

    @ApiPropertyOptional({
        description: 'Description of the project',
        example: 'Updated description',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'List of user IDs to assign to the project',
        example: ['550e8400-e29b-41d4-a716-446655440000'],
        type: [String],
    })
    @IsArray({ message: 'User IDs must be an array' })
    @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
    @IsOptional()
    userIds?: string[];
}
