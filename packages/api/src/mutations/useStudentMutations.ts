import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import { mapStudent } from "../hooks/useStudent.js";
import type { StudentListResponse } from "../hooks/useStudent.js";

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "M" | "F" | "Other";
  gradeId: string;
  sectionId: string;
  admissionDate?: string;
}

export interface UpdateStudentPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "M" | "F" | "Other";
  gradeId?: string;
  sectionId?: string;
  iepFlag?: boolean;
  status?: "active" | "transferred" | "withdrawn";
}

function invalidateStudents(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["students"] });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const { data } = await apiClient.post<StudentListResponse>(
        "/api/v1/students",
        payload
      );
      return mapStudent(data);
    },
    onSuccess: () => {
      invalidateStudents(queryClient);
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateStudentPayload) => {
      const { data } = await apiClient.patch<StudentListResponse>(
        `/api/v1/students/${id}`,
        payload
      );
      return mapStudent(data);
    },
    onSuccess: () => {
      invalidateStudents(queryClient);
    },
  });
}
