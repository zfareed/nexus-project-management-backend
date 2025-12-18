
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get dashboard statistics for the logged-in user' })
    @ApiResponse({
        status: 200,
        description: 'Dashboard statistics retrieved successfully.',
        type: DashboardStatsDto
    })
    async getStats(@Request() req): Promise<DashboardStatsDto> {
        return this.dashboardService.getDashboardStats(req.user.userId, req.user.role);
    }
}
