export function DashboardPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="flex h-screen">
        <aside className="w-64 bg-primary text-white flex flex-col">
          <div className="p-6 border-b border-blue-800">
            <h1 className="text-xl font-bold">SchoolOS</h1>
            <p className="text-blue-300 text-sm">Admin Portal</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { label: "Dashboard", icon: "📊", active: true },
              { label: "Students", icon: "👤" },
              { label: "Teachers", icon: "🧑‍🏫" },
              { label: "Timetable", icon: "🗓️" },
              { label: "Academics", icon: "📚" },
              { label: "Attendance", icon: "✅" },
              { label: "Finance", icon: "💰" },
              { label: "Communication", icon: "📢" },
              { label: "Settings", icon: "⚙️" },
            ].map(({ label, icon, active }) => (
              <button
                key={label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-accent text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Executive Dashboard</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Demo School</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
            </div>
          </header>

          <div className="p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Today's Attendance", value: "92%", change: "+2%", color: "text-success", bg: "bg-green-50" },
                { label: "Fee Collection (Month)", value: "₹4.2L", change: "+12%", color: "text-accent", bg: "bg-blue-50" },
                { label: "Active Students", value: "1,248", change: "", color: "text-text-primary", bg: "bg-gray-50" },
                { label: "Pending Leaves", value: "7", change: "", color: "text-warning", bg: "bg-orange-50" },
              ].map(({ label, value, change, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
                  <p className="text-sm text-text-secondary font-medium mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  {change && <p className="text-xs text-success mt-1">{change} vs last week</p>}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-text-primary mb-3">Quick Actions</h3>
              <div className="flex gap-3">
                {["Generate Report Cards", "Send Announcement", "View Fee Overdue List", "Emergency Alert"].map((action, i) => (
                  <button
                    key={action}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      i === 3
                        ? "bg-error text-white border-transparent hover:bg-red-700"
                        : "border-gray-200 text-text-primary hover:bg-gray-50"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Attendance */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-text-primary">Live Attendance</h3>
                <span className="text-xs text-success bg-green-50 px-2 py-1 rounded-full">● Live</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { class: "Grade 10-A", present: 38, total: 40 },
                  { class: "Grade 10-B", present: 35, total: 40 },
                  { class: "Grade 9-A", present: 42, total: 45 },
                  { class: "Grade 8-A", present: 28, total: 38 },
                  { class: "Grade 7-A", present: 36, total: 40 },
                ].map(({ class: cls, present, total }) => {
                  const pct = Math.round((present / total) * 100);
                  const color = pct >= 90 ? "bg-green-100 border-green-200" : pct >= 75 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
                  const textColor = pct >= 90 ? "text-success" : pct >= 75 ? "text-warning" : "text-error";
                  return (
                    <div key={cls} className={`${color} border rounded-lg p-3 text-center`}>
                      <p className="text-xs font-medium text-text-primary mb-1">{cls}</p>
                      <p className={`text-lg font-bold ${textColor}`}>{pct}%</p>
                      <p className="text-xs text-text-secondary">{present}/{total}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
