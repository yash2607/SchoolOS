import { useStudentGrades } from "@schoolos/api";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function StudentAcademicsPage(): React.JSX.Element {
  const { activeStudent } = usePortalStudent("student");
  const gradesQuery = useStudentGrades(activeStudent?.id ?? null);

  return (
    <PortalLayout
      portal="student"
      title="Student Academics"
      subtitle="Marks and feedback organized for students instead of administrators."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {(gradesQuery.data ?? []).map((group) => (
          <section key={group.subjectId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{group.subjectName}</h3>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <article key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.dueDate ? `Due ${item.dueDate}` : "Teacher-published item"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-violet-700">
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

        {!gradesQuery.isLoading && (gradesQuery.data?.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 xl:col-span-2">
            No academic records are available for this student yet.
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
