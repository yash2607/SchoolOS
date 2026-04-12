import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { GradebookCell } from "@schoolos/types";

export interface StudentGradeItem {
  id: string;
  assignmentId: string;
  title: string;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  publishedAt: string | null;
  dueDate: string | null;
}

export interface StudentGradeGroup {
  subjectId: string;
  subjectName: string;
  items: StudentGradeItem[];
}

export function useStudentGrades(studentId: string | null) {
  return useQuery<StudentGradeGroup[]>({
    queryKey: ["grades", "student", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<
        Array<{
          subject: string;
          items: Array<{
            grade: {
              id: string;
              assignmentId: string;
              score: number | null;
              maxScore: number;
              feedback: string | null;
              publishedAt: string | null;
            };
            assignment: {
              id: string;
              title: string;
              dueDate: string | null;
            };
          }>;
        }>
      >(`/api/v1/gradebook/student/${studentId}`);

      return data.map<StudentGradeGroup>((group) => ({
        subjectId: group.subject,
        subjectName: group.subject,
        items: group.items.map((item) => ({
          id: item.grade.id,
          assignmentId: item.grade.assignmentId,
          title: item.assignment.title,
          score: item.grade.score,
          maxScore: item.grade.maxScore,
          feedback: item.grade.feedback,
          publishedAt: item.grade.publishedAt,
          dueDate: item.assignment.dueDate,
        })),
      }));
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
