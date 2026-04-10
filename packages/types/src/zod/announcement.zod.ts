import { z } from "zod";

export const AudienceTypeSchema = z.enum([
  "school",
  "grade",
  "section",
  "individual",
]);

export const NotificationChannelSchema = z.enum(["push", "sms", "email"]);

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1),
  audienceType: AudienceTypeSchema,
  audienceIds: z.array(z.string().uuid()).optional().default([]),
  channels: z.array(NotificationChannelSchema).min(1),
  scheduledAt: z.string().datetime().nullable().optional(),
  attachmentUrl: z.string().url().nullable().optional(),
  requiresAck: z.boolean().optional().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;
