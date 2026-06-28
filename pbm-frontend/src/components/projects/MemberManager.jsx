/**
 * MemberManager.jsx
 * Displays project members and lets project-admins / the owner:
 *   - Add a member by email + role
 *   - Change an existing member's role
 *   - Remove a member
 *
 * Props:
 *   projectId   string
 *   members     array   – current member list from the parent page
 *   currentUser object  – logged-in user
 *   onRefresh   () => void  – refetch members after mutations
 */

import { useState, useActionState } from "react";
import { Alert }    from "@/components/ui/Alert";
import { Spinner }  from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "@/api/projects.api";

const ROLES = ["member", "project_admin"];

// ─── Add-member form action ───────────────────────────────────────────────────
function makeAddAction(projectId, onRefresh) {
  return async function addAction(_prev, formData) {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const role  = formData.get("role")?.toString();

    if (!email) return { ok: false, message: "Email is required." };

    try {
      await addProjectMember(projectId, { email, role });
      onRefresh();
      return { ok: true, message: null };
    } catch (err) {
      return { ok: false, message: err.message || "Could not add member." };
    }
  };
}

export function MemberManager({ projectId, members = [], currentUser, onRefresh }) {
  const [removeTarget, setRemoveTarget] = useState(null);
  const [roleLoading, setRoleLoading]   = useState(null); // userId being updated

  const [addState, addAction, isAdding] = useActionState(
    makeAddAction(projectId, onRefresh),
    { ok: false, message: null },
  );

  // ── Change role ────────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(userId);
    try {
      await updateMemberRole(projectId, userId, newRole);
      onRefresh();
    } catch {
      // TODO: surface error toast
    } finally {
      setRoleLoading(null);
    }
  };

  // ── Remove member ──────────────────────────────────────────────────────────
  const handleRemove = async () => {
    await removeProjectMember(projectId, removeTarget._id);
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* ── Add member form ──────────────────────────────────────────── */}
      <form action={addAction} noValidate>
        <p className="mb-2 text-sm font-medium text-gray-700">Add member</p>
        {addState.ok && (
          <Alert variant="success" message="Member added successfully!" className="mb-3" />
        )}
        {addState.message && !addState.ok && (
          <Alert variant="error" message={addState.message} className="mb-3" />
        )}
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="colleague@example.com"
            className="input flex-1"
          />
          <select name="role" className="input w-36 shrink-0">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "project_admin" ? "Admin" : "Member"}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isAdding}
            className="btn-primary shrink-0"
          >
            {isAdding ? <Spinner size="sm" className="text-white" /> : "Add"}
          </button>
        </div>
      </form>

      {/* ── Member list ──────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {members.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            No members yet. Add someone above.
          </p>
        )}
        {members.map((m) => {
          const u        = m.user ?? m;
          const isMe     = u._id === currentUser?._id;
          const isLoading = roleLoading === u._id;

          return (
            <div key={u._id} className="flex items-center gap-3 px-4 py-3">
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {u.username?.slice(0, 2).toUpperCase()}
              </div>

              {/* Name / email */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {u.username} {isMe && <span className="text-xs text-gray-400">(you)</span>}
                </p>
                <p className="truncate text-xs text-gray-400">{u.email}</p>
              </div>

              {/* Role selector */}
              {!isMe ? (
                <div className="flex items-center gap-1">
                  {isLoading && <Spinner size="sm" className="text-brand-500" />}
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    disabled={isLoading}
                    className="input w-32 py-1 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === "project_admin" ? "Admin" : "Member"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="badge-proj-admin">
                  {m.role === "project_admin" ? "Admin" : "Member"}
                </span>
              )}

              {/* Remove */}
              {!isMe && (
                <button
                  onClick={() => setRemoveTarget(u)}
                  className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Remove member"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm7-7h5m-5 4h5" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove member"
        message={`Remove ${removeTarget?.username} from this project?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
