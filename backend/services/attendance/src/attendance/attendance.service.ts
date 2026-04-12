import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import {
  MarkAttendanceDto,
  EditAttendanceDto,
  SubmitLeaveRequestDto,
  ReviewLeaveRequestDto,
} from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── POST /attendance — bulk mark (upsert) ────────────────────────────────
  async markBulk(
    schoolId: string,
    markedByUserId: string,
    dto: MarkAttendanceDto,
  ): Promise<AttendanceRecord[]> {
    const now = new Date();
    const periodNumber = dto.periodNumber ?? null;

    const results: AttendanceRecord[] = [];

    for (const item of dto.records) {
      // Try to find existing record
      const existing = await this.recordRepo.findOne({
        where: {
          studentId: item.studentId,
          date: dto.date,
          periodNumber: periodNumber as number,
        },
      });

      if (existing) {
        existing.status = item.status;
        existing.markedByUserId = markedByUserId;
        existing.markedAt = now;
        results.push(await this.recordRepo.save(existing));
      } else {
        const record = this.recordRepo.create({
          schoolId,
          studentId: item.studentId,
          sectionId: dto.sectionId,
          date: dto.date,
          status: item.status,
          markedByUserId,
          markedAt: now,
          periodNumber,
          editedAt: null,
          editReason: null,
        });
        results.push(await this.recordRepo.save(record));
      }
    }

    return results;
  }

  // ─── GET /attendance/roster?sectionId=&date=&periodNumber= ───────────────
  async getRoster(
    schoolId: string,
    sectionId: string,
    date: string,
    periodNumber?: number,
  ): Promise<AttendanceRecord[]> {
    const where: Record<string, unknown> = { schoolId, sectionId, date };
    if (periodNumber !== undefined) {
      where['periodNumber'] = periodNumber;
    } else {
      where['periodNumber'] = null;
    }
    return this.recordRepo.find({ where: where as never, order: { studentId: 'ASC' } });
  }

  // ─── GET /attendance/student/:studentId?month=&year= ─────────────────────
  async getStudentHistory(
    schoolId: string,
    studentId: string,
    month: number,
    year: number,
  ): Promise<AttendanceRecord[]> {
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayDate = new Date(year, month, 0);
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

    return this.dataSource.query(
      `SELECT id, student_id AS "studentId", date, status, period_number AS "periodNumber"
       FROM attendance_records
       WHERE school_id = $1
         AND student_id = $2
         AND date >= $3
         AND date <= $4
       ORDER BY date ASC`,
      [schoolId, studentId, firstDay, lastDay],
    );
  }

  // ─── GET /attendance/school/summary?date= ────────────────────────────────
  async getSchoolSummary(schoolId: string, date: string): Promise<unknown[]> {
    return this.dataSource.query(
      `SELECT
         section_id   AS "sectionId",
         status,
         COUNT(*)::int AS count
       FROM attendance_records
       WHERE school_id = $1
         AND date = $2
         AND period_number IS NULL
       GROUP BY section_id, status
       ORDER BY section_id ASC, status ASC`,
      [schoolId, date],
    );
  }

  // ─── GET /attendance/section/:sectionId/summary?fromDate=&toDate= ─────────
  async getSectionSummary(
    schoolId: string,
    sectionId: string,
    fromDate: string,
    toDate: string,
  ): Promise<unknown[]> {
    return this.dataSource.query(
      `SELECT
         student_id   AS "studentId",
         COUNT(*) FILTER (WHERE status = 'present') ::int AS present,
         COUNT(*) FILTER (WHERE status = 'absent')  ::int AS absent,
         COUNT(*) FILTER (WHERE status = 'late')    ::int AS late,
         COUNT(*) FILTER (WHERE status = 'on_leave')::int AS on_leave,
         COUNT(*)                                   ::int AS total,
         ROUND(
           COUNT(*) FILTER (WHERE status = 'present') * 100.0 / NULLIF(COUNT(*), 0), 2
         ) AS "attendancePct"
       FROM attendance_records
       WHERE school_id  = $1
         AND section_id = $2
         AND date >= $3
         AND date <= $4
         AND period_number IS NULL
       GROUP BY student_id
       ORDER BY student_id ASC`,
      [schoolId, sectionId, fromDate, toDate],
    );
  }

  // ─── PATCH /attendance/:id — edit with audit ──────────────────────────────
  async editRecord(
    schoolId: string,
    id: string,
    dto: EditAttendanceDto,
  ): Promise<AttendanceRecord> {
    const record = await this.recordRepo.findOne({ where: { id, schoolId } });
    if (!record) throw new NotFoundException(`Attendance record ${id} not found`);

    record.status = dto.status;
    record.editedAt = new Date();
    record.editReason = dto.editReason;

    return this.recordRepo.save(record);
  }

  // ─── POST /attendance/leave ───────────────────────────────────────────────
  async submitLeave(
    schoolId: string,
    requestedByUserId: string,
    dto: SubmitLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leave = this.leaveRepo.create({
      schoolId,
      studentId: dto.studentId,
      requestedByUserId,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
      reason: dto.reason,
      status: 'pending',
      reviewedByUserId: null,
      reviewedAt: null,
      reviewNote: null,
    });
    return this.leaveRepo.save(leave);
  }

  // ─── GET /attendance/leave?status=&schoolId= ──────────────────────────────
  findLeaveRequests(
    schoolId: string,
    status?: string,
  ): Promise<LeaveRequest[]> {
    const where: Record<string, unknown> = { schoolId };
    if (status) where['status'] = status;
    return this.leaveRepo.find({
      where: where as never,
      order: { createdAt: 'DESC' },
    });
  }

  // ─── PATCH /attendance/leave/:id — approve or reject ─────────────────────
  async reviewLeave(
    schoolId: string,
    id: string,
    reviewedByUserId: string,
    dto: ReviewLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leave = await this.leaveRepo.findOne({ where: { id, schoolId } });
    if (!leave) throw new NotFoundException(`Leave request ${id} not found`);
    if (leave.status !== 'pending') {
      throw new BadRequestException(`Leave request is already ${leave.status}`);
    }

    leave.status = dto.status;
    leave.reviewedByUserId = reviewedByUserId;
    leave.reviewedAt = new Date();
    leave.reviewNote = dto.note ?? null;

    return this.leaveRepo.save(leave);
  }
}
