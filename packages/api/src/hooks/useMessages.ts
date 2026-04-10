import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Conversation, Message } from "@schoolos/types";
import type { PaginatedResponse } from "@schoolos/types";

export function useConversations() {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Conversation[]>(
        "/api/v1/messages/conversations"
      );
      return data;
    },
  });
}

export function useMessageThread(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ["messages", "thread", conversationId],
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<PaginatedResponse<Message>>(
        `/api/v1/messages/conversations/${conversationId}`,
        { params: { limit: 50, cursor: pageParam } }
      );
      return data;
    },
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor ?? undefined : undefined,
  });
}
