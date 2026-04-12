import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MessageThread } from '../entities/message-thread.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageThread, Message]),
    JwtModule.register({}),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
