import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, JwtPayload } from '../common/jwt.guard';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { RemoveDeviceTokenDto } from './dto/remove-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

interface AuthRequest extends Express.Request {
  user: JwtPayload;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications/device-token
   * Register (upsert) an FCM device token for the authenticated user.
   */
  @Post('device-token')
  registerToken(
    @Req() req: AuthRequest,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    const { sub: userId, schoolId } = req.user;
    return this.notificationsService.registerToken(userId, schoolId, dto);
  }

  /**
   * DELETE /notifications/device-token
   * Deactivate an FCM device token for the authenticated user.
   */
  @Delete('device-token')
  removeToken(
    @Req() req: AuthRequest,
    @Body() dto: RemoveDeviceTokenDto,
  ) {
    return this.notificationsService.removeToken(req.user.sub, dto.token);
  }

  /**
   * POST /notifications/send
   * Send a push notification to a target userId.
   * Intended for internal/admin use (caller must be authenticated).
   */
  @Post('send')
  sendNotification(
    @Req() req: AuthRequest,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationsService.sendToUser(req.user.schoolId, dto);
  }

  /**
   * GET /notifications/history?limit=20&page=1
   * Returns the authenticated user's notification log.
   */
  @Get('history')
  getHistory(
    @Req() req: AuthRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.notificationsService.getHistory(
      req.user.sub,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
