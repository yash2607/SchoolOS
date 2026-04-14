import {
  type PaymentRecord,
  type StudentInvoiceRecord,
  useCollectionReport,
  useFeeStructures,
  useOverdueInvoices,
} from "@schoolos/api";
import { PortalLayout } from "../components/PortalLayout.js";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null): string {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
  };
}

export function FinancePage(): React.JSX.Element {
  const { fromDate, toDate } = currentMonthRange();
  const reportQuery = useCollectionReport(fromDate, toDate);
  const overdueQuery = useOverdueInvoices();
  const structuresQuery = useFeeStructures();
  const totalCollected = reportQuery.data?.total ?? 0;
  const overdueAmount =
    overdueQuery.data?.reduce(
      (sum: number, invoice: StudentInvoiceRecord) => sum + Number(invoice.dueAmount),
      0
    ) ?? 0;
  const offlineEntries =
    reportQuery.data?.payments.filter(
      (payment: PaymentRecord) => payment.method !== "online"
    ).length ?? 0;
  const paymentMix = Object.entries(reportQuery.data?.byMethod ?? {}).map(
    ([method, amount]) => ({
      label: method.replace("_", " "),
      amount: Number(amount),
    })
  );
  const playbook = [
    "Collection KPIs and payment history are now backed by the finance service.",
    "Next backend slice: wire invoice generation and fee structure creation from this same screen.",
    "Student and family labels can be enriched once we join student directory data into finance queries.",
  ];

  return (
    <PortalLayout
      portal="admin"
      title="Finance"
      subtitle="Premium finance operations UI based on the imported SchoolOS frontend, now upgraded with live collection and overdue data."
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
                This page now follows the polished imported SchoolOS finance dashboard
                and uses live collection report plus overdue invoice data from the backend.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              Reporting window: {fromDate} to {toDate}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {[
            {
              label: "Collected This Month",
              value: formatCurrency(totalCollected),
              tone: "bg-emerald-50 text-emerald-700",
              detail: "Successful payments captured in the current reporting window.",
            },
            {
              label: "Outstanding Balance",
              value: formatCurrency(overdueAmount),
              tone: "bg-amber-50 text-amber-700",
              detail: `${overdueQuery.data?.length ?? 0} overdue invoices currently need follow-up.`,
            },
            {
              label: "Offline Entries",
              value: String(offlineEntries),
              tone: "bg-indigo-50 text-indigo-700",
              detail: "Cash, cheque, and bank transfer records found in the collection report.",
            },
          ].map((metric) => (
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
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${metric.tone}`}>
                  Live
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
                <h3 className="text-lg font-semibold text-slate-950">Recent Collections</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Live payments from the finance report endpoint.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    {["Payment", "Student ID", "Amount", "Mode", "Status", "Paid At"].map(
                      (label) => (
                        <th
                          key={label}
                          className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400"
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportQuery.isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-sm text-slate-500">
                        Loading collection report...
                      </td>
                    </tr>
                  )}
                  {!reportQuery.isLoading &&
                    (reportQuery.data?.payments ?? []).slice(0, 8).map((payment: PaymentRecord) => (
                      <tr key={payment.id} className="bg-white transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">{payment.id}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Invoice {payment.invoiceId ?? "manual"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{payment.studentId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td className="px-6 py-4 text-sm capitalize text-slate-600">
                          {payment.method.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(payment.paidAt)}
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
                {paymentMix.length === 0 && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No payment mix available yet for this date window.
                  </div>
                )}
                {paymentMix.map((item, index) => {
                  const percentage =
                    totalCollected > 0 ? Math.round((item.amount / totalCollected) * 100) : 0;
                  const tone =
                    index === 0
                      ? "bg-indigo-500"
                      : index === 1
                        ? "bg-cyan-500"
                        : "bg-emerald-500";
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`${tone} h-full rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {percentage}% share
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <h3 className="text-lg font-semibold text-slate-950">Overdue Queue</h3>
              <div className="mt-5 space-y-3">
                {overdueQuery.isLoading && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Loading overdue invoices...
                  </div>
                )}
                {!overdueQuery.isLoading &&
                  (overdueQuery.data ?? []).slice(0, 5).map((invoice: StudentInvoiceRecord) => (
                    <div
                      key={invoice.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                    >
                      <div className="font-semibold text-slate-900">{invoice.studentId}</div>
                      <div className="mt-1">{formatCurrency(Number(invoice.dueAmount))}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        Due {invoice.dueDate}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-6 shadow-[0_24px_80px_rgba(34,41,87,0.10)]">
              <h3 className="text-lg font-semibold text-slate-950">Next Integration Pass</h3>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                  {structuresQuery.data?.length ?? 0} fee structure items are available for the next admin CRUD pass.
                </div>
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
