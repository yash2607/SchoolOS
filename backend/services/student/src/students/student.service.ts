import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Guardian } from '../entities/guardian.entity';
import type { CreateStudentDto, UpdateStudentDto, CreateGuardianDto, LinkGuardianDto } from './dto/create-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Guardian) private readonly guardianRepo: Repository<Guardian>,
  ) {}

  private async generateStudentCode(schoolId: string, gradeId: string, sectionId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.studentRepo.count({ where: { schoolId } });
    return `${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  async create(schoolId: string, dto: CreateStudentDto): Promise<Student> {
    const studentCode = await this.generateStudentCode(schoolId, dto.gradeId, dto.sectionId);

    const student = this.studentRepo.create({
      schoolId,
      studentCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth ?? null,
      gender: dto.gender ?? 'M',
      gradeId: dto.gradeId,
      sectionId: dto.sectionId,
      rollNumber: dto.rollNumber ?? 0,
      admissionDate: dto.admissionDate ?? null,
      address: dto.address ?? null,
      bloodGroup: dto.bloodGroup ?? null,
      status: 'active',
      iepFlag: false,
      deletedAt: null,
    });

    const saved = await this.studentRepo.save(student);

    if (dto.guardians?.length) {
      const guardians = dto.guardians.map((g, i) =>
        this.guardianRepo.create({
          studentId: saved.id,
          name: g.name,
          relationship: g.relationship ?? 'parent',
          mobileE164: g.mobileE164 ?? null,
          email: g.email ?? null,
          isPrimary: g.isPrimary ?? i === 0,
          canPickup: g.canPickup ?? true,
          userId: null,
        }),
      );
      await this.guardianRepo.save(guardians);
    }

    return this.findOne(schoolId, saved.id);
  }

  async findAll(schoolId: string, filters: { gradeId?: string; sectionId?: string; status?: string; search?: string }) {
    const qb = this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.guardians', 'g')
      .where('s.schoolId = :schoolId', { schoolId })
      .andWhere('s.deletedAt IS NULL');

    if (filters.gradeId) qb.andWhere('s.gradeId = :gradeId', { gradeId: filters.gradeId });
    if (filters.sectionId) qb.andWhere('s.sectionId = :sectionId', { sectionId: filters.sectionId });
    if (filters.status) qb.andWhere('s.status = :status', { status: filters.status });
    if (filters.search) {
      qb.andWhere(
        "(LOWER(s.firstName) LIKE :q OR LOWER(s.lastName) LIKE :q OR s.studentCode LIKE :q)",
        { q: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.orderBy('s.rollNumber', 'ASC').getMany();
  }

  async findOne(schoolId: string, studentId: string): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId, schoolId, deletedAt: IsNull() },
      relations: ['guardians'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(schoolId: string, studentId: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(schoolId, studentId);
    Object.assign(student, dto);
    await this.studentRepo.save(student);
    return this.findOne(schoolId, studentId);
  }

  async softDelete(schoolId: string, studentId: string): Promise<{ success: boolean }> {
    const student = await this.findOne(schoolId, studentId);
    student.deletedAt = new Date();
    student.status = 'withdrawn';
    await this.studentRepo.save(student);
    return { success: true };
  }

  // ─── Guardians ───────────────────────────────────────────────────
  async addGuardian(schoolId: string, studentId: string, dto: CreateGuardianDto): Promise<Guardian> {
    await this.findOne(schoolId, studentId); // verify student belongs to school
    const count = await this.guardianRepo.count({ where: { studentId } });
    if (count >= 4) throw new ConflictException('Maximum 4 guardians per student');

    const guardian = this.guardianRepo.create({
      studentId,
      name: dto.name,
      relationship: dto.relationship ?? 'parent',
      mobileE164: dto.mobileE164 ?? null,
      email: dto.email ?? null,
      isPrimary: dto.isPrimary ?? count === 0,
      canPickup: dto.canPickup ?? true,
      userId: null,
    });
    return this.guardianRepo.save(guardian);
  }

  async linkGuardianToUser(schoolId: string, studentId: string, dto: LinkGuardianDto): Promise<Guardian> {
    await this.findOne(schoolId, studentId);
    const guardian = await this.guardianRepo.findOne({ where: { id: dto.guardianId, studentId } });
    if (!guardian) throw new NotFoundException('Guardian not found');
    guardian.userId = dto.userId;
    return this.guardianRepo.save(guardian);
  }

  // ─── Parent: get my children ─────────────────────────────────────
  async getChildrenForParent(userId: string): Promise<Array<Student & { guardianInfo: Guardian }>> {
    const guardians = await this.guardianRepo.find({ where: { userId } });
    if (!guardians.length) return [];

    const studentIds = guardians.map((g) => g.studentId);
    const students = await this.studentRepo.find({
      where: studentIds.map((id) => ({ id, deletedAt: IsNull() })),
      relations: ['guardians'],
    });

    return students.map((s) => ({
      ...s,
      guardianInfo: guardians.find((g) => g.studentId === s.id)!,
    }));
  }

  // ─── Teacher: get class roster ────────────────────────────────────
  async getRoster(schoolId: string, sectionId: string): Promise<Student[]> {
    return this.studentRepo.find({
      where: { schoolId, sectionId, status: 'active', deletedAt: IsNull() },
      relations: ['guardians'],
      order: { rollNumber: 'ASC' },
    });
  }

  // ─── Bulk CSV import (basic version) ─────────────────────────────
  async bulkCreate(schoolId: string, rows: CreateStudentDto[]): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;
    for (const row of rows) {
      try {
        await this.create(schoolId, row);
        created++;
      } catch (e) {
        errors.push(`${row.firstName} ${row.lastName}: ${(e as Error).message}`);
      }
    }
    return { created, errors };
  }
}
