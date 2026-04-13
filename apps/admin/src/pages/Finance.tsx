import { PortalLayout } from "../components/PortalLayout.js";

export function FinancePage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Finance"
      subtitle="Fee setup, collections, overdue follow-up, and ledger visibility for MVP schools."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Fee Management Modules</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Fee structure setup by grade and academic year",
              "Installments with due dates and reminder windows",
              "Discounts, scholarships, and manual adjustments",
              "Student ledger with online and offline payment entries",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Collection Dashboard</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Expected This Month", value: "INR 6.8L" },
              { label: "Collected", value: "INR 4.2L" },
              { label: "Overdue Accounts", value: "86" },
              { label: "Offline Entries Pending", value: "12" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
