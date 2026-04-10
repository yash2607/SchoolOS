import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Assignment, CreateAssignmentInput } from "@schoolos/types";

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssignmentInput) => {
      const { data } = await apiClient.post<Assignment>(
        "/api/v1/assignments",
        payload
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
