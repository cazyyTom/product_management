/**
 * AuthLayout.jsx
 * Split-screen shell shared by all auth pages.
 * Left: decorative brand panel  |  Right: form content
 */
import { Link } from "react-router-dom";

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left decorative panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 p-12 text-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">PBM Basecamp</span>
        </Link>

        {/* Hero text */}
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Manage projects.<br />Ship faster.<br />Work smarter.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            A unified workspace for teams to track tasks, collaborate on notes,
            and stay aligned on every project — all in one place.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              "Role-based access control",
              "Kanban task boards with subtasks",
              "Project notes & documentation",
              "Real-time status tracking",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/80">
                <svg className="h-5 w-5 text-brand-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/40">© {new Date().getFullYear()} PBM Basecamp</p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">PBM Basecamp</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
