import { PortalLayout } from "../components/PortalLayout.js";

export function CommunicationPage(): React.JSX.Element {
  return (
    <PortalLayout
      portal="admin"
      title="Communication"
      subtitle="Announcements, targeted broadcasts, and parent-facing messaging workflows."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Broadcast Center</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "School-wide announcements with acknowledgement tracking",
              "Target by grade, section, or individual student group",
              "Emergency alerts for urgent operational communication",
              "Message templates for absence, praise, and concern follow-ups",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Teacher ↔ Parent Threads</h2>
          <div className="mt-5 space-y-3">
            {[
              "One thread per teacher-parent pair per student",
              "Unread counters and last-message preview",
              "Circular acknowledgement logs",
              "Future socket-based real-time delivery",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
