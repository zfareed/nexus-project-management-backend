
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, TaskStatus } from '../generated/prisma';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats(userId: string, role: string) {
        // Define filters based on role
        const isAdmin = role === UserRole.ADMIN;

        const projectWhere = isAdmin ? {} : {
            OR: [
                { createdById: userId },
                { users: { some: { userId: userId } } },
            ],
        };

        const taskWhere: any = isAdmin ? {} : { assigneeId: userId };

        // 1. Get projects count
        const projectsCount = await this.prisma.project.count({
            where: projectWhere,
        });

        // 2. Tasks Statistics
        const [
            totalAssignedTasks,
            completedTasksCount,
            pendingTasksCount,
            overdueTasksCount,
            tasksByStatus,
            tasksByPriority
        ] = await Promise.all([
            // Total Tasks
            this.prisma.task.count({
                where: taskWhere
            }),
            // Completed
            this.prisma.task.count({
                where: { ...taskWhere, status: TaskStatus.DONE }
            }),
            // Pending (Not Done)
            this.prisma.task.count({
                where: {
                    ...taskWhere,
                    status: { not: TaskStatus.DONE }
                }
            }),
            // Overdue (Not Done and Due Date < Now)
            this.prisma.task.count({
                where: {
                    ...taskWhere,
                    status: { not: TaskStatus.DONE },
                    dueDate: { lt: new Date() }
                }
            }),
            // Distribution by Status
            this.prisma.task.groupBy({
                by: ['status'],
                where: taskWhere,
                _count: { status: true }
            }),
            // Distribution by Priority
            this.prisma.task.groupBy({
                by: ['priority'],
                where: taskWhere,
                _count: { priority: true }
            })
        ]);

        // Calculate completion rate
        const completionRate = totalAssignedTasks > 0
            ? Math.round((completedTasksCount / totalAssignedTasks) * 100)
            : 0;

        return {
            overview: {
                totalProjects: projectsCount,
                tasksCompleted: completedTasksCount,
                completionRate: completionRate,
                pendingTasks: pendingTasksCount,
                overdueTasks: overdueTasksCount,
            },
            taskStatusDistribution: tasksByStatus.map(item => ({
                status: item.status,
                count: item._count.status
            })),
            taskPriorityDistribution: tasksByPriority.map(item => ({
                priority: item.priority,
                count: item._count.priority
            }))
        };
    }
}
