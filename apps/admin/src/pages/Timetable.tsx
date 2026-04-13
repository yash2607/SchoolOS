import { PortalLayout } from "../components/PortalLayout.js";

export function TimetablePage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Timetable"
      subtitle="Manual timetable builder and publish workflow from the MVP roadmap."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Builder Workflow</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Create periods with subject, teacher, room, and class mapping",
              "Publish schedules to parent and student portals",
              "Teacher timetable parity with mobile daily views",
              "Exam schedule slots and school calendar events",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Launch Priorities</h2>
          <ol className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">1. Manual section timetable entry.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">2. Teacher timetable verification before publish.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">3. Parent/student read-only weekly view on web and mobile.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">4. Exam schedule extension after class timetable is stable.</li>
          </ol>
        </section>
      </div>
    </PortalLayout>
  );
}
