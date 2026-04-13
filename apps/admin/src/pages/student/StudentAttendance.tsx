import { useMemo } from "react";
import { useStudentAttendance } from "@schoolos/api";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function StudentAttendancePage(): React.JSX.Element {
  const { activeStudent } = usePortalStudent("student");
  const attendanceQuery = useStudentAttendance(activeStudent?.id ?? null);

  const totals = useMemo(() => {
    const rows = attendanceQuery.data ?? [];
    return {
      total: rows.length,
      present: rows.filter((row) => row.status === "present").length,
      absent: rows.filter((row) => row.status === "absent").length,
      late: rows.filter((row) => row.status === "late").length,
    };
  }, [attendanceQuery.data]);

  return (
    <PortalLayout
      portal="student"
      title="Student Attendance"
      subtitle="A student-friendly attendance history with clear daily statuses."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Days Recorded", value: `${totals.total}` },
            { label: "Present", value: `${totals.present}` },
            { label: "Absent", value: `${totals.absent}` },
            { label: "Late", value: `${totals.late}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Daily Timeline</h3>
          <div className="mt-5 space-y-3">
            {(attendanceQuery.data ?? []).map((row) => (
              <article key={row.date} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">{row.date}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.periods?.length ? `${row.periods.length} period record(s)` : "Whole day mark"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${studentStatusBadge(row.status)}`}>
                  {row.status.replace("_", " ")}
                </span>
              </article>
            ))}

            {!attendanceQuery.isLoading && (attendanceQuery.data?.length ?? 0) === 0 && (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-slate-500">
                No attendance data is available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}

function studentStatusBadge(status: string) {
  if (status === "present") return "bg-emerald-50 text-emerald-700";
  if (status === "late") return "bg-amber-50 text-amber-700";
  if (status === "authorized_absent") return "bg-sky-50 text-sky-700";
  return "bg-rose-50 text-rose-700";
}
