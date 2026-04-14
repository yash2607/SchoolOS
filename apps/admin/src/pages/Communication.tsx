import { useConversations } from "@schoolos/api";
import { PortalLayout } from "../components/PortalLayout.js";

const announcements = [
  {
    title: "Parent-Teacher Summit",
    audience: "All parents",
    status: "Sent",
    time: "2 hours ago",
    content:
      "Friday's academic review meetings are now open for slot booking through the parent portal.",
  },
  {
    title: "Transport Route Update",
    audience: "Route 3 & 4 families",
    status: "Scheduled",
    time: "Tomorrow, 7:15 AM",
    content:
      "Morning pickup timings have shifted by 10 minutes due to road repair work near the east gate.",
  },
  {
    title: "Midterm Results Published",
    audience: "Grades 8-12",
    status: "Sent",
    time: "Yesterday",
    content:
      "Parents and students can now review term marks, teacher notes, and improvement tasks.",
  },
];

const composerShortcuts = [
  "School-wide updates",
  "Fee follow-up nudges",
  "Absence intervention message",
  "Recognition and praise template",
];

function formatRelative(value: string | null): string {
  if (!value) return "No recent activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunicationPage(): React.JSX.Element {
  const threadsQuery = useConversations();
  const threads = threadsQuery.data ?? [];

  return (
    <PortalLayout
      portal="admin"
      title="Communication"
      subtitle="Imported SchoolOS communication design, upgraded with live thread visibility from the existing backend."
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-700">
                Communication Hub
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Broadcast announcements and monitor live parent threads
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                The layout now matches the imported frontend. Announcements are presented in
                the premium SchoolOS style, while the thread rail below is already connected
                to the live messaging backend.
              </p>
            </div>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
              New Announcement
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_420px]">
          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-semibold text-slate-950">Recent Announcements</h3>
              <p className="mt-1 text-sm text-slate-500">
                Premium visual treatment from the imported SchoolOS communication center.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {announcements.map((item) => (
                <article key={item.title} className="px-6 py-6 transition hover:bg-slate-50/70">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                            item.status === "Sent"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {item.audience}
                        </span>
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h4>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{item.content}</p>
                    </div>
                    <div className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {item.time}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <h3 className="text-lg font-semibold text-slate-950">Quick Composer</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Recipient Group
                  </label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white">
                    <option>All Parents</option>
                    <option>All Teachers</option>
                    <option>Grade 10 Families</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Message Draft
                  </label>
                  <textarea
                    className="min-h-[140px] w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                    placeholder="Compose an announcement, reminder, or follow-up message..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {composerShortcuts.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500">
                  Send Message
                </button>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-950">Live Threads</h3>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {threads.length} active
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {threadsQuery.isLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Loading conversation threads...
                  </div>
                )}
                {!threadsQuery.isLoading && !threads.length && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No message threads yet. Once parents and teachers start messaging, they will appear here.
                  </div>
                )}
                {threads.slice(0, 6).map((thread) => (
                  <div
                    key={thread.id}
                    className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {thread.parentName ?? "Parent"} and {thread.teacherName ?? "Teacher"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {thread.studentName ?? "Student thread"}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                        {thread.unreadCount} unread
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {thread.lastMessage?.content ?? "Conversation created and ready for messages."}
                    </p>
                    <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {formatRelative(thread.lastMessageAt ?? thread.updatedAt)}
                    </div>
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