import { useFeeSummary, useStudentFees } from "@schoolos/api";
import { formatINR } from "@schoolos/utils";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function ParentFeesPage(): React.JSX.Element {
  const { activeStudentId } = usePortalStudent("parent");
  const feeAccountQuery = useStudentFees(activeStudentId);
  const feeSummaryQuery = useFeeSummary(activeStudentId);

  const summary = feeSummaryQuery.data;
  const account = feeAccountQuery.data;

  return (
    <PortalLayout
      portal="parent"
      title="Fees"
      subtitle="Installments, outstanding balance, and ledger visibility from the parent MVP flow."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Paid", value: formatINR(summary?.totalPaid ?? 0) },
            { label: "Outstanding", value: formatINR(summary?.outstanding ?? 0) },
            {
              label: "Next Installment",
              value: summary?.nextInstallment ? formatINR(summary.nextInstallment.amount) : "None due",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Installment Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Fee Head</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Late Fee</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(account?.installments ?? []).map((installment) => (
                  <tr key={installment.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{installment.feeHeadName}</td>
                    <td className="px-6 py-4 text-slate-600">{installment.dueDate}</td>
                    <td className="px-6 py-4 text-slate-900">{formatINR(installment.amount)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatINR(installment.lateFeeApplied)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${feeStatusBadge(installment.status)}`}>
                        {installment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!feeAccountQuery.isLoading && (account?.installments.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No fee installments found for this student.
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

function feeStatusBadge(status: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700";
  if (status === "overdue") return "bg-rose-50 text-rose-700";
  if (status === "partial") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
