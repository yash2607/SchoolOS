import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { SubmitAttendanceInput } from "@schoolos/types";

export function useSubmitAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitAttendanceInput) => {
      const { data } = await apiClient.post<{ sessionId: string }>(
        "/api/v1/attendance",
        payload
      );
      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["attendance", "roster", variables.sectionId],
      });
    },
  });
}
