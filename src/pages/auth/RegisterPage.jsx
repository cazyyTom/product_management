/**
 * RegisterPage.jsx
 *
 * Multi-field registration form using React 19's useActionState.
 * On success → shows "check your email" confirmation panel instead of
 * immediately redirecting (email verification is required before login).
 */

import { useActionState, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateRegister({ username, email, password, confirmPassword }) {
  const errors = {};
  if (!username || username.length < 3)
    errors.username = "Username must be at least 3 characters.";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    errors.username = "Username can only contain letters, numbers and underscores.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (!password || password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

// ─── Form action ──────────────────────────────────────────────────────────────
function createRegisterAction(register) {
  return async function registerAction(_prevState, formData) {
    const username       = formData.get("username")?.toString().trim().toLowerCase();
    const email          = formData.get("email")?.toString().trim().toLowerCase();
    const password       = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    const fieldErrors = validateRegister({ username, email, password, confirmPassword });
    if (Object.keys(fieldErrors).length) {
      return { ok: false, fieldErrors, message: null };
    }

    try {
      await register({ username, email, password });
      return { ok: true, fieldErrors: {}, message: null, email };
    } catch (err) {
      const msg = err.message || "Registration failed. Please try again.";
      return { ok: false, fieldErrors: {}, message: msg };
    }
  };
}

// ─── Success panel ────────────────────────────────────────────────────────────
function VerifyEmailPrompt({ email }) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Check your inbox</h2>
      <p className="text-sm text-gray-600">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-gray-900">{email}</span>.
        Click the link in that email to activate your account.
      </p>
      <p className="text-xs text-gray-400">
        Can&apos;t find it? Check your spam folder.
      </p>
      <Link to="/login" className="btn-primary mt-4 inline-flex">
        Back to sign in
      </Link>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // Already logged-in guard
  useEffect(() => {
    if (isAuthenticated) navigate("/projects", { replace: true });
  }, [isAuthenticated, navigate]);

  const [state, formAction, isPending] = useActionState(
    createRegisterAction(register),
    { ok: false, fieldErrors: {}, message: null },
  );

  // Show email-verify panel after success
  if (state.ok) {
    return (
      <AuthLayout>
        <VerifyEmailPrompt email={state.email} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever. No credit card required."
    >
      <form action={formAction} noValidate className="space-y-4">
        {/* Global error */}
        {state.message && (
          <Alert variant="error" message={state.message} />
        )}

        {/* Username */}
        <FormField
          label="Username"
          id="username"
          error={state.fieldErrors?.username}
        >
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            placeholder="johndoe"
            className={`input ${state.fieldErrors?.username ? "input-error" : ""}`}
          />
        </FormField>

        {/* Email */}
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
            placeholder="you@example.com"
            className={`input ${state.fieldErrors?.email ? "input-error" : ""}`}
          />
        </FormField>

        {/* Password */}
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
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className={`input pr-10 ${state.fieldErrors?.password ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </FormField>

        {/* Confirm Password */}
        <FormField
          label="Confirm password"
          id="confirmPassword"
          error={state.fieldErrors?.confirmPassword}
        >
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`input pr-10 ${state.fieldErrors?.confirmPassword ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </FormField>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary btn-lg w-full mt-2"
        >
          {isPending ? (
            <>
              <Spinner size="sm" className="text-white" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400">
          By registering you agree to our{" "}
          <a href="#" className="underline hover:text-gray-600">Terms of Service</a>.
        </p>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 pt-1">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ─── Tiny eye icon ────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
