import { useMemo } from "react";
import { useStudentAttendance } from "@schoolos/api";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function ParentAttendancePage(): React.JSX.Element {
  const { activeStudentId } = usePortalStudent("parent");
  const attendanceQuery = useStudentAttendance(activeStudentId);

  const summary = useMemo(() => {
    const rows = attendanceQuery.data ?? [];
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "present") acc.present += 1;
        if (row.status === "absent") acc.absent += 1;
        if (row.status === "late") acc.late += 1;
        if (row.status === "authorized_absent") acc.onLeave += 1;
        return acc;
      },
      { total: 0, present: 0, absent: 0, late: 0, onLeave: 0 },
    );
  }, [attendanceQuery.data]);

  const rate = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;

  return (
    <PortalLayout
      portal="parent"
      title="Attendance"
      subtitle="Daily attendance history and monthly roll-up for the active student."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Attendance Rate", value: `${rate}%` },
            { label: "Present", value: `${summary.present}` },
            { label: "Absent", value: `${summary.absent}` },
            { label: "Late", value: `${summary.late}` },
            { label: "On Leave", value: `${summary.onLeave}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Attendance Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Periods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(attendanceQuery.data ?? []).map((row) => (
                  <tr key={row.date}>
                    <td className="px-6 py-4 font-medium text-slate-900">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(row.status)}`}>
                        {row.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.periods?.length
                        ? row.periods.map((period) => `P${period.periodNumber}: ${period.status}`).join(" | ")
                        : "Whole-day status"}
                    </td>
                  </tr>
                ))}
                {!attendanceQuery.isLoading && (attendanceQuery.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      No attendance history found for the selected month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}

function statusBadge(status: string) {
  if (status === "present") return "bg-emerald-50 text-emerald-700";
  if (status === "late") return "bg-amber-50 text-amber-700";
  if (status === "authorized_absent") return "bg-sky-50 text-sky-700";
  return "bg-rose-50 text-rose-700";
}
