import { IsString, IsOptional, MaxLength, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../generated/prisma';

/**
 * DTO for updating an existing task
 * All fields are optional since we support partial updates
 */
export class UpdateTaskDto {
    @ApiPropertyOptional({
        description: 'Title of the task',
        example: 'Implement authentication',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Task title must not exceed 255 characters' })
    title?: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the task',
        example: 'Updated description',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Current status of the task',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
    })
    @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
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
}
