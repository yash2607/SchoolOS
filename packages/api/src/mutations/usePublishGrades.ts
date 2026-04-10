import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";

export function usePublishGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assessmentComponentId: string) => {
      await apiClient.post("/api/v1/grades/publish", { assessmentComponentId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gradebook"] });
      void queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });
}
