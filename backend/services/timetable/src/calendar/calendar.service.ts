import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SchoolEvent } from '../entities/school-event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(SchoolEvent)
    private readonly eventRepo: Repository<SchoolEvent>,
  ) {}

  // ─── GET /calendar?month=&year= ──────────────────────────────────────────
  findByMonth(schoolId: string, month: number, year: number): Promise<SchoolEvent[]> {
    // Compute first and last day of month as date strings
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0); // day 0 of next month = last day of this month
    const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    return this.eventRepo.find({
      where: [
        // events that start within the month
        {
          schoolId,
          eventDate: Between(firstDay, lastDayStr) as unknown as string,
        },
        // events that span into the month (endDate within or beyond month start)
        {
          schoolId,
          endDate: MoreThanOrEqual(firstDay) as unknown as string,
          eventDate: LessThanOrEqual(lastDayStr) as unknown as string,
        },
      ],
      order: { eventDate: 'ASC' },
    });
  }

  // ─── POST /calendar ───────────────────────────────────────────────────────
  create(schoolId: string, createdByUserId: string, dto: CreateEventDto): Promise<SchoolEvent> {
    const event = this.eventRepo.create({
      ...dto,
      schoolId,
      createdByUserId,
      eventType: dto.eventType ?? 'event',
      targetType: dto.targetType ?? 'school',
      description: dto.description ?? null,
      endDate: dto.endDate ?? null,
      targetId: dto.targetId ?? null,
    });
    return this.eventRepo.save(event);
  }

  // ─── DELETE /calendar/:id ─────────────────────────────────────────────────
  async remove(schoolId: string, id: string): Promise<{ message: string }> {
    const event = await this.eventRepo.findOne({ where: { id, schoolId } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    await this.eventRepo.remove(event);
    return { message: 'Event deleted successfully' };
  }
}
