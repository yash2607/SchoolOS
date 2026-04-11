import { Layout } from "../components/Layout.js";

export function FinancePage(): React.JSX.Element {
  return (
    <Layout title="Finance">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 mb-5">
          <svg className="h-10 w-10 text-[#1A7A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">Finance & Fee Management</h2>
        <p className="text-sm text-[#4A4A6A] text-center max-w-sm">
          Track fee collections, manage installments, send payment reminders, and generate financial reports. Coming in Phase 2.
        </p>
        <span className="mt-4 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-[#1A7A4A]">Coming Soon</span>
      </div>
    </Layout>
  );
}
