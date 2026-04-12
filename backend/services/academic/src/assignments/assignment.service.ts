import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { Submission } from '../entities/submission.entity';
import { GradeRecord } from '../entities/grade-record.entity';
import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment) private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(GradeRecord) private readonly gradeRepo: Repository<GradeRecord>,
  ) {}

  // ─── Assignments ─────────────────────────────────────────────────────────

  async create(schoolId: string, teacherUserId: string, dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentRepo.create({
      schoolId,
      teacherUserId,
      sectionId: dto.sectionId,
      subjectId: dto.subjectId,
      title: dto.title,
      description: dto.description ?? null,
      dueDate: new Date(dto.dueDate),
      attachmentKeys: dto.attachmentKeys ?? [],
      status: 'draft',
      publishedAt: null,
      deletedAt: null,
    });
    return this.assignmentRepo.save(assignment);
  }

  async findAll(
    schoolId: string,
    filters: { sectionId?: string; subjectId?: string; status?: string; teacherUserId?: string },
  ): Promise<Assignment[]> {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.schoolId = :schoolId', { schoolId })
      .andWhere('a.deletedAt IS NULL');

    if (filters.sectionId) qb.andWhere('a.sectionId = :sectionId', { sectionId: filters.sectionId });
    if (filters.subjectId) qb.andWhere('a.subjectId = :subjectId', { subjectId: filters.subjectId });
    if (filters.status) qb.andWhere('a.status = :status', { status: filters.status });
    if (filters.teacherUserId) qb.andWhere('a.teacherUserId = :teacherUserId', { teacherUserId: filters.teacherUserId });

    return qb.orderBy('a.dueDate', 'DESC').getMany();
  }

  async findOne(schoolId: string, id: string): Promise<Assignment & { submissionCount: number }> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const submissionCount = await this.submissionRepo.count({
      where: { assignmentId: id, status: 'submitted' },
    });

    return { ...assignment, submissionCount };
  }

  async update(schoolId: string, id: string, dto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.status !== 'draft') throw new BadRequestException('Only draft assignments can be updated');

    Object.assign(assignment, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      ...(dto.attachmentKeys !== undefined && { attachmentKeys: dto.attachmentKeys }),
    });

    return this.assignmentRepo.save(assignment);
  }

  async publish(schoolId: string, id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = 'published';
    assignment.publishedAt = new Date();
    return this.assignmentRepo.save(assignment);
  }

  async softDelete(schoolId: string, id: string): Promise<{ success: boolean }> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.deletedAt = new Date();
    await this.assignmentRepo.save(assignment);
    return { success: true };
  }

  // ─── Submissions ──────────────────────────────────────────────────────────

  async listSubmissions(schoolId: string, assignmentId: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const submissions = await this.submissionRepo.find({ where: { assignmentId } });
    const grades = await this.gradeRepo.find({ where: { assignmentId } });

    return {
      assignment,
      submissions: submissions.map((sub) => ({
        ...sub,
        grade: grades.find((g) => g.studentId === sub.studentId) ?? null,
      })),
    };
  }

  async submit(
    schoolId: string,
    assignmentId: string,
    requestingUserId: string,
    dto: SubmitAssignmentDto,
  ): Promise<Submission> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const studentId = dto.studentId ?? requestingUserId;
    const now = new Date();
    const isLate = now > assignment.dueDate;

    let submission = await this.submissionRepo.findOne({
      where: { assignmentId, studentId },
    });

    if (submission) {
      submission.submittedAt = now;
      submission.attachmentKeys = dto.attachmentKeys ?? submission.attachmentKeys;
      submission.status = isLate ? 'late' : 'submitted';
    } else {
      submission = this.submissionRepo.create({
        assignmentId,
        studentId,
        submittedAt: now,
        attachmentKeys: dto.attachmentKeys ?? [],
        status: isLate ? 'late' : 'submitted',
      });
    }

    return this.submissionRepo.save(submission);
  }

  async gradeSubmission(
    schoolId: string,
    assignmentId: string,
    studentId: string,
    gradedByUserId: string,
    dto: GradeSubmissionDto,
  ): Promise<GradeRecord> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, schoolId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    let grade = await this.gradeRepo.findOne({ where: { assignmentId, studentId } });

    if (grade) {
      if (dto.score !== undefined) grade.score = dto.score;
      if (dto.maxScore !== undefined) grade.maxScore = dto.maxScore;
      if (dto.feedback !== undefined) grade.feedback = dto.feedback;
      grade.gradedByUserId = gradedByUserId;
    } else {
      grade = this.gradeRepo.create({
        assignmentId,
        studentId,
        schoolId,
        score: dto.score ?? null,
        maxScore: dto.maxScore ?? 100,
        feedback: dto.feedback ?? null,
        gradedByUserId,
        publishedAt: null,
        parentAckAt: null,
      });
    }

    return this.gradeRepo.save(grade);
  }

  async parentAck(assignmentId: string, studentId: string): Promise<GradeRecord> {
    const grade = await this.gradeRepo.findOne({ where: { assignmentId, studentId } });
    if (!grade) throw new NotFoundException('Grade record not found');
    grade.parentAckAt = new Date();
    return this.gradeRepo.save(grade);
  }

  // ─── Gradebook ────────────────────────────────────────────────────────────

  async gradebookForSection(
    schoolId: string,
    sectionId: string,
    filters: { subjectId?: string; academicYearId?: string },
  ) {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.schoolId = :schoolId', { schoolId })
      .andWhere('a.sectionId = :sectionId', { sectionId })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.status = :status', { status: 'published' });

    if (filters.subjectId) qb.andWhere('a.subjectId = :subjectId', { subjectId: filters.subjectId });

    const assignments = await qb.orderBy('a.dueDate', 'ASC').getMany();

    const assignmentIds = assignments.map((a) => a.id);
    if (!assignmentIds.length) return { assignments: [], grades: [] };

    const grades = await this.gradeRepo
      .createQueryBuilder('g')
      .where('g.assignmentId IN (:...assignmentIds)', { assignmentIds })
      .getMany();

    const submissions = await this.submissionRepo
      .createQueryBuilder('s')
      .where('s.assignmentId IN (:...assignmentIds)', { assignmentIds })
      .getMany();

    return { assignments, grades, submissions };
  }

  async gradebookForStudent(studentId: string) {
    const grades = await this.gradeRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    if (!grades.length) return [];

    const assignmentIds = [...new Set(grades.map((g) => g.assignmentId))];
    const assignments = await this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.id IN (:...assignmentIds)', { assignmentIds })
      .andWhere('a.deletedAt IS NULL')
      .getMany();

    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // Group by subjectId
    const bySubject = new Map<string, { subject: string; items: object[] }>();
    for (const grade of grades) {
      const assignment = assignmentMap.get(grade.assignmentId);
      if (!assignment) continue;
      const subjectId = assignment.subjectId;
      if (!bySubject.has(subjectId)) {
        bySubject.set(subjectId, { subject: subjectId, items: [] });
      }
      bySubject.get(subjectId)!.items.push({ grade, assignment });
    }

    return Array.from(bySubject.values());
  }
}
