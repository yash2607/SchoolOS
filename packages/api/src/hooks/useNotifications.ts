import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Notification } from "@schoolos/types";
import type { PaginatedResponse } from "@schoolos/types";

export function useNotifications(category?: string) {
  return useInfiniteQuery({
    queryKey: ["notifications", category],
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<PaginatedResponse<Notification>>(
        "/api/v1/notifications",
        {
          params: {
            limit: 30,
            cursor: pageParam,
            category,
          },
        }
      );
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor ?? undefined : undefined,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.post(`/api/v1/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
