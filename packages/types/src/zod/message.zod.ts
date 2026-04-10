import { z } from "zod";

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  body: z.string().min(1).max(2000),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().max(200).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
