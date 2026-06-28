/**
 * ForgotPasswordPage.jsx
 * Sends a password reset email. On success shows a confirmation banner.
 */

import { useActionState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/api/auth.api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

async function forgotAction(_prev, formData) {
  const email = formData.get("email")?.toString().trim();
  if (!email) return { ok: false, message: "Email is required." };

  try {
    await forgotPassword(email);
    return { ok: true, message: null };
  } catch (err) {
    return { ok: false, message: err.message || "Something went wrong." };
  }
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotAction, {
    ok: false,
    message: null,
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {state.ok ? (
        <Alert
          variant="success"
          message="If an account with that email exists, a reset link has been sent. Check your inbox."
          className="mb-4"
        />
      ) : (
        <form action={formAction} noValidate className="space-y-5">
          {state.message && <Alert variant="error" message={state.message} />}

          <FormField label="Email address" id="email">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className="input"
            />
          </FormField>

          <button type="submit" disabled={isPending} className="btn-primary btn-lg w-full">
            {isPending ? (
              <><Spinner size="sm" className="text-white" /> Sending…</>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
