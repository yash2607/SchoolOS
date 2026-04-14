import { PortalLayout } from "../components/PortalLayout.js";

const collectionMetrics = [
  {
    label: "Collected This Month",
    value: "INR 12.8L",
    trend: "+14.2%",
    tone: "emerald",
    detail: "Healthy collection pace across tuition and transport",
  },
  {
    label: "Outstanding Balance",
    value: "INR 3.1L",
    trend: "-6.5%",
    tone: "amber",
    detail: "42 families still require follow-up before the due window closes",
  },
  {
    label: "Offline Entries",
    value: "19",
    trend: "+4",
    tone: "indigo",
    detail: "Cash or manual bank receipts pending reconciliation",
  },
];

const transactions = [
  {
    id: "TXN-24014",
    family: "Sharma Family",
    student: "Aanya Sharma",
    type: "Tuition",
    amount: "INR 24,000",
    mode: "UPI",
    status: "Completed",
    time: "Today, 10:42 AM",
  },
  {
    id: "TXN-24013",
    family: "Khan Family",
    student: "Arhaan Khan",
    type: "Transport",
    amount: "INR 4,500",
    mode: "Cash",
    status: "Pending",
    time: "Today, 09:18 AM",
  },
  {
    id: "TXN-24012",
    family: "Reddy Family",
    student: "Mira Reddy",
    type: "Lab & Activity",
    amount: "INR 6,800",
    mode: "Bank Transfer",
    status: "Completed",
    time: "Yesterday",
  },
  {
    id: "TXN-24011",
    family: "Patel Family",
    student: "Vivaan Patel",
    type: "Tuition",
    amount: "INR 24,000",
    mode: "NetBanking",
    status: "Failed",
    time: "Yesterday",
  },
];

const paymentMix = [
  { label: "Online Gateway", percentage: 62, amount: "INR 7.9L", color: "bg-indigo-500" },
  { label: "Bank Transfer", percentage: 24, amount: "INR 3.0L", color: "bg-cyan-500" },
  { label: "Cash Desk", percentage: 14, amount: "INR 1.8L", color: "bg-emerald-500" },
];

const playbook = [
  "Fee structure and instalment editing should connect next to finance service mutations.",
  "School-wide overdue automation can reuse the new communication hub patterns.",
  "Ledger drill-downs and printable receipts are UI-ready and just need backend responses.",
];

export function FinancePage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Finance"
      subtitle="Premium finance operations UI based on the imported SchoolOS frontend, ready for collections, ledgers, and payment workflow wiring."
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                Financial Management
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Collections, ledgers, and school cashflow at a glance
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                This page now follows the polished imported SchoolOS finance dashboard.
                The visual system is live; the next backend step is connecting admin fee
                analytics and transaction feeds from the finance service.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Export Ledger
              </button>
              <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
                Generate Invoice
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {collectionMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(34,41,87,0.10)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    {metric.value}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    metric.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : metric.tone === "amber"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {metric.trend}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{metric.detail}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Recent Transactions</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Styled from the imported finance screen and ready to accept live admin feeds.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    {[
                      "Transaction",
                      "Family",
                      "Student",
                      "Amount",
                      "Mode",
                      "Status",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="bg-white transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{txn.id}</div>
                        <div className="mt-1 text-xs text-slate-500">{txn.time}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{txn.family}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{txn.student}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{txn.amount}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{txn.mode}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            txn.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : txn.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <h3 className="text-lg font-semibold text-slate-950">Payment Mix</h3>
              <div className="mt-6 space-y-5">
                {paymentMix.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      <span className="text-xs font-bold text-slate-500">{item.amount}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {item.percentage}% share
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-6 shadow-[0_24px_80px_rgba(34,41,87,0.10)]">
              <h3 className="text-lg font-semibold text-slate-950">Next Integration Pass</h3>
              <div className="mt-5 space-y-3">
                {playbook.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600"
                  >
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