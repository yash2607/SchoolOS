import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { Message, SendMessageInput } from "@schoolos/types";

export function useSendMessage(conversationId?: string) {
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
      if (conversationId) {
        await queryClient.cancelQueries({
          queryKey: ["messages", "thread", conversationId],
        });
        const optimistic = {
          id: `optimistic-${Date.now()}`,
          conversationId,
          senderId: "current-user",
          receiverId: "",
          body: newMessage.body,
          attachmentUrl: newMessage.attachmentUrl ?? null,
          attachmentName: newMessage.attachmentName ?? null,
          sentAt: new Date().toISOString(),
          deliveredAt: null,
          readAt: null,
        };
        return { optimistic };
      }
      return {};
    },
  });
}
