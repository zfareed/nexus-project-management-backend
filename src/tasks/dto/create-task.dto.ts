import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../generated/prisma';

/**
 * DTO for creating a new task
 */
export class CreateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement authentication',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty({ message: 'Task title is required' })
    @MaxLength(255, { message: 'Task title must not exceed 255 characters' })
    title: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the task',
        example: 'Implement JWT-based authentication using Passport strategy',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Current status of the task',
        enum: TaskStatus,
        example: TaskStatus.TODO,
    })
    @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, REVIEW, DONE' })
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.MEDIUM,
    })
    @IsEnum(TaskPriority, { message: 'Priority must be one of: LOW, MEDIUM, HIGH' })
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional({
        description: 'Due date for the task',
        example: '2024-12-31T23:59:59Z',
        format: 'date-time',
    })
    @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
    @IsOptional()
    dueDate?: string;

    @ApiProperty({
        description: 'ID of the project this task belongs to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID('4', { message: 'Project ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Project ID is required' })
    projectId: string;

    @ApiProperty({
        description: 'ID of the user assigned to this task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID('4', { message: 'Assignee ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Assignee ID is required' })
    assigneeId: string;
}
