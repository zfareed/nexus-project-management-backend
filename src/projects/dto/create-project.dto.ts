import { IsString, IsOptional, IsNotEmpty, MaxLength, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new project
 */
export class CreateProjectDto {
    @ApiProperty({
        description: 'Name of the project',
        example: 'Website Redesign',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty({ message: 'Project name is required' })
    @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the project',
        example: 'Complete redesign of the corporate website',
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
