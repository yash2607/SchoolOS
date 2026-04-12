/** 0=Sunday, 1=Monday, ..., 6=Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimetableSlot {
  id: string;
  sectionId: string;
  sectionName?: string;
  gradeName?: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string | null;
  isPublished: boolean;
  academicYearId: string;
}

export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  date: string;
  periods: TimetableSlot[];
}

export interface CurrentPeriod {
  slot: TimetableSlot;
  minutesRemaining: number;
}

export interface SchoolCalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  type: "school" | "exam" | "holiday" | "ptm" | "other";
  description: string | null;
}

export interface ExamSchedule {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  duration: number;
  venue: string | null;
  termId: string;
}
