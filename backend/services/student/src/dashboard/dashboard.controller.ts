import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, JwtPayload } from '../common/jwt.guard';
import { DashboardService } from './dashboard.service';

interface AuthRequest extends Express.Request {
  user: JwtPayload;
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/parent/:childId
   * Returns the parent dashboard for the specified child.
   * Requires the requesting user to be a registered guardian of that child.
   */
  @Get('parent/:childId')
  async getParentDashboard(
    @Param('childId') childId: string,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.sub;

    const isGuardian = await this.dashboardService.isGuardianOf(userId, childId);
    if (!isGuardian) {
      throw new ForbiddenException('You do not have access to this student\'s dashboard');
    }

    const dashboard = await this.dashboardService.getParentDashboard(childId);
    if (!dashboard) {
      throw new NotFoundException('Student not found');
    }

    return dashboard;
  }
}
