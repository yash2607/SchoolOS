import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';
import { AnnouncementAck } from '../entities/announcement-ack.entity';
import type { CreateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(AnnouncementAck) private readonly ackRepo: Repository<AnnouncementAck>,
  ) {}

  async create(schoolId: string, createdByUserId: string, dto: CreateAnnouncementDto): Promise<Announcement> {
    const now = new Date();
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const sentAt = !scheduledAt || scheduledAt <= now ? now : null;

    const announcement = this.announcementRepo.create({
      schoolId,
      title: dto.title,
      body: dto.body,
      targetType: dto.targetType ?? 'school',
      targetIds: dto.targetIds ?? [],
      isEmergency: dto.isEmergency ?? false,
      isPinned: dto.isPinned ?? false,
      scheduledAt,
      sentAt,
      createdByUserId,
      deletedAt: null,
    });

    return this.announcementRepo.save(announcement);
  }

  async list(
    schoolId: string,
    page: number,
    limit: number,
  ): Promise<{ announcements: Announcement[]; total: number; page: number; limit: number }> {
    const [announcements, total] = await this.announcementRepo.findAndCount({
      where: { schoolId, deletedAt: IsNull() },
      order: {
        isPinned: 'DESC',
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { announcements, total, page, limit };
  }

  async findOne(id: string, schoolId: string): Promise<Announcement> {
    const announcement = await this.announcementRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async acknowledge(announcementId: string, userId: string): Promise<AnnouncementAck> {
    const announcement = await this.announcementRepo.findOne({
      where: { id: announcementId, deletedAt: IsNull() },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    const existing = await this.ackRepo.findOne({ where: { announcementId, userId } });
    if (existing) return existing;

    const ack = this.ackRepo.create({
      announcementId,
      userId,
      ackedAt: new Date(),
    });

    return this.ackRepo.save(ack);
  }

  async ackStats(
    announcementId: string,
    schoolId: string,
  ): Promise<{ ackCount: number; totalTargets: number; announcement: Announcement }> {
    const announcement = await this.findOne(announcementId, schoolId);

    const ackCount = await this.ackRepo.count({ where: { announcementId } });
    const totalTargets = announcement.targetIds.length;

    return { ackCount, totalTargets, announcement };
  }

  async softDelete(id: string, schoolId: string): Promise<{ success: boolean }> {
    const announcement = await this.findOne(id, schoolId);
    announcement.deletedAt = new Date();
    await this.announcementRepo.save(announcement);
    return { success: true };
  }

  /**
   * Called by a scheduled job or on list to send scheduled announcements whose scheduledAt has passed.
   */
  async processScheduled(): Promise<void> {
    const now = new Date();
    const pending = await this.announcementRepo
      .createQueryBuilder('a')
      .where('a.sentAt IS NULL')
      .andWhere('a.scheduledAt IS NOT NULL')
      .andWhere('a.scheduledAt <= :now', { now })
      .andWhere('a.deletedAt IS NULL')
      .getMany();

    for (const ann of pending) {
      ann.sentAt = now;
      await this.announcementRepo.save(ann);
    }
  }
}
