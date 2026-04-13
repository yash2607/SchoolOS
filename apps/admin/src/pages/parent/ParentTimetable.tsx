import { useMemo } from "react";
import { useStudentTimetable } from "@schoolos/api";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ParentTimetablePage(): React.JSX.Element {
  const { activeStudent } = usePortalStudent("parent");
  const timetableQuery = useStudentTimetable(activeStudent?.sectionId ?? null);

  const days = useMemo(
    () =>
      (timetableQuery.data ?? []).map((day) => ({
        ...day,
        label: DAY_LABELS[day.dayOfWeek] ?? `Day ${day.dayOfWeek}`,
      })),
    [timetableQuery.data],
  );

  return (
    <PortalLayout
      portal="parent"
      title="Timetable"
      subtitle="Weekly class schedule exactly where parents expect it on web."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {days.map((day) => (
          <section key={`${day.dayOfWeek}-${day.date}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{day.label}</h3>
              <span className="text-xs text-slate-500">{day.date}</span>
            </div>
            <div className="mt-5 space-y-3">
              {day.periods.length > 0 ? (
                day.periods.map((period) => (
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
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No classes scheduled.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </PortalLayout>
  );
}
