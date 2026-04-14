import { PortalLayout } from "../components/PortalLayout.js";
import { useAuthStore } from "../store/authStore.js";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const attendanceTrend = [
  { day: "Mon", pct: 84 },
  { day: "Tue", pct: 70 },
  { day: "Wed", pct: 92 },
  { day: "Thu", pct: 88 },
  { day: "Fri", pct: 94 },
  { day: "Sat", pct: 75 },
  { day: "Sun", pct: 82 },
  { day: "Mon", pct: 90 },
  { day: "Tue", pct: 95 },
  { day: "Wed", pct: 79 },
  { day: "Thu", pct: 83 },
  { day: "Today", pct: 89 },
];

const kpis = [
  {
    label: "Total Students",
    value: "1,240",
    helper: "v.s. 1,211 last month",
    icon: "ST",
    tone: "#eef2ff",
    trend: "+2.4%",
    trendColor: "#10b981",
  },
  {
    label: "Attendance Today",
    value: "94.2%",
    helper: "v.s. 93.4% average",
    icon: "AT",
    tone: "#ecfdf5",
    trend: "+0.8%",
    trendColor: "#10b981",
  },
  {
    label: "Fees Collected",
    value: "Rs 84,200",
    helper: "Target: Rs 90,000",
    icon: "FE",
    tone: "#eff6ff",
    trend: "+5.1%",
    trendColor: "#10b981",
  },
  {
    label: "Pending Fees",
    value: "Rs 12,500",
    helper: "12 overdue reminders",
    icon: "PD",
    tone: "#fff1f2",
    trend: "-1.2%",
    trendColor: "#e11d48",
  },
];

const activity = [
  {
    title: "New Admission",
    detail: "Sarah Jenkins · Grade 9 - Applied Sciences",
    time: "14 minutes ago",
    icon: "AD",
    tone: "#eef2ff",
  },
  {
    title: "Fees Paid",
    detail: "Grade 4 - Section B · Quarterly exam invoice",
    time: "2 hours ago",
    icon: "FE",
    tone: "#ecfdf5",
  },
  {
    title: "Announcement Sent",
    detail: "Parent-Teacher Meeting scheduled",
    time: "5 hours ago",
    icon: "AN",
    tone: "#eff6ff",
  },
  {
    title: "Timetable Updated",
    detail: "Section C - Mathematics Slot",
    time: "Yesterday",
    icon: "TT",
    tone: "#f3f4f6",
  },
];

const quickActions = [
  {
    title: "Add Student",
    caption: "Register new admissions",
    icon: "ST",
  },
  {
    title: "Send Announcement",
    caption: "Notify parents and staff",
    icon: "AN",
  },
  {
    title: "Mark Attendance",
    caption: "Manual registry entry",
    icon: "AT",
  },
];

const alerts = [
  {
    title: "Low Attendance Alert",
    detail: "5 students in Grade 11 have fallen below the 75% threshold this week.",
    bg: "#fff1f2",
    color: "#be123c",
  },
  {
    title: "Pending Reminders",
    detail: "12 pending fee reminders are waiting for approval before dispatch.",
    bg: "#fff7ed",
    color: "#c2410c",
  },
];

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuthStore();

  return (
    <PortalLayout
      portal="admin"
      title="Dashboard Overview"
      subtitle="Welcome back. Here is what is happening across your school today."
    >
      <section className="erp-kpi-grid mb-6">
        {kpis.map((item) => (
          <article key={item.label} className="erp-kpi-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-extrabold text-[#3525cd]"
                style={{ background: item.tone }}
              >
                {item.icon}
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: `${item.trendColor}12`,
                  color: item.trendColor,
                }}
              >
                {item.trend}
              </span>
            </div>
            <div className="erp-kpi-card__eyebrow">{item.label}</div>
            <div className="erp-kpi-card__value">{item.value}</div>
            <div className="erp-kpi-card__helper">{item.helper}</div>
          </article>
        ))}
      </section>

      <section className="erp-panel-grid mb-6">
        <article className="erp-panel">
          <div className="erp-panel__header">
            <div>
              <h3>Attendance Trends</h3>
              <p className="mt-2 text-sm text-[#667085]">
                Daily student presence over the last 14 days
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-2xl bg-[#eef2f7] px-4 py-2 text-xs font-semibold text-[#64748b]">
                Weekly
              </button>
              <button className="rounded-2xl bg-[#3525cd] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(53,37,205,0.18)]">
                Monthly
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <XAxis
                  axisLine={false}
                  dataKey="day"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: "rgba(79, 70, 229, 0.05)" }}
                  formatter={(value: number) => [`${value}%`, "Attendance"]}
                  contentStyle={{
                    border: "0",
                    borderRadius: 18,
                    boxShadow: "0 12px 40px -12px rgba(25, 28, 29, 0.08)",
                    background: "rgba(255,255,255,0.96)",
                  }}
                />
                <Bar dataKey="pct" fill="#cfd7fb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <aside className="erp-highlight-list">
          <div className="flex items-center justify-between gap-3">
            <h3>Recent Activity</h3>
            <button className="text-sm font-bold text-[#3525cd]">View All</button>
          </div>
          <ul>
            {activity.map((item) => (
              <li key={item.title}>
                <div
                  className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-sm font-extrabold"
                  style={{ background: item.tone, color: "#3525cd" }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-[#191c1d]">{item.title}</div>
                  <div className="mt-1 text-sm text-[#667085]">{item.detail}</div>
                  <div className="mt-2 text-xs text-[#94a3b8]">{item.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h3 className="mb-4 text-[1.55rem] font-extrabold tracking-[-0.03em] text-[#191c1d]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {quickActions.map((item) => (
              <button
                key={item.title}
                className="rounded-[24px] bg-white p-6 text-left shadow-[inset_0_0_0_1px_rgba(119,117,135,0.08),0_12px_40px_-12px_rgba(25,28,29,0.08)] transition hover:-translate-y-0.5"
                type="button"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef2ff] text-sm font-extrabold text-[#3525cd]">
                  {item.icon}
                </div>
                <div className="mt-6 text-lg font-bold text-[#191c1d]">{item.title}</div>
                <div className="mt-2 text-sm text-[#94a3b8]">{item.caption}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[1.55rem] font-extrabold tracking-[-0.03em] text-[#191c1d]">
            Urgent Alerts
          </h3>
          <div className="space-y-4">
            {alerts.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] p-5 shadow-[inset_0_0_0_1px_rgba(119,117,135,0.08)]"
                style={{ background: item.bg }}
              >
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  {item.title}
                </div>
                <div className="mt-2 text-sm leading-6" style={{ color: item.color }}>
                  {item.detail}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {user && (
        <p className="mt-6 text-right text-xs text-[#94a3b8]">
          Logged in as <span className="font-semibold text-[#4b5563]">{user.name}</span> · {user.role.replace(/_/g, " ")}
        </p>
      )}
    </PortalLayout>
  );
}
