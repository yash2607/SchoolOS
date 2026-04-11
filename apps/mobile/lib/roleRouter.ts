import type { UserRole } from "@schoolos/types";

type RoleGroup = "/(parent)" | "/(teacher)" | "/(admin)";

export function getGroupForRole(role: UserRole): RoleGroup {
  switch (role) {
    case "PARENT":
      return "/(parent)";
    case "CLASS_TEACHER":
    case "SUBJECT_TEACHER":
      return "/(teacher)";
    case "SCHOOL_ADMIN":
    case "ACADEMIC_COORD":
    case "SUPER_ADMIN":
      return "/(admin)";
  }
}
