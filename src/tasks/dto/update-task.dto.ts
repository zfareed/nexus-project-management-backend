import { IsString, IsOptional, MaxLength, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../generated/prisma';

/**
 * DTO for updating an existing task
 * All fields are optional since we support partial updates
 */
export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Task title must not exceed 255 characters' })
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority, { message: 'Priority must be one of: LOW, MEDIUM, HIGH' })
    @IsOptional()
    priority?: TaskPriority;

    @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
    @IsOptional()
    dueDate?: string;
}
