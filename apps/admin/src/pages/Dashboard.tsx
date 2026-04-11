import { Layout } from "../components/Layout.js";
import { useAuthStore } from "../store/authStore.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const attendanceTrend = [
  { day: "Mon", pct: 91 },
  { day: "Tue", pct: 88 },
  { day: "Wed", pct: 94 },
  { day: "Thu", pct: 90 },
  { day: "Fri", pct: 92 },
];

const gradeAttendance = [
  { class: "Grade 10-A", present: 38, total: 40 },
  { class: "Grade 10-B", present: 35, total: 40 },
  { class: "Grade 9-A", present: 42, total: 45 },
  { class: "Grade 8-A", present: 28, total: 38 },
  { class: "Grade 7-A", present: 36, total: 40 },
];

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuthStore();

  return (
    <Layout title="Executive Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          { label: "Today's Attendance", value: "92%", change: "+2% vs last week", changeColor: "text-[#1A7A4A]", bg: "bg-green-50", iconBg: "bg-green-100",
            icon: <svg className="h-5 w-5 text-[#1A7A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
          { label: "Fee Collection (Month)", value: "₹4.2L", change: "+12% vs last month", changeColor: "text-[#2E7DD1]", bg: "bg-blue-50", iconBg: "bg-blue-100",
            icon: <svg className="h-5 w-5 text-[#2E7DD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Active Students", value: "1,248", change: "Enrolled this year", changeColor: "text-[#4A4A6A]", bg: "bg-gray-50", iconBg: "bg-gray-100",
            icon: <svg className="h-5 w-5 text-[#4A4A6A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
          { label: "Pending Leaves", value: "7", change: "Awaiting approval", changeColor: "text-[#D4600A]", bg: "bg-orange-50", iconBg: "bg-orange-100",
            icon: <svg className="h-5 w-5 text-[#D4600A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        ].map(({ label, value, change, changeColor, bg, iconBg, icon }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-white shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-[#4A4A6A]">{label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
            <p className={`mt-1 text-xs ${changeColor}`}>{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Attendance chart */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="mb-4 font-semibold text-[#1A1A2E]">Attendance Trend (This Week)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceTrend} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4A4A6A" }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: "#4A4A6A" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "Attendance"]} />
              <Bar dataKey="pct" fill="#2E7DD1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="mb-4 font-semibold text-[#1A1A2E]">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Generate Report Cards", icon: "📄" },
              { label: "Send Announcement", icon: "📢" },
              { label: "Fee Overdue List", icon: "💰" },
              { label: "Emergency Alert", icon: "🚨", danger: true },
            ].map(({ label, icon, danger }) => (
              <button key={label}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-left transition ${
                  danger ? "bg-red-50 text-[#B91C1C] hover:bg-red-100" : "bg-gray-50 text-[#1A1A2E] hover:bg-gray-100"
                }`}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Attendance by class */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1A1A2E]">Live Attendance by Class</h3>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#1A7A4A] bg-green-50 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A7A4A] animate-pulse" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {gradeAttendance.map(({ class: cls, present, total }) => {
            const pct = Math.round((present / total) * 100);
            const isGood = pct >= 90, isOk = pct >= 75;
            return (
              <div key={cls} className={`rounded-xl border p-4 text-center ${isGood ? "bg-green-50 border-green-200" : isOk ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
                <p className="text-xs font-medium text-[#4A4A6A] mb-2">{cls}</p>
                <p className={`text-2xl font-bold ${isGood ? "text-[#1A7A4A]" : isOk ? "text-[#D4600A]" : "text-[#B91C1C]"}`}>{pct}%</p>
                <p className="text-xs text-[#4A4A6A] mt-1">{present}/{total} present</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Welcome message if new */}
      {user && (
        <p className="mt-4 text-xs text-[#4A4A6A] text-right">
          Logged in as <span className="font-medium">{user.name}</span> · {user.role.replace(/_/g, " ")}
        </p>
      )}
    </Layout>
  );
}
