import { useConversations, useParentDashboard } from "@schoolos/api";
import { formatINR, relativeTime } from "@schoolos/utils";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

function DashboardCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export function ParentDashboardPage(): React.JSX.Element {
  const { activeStudent, activeStudentId } = usePortalStudent("parent");
  const dashboardQuery = useParentDashboard(activeStudentId);
  const conversationsQuery = useConversations();
  const threadCount =
    conversationsQuery.data?.filter((thread) => thread.studentId === activeStudentId).length ?? 0;
  const unreadCount =
    conversationsQuery.data
      ?.filter((thread) => thread.studentId === activeStudentId)
      .reduce((total, thread) => total + thread.unreadCount, 0) ?? 0;

  const data = dashboardQuery.data;

  return (
    <PortalLayout
      portal="parent"
      title="Parent Dashboard"
      subtitle="The same MVP parent experience from mobile, expanded for the web."
    >
      {!activeStudent ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
          No linked child is available yet. Once a student is linked, attendance, grades, fees, timetable, and messages will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-emerald-600 px-6 py-7 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Student Snapshot</p>
            <h2 className="mt-2 text-3xl font-bold">{activeStudent.fullName}</h2>
            <p className="mt-2 text-sm text-white/80">
              Admission {activeStudent.admissionNo}
              {activeStudent.gradeName ? ` | ${activeStudent.gradeName}` : ""}
              {activeStudent.sectionName ? ` | ${activeStudent.sectionName}` : ""}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              label="Today's Attendance"
              value={formatAttendanceStatus(data?.attendance.status)}
              helper={
                data?.attendance.markedAt
                  ? `Marked ${relativeTime(data.attendance.markedAt)}`
                  : "Awaiting teacher mark"
              }
            />
            <DashboardCard
              label="Next Class"
              value={data?.nextClass?.subject ?? "No more classes"}
              helper={
                data?.nextClass
                  ? `${data.nextClass.startTime} with ${data.nextClass.teacher}`
                  : "Today's timetable is complete"
              }
            />
            <DashboardCard
              label="Homework"
              value={`${data?.pendingHomework.count ?? 0} pending`}
              helper={data?.pendingHomework.nextDueDate ?? "No due date scheduled"}
            />
            <DashboardCard
              label="Unread Messages"
              value={`${unreadCount}`}
              helper={`${threadCount} active teacher conversation${threadCount === 1 ? "" : "s"}`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">MVP Parent Cards</h3>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Product doc aligned
                </span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Recent Grade</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {data?.recentGrade
                      ? `${data.recentGrade.subject}: ${data.recentGrade.marks}/${data.recentGrade.maxMarks}`
                      : "No published grade yet"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {data?.recentGrade?.publishedAt
                      ? `Published ${relativeTime(data.recentGrade.publishedAt)}`
                      : "Teachers publish grades here once reviewed."}
                  </p>
                </article>

                <article className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">Fee Alert</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {data?.feeAlert ? formatINR(data.feeAlert.amount) : "No pending due"}
                  </p>
                  <p className="mt-2 text-xs text-amber-700">
                    {data?.feeAlert
                      ? `Due in ${data.feeAlert.daysUntilDue} day(s) on ${data.feeAlert.dueDate}`
                      : "Upcoming installments will appear here."}
                  </p>
                </article>

                <article className="rounded-2xl bg-sky-50 p-4 md:col-span-2">
                  <p className="text-sm font-semibold text-sky-800">AI Weekly Summary</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {data?.aiSummary?.text ??
                      "Weekly academic and attendance highlights will appear here once the summary service is enabled for the school."}
                  </p>
                  {data?.aiSummary?.generatedAt && (
                    <p className="mt-3 text-xs text-slate-500">
                      Generated {relativeTime(data.aiSummary.generatedAt)}
                    </p>
                  )}
                </article>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">What’s On Web Now</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Attendance history with monthly roll-up</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Published grades and assignment feedback</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Fee account overview and installment ledger</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Teacher-parent conversation list</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Full weekly timetable in browser-friendly layout</li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

function formatAttendanceStatus(
  status: "present" | "absent" | "late" | "not_marked" | undefined,
) {
  switch (status) {
    case "present":
      return "Present";
    case "absent":
      return "Absent";
    case "late":
      return "Late";
    default:
      return "Not Marked";
  }
}
