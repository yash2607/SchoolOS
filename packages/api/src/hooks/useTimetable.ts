import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { DaySchedule, ExamSchedule } from "@schoolos/types";

export function useStudentTimetable(sectionId: string | null) {
  return useQuery({
    queryKey: ["timetable", sectionId],
    queryFn: async () => {
      const { data } = await apiClient.get<DaySchedule[]>(
        `/api/v1/timetable/section/${sectionId}`
      );
      return data;
    },
    enabled: !!sectionId,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

export function useTeacherTimetable(teacherId: string | null) {
  return useQuery({
    queryKey: ["timetable", "teacher", teacherId],
    queryFn: async () => {
      const { data } = await apiClient.get<DaySchedule[]>(
        `/api/v1/timetable/teacher/${teacherId}`
      );
      return data;
    },
    enabled: !!teacherId,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

export function useExamSchedule(sectionId: string | null) {
  return useQuery({
    queryKey: ["timetable", "exams", sectionId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamSchedule[]>(
        `/api/v1/timetable/exams`,
        { params: { sectionId } }
      );
      return data;
    },
    enabled: !!sectionId,
  });
}
