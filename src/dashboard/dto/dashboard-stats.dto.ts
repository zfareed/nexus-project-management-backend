
import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
    @ApiProperty({ description: 'Total number of projects involved in', example: 3 })
    totalProjects: number;

    @ApiProperty({ description: 'Number of completed tasks', example: 1 })
    tasksCompleted: number;

    @ApiProperty({ description: 'Task completion rate as a percentage', example: 20 })
    completionRate: number;

    @ApiProperty({ description: 'Number of pending tasks', example: 4 })
    pendingTasks: number;

    @ApiProperty({ description: 'Number of overdue tasks', example: 4 })
    overdueTasks: number;
}

export class TaskStatusDistributionDto {
    @ApiProperty({ description: 'Task status', example: 'TODO' })
    status: string;

    @ApiProperty({ description: 'Count of tasks with this status', example: 2 })
    count: number;
}

export class TaskPriorityDistributionDto {
    @ApiProperty({ description: 'Task priority', example: 'HIGH' })
    priority: string;

    @ApiProperty({ description: 'Count of tasks with this priority', example: 2 })
    count: number;
}

export class DashboardStatsDto {
    @ApiProperty({ type: DashboardOverviewDto })
    overview: DashboardOverviewDto;

    @ApiProperty({ type: [TaskStatusDistributionDto] })
    taskStatusDistribution: TaskStatusDistributionDto[];

    @ApiProperty({ type: [TaskPriorityDistributionDto] })
    taskPriorityDistribution: TaskPriorityDistributionDto[];
}
