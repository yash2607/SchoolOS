import { Layout } from "../components/Layout.js";

export function AcademicsPage(): React.JSX.Element {
  return (
    <Layout title="Academics">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-50 mb-5">
          <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">Academics & Grades</h2>
        <p className="text-sm text-[#4A4A6A] text-center max-w-sm">
          Manage gradebooks, assessments, report cards, and academic performance tracking. Coming in Phase 2.
        </p>
        <span className="mt-4 inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">Coming Soon</span>
      </div>
    </Layout>
  );
}
