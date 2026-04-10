import { z } from "zod";

export const NotificationCategorySchema = z.enum([
  "attendance",
  "academic",
  "finance",
  "communication",
  "emergency",
  "system",
]);

export const UpdateNotificationPrefsSchema = z.object({
  attendance: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  grades: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  assignments: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  fees: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  messages: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  announcements: z
    .object({
      enabled: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
});
