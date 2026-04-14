import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { AdminAnnouncement } from "../hooks/useAnnouncements.js";

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  targetType?: "school" | "section" | "grade" | "individual";
  targetIds?: string[];
  isEmergency?: boolean;
  isPinned?: boolean;
  scheduledAt?: string;
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAnnouncementPayload) => {
      const { data } = await apiClient.post<AdminAnnouncement>(
        "/api/v1/announcements",
        payload
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
