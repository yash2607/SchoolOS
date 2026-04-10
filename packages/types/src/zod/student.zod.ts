import { z } from "zod";

export const StudentStatusSchema = z.enum([
  "active",
  "inactive",
  "alumni",
  "transferred",
]);

export const GenderSchema = z.enum(["male", "female", "other"]);

export const StudentSchema = z.object({
  id: z.string().uuid(),
  admissionNo: z.string().min(1).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: GenderSchema,
  gradeId: z.string().uuid(),
  sectionId: z.string().uuid(),
  photoUrl: z.string().url().nullable(),
  blurhash: z.string().nullable(),
  healthNotes: z.string().max(2000).nullable(),
  hasIep: z.boolean(),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: StudentStatusSchema,
});

export const CreateStudentSchema = StudentSchema.omit({
  id: true,
  photoUrl: true,
  blurhash: true,
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
