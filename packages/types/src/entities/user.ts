export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "ACADEMIC_COORD"
  | "CLASS_TEACHER"
  | "SUBJECT_TEACHER"
  | "PARENT";

export type SSOProvider = "google" | "microsoft" | null;

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  mobileE164: string | null;
  ssoProvider: SSOProvider;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthUser extends User {
  schoolId: string;
  sessionId: string;
}
