import { z } from "zod";

export const AttendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "authorized_absent",
]);

export const AttendanceSessionRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: AttendanceStatusSchema,
});

export const SubmitAttendanceSchema = z.object({
  sectionId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodNumber: z.number().int().min(1).max(12),
  records: z.array(AttendanceSessionRecordSchema).min(1),
});

export const EditAttendanceSchema = SubmitAttendanceSchema.extend({
  editReason: z.string().min(10, "Edit reason must be at least 10 characters"),
});

export type SubmitAttendanceInput = z.infer<typeof SubmitAttendanceSchema>;
export type EditAttendanceInput = z.infer<typeof EditAttendanceSchema>;
