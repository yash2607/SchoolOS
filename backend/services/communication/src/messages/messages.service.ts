import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageThread } from '../entities/message-thread.entity';
import { Message } from '../entities/message.entity';
import type { CreateThreadDto, SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageThread) private readonly threadRepo: Repository<MessageThread>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
  ) {}

  async listThreads(
    schoolId: string,
    userId: string,
  ): Promise<Array<MessageThread & { lastMessage: Message | null; unreadCount: number }>> {
    const threads = await this.threadRepo
      .createQueryBuilder('t')
      .where('t.schoolId = :schoolId', { schoolId })
      .andWhere('(t.teacherUserId = :userId OR t.parentUserId = :userId)', { userId })
      .orderBy('t.lastMessageAt', 'DESC', 'NULLS LAST')
      .getMany();

    const result = await Promise.all(
      threads.map(async (thread) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { threadId: thread.id },
          order: { sentAt: 'DESC' },
        });

        const unreadCount = await this.messageRepo
          .createQueryBuilder('m')
          .where('m.threadId = :threadId', { threadId: thread.id })
          .andWhere('m.senderUserId != :userId', { userId })
          .andWhere('m.readAt IS NULL')
          .getCount();

        return { ...thread, lastMessage, unreadCount };
      }),
    );

    return result;
  }

  async getThreadMessages(
    threadId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: Message[]; total: number; page: number; limit: number }> {
    const thread = await this.threadRepo.findOne({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread not found');

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { threadId },
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages: messages.reverse(), total, page, limit };
  }

  async createOrGetThread(schoolId: string, dto: CreateThreadDto): Promise<MessageThread> {
    const existing = await this.threadRepo.findOne({
      where: {
        teacherUserId: dto.teacherUserId,
        parentUserId: dto.parentUserId,
        studentId: dto.studentId,
      },
    });

    if (existing) return existing;

    const thread = this.threadRepo.create({
      schoolId,
      teacherUserId: dto.teacherUserId,
      parentUserId: dto.parentUserId,
      studentId: dto.studentId,
      lastMessageAt: null,
    });

    return this.threadRepo.save(thread);
  }

  async sendMessage(senderUserId: string, dto: SendMessageDto): Promise<Message> {
    const thread = await this.threadRepo.findOne({ where: { id: dto.threadId } });
    if (!thread) throw new NotFoundException('Thread not found');

    const message = this.messageRepo.create({
      threadId: dto.threadId,
      senderUserId,
      content: dto.content,
      attachmentKeys: dto.attachmentKeys ?? [],
      sentAt: new Date(),
      deliveredAt: null,
      readAt: null,
    });

    const saved = await this.messageRepo.save(message);

    // Update thread's lastMessageAt
    thread.lastMessageAt = saved.sentAt;
    await this.threadRepo.save(thread);

    return saved;
  }

  async markRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (!message.readAt) {
      message.readAt = new Date();
      await this.messageRepo.save(message);
    }
    return message;
  }
}
