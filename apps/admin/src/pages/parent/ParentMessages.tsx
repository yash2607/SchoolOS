import { useConversations } from "@schoolos/api";
import { relativeTime } from "@schoolos/utils";
import { PortalLayout } from "../../components/PortalLayout.js";
import { usePortalStudent } from "../../hooks/usePortalStudent.js";

export function ParentMessagesPage(): React.JSX.Element {
  const { activeStudentId } = usePortalStudent("parent");
  const conversationsQuery = useConversations();
  const threads =
    conversationsQuery.data?.filter((thread) => thread.studentId === activeStudentId) ?? [];

  return (
    <PortalLayout
      portal="parent"
      title="Messages"
      subtitle="Teacher-parent communication threads scoped to the active student."
    >
      <div className="space-y-4">
        {threads.map((thread) => (
          <article key={thread.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {thread.teacherName ?? "Teacher conversation"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {thread.studentName ? `Regarding ${thread.studentName}` : "Direct class communication"}
                </p>
              </div>
              {thread.unreadCount > 0 && (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {thread.unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {thread.lastMessage?.content ?? "No messages yet. The next update from school staff will appear here."}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              {(thread.lastMessage?.sentAt ?? thread.lastMessageAt)
                ? relativeTime(thread.lastMessage?.sentAt ?? thread.lastMessageAt ?? "")
                : "New thread"}
            </p>
          </article>
        ))}

        {!conversationsQuery.isLoading && threads.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
            No teacher conversations have started for this student yet.
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
