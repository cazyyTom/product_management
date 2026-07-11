/**
 * ProfilePage.jsx
 * User profile page — view account info, change password, resend verification.
 */

import { useActionState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSetPageTitle } from "@/hooks/usePageTitle";
import { changePassword, resendEmailVerification } from "@/api/auth.api";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";

// ─── Change password action ───────────────────────────────────────────────────
async function changePwdAction(_prev, formData) {
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword     = formData.get("newPassword")?.toString();
  const confirm         = formData.get("confirm")?.toString();

  if (!currentPassword) return { ok: false, message: "Current password is required." };
  if (!newPassword || newPassword.length < 8)
    return { ok: false, message: "New password must be at least 8 characters." };
  if (newPassword !== confirm)
    return { ok: false, message: "Passwords do not match." };

  try {
    await changePassword({ currentPassword, newPassword });
    return { ok: true, message: null };
  } catch (err) {
    return { ok: false, message: err.message || "Failed to change password." };
  }
}

export default function ProfilePage() {
  const { user } = useAuth();
  useSetPageTitle("My Profile");

  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd]         = useState(false);

  const [pwdState, pwdAction, isPending] = useActionState(changePwdAction, {
    ok: false,
    message: null,
  });

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await resendEmailVerification();
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* ── Account info ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Account Information</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Email verification status */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            {user?.isEmailVerified ? (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-3.5 w-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-green-700 font-medium">Email verified</span>
              </>
            ) : (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-3.5 w-3.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-yellow-700">Email not verified.</span>
                <button
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="ml-auto text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
                >
                  {resendStatus === "sending" ? "Sending…"
                    : resendStatus === "sent" ? "Email sent ✓"
                    : "Resend verification"}
                </button>
              </>
            )}
          </div>
          {resendStatus === "error" && (
            <Alert variant="error" message="Failed to resend verification email. Please try again." />
          )}

          {/* Info rows */}
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Username</dt>
              <dd className="font-medium text-gray-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Member since</dt>
              <dd className="font-medium text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── Change password ───────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Change Password</h2>
        </div>
        <div className="card-body">
          <form action={pwdAction} noValidate className="space-y-4 max-w-sm">
            {pwdState.ok && <Alert variant="success" message="Password changed successfully!" />}
            {pwdState.message && !pwdState.ok && <Alert variant="error" message={pwdState.message} />}

            <FormField label="Current password" id="currentPassword">
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="input pr-10"
                />
                <EyeToggle open={showCurrentPwd} onToggle={() => setShowCurrentPwd(v => !v)} />
              </div>
            </FormField>

            <FormField label="New password" id="newPassword">
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPwd ? "text" : "password"}
                  autoComplete="new-password"
                  className="input pr-10"
                />
                <EyeToggle open={showNewPwd} onToggle={() => setShowNewPwd(v => !v)} />
              </div>
            </FormField>

            <FormField label="Confirm new password" id="confirm">
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                className="input"
              />
            </FormField>

            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? <><Spinner size="sm" className="text-white" /> Updating…</> : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EyeToggle({ open, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {open ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}
