export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  mobileE164: string | null;
  photoUrl: string | null;
  blurhash: string | null;
  employeeId: string | null;
  qualification: string | null;
  isActive: boolean;
  joinedAt: string;
}

export interface TeacherSummary {
  id: string;
  name: string;
  photoUrl: string | null;
  blurhash: string | null;
}
