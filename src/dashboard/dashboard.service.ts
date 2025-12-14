
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(userId: string) {
        // 1. Get IDs of projects user is involved in (either created or assigned)
        // We could just count them directly
        const projectsCount = await this.prisma.project.count({
            where: {
                OR: [
                    { createdById: userId },
                    { users: { some: { userId: userId } } },
                ],
            },
        });

        // 2. Tasks Statistics
        // Get all tasks assigned to the user
        // We can run these in parallel for performance
        const [
            totalAssignedTasks,
            completedTasksCount,
            pendingTasksCount,
            overdueTasksCount,
            tasksByStatus,
            tasksByPriority
        ] = await Promise.all([
            // Total Assigned
            this.prisma.task.count({
                where: { assigneeId: userId }
            }),
            // Completed
            this.prisma.task.count({
                where: { assigneeId: userId, status: 'DONE' }
            }),
            // Pending (Not Done)
            this.prisma.task.count({
                where: {
                    assigneeId: userId,
                    status: { not: 'DONE' }
                }
            }),
            // Overdue (Not Done and Due Date < Now)
            this.prisma.task.count({
                where: {
                    assigneeId: userId,
                    status: { not: 'DONE' },
                    dueDate: { lt: new Date() }
                }
            }),
            // Distribution by Status
            this.prisma.task.groupBy({
                by: ['status'],
                where: { assigneeId: userId },
                _count: { status: true }
            }),
            // Distribution by Priority
            this.prisma.task.groupBy({
                by: ['priority'],
                where: { assigneeId: userId },
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
