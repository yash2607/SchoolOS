import type { UserRole } from "@schoolos/types";

export type PortalVariant = "admin" | "parent" | "student";

export interface PortalNavItem {
  label: string;
  path: string;
  short: string;
}

export const portalMeta: Record<
  PortalVariant,
  {
    label: string;
    accent: string;
    background: string;
    nav: PortalNavItem[];
  }
> = {
  admin: {
    label: "Admin Console",
    accent: "#3525cd",
    background: "linear-gradient(180deg, #f4f6fb 0%, #eef2ff 100%)",
    nav: [
      { label: "Dashboard", path: "/admin/dashboard", short: "DB" },
      { label: "Students", path: "/admin/students", short: "ST" },
      { label: "Teachers", path: "/admin/teachers", short: "TC" },
      { label: "Attendance", path: "/admin/attendance", short: "AT" },
      { label: "Timetable", path: "/admin/timetable", short: "TT" },
      { label: "Academics", path: "/admin/academics", short: "AC" },
      { label: "Finance", path: "/admin/finance", short: "FN" },
      { label: "Communication", path: "/admin/communication", short: "CM" },
      { label: "Settings", path: "/admin/settings", short: "SE" },
    ],
  },
  parent: {
    label: "Parent Portal",
    accent: "#0f766e",
    background: "linear-gradient(180deg, #edfdf8 0%, #f5fffb 100%)",
    nav: [
      { label: "Dashboard", path: "/parent/dashboard", short: "DB" },
      { label: "Academics", path: "/parent/academics", short: "AC" },
      { label: "Attendance", path: "/parent/attendance", short: "AT" },
      { label: "Timetable", path: "/parent/timetable", short: "TT" },
      { label: "Fees", path: "/parent/fees", short: "FE" },
      { label: "Messages", path: "/parent/messages", short: "MS" },
    ],
  },
  student: {
    label: "Student Portal",
    accent: "#5b4cf0",
    background: "linear-gradient(180deg, #f3f2ff 0%, #f8f7ff 100%)",
    nav: [
      { label: "Dashboard", path: "/student/dashboard", short: "DB" },
      { label: "Academics", path: "/student/academics", short: "AC" },
      { label: "Attendance", path: "/student/attendance", short: "AT" },
      { label: "Timetable", path: "/student/timetable", short: "TT" },
    ],
  },
};

export function getDefaultPortalPath(role: UserRole | null | undefined): string {
  return role === "PARENT" ? "/parent/dashboard" : "/admin/dashboard";
}

export function getAccessiblePortals(
  role: UserRole | null | undefined,
): PortalVariant[] {
  if (role === "PARENT") return ["parent", "student"];
  return ["admin", "parent", "student"];
}
