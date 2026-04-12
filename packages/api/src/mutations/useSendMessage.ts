import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Message, SendMessageInput } from "@schoolos/types";

export function useSendMessage(threadId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SendMessageInput) => {
      const { data } = await apiClient.post<Message>(
        "/api/v1/messages",
        payload
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onMutate: async (newMessage) => {
      // Optimistic update: immediately add message to thread
      if (threadId) {
        await queryClient.cancelQueries({
          queryKey: ["messages", "thread", threadId],
        });
        const optimistic = {
          id: `optimistic-${Date.now()}`,
          threadId,
          senderUserId: "current-user",
          content: newMessage.content,
          attachmentKeys: newMessage.attachmentKeys ?? [],
          sentAt: new Date().toISOString(),
          deliveredAt: null,
          readAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { optimistic };
      }
      return {};
    },
  });
}
