import { PortalLayout } from "../components/PortalLayout.js";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00"];

const slots = [
  { day: "Monday", time: "08:00", subject: "Mathematics", teacher: "R. Iyer", tone: "bg-indigo-50 border-indigo-100 text-indigo-700" },
  { day: "Monday", time: "09:00", subject: "Physics", teacher: "P. Menon", tone: "bg-cyan-50 border-cyan-100 text-cyan-700" },
  { day: "Tuesday", time: "10:00", subject: "English", teacher: "S. Dutta", tone: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  { day: "Wednesday", time: "11:00", subject: "Chemistry", teacher: "A. Nair", tone: "bg-amber-50 border-amber-100 text-amber-700" },
  { day: "Thursday", time: "12:00", subject: "History", teacher: "M. Joseph", tone: "bg-rose-50 border-rose-100 text-rose-700" },
  { day: "Friday", time: "09:00", subject: "Computer Lab", teacher: "K. Verma", tone: "bg-slate-100 border-slate-200 text-slate-700" },
];

const stats = [
  { label: "Weekly Hours", value: "34 hrs", tone: "bg-indigo-50 text-indigo-700" },
  { label: "Faculty Mapped", value: "18", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Rooms Allocated", value: "12", tone: "bg-amber-50 text-amber-700" },
];

const builderNotes = [
  "Timetable builder visuals now match the imported SchoolOS scheduling surface.",
  "Next backend pass should wire period CRUD and publish actions to the timetable service.",
  "Exam timetable and teacher load balancing can extend this same grid without redesigning it.",
];

export function TimetablePage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Timetable"
      subtitle="Imported scheduling UI adapted into the routed admin ERP so timetable operations feel premium and structured."
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-700">
                Timetable Builder
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Create and publish weekly schedules with visual clarity
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                This is the imported scheduling interface translated into your admin product so the
                timetable workflow already looks like a premium school ERP before full CRUD wiring lands.
              </p>
            </div>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Add Slot
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Grade 10 • Section A</h3>
              <p className="mt-1 text-sm text-slate-500">Weekly class allocation board</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Publish-ready UI
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/80">
                <div className="border-r border-slate-200 p-4" />
                {days.map((day) => (
                  <div key={day} className="border-r border-slate-200 p-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-slate-100">
                {times.map((time) => (
                  <div key={time} className="grid grid-cols-6">
                    <div className="border-r border-slate-200 bg-slate-50/50 p-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = slots.find((item) => item.day === day && item.time === time);
                      return (
                        <div key={`${day}-${time}`} className="border-r border-slate-100 p-2 last:border-r-0">
                          {slot ? (
                            <div className={`flex h-28 flex-col justify-between rounded-2xl border p-3 transition hover:shadow-sm ${slot.tone}`}>
                              <div>
                                <div className="text-sm font-bold">{slot.subject}</div>
                                <div className="mt-1 text-xs font-medium opacity-80">{slot.teacher}</div>
                              </div>
                              <div className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-75">
                                Scheduled
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
                              Empty
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-5 md:grid-cols-3">
            {stats.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(34,41,87,0.10)]">
                <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] ${item.tone}`}>
                  {item.label}
                </div>
                <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">{item.value}</div>
              </article>
            ))}
          </section>

          <aside className="rounded-[30px] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-6 shadow-[0_24px_80px_rgba(34,41,87,0.10)]">
            <h3 className="text-lg font-semibold text-slate-950">Builder Notes</h3>
            <div className="mt-5 space-y-3">
              {builderNotes.map((item) => (
                <div key={item} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
}