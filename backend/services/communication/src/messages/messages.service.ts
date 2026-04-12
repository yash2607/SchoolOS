import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MessageThread } from '../entities/message-thread.entity';
import { Message } from '../entities/message.entity';
import type { CreateThreadDto, SendMessageDto } from './dto/message.dto';

export interface MessageThreadParticipantNames {
  teacherName: string | null;
  parentName: string | null;
  studentName: string | null;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageThread) private readonly threadRepo: Repository<MessageThread>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    private readonly dataSource: DataSource,
  ) {}

  async listThreads(
    schoolId: string,
    userId: string,
  ): Promise<Array<MessageThread & MessageThreadParticipantNames & { lastMessage: Message | null; unreadCount: number }>> {
    const threads = await this.threadRepo
      .createQueryBuilder('t')
      .where('t.schoolId = :schoolId', { schoolId })
      .andWhere('(t.teacherUserId = :userId OR t.parentUserId = :userId)', { userId })
      .orderBy('t.lastMessageAt', 'DESC', 'NULLS LAST')
      .getMany();

    const participantNames = await this.getParticipantNamesByThread(threads);

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

        return {
          ...thread,
          ...(participantNames.get(thread.id) ?? {
            teacherName: null,
            parentName: null,
            studentName: null,
          }),
          lastMessage,
          unreadCount,
        };
      }),
    );

    return result;
  }

  async getThreadMessages(
    schoolId: string,
    threadId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: Message[]; total: number; page: number; limit: number }> {
    await this.verifyThreadAccess(schoolId, threadId, userId);

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { threadId },
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages: messages.reverse(), total, page, limit };
  }

  async createOrGetThread(schoolId: string, userId: string, dto: CreateThreadDto): Promise<MessageThread> {
    if (dto.teacherUserId !== userId && dto.parentUserId !== userId) {
      throw new ForbiddenException('You can only create threads you participate in');
    }

    const existing = await this.threadRepo.findOne({
      where: {
        schoolId,
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

  async sendMessage(schoolId: string, senderUserId: string, dto: SendMessageDto): Promise<Message> {
    const thread = await this.verifyThreadAccess(schoolId, dto.threadId, senderUserId);

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

  async markRead(schoolId: string, messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    await this.verifyThreadAccess(schoolId, message.threadId, userId);

    if (!message.readAt) {
      message.readAt = new Date();
      await this.messageRepo.save(message);
    }
    return message;
  }

  async verifyThreadAccess(
    schoolId: string,
    threadId: string,
    userId: string,
  ): Promise<MessageThread> {
    const thread = await this.threadRepo.findOne({ where: { id: threadId, schoolId } });
    if (!thread) throw new NotFoundException('Thread not found');
    this.assertThreadParticipant(thread, userId);
    return thread;
  }

  private assertThreadParticipant(thread: MessageThread, userId: string): void {
    if (thread.teacherUserId !== userId && thread.parentUserId !== userId) {
      throw new ForbiddenException('You do not have access to this thread');
    }
  }

  private async getParticipantNamesByThread(
    threads: MessageThread[],
  ): Promise<Map<string, MessageThreadParticipantNames>> {
    const result = new Map<string, MessageThreadParticipantNames>();
    if (!threads.length) return result;

    const rows = await this.dataSource.query<
      Array<{
        threadId: string;
        teacherName: string | null;
        parentName: string | null;
        studentName: string | null;
      }>
    >(
      `
        SELECT
          t.id AS "threadId",
          teacher.name AS "teacherName",
          parent.name AS "parentName",
          TRIM(CONCAT(COALESCE(student."firstName", ''), ' ', COALESCE(student."lastName", ''))) AS "studentName"
        FROM message_threads t
        LEFT JOIN users teacher ON teacher.id = t."teacherUserId"
        LEFT JOIN users parent ON parent.id = t."parentUserId"
        LEFT JOIN students student ON student.id = t."studentId"
        WHERE t.id = ANY($1)
      `,
      [threads.map((thread) => thread.id)],
    );

    for (const row of rows) {
      result.set(row.threadId, {
        teacherName: row.teacherName,
        parentName: row.parentName,
        studentName: row.studentName?.trim() || null,
      });
    }

    return result;
  }
}
