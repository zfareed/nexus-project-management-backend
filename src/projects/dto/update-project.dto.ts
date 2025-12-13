import { IsString, IsOptional, MaxLength, IsArray, IsUUID } from 'class-validator';

/**
 * DTO for updating an existing project
 * All fields are optional since this is a partial update
 */
export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray({ message: 'User IDs must be an array' })
    @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
    @IsOptional()
    userIds?: string[];
}
