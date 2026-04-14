import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { ChildProfile, Student } from "@schoolos/types";

interface ParentChildResponse {
  id: string;
  firstName: string;
  lastName: string;
  gradeId: string;
  sectionId: string;
  studentCode: string;
  photoUrl?: string | null;
  blurhash?: string | null;
}

export interface StudentListResponse {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: "M" | "F" | "Other";
  gradeId: string;
  sectionId: string;
  photoUrl?: string | null;
  iepFlag: boolean;
  admissionDate: string | null;
  status: "active" | "transferred" | "withdrawn";
  gradeName?: string | null;
  sectionName?: string | null;
}

interface UseStudentsFilters {
  gradeId?: string;
  sectionId?: string;
  status?: string;
  search?: string;
}

export function mapStudent(student: StudentListResponse): Student {
  return {
    id: student.id,
    admissionNo: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: `${student.firstName} ${student.lastName}`.trim(),
    dob: student.dateOfBirth ?? "",
    gender:
      student.gender === "M"
        ? "male"
        : student.gender === "F"
          ? "female"
          : "other",
    gradeId: student.gradeId,
    sectionId: student.sectionId,
    photoUrl: student.photoUrl ?? null,
    blurhash: null,
    healthNotes: null,
    hasIep: student.iepFlag,
    enrollmentDate: student.admissionDate ?? "",
    status: student.status === "withdrawn" ? "inactive" : student.status,
  };
}

export function useStudent(studentId: string | null) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentListResponse>(
        `/api/v1/students/${studentId}`
      );
      return mapStudent(data);
    },
    enabled: !!studentId,
  });
}

export function useStudents(filters: UseStudentsFilters = {}) {
  return useQuery({
    queryKey: ["students", "list", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentListResponse[]>(
        "/api/v1/students",
        { params: filters }
      );
      return data.map((student) => ({
        ...mapStudent(student),
        gradeName: student.gradeName ?? null,
        sectionName: student.sectionName ?? null,
      }));
    },
  });
}

export function useChildrenForParent(parentId: string | null) {
  return useQuery({
    queryKey: ["students", "parent", parentId],
    queryFn: async () => {
      const { data } = await apiClient.get<ParentChildResponse[]>(
        "/api/v1/me/children"
      );
      return data.map<ChildProfile>((child) => ({
        id: child.id,
        fullName: `${child.firstName} ${child.lastName}`.trim(),
        photoUrl: child.photoUrl ?? null,
        blurhash: child.blurhash ?? null,
        gradeId: child.gradeId,
        sectionId: child.sectionId,
        admissionNo: child.studentCode,
      }));
    },
    enabled: !!parentId,
  });
}
