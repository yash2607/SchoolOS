import { useStudentTimetable } from "@schoolos/api";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StudentTimetablePage(): React.JSX.Element {
  const { activeStudent } = usePortalStudent("student");
  const timetableQuery = useStudentTimetable(activeStudent?.sectionId ?? null);

  return (
    <PortalLayout
      portal="student"
      title="Student Timetable"
      subtitle="The weekly class plan in a cleaner desktop layout."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {(timetableQuery.data ?? []).map((day) => (
          <section key={`${day.dayOfWeek}-${day.date}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}</h3>
              <span className="text-xs text-slate-500">{day.date}</span>
            </div>
            <div className="mt-5 space-y-3">
              {day.periods.map((period) => (
                <article key={period.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{period.subjectName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {period.startTime} - {period.endTime}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      P{period.periodNumber}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {period.teacherName}
                    {period.room ? ` | Room ${period.room}` : ""}
                  </p>
                </article>
              ))}

              {day.periods.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-slate-500">
                  No periods scheduled.
                </div>
              )}
            </div>
          </section>
        ))}

        {!timetableQuery.isLoading && (timetableQuery.data?.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 xl:col-span-2">
            Timetable data is not available yet for this section.
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
