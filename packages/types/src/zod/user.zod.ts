import { z } from "zod";

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "ACADEMIC_COORD",
  "CLASS_TEACHER",
  "SUBJECT_TEACHER",
  "PARENT",
]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  role: UserRoleSchema,
  name: z.string().min(1).max(200),
  email: z.string().email().nullable(),
  mobileE164: z.string().regex(/^\+91[6-9]\d{9}$/).nullable(),
  ssoProvider: z.enum(["google", "microsoft"]).nullable(),
  isActive: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const SendOtpSchema = z.object({
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/, "Valid Indian mobile number required"),
});

export const VerifyOtpSchema = z.object({
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp: z.string().length(6).regex(/^\d{6}$/),
  deviceToken: z.string().optional(),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
