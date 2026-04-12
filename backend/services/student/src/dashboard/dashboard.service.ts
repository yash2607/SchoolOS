import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface ParentDashboardDto {
  attendance: {
    status: 'present' | 'absent' | 'late' | 'not_marked';
    markedAt?: string;
  };
  nextClass: {
    subject: string;
    teacher: string;
    startTime: string;
    room?: string;
  } | null;
  pendingHomework: {
    count: number;
    nextDueDate: string | null;
  };
  recentGrade: {
    subject: string;
    marks: number;
    maxMarks: number;
    publishedAt: string;
  } | null;
  feeAlert: {
    amount: number;
    dueDate: string;
    daysUntilDue: number;
    installmentId: string;
  } | null;
  aiSummary: null;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Verify that the requesting user is a guardian of the given studentId.
   * Returns true if the relationship exists, false otherwise.
   */
  async isGuardianOf(userId: string, studentId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query<{ exists: boolean }[]>(
        `SELECT EXISTS (
          SELECT 1 FROM guardians
          WHERE "userId" = $1 AND "studentId" = $2
        ) AS exists`,
        [userId, studentId],
      );
      return result[0]?.exists === true;
    } catch (err) {
      this.logger.error(`isGuardianOf error: ${(err as Error).message}`);
      return false;
    }
  }

  async getParentDashboard(childId: string): Promise<ParentDashboardDto> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0] ?? today.toISOString().slice(0, 10);
    // Day of week: 0=Sunday … 6=Saturday → postgres DOW uses same convention
    const dayOfWeek = today.getDay(); // 0-6

    const [attendance, nextClass, pendingHomework, recentGrade, feeAlert, student] =
      await Promise.all([
        this.fetchAttendance(childId, todayStr),
        this.fetchNextClass(childId, dayOfWeek, today),
        this.fetchPendingHomework(childId, todayStr),
        this.fetchRecentGrade(childId),
        this.fetchFeeAlert(childId, today),
        this.fetchStudent(childId),
      ]);

    void student; // used only to route sectionId inside helpers

    return {
      attendance,
      nextClass,
      pendingHomework,
      recentGrade,
      feeAlert,
      aiSummary: null,
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async fetchStudent(
    studentId: string,
  ): Promise<{ sectionId: string } | null> {
    try {
      const rows = await this.dataSource.query<{ sectionId: string }[]>(
        `SELECT "sectionId" FROM students WHERE id = $1 LIMIT 1`,
        [studentId],
      );
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }

  private async fetchAttendance(
    studentId: string,
    todayStr: string,
  ): Promise<ParentDashboardDto['attendance']> {
    try {
      const rows = await this.dataSource.query<
        { status: string; markedAt: string | null }[]
      >(
        `SELECT status, "markedAt"
         FROM attendance_records
         WHERE "studentId" = $1
           AND date::date = $2::date
         LIMIT 1`,
        [studentId, todayStr],
      );

      if (!rows.length) return { status: 'not_marked' };

      const row = rows[0];
      if (!row) return { status: 'not_marked' };
      const status = (['present', 'absent', 'late'] as const).includes(
        row.status as 'present' | 'absent' | 'late',
      )
        ? (row.status as 'present' | 'absent' | 'late')
        : ('not_marked' as const);

      return {
        status,
        ...(row.markedAt ? { markedAt: row.markedAt } : {}),
      };
    } catch (err) {
      this.logger.warn(`fetchAttendance error: ${(err as Error).message}`);
      return { status: 'not_marked' };
    }
  }

  private async fetchNextClass(
    studentId: string,
    dayOfWeek: number,
    now: Date,
  ): Promise<ParentDashboardDto['nextClass']> {
    try {
      // Get the student's sectionId first
      const studentRows = await this.dataSource.query<{ sectionId: string }[]>(
        `SELECT "sectionId" FROM students WHERE id = $1 LIMIT 1`,
        [studentId],
      );
      if (!studentRows.length) return null;

      const firstStudent = studentRows[0];
      if (!firstStudent) return null;

      const { sectionId } = firstStudent;
      const nowTime = now.toTimeString().slice(0, 8); // 'HH:MM:SS'

      const rows = await this.dataSource.query<
        {
          subject: string;
          teacher: string;
          startTime: string;
          room: string | null;
        }[]
      >(
        `SELECT
           te.subject,
           te.teacher,
           p."startTime",
           te.room
         FROM timetable_entries te
         JOIN periods p ON p.id = te."periodId"
         WHERE te."sectionId" = $1
           AND te."dayOfWeek" = $2
           AND p."startTime" > $3
         ORDER BY p."startTime" ASC
         LIMIT 1`,
        [sectionId, dayOfWeek, nowTime],
      );

      if (!rows.length) return null;

      const row = rows[0];
      if (!row) return null;

      return {
        subject: row.subject,
        teacher: row.teacher,
        startTime: row.startTime,
        ...(row.room ? { room: row.room } : {}),
      };
    } catch (err) {
      this.logger.warn(`fetchNextClass error: ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchPendingHomework(
    studentId: string,
    todayStr: string,
  ): Promise<ParentDashboardDto['pendingHomework']> {
    try {
      // Get sectionId
      const studentRows = await this.dataSource.query<{ sectionId: string }[]>(
        `SELECT "sectionId" FROM students WHERE id = $1 LIMIT 1`,
        [studentId],
      );
      if (!studentRows.length) return { count: 0, nextDueDate: null };

      const firstStudent = studentRows[0];
      if (!firstStudent) return { count: 0, nextDueDate: null };

      const { sectionId } = firstStudent;

      // Count published assignments due today or later for which this student
      // has no grade_record yet
      const rows = await this.dataSource.query<
        { count: string; nextDueDate: string | null }[]
      >(
        `SELECT
           COUNT(*)::int AS count,
           MIN(a."dueDate")::text AS "nextDueDate"
         FROM assignments a
         WHERE a."sectionId" = $1
           AND a.status = 'published'
           AND a."dueDate"::date >= $2::date
           AND NOT EXISTS (
             SELECT 1 FROM grade_records gr
             WHERE gr."assignmentId" = a.id
               AND gr."studentId" = $3
           )`,
        [sectionId, todayStr, studentId],
      );

      const row = rows[0];
      return {
        count: Number(row?.count ?? 0),
        nextDueDate: row?.nextDueDate ?? null,
      };
    } catch (err) {
      this.logger.warn(`fetchPendingHomework error: ${(err as Error).message}`);
      return { count: 0, nextDueDate: null };
    }
  }

  private async fetchRecentGrade(
    studentId: string,
  ): Promise<ParentDashboardDto['recentGrade']> {
    try {
      const rows = await this.dataSource.query<
        {
          subject: string;
          marks: number;
          maxMarks: number;
          publishedAt: string;
        }[]
      >(
        `SELECT
           gr.subject,
           gr.marks,
           gr."maxMarks",
           gr."publishedAt"
         FROM grade_records gr
         WHERE gr."studentId" = $1
           AND gr."publishedAt" IS NOT NULL
         ORDER BY gr."publishedAt" DESC
         LIMIT 1`,
        [studentId],
      );

      if (!rows.length) return null;

      const row = rows[0];
      if (!row) return null;

      return {
        subject: row.subject,
        marks: Number(row.marks),
        maxMarks: Number(row.maxMarks),
        publishedAt: row.publishedAt,
      };
    } catch (err) {
      this.logger.warn(`fetchRecentGrade error: ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchFeeAlert(
    studentId: string,
    now: Date,
  ): Promise<ParentDashboardDto['feeAlert']> {
    try {
      const rows = await this.dataSource.query<
        {
          amount: number;
          dueDate: string;
          id: string;
        }[]
      >(
        `SELECT
           si.amount,
           si."dueDate",
           si.id
         FROM student_invoices si
         WHERE si."studentId" = $1
           AND si.status IN ('unpaid', 'overdue')
         ORDER BY si."dueDate" ASC
         LIMIT 1`,
        [studentId],
      );

      if (!rows.length) return null;

      const row = rows[0];
      if (!row) return null;

      const dueDate = new Date(row.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        amount: Number(row.amount),
        dueDate: row.dueDate,
        daysUntilDue,
        installmentId: row.id,
      };
    } catch (err) {
      this.logger.warn(`fetchFeeAlert error: ${(err as Error).message}`);
      return null;
    }
  }
}
