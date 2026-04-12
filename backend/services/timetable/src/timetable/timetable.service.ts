import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TimetableEntry } from '../entities/timetable-entry.entity';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntry)
    private readonly entryRepo: Repository<TimetableEntry>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── GET /timetable?sectionId=&dayOfWeek=&academicYearId= ─────────────────
  async findEntries(
    schoolId: string,
    sectionId?: string,
    dayOfWeek?: number,
    academicYearId?: string,
  ): Promise<unknown[]> {
    let sql = `
      SELECT
        te.id,
        te.school_id         AS "schoolId",
        te.section_id        AS "sectionId",
        te.subject_id        AS "subjectId",
        te.teacher_user_id   AS "teacherUserId",
        te.period_id         AS "periodId",
        te.day_of_week       AS "dayOfWeek",
        te.academic_year_id  AS "academicYearId",
        te.is_active         AS "isActive",
        te.created_at        AS "createdAt",
        te.updated_at        AS "updatedAt",
        p.name               AS "periodName",
        p.start_time         AS "startTime",
        p.end_time           AS "endTime",
        p.period_number      AS "periodNumber",
        p.is_break           AS "isBreak",
        p."order"            AS "periodOrder",
        sub.name             AS "subjectName",
        sub.code             AS "subjectCode",
        sec.name             AS "sectionName",
        g.name               AS "gradeName"
      FROM timetable_entries te
      LEFT JOIN periods      p   ON p.id   = te.period_id
      LEFT JOIN subjects     sub ON sub.id = te.subject_id
      LEFT JOIN sections     sec ON sec.id = te.section_id
      LEFT JOIN grades       g   ON g.id   = sec.grade_id
      WHERE te.school_id = $1
        AND te.is_active = true
    `;

    const params: unknown[] = [schoolId];
    let idx = 2;

    if (sectionId) {
      sql += ` AND te.section_id = $${idx++}`;
      params.push(sectionId);
    }
    if (dayOfWeek !== undefined) {
      sql += ` AND te.day_of_week = $${idx++}`;
      params.push(dayOfWeek);
    }
    if (academicYearId) {
      sql += ` AND te.academic_year_id = $${idx++}`;
      params.push(academicYearId);
    }

    sql += ` ORDER BY te.day_of_week ASC, p."order" ASC`;

    return this.dataSource.query(sql, params);
  }

  // ─── POST /timetable ──────────────────────────────────────────────────────
  async create(schoolId: string, dto: CreateTimetableEntryDto): Promise<TimetableEntry> {
    const entry = this.entryRepo.create({ ...dto, schoolId, isActive: true });
    return this.entryRepo.save(entry);
  }

  // ─── DELETE /timetable/:id ────────────────────────────────────────────────
  async remove(schoolId: string, id: string): Promise<{ message: string }> {
    const entry = await this.entryRepo.findOne({ where: { id, schoolId } });
    if (!entry) throw new NotFoundException(`Timetable entry ${id} not found`);
    await this.entryRepo.remove(entry);
    return { message: 'Timetable entry deleted successfully' };
  }

  // ─── GET /timetable/teacher/:teacherUserId — full week grouped by dayOfWeek ─
  async getTeacherSchedule(schoolId: string, teacherUserId: string): Promise<unknown[]> {
    const sql = `
      SELECT
        te.id,
        te.section_id       AS "sectionId",
        te.subject_id       AS "subjectId",
        te.period_id        AS "periodId",
        te.day_of_week      AS "dayOfWeek",
        te.academic_year_id AS "academicYearId",
        p.name              AS "periodName",
        p.start_time        AS "startTime",
        p.end_time          AS "endTime",
        p.period_number     AS "periodNumber",
        p."order"           AS "periodOrder",
        sub.name            AS "subjectName",
        sub.code            AS "subjectCode",
        sec.name            AS "sectionName",
        g.name              AS "gradeName"
      FROM timetable_entries te
      LEFT JOIN periods  p   ON p.id   = te.period_id
      LEFT JOIN subjects sub ON sub.id = te.subject_id
      LEFT JOIN sections sec ON sec.id = te.section_id
      LEFT JOIN grades   g   ON g.id   = sec.grade_id
      WHERE te.school_id      = $1
        AND te.teacher_user_id = $2
        AND te.is_active       = true
      ORDER BY te.day_of_week ASC, p."order" ASC
    `;

    const rows: Record<string, unknown>[] = await this.dataSource.query(sql, [schoolId, teacherUserId]);

    // Group by dayOfWeek — return in DaySchedule shape expected by frontend
    const grouped: Record<number, Record<string, unknown>[]> = {};
    for (const row of rows) {
      const day = row['dayOfWeek'] as number;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(row);
    }

    return Object.entries(grouped).map(([day, periods]) => ({
      dayOfWeek: Number(day),
      date: '',
      periods,
    }));
  }

  // ─── GET /timetable/today/:sectionId — today's periods with subject/teacher ─
  async getTodaySchedule(schoolId: string, sectionId: string): Promise<unknown[]> {
    // 0=Mon,1=Tue,...,4=Fri; JS getDay() 0=Sun,1=Mon,...6=Sat
    const jsDay = new Date().getDay();
    // Map JS Sunday=0 → skip (weekend), Monday=1 → 0, ..., Friday=5 → 4
    const dayOfWeek = jsDay === 0 || jsDay === 6 ? -1 : jsDay - 1;

    if (dayOfWeek < 0) return []; // weekend

    const sql = `
      SELECT
        te.id,
        te.subject_id      AS "subjectId",
        te.teacher_user_id AS "teacherUserId",
        te.period_id       AS "periodId",
        te.day_of_week     AS "dayOfWeek",
        p.name             AS "periodName",
        p.start_time       AS "startTime",
        p.end_time         AS "endTime",
        p.period_number    AS "periodNumber",
        p.is_break         AS "isBreak",
        p."order"          AS "periodOrder",
        sub.name           AS "subjectName",
        sub.code           AS "subjectCode"
      FROM timetable_entries te
      LEFT JOIN periods  p   ON p.id   = te.period_id
      LEFT JOIN subjects sub ON sub.id = te.subject_id
      WHERE te.school_id  = $1
        AND te.section_id = $2
        AND (te.day_of_week = $3 OR p.day_of_week IS NULL)
        AND te.is_active  = true
      ORDER BY p."order" ASC
    `;

    return this.dataSource.query(sql, [schoolId, sectionId, dayOfWeek]);
  }
}
