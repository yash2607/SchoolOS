import { useMemo } from "react";
import {
  useFeeSummary,
  useStudentAttendance,
  useStudentGrades,
  useStudentTimetable,
} from "@schoolos/api";
import { formatINR } from "@schoolos/utils";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function StudentDashboardPage(): React.JSX.Element {
  const { activeStudent } = usePortalStudent("student");
  const attendanceQuery = useStudentAttendance(activeStudent?.id ?? null);
  const gradesQuery = useStudentGrades(activeStudent?.id ?? null);
  const timetableQuery = useStudentTimetable(activeStudent?.sectionId ?? null);
  const feeSummaryQuery = useFeeSummary(activeStudent?.id ?? null);

  const latestGrade =
    gradesQuery.data?.flatMap((group) => group.items).find((item) => item.publishedAt) ?? null;
  const attendanceRate = useMemo(() => {
    const rows = attendanceQuery.data ?? [];
    if (rows.length === 0) return 0;
    const presentCount = rows.filter((row) => row.status === "present").length;
    return Math.round((presentCount / rows.length) * 100);
  }, [attendanceQuery.data]);
  const todaySlot =
    timetableQuery.data?.find((day) => day.dayOfWeek === new Date().getDay())?.periods[0] ?? null;

  return (
    <PortalLayout
      portal="student"
      title="Student Dashboard"
      subtitle="A student-first web view for classes, progress, and attendance."
    >
      {!activeStudent ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
          Select a student to preview the student portal.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-6 py-7 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Student View</p>
            <h2 className="mt-2 text-3xl font-bold">{activeStudent.fullName}</h2>
            <p className="mt-2 text-sm text-white/80">
              Admission {activeStudent.admissionNo}
              {activeStudent.gradeName ? ` | ${activeStudent.gradeName}` : ""}
              {activeStudent.sectionName ? ` | ${activeStudent.sectionName}` : ""}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Attendance", value: `${attendanceRate}%`, helper: "Month to date" },
              {
                label: "Latest Grade",
                value: latestGrade ? `${latestGrade.score ?? "-"} / ${latestGrade.maxScore}` : "No grade yet",
                helper: latestGrade?.title ?? "Waiting for publication",
              },
              {
                label: "Next Class",
                value: todaySlot?.subjectName ?? "No class scheduled",
                helper: todaySlot ? `${todaySlot.startTime} - ${todaySlot.endTime}` : "Check timetable",
              },
              {
                label: "Outstanding Fees",
                value: formatINR(feeSummaryQuery.data?.outstanding ?? 0),
                helper: "Shown so students stay informed",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
