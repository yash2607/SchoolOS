import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from '../entities/announcement.entity';
import { AnnouncementAck } from '../entities/announcement-ack.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, AnnouncementAck]),
    JwtModule.register({}),
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
