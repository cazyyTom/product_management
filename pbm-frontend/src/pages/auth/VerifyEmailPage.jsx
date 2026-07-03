/**
 * VerifyEmailPage.jsx
 *
 * The backend sends an email with:
 *   {APP_URL}/api/v1/auth/verify-email/{token}
 *
 * That hits the backend directly, but we also handle the CLIENT_URL redirect:
 *   {CLIENT_URL}/verify-email/{token}
 *
 * This page calls the verify endpoint on mount and shows success / error.
 */

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Spinner } from "@/components/ui/Spinner";

export default function VerifyEmailPage() {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!verificationToken) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    api
      .get(`/auth/verify-email/${verificationToken}`)
      .then(() => {
        setStatus("success");
        navigate("/login", {
          replace: true,
          state: { alertMessage: "Email verified, Login now" },
        });
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.message || "Verification failed. The link may have expired.",
        );
      });
  }, [verificationToken, navigate]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-5 text-center py-8">
        {status === "loading" && (
          <>
            <Spinner size="lg" className="text-brand-600" />
            <p className="text-gray-600">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Email verified!</h2>
            <p className="text-sm text-gray-500">Your account is now active. You can sign in.</p>
            <Link to="/login" className="btn-primary mt-2">Go to sign in</Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Verification failed</h2>
            <p className="text-sm text-gray-500">{message}</p>
            <Link to="/register" className="btn-secondary mt-2">Back to register</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
