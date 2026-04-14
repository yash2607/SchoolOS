import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";

export interface AdminAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  targetType: "school" | "section" | "grade" | "individual";
  targetIds: string[];
  isEmergency: boolean;
  isPinned: boolean;
  scheduledAt: string | null;
  sentAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementListResponse {
  announcements: AdminAnnouncement[];
  total: number;
  page: number;
  limit: number;
}

interface UseAnnouncementsParams {
  page?: number;
  limit?: number;
}

export function useAnnouncements(params: UseAnnouncementsParams = {}) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: async () => {
      const { data } = await apiClient.get<AnnouncementListResponse>(
        "/api/v1/announcements",
        { params }
      );
      return data;
    },
  });
}
