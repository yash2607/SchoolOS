export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "authorized_absent";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sectionId: string;
  date: string;
  periodNumber: number;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
  editedAt: string | null;
  editReason: string | null;
  isOfflineSubmission: boolean;
}

export interface AttendanceSession {
  sectionId: string;
  date: string;
  periodNumber: number;
  records: AttendanceSessionRecord[];
  submittedBy: string;
  submittedAt?: string;
}

export interface AttendanceSessionRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  authorizedAbsent: number;
  total: number;
  percentage: number;
}

export interface DailyAttendanceStatus {
  date: string;
  status: AttendanceStatus | "not_marked" | "weekend" | "holiday";
  periods?: PeriodAttendance[];
}

export interface PeriodAttendance {
  periodNumber: number;
  status: AttendanceStatus;
  subject: string;
}
