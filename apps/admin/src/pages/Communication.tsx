import { Layout } from "../components/Layout.js";

export function CommunicationPage(): React.JSX.Element {
  return (
    <Layout title="Communication">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 mb-5">
          <svg className="h-10 w-10 text-[#D4600A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">Communication</h2>
        <p className="text-sm text-[#4A4A6A] text-center max-w-sm">
          Send announcements to parents and students, manage messaging threads, and broadcast emergency alerts. Coming in Phase 2.
        </p>
        <span className="mt-4 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#D4600A]">Coming Soon</span>
      </div>
    </Layout>
  );
}
