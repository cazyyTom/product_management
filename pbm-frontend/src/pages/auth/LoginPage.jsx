import { useActionState, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

function createLoginAction(login) {
  return async function loginAction(_prevState, formData) {
    const email    = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    const fieldErrors = {};
    if (!email)    fieldErrors.email    = "Email is required.";
    if (!password) fieldErrors.password = "Password is required.";
    if (Object.keys(fieldErrors).length) {
      return { ok: false, fieldErrors, message: null };
    }

    try {
      await login({ email, password });
      return { ok: true, fieldErrors: {}, message: null };
    } catch (err) {
      return { ok: false, fieldErrors: {}, message: err.message || "Login failed. Please try again." };
    }
  };
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifiedMessage] = useState(location.state?.alertMessage || null);
  const from     = location.state?.from?.pathname || "/projects";

  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    createLoginAction(login),
    { ok: false, fieldErrors: {}, message: null },
  );


  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form action={formAction} noValidate className="space-y-5">
        {verifiedMessage && (
          <Alert variant="success" message={verifiedMessage} />
        )}
        {state.message && <Alert variant="error" message={state.message} />}

        <FormField
          label="Email address"
          id="email"
          error={state.fieldErrors?.email}
        >
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            className={`input ${state.fieldErrors?.email ? "input-error" : ""}`}
          />
        </FormField>

        <FormField
          label="Password"
          id="password"
          error={state.fieldErrors?.password}
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input pr-10 ${state.fieldErrors?.password ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary btn-lg w-full"
        >
          {isPending ? (
            <>
              <Spinner size="sm" className="text-white" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
