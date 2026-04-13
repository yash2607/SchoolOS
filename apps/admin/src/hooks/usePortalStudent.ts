import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChildrenForParent } from "@schoolos/api";
import type { ChildProfile } from "@schoolos/types";
import { apiClient } from "../lib/api.js";
import type { PortalVariant } from "../lib/portal.js";
import { useAuthStore } from "../store/authStore.js";
import { usePortalStore } from "../store/portalStore.js";

interface StudentListResponse {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  gradeId: string;
  sectionId: string;
  gradeName?: string | null;
  sectionName?: string | null;
}

export interface PortalStudentOption extends ChildProfile {
  gradeName?: string | null;
  sectionName?: string | null;
}

function mapPreviewStudent(student: StudentListResponse): PortalStudentOption {
  return {
    id: student.id,
    fullName: `${student.firstName} ${student.lastName}`.trim(),
    photoUrl: null,
    blurhash: null,
    gradeId: student.gradeId,
    sectionId: student.sectionId,
    admissionNo: student.studentCode,
    gradeName: student.gradeName ?? null,
    sectionName: student.sectionName ?? null,
  };
}

export function usePortalStudent(portal: PortalVariant) {
  const user = useAuthStore((state) => state.user);
  const activeStudentId = usePortalStore((state) => state.activeStudentId);
  const setActiveStudentId = usePortalStore((state) => state.setActiveStudentId);
  const isParentUser = user?.role === "PARENT";

  const parentChildrenQuery = useChildrenForParent(isParentUser ? user?.id ?? null : null);
  const previewStudentsQuery = useQuery({
    queryKey: ["portal", "preview-students"],
    enabled: !isParentUser && (portal === "parent" || portal === "student"),
    queryFn: async () => {
      const { data } = await apiClient.get<StudentListResponse[]>("/api/v1/students");
      return data.slice(0, 12).map(mapPreviewStudent);
    },
  });

  const options = useMemo<PortalStudentOption[]>(() => {
    if (isParentUser) {
      return (parentChildrenQuery.data ?? []).map((child) => ({
        ...child,
        gradeName: null,
        sectionName: null,
      }));
    }
    return previewStudentsQuery.data ?? [];
  }, [isParentUser, parentChildrenQuery.data, previewStudentsQuery.data]);

  useEffect(() => {
    if (options.length === 0) return;
    const exists = options.some((student) => student.id === activeStudentId);
    if (!activeStudentId || !exists) {
      setActiveStudentId(options[0]?.id ?? null);
    }
  }, [activeStudentId, options, setActiveStudentId]);

  const activeStudent =
    options.find((student) => student.id === activeStudentId) ?? options[0] ?? null;

  return {
    activeStudent,
    activeStudentId: activeStudent?.id ?? null,
    options,
    setActiveStudentId,
    isLoading: isParentUser ? parentChildrenQuery.isLoading : previewStudentsQuery.isLoading,
    sourceLabel: isParentUser ? "Linked child" : "Admin preview",
  };
}
