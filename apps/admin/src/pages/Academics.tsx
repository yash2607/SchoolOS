import { PortalLayout } from "../components/PortalLayout.js";

export function AcademicsPage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Academics"
      subtitle="Assignments, grade publishing, report cards, and academic operations from the MVP product doc."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Academic Workflow</h2>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              MVP web scope
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Assignments",
                body: "Create homework and classwork, track submissions, and publish grades with feedback.",
              },
              {
                title: "Gradebook",
                body: "Per-subject grade entry, draft-to-published flow, and parent-visible results.",
              },
              {
                title: "Report Cards",
                body: "Term-end report generation, AI-assisted narratives, and publish controls.",
              },
              {
                title: "Review Queue",
                body: "Flag unpublished grades and missing teacher feedback before parent release.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Build Order From PRD</h2>
          <ol className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">1. Teacher assignment publishing with due dates and instructions.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">2. Grade entry per assignment with text feedback.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">3. Publish action that makes results visible to parents on mobile and web.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">4. Report card generation and bulk publish for end-of-term workflows.</li>
          </ol>
        </section>
      </div>
    </PortalLayout>
  );
}
