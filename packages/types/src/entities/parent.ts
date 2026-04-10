import type { Student } from "./student.js";

export type Relationship = "mother" | "father" | "guardian" | "other";

export interface Parent {
  id: string;
  userId: string;
  name: string;
  mobileE164: string;
  email: string | null;
  relationship: Relationship;
  alternateContact: string | null;
  address: string | null;
  isActive: boolean;
}

export interface ParentWithChildren extends Parent {
  children: Student[];
}

export interface ChildProfile {
  id: string;
  fullName: string;
  photoUrl: string | null;
  blurhash: string | null;
  gradeId: string;
  sectionId: string;
  admissionNo: string;
}
