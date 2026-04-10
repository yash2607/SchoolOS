import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { FeeAccount, FeeSummary } from "@schoolos/types";

export function useStudentFees(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "student", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeAccount>(
        `/api/v1/fees/student/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}

export function useFeeSummary(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "summary", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeSummary>(
        `/api/v1/fees/student/${studentId}/summary`
      );
      return data;
    },
    enabled: !!studentId,
  });
}
