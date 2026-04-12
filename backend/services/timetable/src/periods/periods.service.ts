import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from '../entities/period.entity';
import { CreatePeriodDto } from './dto/create-period.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
  ) {}

  findAll(schoolId: string): Promise<Period[]> {
    return this.periodRepo.find({
      where: { schoolId },
      order: { order: 'ASC' },
    });
  }

  async create(schoolId: string, dto: CreatePeriodDto): Promise<Period> {
    const period = this.periodRepo.create({
      ...dto,
      schoolId,
      isBreak: dto.isBreak ?? false,
      dayOfWeek: dto.dayOfWeek ?? null,
    });
    return this.periodRepo.save(period);
  }

  async remove(schoolId: string, id: string): Promise<{ message: string }> {
    const period = await this.periodRepo.findOne({ where: { id, schoolId } });
    if (!period) throw new NotFoundException(`Period ${id} not found`);
    await this.periodRepo.remove(period);
    return { message: 'Period deleted successfully' };
  }
}
