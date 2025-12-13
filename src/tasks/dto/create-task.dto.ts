import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../generated/prisma';

/**
 * DTO for creating a new task
 */
export class CreateTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'Task title is required' })
    @MaxLength(255, { message: 'Task title must not exceed 255 characters' })
    title: string;

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

    @IsUUID('4', { message: 'Project ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Project ID is required' })
    projectId: string;

    @IsUUID('4', { message: 'Assignee ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Assignee ID is required' })
    assigneeId: string;
}
