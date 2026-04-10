import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { AttendanceRecord, DailyAttendanceStatus } from "@schoolos/types";

export function useStudentAttendance(
  studentId: string | null,
  month?: string
) {
  return useQuery({
    queryKey: ["attendance", "student", studentId, month],
    queryFn: async () => {
      const { data } = await apiClient.get<DailyAttendanceStatus[]>(
        `/api/v1/attendance/student/${studentId}`,
        { params: { month } }
      );
      return data;
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
