import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '../entities/academic-year.entity';
import { Grade } from '../entities/grade.entity';
import { Section } from '../entities/section.entity';
import { Subject } from '../entities/subject.entity';
import type {
  CreateAcademicYearDto,
  CreateGradeDto,
  CreateSectionDto,
  CreateSubjectDto,
  UpdateSchoolDto,
} from './dto/create-school-setup.dto';

// We reference the schools table from auth service — same DB
import { DataSource } from 'typeorm';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
    @InjectRepository(Grade) private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
    @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
    private readonly dataSource: DataSource,
  ) {}

  async getSchool(schoolId: string) {
    const school = await this.dataSource
      .createQueryBuilder()
      .select(['s.id', 's.name', 's.timezone', 's.logoUrl', 's.isActive', 's.createdAt'])
      .from('schools', 's')
      .where('s.id = :id', { id: schoolId })
      .getRawOne<{ s_id: string; s_name: string; s_timezone: string; s_logoUrl: string | null; s_isActive: boolean; s_createdAt: Date }>();

    if (!school) throw new NotFoundException('School not found');
    return {
      id: school.s_id,
      name: school.s_name,
      timezone: school.s_timezone,
      logoUrl: school.s_logoUrl,
      isActive: school.s_isActive,
      createdAt: school.s_createdAt,
    };
  }

  async updateSchool(schoolId: string, dto: UpdateSchoolDto) {
    await this.dataSource
      .createQueryBuilder()
      .update('schools')
      .set({ ...(dto.name && { name: dto.name }), ...(dto.timezone && { timezone: dto.timezone }), ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }) })
      .where('id = :id', { id: schoolId })
      .execute();
    return this.getSchool(schoolId);
  }

  // ─── Academic Years ──────────────────────────────────────────────
  async getAcademicYears(schoolId: string) {
    return this.yearRepo.find({ where: { schoolId }, order: { startDate: 'DESC' } });
  }

  async createAcademicYear(schoolId: string, dto: CreateAcademicYearDto) {
    if (dto.isActive) {
      await this.yearRepo.update({ schoolId }, { isActive: false });
    }
    const year = this.yearRepo.create({ ...dto, schoolId, isActive: dto.isActive ?? false });
    return this.yearRepo.save(year);
  }

  async setActiveYear(schoolId: string, yearId: string) {
    await this.yearRepo.update({ schoolId }, { isActive: false });
    await this.yearRepo.update({ id: yearId, schoolId }, { isActive: true });
    const year = await this.yearRepo.findOne({ where: { id: yearId, schoolId } });
    if (!year) throw new NotFoundException('Academic year not found');
    return year;
  }

  // ─── Grades ──────────────────────────────────────────────────────
  async getGrades(schoolId: string) {
    return this.gradeRepo.find({
      where: { schoolId },
      order: { order: 'ASC' },
      relations: ['sections'],
    });
  }

  async createGrade(schoolId: string, dto: CreateGradeDto) {
    const existing = await this.gradeRepo.findOne({ where: { schoolId, name: dto.name } });
    if (existing) throw new ConflictException(`Grade "${dto.name}" already exists`);
    const grade = this.gradeRepo.create({ ...dto, schoolId });
    return this.gradeRepo.save(grade);
  }

  async deleteGrade(schoolId: string, gradeId: string) {
    const grade = await this.gradeRepo.findOne({ where: { id: gradeId, schoolId } });
    if (!grade) throw new NotFoundException('Grade not found');
    await this.gradeRepo.remove(grade);
    return { success: true };
  }

  // ─── Sections ────────────────────────────────────────────────────
  async getSections(gradeId: string, schoolId: string) {
    const grade = await this.gradeRepo.findOne({ where: { id: gradeId, schoolId } });
    if (!grade) throw new NotFoundException('Grade not found');
    return this.sectionRepo.find({ where: { gradeId }, order: { name: 'ASC' } });
  }

  async createSection(schoolId: string, gradeId: string, dto: CreateSectionDto) {
    const grade = await this.gradeRepo.findOne({ where: { id: gradeId, schoolId } });
    if (!grade) throw new NotFoundException('Grade not found');
    const existing = await this.sectionRepo.findOne({ where: { gradeId, name: dto.name } });
    if (existing) throw new ConflictException(`Section "${dto.name}" already exists in this grade`);
    const section = this.sectionRepo.create({ ...dto, gradeId, classTeacherId: dto.classTeacherId ?? null });
    return this.sectionRepo.save(section);
  }

  async updateSection(schoolId: string, sectionId: string, dto: Partial<CreateSectionDto>) {
    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
      relations: ['grade'],
    });
    if (!section || section.grade.schoolId !== schoolId) throw new NotFoundException('Section not found');
    Object.assign(section, dto);
    return this.sectionRepo.save(section);
  }

  // ─── Subjects ────────────────────────────────────────────────────
  async getSubjects(schoolId: string) {
    return this.subjectRepo.find({ where: { schoolId, isActive: true }, order: { name: 'ASC' } });
  }

  async createSubject(schoolId: string, dto: CreateSubjectDto) {
    const subject = this.subjectRepo.create({ ...dto, schoolId, isActive: true, code: dto.code ?? null, type: dto.type ?? 'core' });
    return this.subjectRepo.save(subject);
  }

  async deleteSubject(schoolId: string, subjectId: string) {
    await this.subjectRepo.update({ id: subjectId, schoolId }, { isActive: false });
    return { success: true };
  }
}
