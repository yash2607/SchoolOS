import { z } from "zod";

export const AssignmentStatusSchema = z.enum(["draft", "published"]);

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  dueDate: z.string().datetime(),
  fileAttachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        mimeType: z.string(),
        sizeBytes: z.number().positive(),
      })
    )
    .max(3)
    .optional()
    .default([]),
  status: AssignmentStatusSchema.optional().default("draft"),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
