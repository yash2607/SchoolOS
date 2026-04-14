import { useMemo, useState } from "react";
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
    <div className="portal-switcher">
      {portals.map((item) => {
        const active = item === portal;
        return (
          <Link
            key={item}
            to={portalMeta[item].nav[0]?.path ?? "/"}
            className={`portal-switcher__link${active ? " is-active" : ""}`}
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
  const navAccent = meta.accent;
  const initials =
    user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "SO";
  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const childPicker =
    portal !== "admin" ? (
      <div className="portal-student-card">
        <p className="portal-student-card__label">
          {sourceLabel}
        </p>
        <select
          value={activeStudentId ?? ""}
          onChange={(event) => setActiveStudentId(event.target.value || null)}
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
          <p className="portal-student-card__meta">
            {activeStudent.admissionNo}
            {activeStudent.gradeName ? ` | ${activeStudent.gradeName}` : ""}
            {activeStudent.sectionName ? ` | ${activeStudent.sectionName}` : ""}
          </p>
        )}
      </div>
    ) : null;

  const sidebar = (
    <>
      <div className="portal-sidebar__inner">
        <div className="portal-brand">
          <div className="portal-brand__mark">SO</div>
          <div>
            <div className="portal-brand__eyebrow">School ERP</div>
            <div className="portal-brand__title">SchoolOS</div>
          </div>
        </div>

        {user?.schoolName && (
          <div className="portal-school">
            <div className="portal-school__label">{meta.label}</div>
            <div className="portal-school__name">{user.schoolName}</div>
          </div>
        )}

        <nav className="portal-nav">
          {meta.nav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`portal-nav__link${active ? " is-active" : ""}`}
              >
                <span className="portal-nav__icon">{item.short}</span>
                <span className="portal-nav__label">{item.label}</span>
                <span className="portal-nav__chevron">›</span>
              </Link>
            );
          })}
        </nav>

        <div className="portal-sidebar__footer">
          {childPicker}
          <div className="portal-user-card">
            <div className="portal-user-card__avatar">{initials}</div>
            <div>
              <div className="portal-user-card__name">{user?.name ?? "School User"}</div>
              <div className="portal-user-card__role">
                {user?.role?.replace(/_/g, " ")}
              </div>
            </div>
            <button
              onClick={() => void handleLogout()}
              className="portal-user-card__logout"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="portal-shell">
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="portal-mobile-overlay"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`portal-sidebar portal-sidebar--mobile${open ? " is-open" : ""}`}
        style={{ background: meta.background }}
      >
        {sidebar}
      </aside>

      <aside
        className="portal-sidebar"
        style={{ background: meta.background }}
      >
        {sidebar}
      </aside>

      <div className="portal-main">
        <div className="portal-surface">
          <header className="portal-topbar">
            <div className="portal-heading">
              <button
                onClick={() => setOpen(true)}
                className="portal-topbar__menu"
              >
                Menu
              </button>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="portal-topbar__meta">
              <PortalSwitcher portal={portal} />
              {portal !== "admin" && activeStudent && (
                <div className="portal-topbar__student">
                  {activeStudent.fullName} · {currentDateLabel}
                </div>
              )}
              {portal === "admin" && (
                <div className="portal-topbar__student">
                  Live ERP workspace · {currentDateLabel}
                </div>
              )}
            </div>
          </header>

          <main
            className="portal-content"
            style={{
              ["--portal-accent" as string]: navAccent,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
