import { IsString, IsOptional, IsNotEmpty, MaxLength, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new project
 */
export class CreateProjectDto {
    @IsString()
    @IsNotEmpty({ message: 'Project name is required' })
    @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray({ message: 'User IDs must be an array' })
    @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
    @IsOptional()
    userIds?: string[];
}
