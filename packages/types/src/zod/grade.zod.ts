import { z } from "zod";

export const GradeStatusSchema = z.enum(["draft", "published"]);

export const GradeEntrySchema = z.object({
  studentId: z.string().uuid(),
  assessmentComponentId: z.string().uuid(),
  marks: z.number().min(0),
  maxMarks: z.number().min(1),
  feedbackText: z.string().max(500).nullable().optional(),
  status: GradeStatusSchema.optional().default("draft"),
});

export const BulkGradeEntrySchema = z.object({
  assessmentComponentId: z.string().uuid(),
  entries: z.array(GradeEntrySchema),
});

export const PublishGradesSchema = z.object({
  assessmentComponentId: z.string().uuid(),
});

export type GradeEntryInput = z.infer<typeof GradeEntrySchema>;
export type BulkGradeEntryInput = z.infer<typeof BulkGradeEntrySchema>;
