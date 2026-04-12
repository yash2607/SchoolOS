import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type {
  AttendanceRecord,
  AttendanceStatus,
  DailyAttendanceStatus,
} from "@schoolos/types";

interface AttendanceHistoryRow {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "on_leave";
  periodNumber: number | null;
}

export function useStudentAttendance(
  studentId: string | null,
  month?: string
) {
  return useQuery({
    queryKey: ["attendance", "student", studentId, month],
    queryFn: async () => {
      const targetMonth = month ?? new Date().toISOString().slice(0, 7);
      const [year, monthNumber] = targetMonth.split("-").map(Number);

      const { data } = await apiClient.get<AttendanceHistoryRow[]>(
        `/api/v1/attendance/student/${studentId}`,
        { params: { month: monthNumber, year } }
      );

      const grouped = new Map<string, AttendanceHistoryRow[]>();
      for (const row of data) {
        const rows = grouped.get(row.date) ?? [];
        rows.push(row);
        grouped.set(row.date, rows);
      }

      return Array.from(grouped.entries())
        .sort(([left], [right]) => right.localeCompare(left))
        .map<DailyAttendanceStatus>(([date, rows]) => {
          const periods = rows
            .filter((row) => row.periodNumber !== null)
            .map((row) => ({
              periodNumber: row.periodNumber ?? 0,
              status: (
                row.status === "on_leave" ? "authorized_absent" : row.status
              ) as AttendanceStatus,
              subject: `Period ${row.periodNumber ?? 0}`,
            }));

          const statuses = rows.map((row) => row.status);
          const status = statuses.includes("absent")
            ? "absent"
            : statuses.includes("late")
              ? "late"
              : statuses.includes("on_leave")
                ? "authorized_absent"
                : "present";

          return {
            date,
            status,
            ...(periods.length > 0 ? { periods } : {}),
          };
        });
    },
    enabled: !!studentId,
  });
}

export function useAttendanceRoster(
  classId: string | null,
  period: number,
  date: string
) {
  return useQuery({
    queryKey: ["attendance", "roster", classId, period, date],
    queryFn: async () => {
      const { data } = await apiClient.get<AttendanceRecord[]>(
        `/api/v1/attendance/roster`,
        { params: { classId, period, date } }
      );
      return data;
    },
    enabled: !!classId,
    staleTime: 2 * 60 * 1000, // 2 min - roster doesn't change often
  });
}
