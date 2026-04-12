import { z } from "zod";

export const SendMessageSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  attachmentKeys: z.array(z.string()).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
