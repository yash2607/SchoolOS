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

export function useStudent(studentId: string | null) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<Student>(
        `/api/v1/students/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
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
