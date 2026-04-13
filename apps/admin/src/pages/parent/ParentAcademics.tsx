import { useStudentGrades } from "@schoolos/api";
import { relativeTime } from "@schoolos/utils";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function ParentAcademicsPage(): React.JSX.Element {
  const { activeStudent, activeStudentId } = usePortalStudent("parent");
  const gradesQuery = useStudentGrades(activeStudentId);

  return (
    <PortalLayout
      portal="parent"
      title="Academics"
      subtitle="Published marks, assignment results, and teacher feedback from the mobile MVP."
    >
      <div className="space-y-6">
        {activeStudent && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{activeStudent.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review subject-wise marks, published work, and feedback.
            </p>
          </div>
        )}

        {gradesQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
            Loading academic results...
          </div>
        ) : gradesQuery.data && gradesQuery.data.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {gradesQuery.data.map((group) => (
              <section key={group.subjectId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{group.subjectName}</h3>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <article key={item.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.publishedAt
                              ? `Published ${relativeTime(item.publishedAt)}`
                              : "Awaiting publication"}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-sky-700">
                          {item.score ?? "-"} / {item.maxScore}
                        </p>
                      </div>
                      {item.feedback && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.feedback}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
            No grades have been published for this student yet.
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
