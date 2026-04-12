import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';
import { NotificationLog } from '../entities/notification-log.entity';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { getFirebaseApp } from '../common/firebase';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepo: Repository<NotificationLog>,
  ) {}

  // ─── Device Token Management ──────────────────────────────────────────────

  async registerToken(
    userId: string,
    schoolId: string,
    dto: RegisterDeviceTokenDto,
  ): Promise<DeviceToken> {
    // Upsert: if (userId, token) already exists just reactivate it
    const existing = await this.deviceTokenRepo.findOne({
      where: { userId, token: dto.token },
    });

    if (existing) {
      existing.platform = dto.platform;
      existing.isActive = true;
      return this.deviceTokenRepo.save(existing);
    }

    const entity = this.deviceTokenRepo.create({
      userId,
      schoolId,
      token: dto.token,
      platform: dto.platform,
      isActive: true,
    });
    return this.deviceTokenRepo.save(entity);
  }

  async removeToken(userId: string, token: string): Promise<{ removed: boolean }> {
    const result = await this.deviceTokenRepo.update(
      { userId, token },
      { isActive: false },
    );
    return { removed: (result.affected ?? 0) > 0 };
  }

  // ─── Send Notification ────────────────────────────────────────────────────

  async sendToUser(
    schoolId: string,
    dto: SendNotificationDto,
  ): Promise<{ success: boolean; sent: number; failed: number; mock?: boolean }> {
    const tokens = await this.deviceTokenRepo.find({
      where: { userId: dto.userId, isActive: true },
    });

    const firebaseApp = getFirebaseApp();

    // Log entry — starts as pending
    const log = this.notificationLogRepo.create({
      schoolId,
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      data: dto.data ?? null,
      channel: 'push',
      status: 'pending',
    });
    await this.notificationLogRepo.save(log);

    // No firebase config — mock mode
    if (!firebaseApp) {
      this.logger.log(
        `[MOCK FCM] To userId=${dto.userId} | title="${dto.title}" | body="${dto.body}" | tokens=${tokens.length}`,
      );
      log.status = 'sent';
      log.sentAt = new Date();
      await this.notificationLogRepo.save(log);
      return { success: true, sent: tokens.length, failed: 0, mock: true };
    }

    // Real FCM sends
    let sentCount = 0;
    let failedCount = 0;

    for (const deviceToken of tokens) {
      try {
        const payload = {
          token: deviceToken.token,
          notification: { title: dto.title, body: dto.body },
          ...(dto.data
            ? {
                data: Object.fromEntries(
                  Object.entries(dto.data).map(([k, v]) => [k, String(v)]),
                ),
              }
            : {}),
        };

        await firebaseApp.messaging().send(payload);
        sentCount++;
      } catch (err) {
        this.logger.error(
          `FCM send failed for token ${deviceToken.token}: ${(err as Error).message}`,
        );
        // Deactivate invalid tokens
        await this.deviceTokenRepo.update({ id: deviceToken.id }, { isActive: false });
        failedCount++;
      }
    }

    log.status = failedCount > 0 && sentCount === 0 ? 'failed' : 'sent';
    log.sentAt = new Date();
    await this.notificationLogRepo.save(log);

    return { success: sentCount > 0 || tokens.length === 0, sent: sentCount, failed: failedCount };
  }

  // ─── Notification History ─────────────────────────────────────────────────

  async getHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: NotificationLog[]; total: number; page: number; limit: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const [data, total] = await this.notificationLogRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return { data, total, page: safePage, limit: safeLimit };
  }
}
