import { Layout } from "../components/Layout.js";

export function TimetablePage(): React.JSX.Element {
  return (
    <Layout title="Timetable">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 mb-5">
          <svg className="h-10 w-10 text-[#2E7DD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">Timetable Management</h2>
        <p className="text-sm text-[#4A4A6A] text-center max-w-sm">
          Create and manage class schedules, period assignments, and teacher timetables. Coming in Phase 2.
        </p>
        <span className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2E7DD1]">Coming Soon</span>
      </div>
    </Layout>
  );
}
