import { z } from "zod";

export const DayOfWeekSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const CreateTimetableSlotSchema = z.object({
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  dayOfWeek: DayOfWeekSchema,
  periodNumber: z.number().int().min(1).max(12),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  room: z.string().max(50).nullable().optional(),
  academicYearId: z.string().uuid(),
});

export type CreateTimetableSlotInput = z.infer<typeof CreateTimetableSlotSchema>;
