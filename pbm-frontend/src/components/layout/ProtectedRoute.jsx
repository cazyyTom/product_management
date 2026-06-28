/**
 * ProtectedRoute.jsx
 *
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  - While the auth bootstrap is still running (isLoading = true) → show a
 *    full-screen spinner so there's no flash of the login page.
 *  - If the user is not authenticated → redirect to /login, preserving the
 *    attempted URL in location.state.from so LoginPage can redirect back.
 *  - If authenticated → render children (or <Outlet /> for nested routes).
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Auth bootstrap in progress — show full-screen loader
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-brand-600" />
          <p className="text-sm text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → bounce to login, remember where they were going
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated → render the matched child route
  return <Outlet />;
}
