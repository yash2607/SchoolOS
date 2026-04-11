import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

const NAV = [
  { label: "Dashboard",     path: "/dashboard",     emoji: "📊" },
  { label: "Students",      path: "/students",      emoji: "🎓" },
  { label: "Teachers",      path: "/teachers",      emoji: "👩‍🏫" },
  { label: "Attendance",    path: "/attendance",    emoji: "✅" },
  { label: "Timetable",     path: "/timetable",     emoji: "🗓️" },
  { label: "Academics",     path: "/academics",     emoji: "📚" },
  { label: "Finance",       path: "/finance",       emoji: "💰" },
  { label: "Communication", path: "/communication", emoji: "📢" },
  { label: "Settings",      path: "/settings",      emoji: "⚙️" },
];

export function Layout({ children, title }: { children: React.ReactNode; title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F0F4F8", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.4)" }} />}

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 30,
        width: 240, display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0f1f3d 0%, #1B3A6B 100%)",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        // Always show on large screens via media query workaround using inline:
      }} className="sidebar-panel">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2E7DD1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>S</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>SchoolOS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Admin Portal</div>
          </div>
        </div>

        {/* School name */}
        {user?.schoolName && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              🏫 {user.schoolName}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {NAV.map(({ label, path, emoji }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? "rgba(46,125,209,0.25)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                borderLeft: active ? "3px solid #2E7DD1" : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "#2E7DD1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "Admin"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.role?.replace(/_/g, " ")}</div>
          </div>
          <button onClick={() => void handleLogout()} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 16, padding: 4 }}>↩</button>
        </div>
      </aside>

      {/* Static sidebar for desktop */}
      <aside style={{
        width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0f1f3d 0%, #1B3A6B 100%)",
      }} className="sidebar-desktop">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2E7DD1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>S</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>SchoolOS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Admin Portal</div>
          </div>
        </div>
        {user?.schoolName && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🏫 {user.schoolName}</div>
          </div>
        )}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {NAV.map(({ label, path, emoji }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? "rgba(46,125,209,0.25)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                borderLeft: active ? "3px solid #2E7DD1" : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "#2E7DD1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "Admin"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.role?.replace(/_/g, " ")}</div>
          </div>
          <button onClick={() => void handleLogout()} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 16, padding: 4 }}>↩</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ height: 60, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", background: "#fff", borderBottom: "1px solid #E5E7EB", flexShrink: 0 }}>
          <button onClick={() => setOpen(true)} className="mobile-menu-btn" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B7280", display: "none" }}>☰</button>
          {title && <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h1>}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{user?.name}</div>
            <div style={{ width: 34, height: 34, borderRadius: 999, background: "#1B3A6B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-panel { transform: translateX(0) !important; position: relative !important; }
        }
      `}</style>
    </div>
  );
}
