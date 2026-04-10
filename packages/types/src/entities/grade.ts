export type GradeStatus = "draft" | "published";

export interface GradeEntry {
  id: string;
  studentId: string;
  assessmentComponentId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  feedbackText: string | null;
  status: GradeStatus;
  publishedAt: string | null;
  gradedBy: string;
}

export interface AssessmentComponent {
  id: string;
  name: string;
  subjectId: string;
  termId: string;
  maxMarks: number;
  weightage: number;
  type: "exam" | "test" | "assignment" | "project" | "other";
}

export interface GradebookCell {
  studentId: string;
  assessmentComponentId: string;
  marks: number | null;
  maxMarks: number;
  status: GradeStatus;
  feedbackText: string | null;
}

export interface SubjectGradeSummary {
  subjectId: string;
  subjectName: string;
  latestScore: number | null;
  latestMaxScore: number | null;
  average: number | null;
  components: GradeEntry[];
}
