export type AssignmentStatus = "draft" | "published";
export type SubmissionStatus = "pending" | "submitted" | "graded";

export interface FileAttachment {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  sectionId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  fileAttachments: FileAttachment[];
  status: AssignmentStatus;
  createdAt: string;
  publishedAt: string | null;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string | null;
  status: SubmissionStatus;
  grade: number | null;
  maxGrade: number | null;
  feedback: string | null;
  acknowledgedAt: string | null;
}

export interface AssignmentSummary {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  status: AssignmentStatus;
  submissionStatus: SubmissionStatus;
  grade: number | null;
}
