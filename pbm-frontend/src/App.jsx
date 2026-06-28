/**
 * App.jsx
 *
 * Full router tree wired with:
 *  - AuthProvider  (authentication state)
 *  - PageTitleProvider (Navbar title)
 *  - Public routes  (/login, /register, etc.)
 *  - Protected routes  (/<appLayout>/...)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }      from "@/context/AuthContext";
import { PageTitleProvider } from "@/hooks/usePageTitle";

// ── Layout guards ──────────────────────────────────────────────────────────
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout }      from "@/components/layout/AppLayout";

// ── Auth pages (public) ────────────────────────────────────────────────────
import LoginPage          from "@/pages/auth/LoginPage";
import RegisterPage       from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage  from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage    from "@/pages/auth/VerifyEmailPage";
import ProfilePage        from "@/pages/auth/ProfilePage";

// ── App pages (protected) ─────────────────────────────────────────────────
import ProjectsPage      from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import TasksPage         from "@/pages/tasks/TasksPage";
import NotesPage         from "@/pages/notes/NotesPage";
import StatusPage        from "@/pages/status/StatusPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageTitleProvider>
          <Routes>
            {/* ── Public / auth routes ─────────────────────────────── */}
            <Route path="/login"                           element={<LoginPage />} />
            <Route path="/register"                        element={<RegisterPage />} />
            <Route path="/forgot-password"                 element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:resetToken"      element={<ResetPasswordPage />} />
            <Route path="/verify-email/:verificationToken" element={<VerifyEmailPage />} />

            {/* ── Protected routes (require auth) ──────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Dashboard / projects */}
                <Route path="/projects"           element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

                {/* Tasks (nested under a project) */}
                <Route path="/projects/:projectId/tasks" element={<TasksPage />} />

                {/* Notes (nested under a project) */}
                <Route path="/projects/:projectId/notes" element={<NotesPage />} />

                {/* System status */}
                <Route path="/status"  element={<StatusPage />} />

                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* ── Root → dashboard ─────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/projects" replace />} />

            {/* ── 404 fallback ─────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTitleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ── 404 page ──────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">This page doesn&apos;t exist.</p>
      <a href="/projects" className="btn-primary mt-2">Go to Dashboard</a>
    </div>
  );
}
