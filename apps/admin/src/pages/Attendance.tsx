import { Layout } from "../components/Layout.js";

const MOCK_ATTENDANCE = [
  { class: "Grade 10-A", present: 38, absent: 2, late: 0, total: 40 },
  { class: "Grade 10-B", present: 35, absent: 3, late: 2, total: 40 },
  { class: "Grade 9-A", present: 42, absent: 2, late: 1, total: 45 },
  { class: "Grade 9-B", present: 37, absent: 4, late: 2, total: 43 },
  { class: "Grade 8-A", present: 28, absent: 8, late: 2, total: 38 },
  { class: "Grade 7-A", present: 36, absent: 3, late: 1, total: 40 },
];

export function AttendancePage(): React.JSX.Element {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const overall = MOCK_ATTENDANCE.reduce((acc, r) => {
    acc.present += r.present; acc.total += r.total; return acc;
  }, { present: 0, total: 0 });
  const overallPct = Math.round((overall.present / overall.total) * 100);

  return (
    <Layout title="Attendance">
      {/* Summary bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48 rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-[#4A4A6A] mb-1">Overall Today</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">{overallPct}%</p>
          <p className="text-xs text-[#4A4A6A] mt-1">{overall.present}/{overall.total} students</p>
        </div>
        <div className="flex-1 min-w-48 rounded-xl bg-green-50 border border-green-100 shadow-sm p-5">
          <p className="text-xs text-[#4A4A6A] mb-1">Present</p>
          <p className="text-3xl font-bold text-[#1A7A4A]">{overall.present}</p>
        </div>
        <div className="flex-1 min-w-48 rounded-xl bg-red-50 border border-red-100 shadow-sm p-5">
          <p className="text-xs text-[#4A4A6A] mb-1">Absent</p>
          <p className="text-3xl font-bold text-[#B91C1C]">{overall.total - overall.present}</p>
        </div>
        <div className="flex-1 min-w-48 rounded-xl bg-gray-50 border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-[#4A4A6A] mb-1">Date</p>
          <p className="text-sm font-semibold text-[#1A1A2E]">{today}</p>
        </div>
      </div>

      {/* Class-wise */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1A1A2E]">Class-wise Attendance</h3>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#1A7A4A] bg-green-50 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A7A4A] animate-pulse" /> Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-[#4A4A6A]">
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Present</th>
                <th className="px-5 py-3">Absent</th>
                <th className="px-5 py-3">Late</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Rate</th>
                <th className="px-5 py-3 w-40">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_ATTENDANCE.map((row) => {
                const pct = Math.round((row.present / row.total) * 100);
                const isGood = pct >= 90, isOk = pct >= 75;
                const barColor = isGood ? "bg-[#1A7A4A]" : isOk ? "bg-[#D4600A]" : "bg-[#B91C1C]";
                const textColor = isGood ? "text-[#1A7A4A]" : isOk ? "text-[#D4600A]" : "text-[#B91C1C]";
                return (
                  <tr key={row.class} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{row.class}</td>
                    <td className="px-5 py-3.5 text-[#1A7A4A] font-medium">{row.present}</td>
                    <td className="px-5 py-3.5 text-[#B91C1C]">{row.absent}</td>
                    <td className="px-5 py-3.5 text-[#D4600A]">{row.late}</td>
                    <td className="px-5 py-3.5 text-[#4A4A6A]">{row.total}</td>
                    <td className={`px-5 py-3.5 font-bold ${textColor}`}>{pct}%</td>
                    <td className="px-5 py-3.5">
                      <div className="h-2 w-32 rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
