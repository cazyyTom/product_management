/**
 * ResetPasswordPage.jsx
 * Receives :resetToken from the URL (sent via email by the backend).
 */

import { useActionState, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "@/api/auth.api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export default function ResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev, formData) => {
      const newPassword = formData.get("newPassword")?.toString();
      const confirm     = formData.get("confirm")?.toString();

      if (!newPassword || newPassword.length < 8)
        return { ok: false, message: "Password must be at least 8 characters." };
      if (newPassword !== confirm)
        return { ok: false, message: "Passwords do not match." };

      try {
        await resetPassword(resetToken, newPassword);
        return { ok: true, message: null };
      } catch (err) {
        return { ok: false, message: err.message || "Reset failed. The link may have expired." };
      }
    },
    { ok: false, message: null },
  );

  if (state.ok) {
    return (
      <AuthLayout title="Password reset" subtitle="Your password has been updated.">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">You can now sign in with your new password.</p>
          <Link to="/login" className="btn-primary inline-flex">Go to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Must be at least 8 characters.">
      <form action={formAction} noValidate className="space-y-5">
        {state.message && <Alert variant="error" message={state.message} />}

        <FormField label="New password" id="newPassword">
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeIcon open={showPwd} />
            </button>
          </div>
        </FormField>

        <FormField label="Confirm new password" id="confirm">
          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </FormField>

        <button type="submit" disabled={isPending} className="btn-primary btn-lg w-full">
          {isPending ? <><Spinner size="sm" className="text-white" /> Resetting…</> : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}

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
