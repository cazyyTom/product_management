/**
 * StatusPage.jsx  (Step 6)
 *
 * System health dashboard — polls GET /healthcheck every 30 s.
 * Shows: API status, DB connection, uptime, memory, environment.
 */

import { useState, useEffect, useCallback } from "react";
import { useSetPageTitle } from "@/hooks/usePageTitle";
import { getHealthStatus } from "@/api/healthcheck.api";
import { Spinner } from "@/components/ui/Spinner";

function StatusBadge({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
      ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub, icon, accent = "brand" }) {
  const bg = {
    brand:   "bg-brand-50 text-brand-600",
    green:   "bg-green-50 text-green-600",
    amber:   "bg-amber-50 text-amber-600",
    purple:  "bg-purple-50 text-purple-600",
    sky:     "bg-sky-50 text-sky-600",
  }[accent];

  return (
    <div className="card flex items-start gap-4 p-5">
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900 truncate">{value ?? "—"}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatusPage() {
  useSetPageTitle("System Status");

  const [health, setHealth]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = useCallback(async () => {
    setError(null);
    try {
      const res = await getHealthStatus();
      setHealth(res.data?.data ?? res.data);
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message || "Could not reach the API.");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 30-second polling
  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 30_000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const apiOk = !!health && health.status === "OK";
  const dbOk  = health?.database?.status === "connected";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">System Status</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Live health check — refreshes every 30 s
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="btn-secondary btn-sm"
          title="Refresh now"
        >
          {loading
            ? <Spinner size="sm" className="text-brand-500" />
            : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )
          }
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center justify-between rounded-xl border-2 px-5 py-4 ${
        loading ? "border-gray-200 bg-gray-50"
        : apiOk ? "border-green-200 bg-green-50"
        : "border-red-200 bg-red-50"
      }`}>
        <div>
          <p className={`text-base font-semibold ${
            loading ? "text-gray-600" : apiOk ? "text-green-700" : "text-red-700"
          }`}>
            {loading ? "Checking…" : apiOk ? "All systems operational" : "Service issue detected"}
          </p>
          {lastChecked && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last checked {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-2">
            <StatusBadge ok={apiOk} label="API" />
            <StatusBadge ok={dbOk}  label="Database" />
          </div>
        )}
      </div>

      {/* Error state */}
      {!loading && error && (
        <div className="card border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-700">Connection error</p>
              <p className="mt-0.5 text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics grid */}
      {!loading && health && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="API Status"
              value={health.status}
              sub={`Environment: ${health.environment}`}
              accent="green"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <MetricCard
              label="Database"
              value={health.database?.status}
              sub="MongoDB connection"
              accent={dbOk ? "green" : "amber"}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              }
            />

            <MetricCard
              label="Uptime"
              value={health.uptime}
              sub="Since last restart"
              accent="brand"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <MetricCard
              label="Memory — Heap Used"
              value={health.memory?.heapUsed}
              sub={`of ${health.memory?.heapTotal} total`}
              accent="purple"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              }
            />
          </div>

          {/* Timestamp */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Server timestamp</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
