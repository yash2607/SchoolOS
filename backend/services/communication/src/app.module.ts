import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MessageThread } from './entities/message-thread.entity';
import { Message } from './entities/message.entity';
import { Announcement } from './entities/announcement.entity';
import { AnnouncementAck } from './entities/announcement-ack.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL') ?? '',
        entities: [MessageThread, Message, Announcement, AnnouncementAck],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: config.get('APP_ENV') !== 'production',
      }),
    }),
    MessagesModule,
    AnnouncementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
