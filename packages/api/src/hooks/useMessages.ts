import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { MessageThreadSummary, ThreadMessagesPage } from "@schoolos/types";

export function useConversations() {
  return useQuery({
    queryKey: ["messages", "threads"],
    queryFn: async () => {
      const { data } = await apiClient.get<MessageThreadSummary[]>(
        "/api/v1/messages/threads"
      );
      return data;
    },
  });
}

export function useMessageThread(threadId: string | null) {
  return useInfiniteQuery({
    queryKey: ["messages", "thread", threadId],
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<ThreadMessagesPage>(
        `/api/v1/messages/threads/${threadId}`,
        { params: { limit: 30, page: pageParam } }
      );
      return data;
    },
    enabled: !!threadId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}
