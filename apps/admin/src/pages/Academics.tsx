import { PortalLayout } from "../components/PortalLayout.js";

const gradeRows = [
  { roll: "101", name: "Aanya Sharma", maths: 94, science: 91, english: 88, social: 90, average: 91 },
  { roll: "102", name: "Arhaan Khan", maths: 86, science: 84, english: 92, social: 81, average: 86 },
  { roll: "103", name: "Mira Reddy", maths: 97, science: 95, english: 93, social: 96, average: 95 },
  { roll: "104", name: "Vivaan Patel", maths: 79, science: 82, english: 76, social: 80, average: 79 },
];

const curriculumProgress = [
  { label: "Mathematics", value: 84, color: "bg-indigo-500" },
  { label: "Science", value: 76, color: "bg-cyan-500" },
  { label: "English", value: 91, color: "bg-emerald-500" },
  { label: "Social Studies", value: 69, color: "bg-amber-500" },
];

const academicOps = [
  "Assignment publishing and grading already exist in backend scope and should be surfaced next from live APIs.",
  "Report card generation can attach to this screen without another major UI pass.",
  "Teacher-facing mark entry can reuse the same table language in the mobile and web shells.",
];

export function AcademicsPage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Academics"
      subtitle="Borrowed from the imported SchoolOS gradebook UI and shaped for SchoolOS ERP academic operations."
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-700">
                Academic Excellence
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Grade registry, curriculum progress, and teacher delivery quality
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                This module now mirrors the imported premium gradebook direction so the ERP feels
                intentional, consistent, and school-grade rather than dashboard-generic.
              </p>
            </div>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Curriculum Planner
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Grade Registry</h3>
                <p className="mt-1 text-sm text-slate-500">Grade 10 • Section A • Midterm performance snapshot</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Imported layout adapted
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    {["Roll", "Student", "Maths", "Science", "English", "Social", "Average"].map((label) => (
                      <th key={label} className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradeRows.map((row) => (
                    <tr key={row.roll} className="bg-white transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{row.roll}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.name}</td>
                      <td className="px-6 py-4">{scoreBadge(row.maths)}</td>
                      <td className="px-6 py-4">{scoreBadge(row.science)}</td>
                      <td className="px-6 py-4">{scoreBadge(row.english)}</td>
                      <td className="px-6 py-4">{scoreBadge(row.social)}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-950">{row.average}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <h3 className="text-lg font-semibold text-slate-950">Curriculum Progress</h3>
              <div className="mt-6 space-y-5">
                {curriculumProgress.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      <span className="text-xs font-bold text-slate-500">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-6 shadow-[0_24px_80px_rgba(34,41,87,0.10)]">
              <h3 className="text-lg font-semibold text-slate-950">Academic Ops Roadmap</h3>
              <div className="mt-5 space-y-3">
                {academicOps.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
}

function scoreBadge(score: number): React.JSX.Element {
  const tone =
    score >= 90
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : score >= 80
        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
        : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <span className={`inline-flex rounded-xl border px-3 py-1 text-sm font-bold ${tone}`}>
      {score}
    </span>
  );
}