import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Student } from "@schoolos/types";

export function useStudent(studentId: string | null) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<Student>(
        `/api/v1/students/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}

export function useChildrenForParent(parentId: string | null) {
  return useQuery({
    queryKey: ["students", "parent", parentId],
    queryFn: async () => {
      const { data } = await apiClient.get<Student[]>(
        `/api/v1/students?parentId=${parentId}`
      );
      return data;
    },
    enabled: !!parentId,
  });
}
