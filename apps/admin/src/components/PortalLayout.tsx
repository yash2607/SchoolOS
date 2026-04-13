import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePortalStudent } from "../hooks/usePortalStudent.js";
import {
  getAccessiblePortals,
  portalMeta,
  type PortalVariant,
} from "../lib/portal.js";
import { useAuthStore } from "../store/authStore.js";

interface PortalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  portal: PortalVariant;
}

function PortalSwitcher({ portal }: { portal: PortalVariant }) {
  const user = useAuthStore((state) => state.user);
  const portals = getAccessiblePortals(user?.role);

  return (
    <div className="flex flex-wrap gap-2">
      {portals.map((item) => {
        const active = item === portal;
        return (
          <Link
            key={item}
            to={portalMeta[item].nav[0]?.path ?? "/"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {portalMeta[item].label}
          </Link>
        );
      })}
    </div>
  );
}

export function PortalLayout({
  children,
  title,
  subtitle,
  portal,
}: PortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { activeStudent, activeStudentId, options, setActiveStudentId, sourceLabel } =
    usePortalStudent(portal);
  const [open, setOpen] = useState(false);

  const meta = portalMeta[portal];
  const initials =
    user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "SO";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const childPicker =
    portal !== "admin" ? (
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {sourceLabel}
        </p>
        <select
          value={activeStudentId ?? ""}
          onChange={(event) => setActiveStudentId(event.target.value || null)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
        >
          {options.length === 0 ? (
            <option value="">No student available</option>
          ) : (
            options.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))
          )}
        </select>
        {activeStudent && (
          <p className="mt-2 text-xs text-white/70">
            {activeStudent.admissionNo}
            {activeStudent.gradeName ? ` | ${activeStudent.gradeName}` : ""}
            {activeStudent.sectionName ? ` | ${activeStudent.sectionName}` : ""}
          </p>
        )}
      </div>
    ) : null;

  const sidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black text-white">
          S
        </div>
        <div>
          <div className="text-sm font-semibold text-white">SchoolOS</div>
          <div className="text-[11px] text-white/60">{meta.label}</div>
        </div>
      </div>

      {user?.schoolName && (
        <div className="border-b border-white/10 px-5 py-3 text-xs text-white/70">
          {user.schoolName}
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {meta.nav.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-white/16 font-semibold text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[11px] font-semibold">
                {item.short}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-white/10 px-4 py-4">
        {childPicker}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {user?.name ?? "School User"}
            </div>
            <div className="truncate text-[11px] text-white/60">
              {user?.role?.replace(/_/g, " ")}
            </div>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-100"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col shadow-2xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: meta.background }}
      >
        {sidebar}
      </aside>

      <aside
        className="hidden w-72 flex-shrink-0 flex-col lg:flex"
        style={{ background: meta.background }}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setOpen(true)}
                className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 lg:hidden"
              >
                Menu
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
              </div>
            </div>

            <div className="ml-auto flex min-w-[220px] flex-col items-end gap-3">
              <PortalSwitcher portal={portal} />
              {portal !== "admin" && activeStudent && (
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {activeStudent.fullName}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
