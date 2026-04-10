import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { SubjectGradeSummary, GradebookCell } from "@schoolos/types";

export function useStudentGrades(studentId: string | null) {
  return useQuery({
    queryKey: ["grades", "student", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectGradeSummary[]>(
        `/api/v1/grades/student/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}

export function useGradebookGrid(
  classId: string | null,
  subjectId: string | null
) {
  return useQuery({
    queryKey: ["gradebook", classId, subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get<GradebookCell[]>(
        `/api/v1/gradebook/${classId}/${subjectId}`
      );
      return data;
    },
    enabled: !!classId && !!subjectId,
  });
}
