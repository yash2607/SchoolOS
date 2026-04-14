import { useMemo, useState } from "react";
import {
  useAnnouncements,
  useConversations,
  useCreateAnnouncement,
} from "@schoolos/api";
import { PortalLayout } from "../components/PortalLayout.js";

const composerShortcuts = [
  "School-wide updates",
  "Fee follow-up nudges",
  "Absence intervention message",
  "Recognition and praise template",
];

const targetOptions = [
  { label: "All School", value: "school" },
  { label: "Grade Group", value: "grade" },
  { label: "Section", value: "section" },
  { label: "Individual", value: "individual" },
] as const;

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

function announcementStatus(item: {
  scheduledAt: string | null;
  sentAt: string | null;
}): "Scheduled" | "Sent" {
  return item.sentAt ? "Sent" : "Scheduled";
}

function audienceLabel(item: {
  targetType: "school" | "section" | "grade" | "individual";
  targetIds: string[];
}): string {
  const count = item.targetIds.length;
  if (item.targetType === "school") return "Whole school";
  if (count === 0) return item.targetType;
  return `${item.targetType} • ${count} target${count === 1 ? "" : "s"}`;
}

export function CommunicationPage(): React.JSX.Element {
  const [form, setForm] = useState({
    title: "",
    body: "",
    targetType: "school" as const,
    isPinned: false,
    isEmergency: false,
  });
  const threadsQuery = useConversations();
  const announcementsQuery = useAnnouncements({ page: 1, limit: 10 });
  const createAnnouncement = useCreateAnnouncement();
  const threads = threadsQuery.data ?? [];
  const announcements = announcementsQuery.data?.announcements ?? [];
  const submitDisabled = !form.title.trim() || !form.body.trim() || createAnnouncement.isPending;

  const statusMessage = useMemo(() => {
    if (createAnnouncement.isSuccess) {
      return "Announcement created successfully and pushed into the live list.";
    }
    if (createAnnouncement.isError) {
      return "Announcement creation failed. Please verify your session and backend config.";
    }
    return null;
  }, [createAnnouncement.isError, createAnnouncement.isSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createAnnouncement.mutateAsync({
      title: form.title.trim(),
      body: form.body.trim(),
      targetType: form.targetType,
      isPinned: form.isPinned,
      isEmergency: form.isEmergency,
    });
    setForm({
      title: "",
      body: "",
      targetType: "school",
      isPinned: false,
      isEmergency: false,
    });
  };

  return (
    <PortalLayout
      portal="admin"
      title="Communication"
      subtitle="Imported SchoolOS communication design, now upgraded with live announcement creation and live thread visibility from the existing backend."
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
                The layout now matches the imported frontend. This page is also the first
                fully wired admin module in the new UI pass: announcements are live and the
                thread rail is backed by the existing communication service.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              {announcements.length} live announcement{announcements.length === 1 ? "" : "s"}
            </div>
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
              {announcementsQuery.isLoading && (
                <div className="px-6 py-10 text-sm text-slate-500">Loading announcements...</div>
              )}
              {!announcementsQuery.isLoading && !announcements.length && (
                <div className="px-6 py-10 text-sm text-slate-500">
                  No announcements have been sent yet. Use the composer to publish the first one.
                </div>
              )}
              {announcements.map((item) => {
                const status = announcementStatus(item);
                return (
                  <article key={item.id} className="px-6 py-6 transition hover:bg-slate-50/70">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                              status === "Sent"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {status}
                          </span>
                          {item.isPinned && (
                            <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700">
                              Pinned
                            </span>
                          )}
                          {item.isEmergency && (
                            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-700">
                              Emergency
                            </span>
                          )}
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            {audienceLabel(item)}
                          </span>
                        </div>
                        <h4 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h4>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{item.body}</p>
                      </div>
                      <div className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {formatRelative(item.sentAt ?? item.scheduledAt ?? item.createdAt)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,41,87,0.12)]">
              <h3 className="text-lg font-semibold text-slate-950">Quick Composer</h3>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Announcement Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                    placeholder="e.g. Parent orientation rescheduled"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Recipient Group
                  </label>
                  <select
                    value={form.targetType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        targetType: event.target.value as typeof current.targetType,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                  >
                    {targetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Message Draft
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, body: event.target.value }))
                    }
                    className="min-h-[140px] w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                    placeholder="Compose an announcement, reminder, or follow-up message..."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isPinned: event.target.checked }))
                      }
                    />
                    Pin announcement
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isEmergency}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isEmergency: event.target.checked }))
                      }
                    />
                    Emergency flag
                  </label>
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
                {statusMessage && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      createAnnouncement.isError
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createAnnouncement.isPending ? "Publishing..." : "Publish Announcement"}
                </button>
              </form>
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