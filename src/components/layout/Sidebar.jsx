/**
 * Sidebar.jsx
 *
 * Collapsible left navigation panel.
 * - Desktop: always visible (240 px wide)
 * - Mobile: slides in as a drawer over the main content
 *
 * Props:
 *  open      boolean  – mobile open state (controlled by AppLayout)
 *  onClose   fn       – close callback for mobile overlay click
 */

import { NavLink, useParams, useMatch } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ─── Nav item definitions ─────────────────────────────────────────────────────
const mainNav = [
  {
    label: "Dashboard",
    to: "/projects",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "System Status",
    to: "/status",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ─── Active link style helper ─────────────────────────────────────────────────
const linkCls = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  ].join(" ");

// ─── Component ────────────────────────────────────────────────────────────────
// Project-level sub-nav items (shown when inside a project route)
function ProjectSubNav({ projectId, onClose }) {
  const subItems = [
    {
      label: "Overview",
      to: `/projects/${projectId}`,
      end: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Tasks",
      to: `/projects/${projectId}/tasks`,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Notes",
      to: `/projects/${projectId}/notes`,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-2 mb-1">
      <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        This project
      </p>
      {subItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkCls}
          onClick={onClose}
        >
          <span className="shrink-0 text-current opacity-70">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const { projectId } = useParams();
  // Detect if we're inside a project sub-route
  const inProject = useMatch("/projects/:projectId/*");

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          // Base
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-white border-r border-gray-200 transition-transform duration-300",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0 lg:static lg:z-auto",
        ].join(" ")}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">PBM Basecamp</span>
        </div>

        {/* ── Main navigation ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Menu
          </p>
          {mainNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkCls} onClick={onClose} end={item.to === "/projects"}>
              <span className="shrink-0 text-current opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Project-scoped sub navigation */}
          {inProject && projectId && (
            <ProjectSubNav projectId={projectId} onClose={onClose} />
          )}
        </nav>

        {/* ── User card ─────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-100 px-3 py-3">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.username ?? "—"}
              </p>
              <p className="truncate text-xs text-gray-400">{user?.email ?? ""}</p>
            </div>
            {/* Settings icon */}
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
