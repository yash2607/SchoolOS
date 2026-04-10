export type StudentStatus = "active" | "inactive" | "alumni" | "transferred";
export type Gender = "male" | "female" | "other";

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: Gender;
  gradeId: string;
  sectionId: string;
  photoUrl: string | null;
  blurhash: string | null;
  healthNotes: string | null;
  hasIep: boolean;
  enrollmentDate: string;
  status: StudentStatus;
}

export interface StudentSummary {
  id: string;
  admissionNo: string;
  fullName: string;
  photoUrl: string | null;
  blurhash: string | null;
  gradeId: string;
  sectionId: string;
}
