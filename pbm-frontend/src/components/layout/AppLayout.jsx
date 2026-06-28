/**
 * AppLayout.jsx
 *
 * The authenticated application shell:
 *
 *   ┌────────────┬──────────────────────────────────────┐
 *   │  Sidebar   │  Navbar (sticky top)                  │
 *   │  (240 px)  ├──────────────────────────────────────┤
 *   │            │                                        │
 *   │            │   <Outlet /> — page content            │
 *   │            │                                        │
 *   └────────────┴──────────────────────────────────────┘
 *
 * On mobile the sidebar collapses to a drawer, toggled by the Navbar
 * hamburger button.
 *
 * The page <title> (shown in the Navbar) is set by each page via the
 * usePageTitle hook — see below.
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar }  from "./Navbar";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { title } = usePageTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main column ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          title={title}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
