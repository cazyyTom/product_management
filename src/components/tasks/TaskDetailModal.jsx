/**
 * TaskDetailModal.jsx
 *
 * Full-detail slide-over panel for a single task.
 * Loads task + subtasks, allows inline editing of every field,
 * shows attachments, and hosts the SubtaskList.
 *
 * Props:
 *   projectId   string
 *   taskId      string | null   – null = modal closed
 *   members     array           – project member list for assignee picker
 *   onClose     () => void
 *   onUpdated   () => void      – refetch task list after changes
 */

import { useState, useEffect } from "react";
import { Modal }        from "@/components/ui/Modal";
import { SubtaskList }  from "./SubtaskList";
import { Spinner }      from "@/components/ui/Spinner";
import { Alert }        from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getTaskById, updateTask, deleteTask } from "@/api/tasks.api";
import { STATUS_LABEL, TASK_STATUS_LIST, STATUS_BADGE } from "@/utils/taskConstants";

export function TaskDetailModal({ projectId, taskId, members = [], onClose, onUpdated }) {
  const [task, setTask]         = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Inline-edit state
  const [editing, setEditing]   = useState(null); // "title" | "description" | "status" | "assignee"
  const [draft, setDraft]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Fetch task + subtasks whenever taskId changes
  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    getTaskById(projectId, taskId)
      .then((res) => {
        const d = res.data?.data;
        setTask(d?.task ?? null);
        setSubtasks(d?.subtasks ?? []);
      })
      .catch((err) => setError(err.message || "Failed to load task."))
      .finally(() => setLoading(false));
  }, [projectId, taskId]);

  const refetchTask = () => {
    if (!taskId) return;
    getTaskById(projectId, taskId).then((res) => {
      const d = res.data?.data;
      setTask(d?.task ?? null);
      setSubtasks(d?.subtasks ?? []);
    });
  };

  // ── Inline save ────────────────────────────────────────────────────────────
  const saveField = async (field, value) => {
    setSaving(true);
    try {
      await updateTask(projectId, taskId, { [field]: value });
      setTask((t) => ({ ...t, [field]: value }));
      onUpdated();
    } catch {
      /* silently fail */
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  const startEdit = (field, current) => {
    setEditing(field);
    setDraft(current ?? "");
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    await deleteTask(projectId, taskId);
    onUpdated();
    onClose();
  };

  if (!taskId) return null;

  return (
    <Modal open={!!taskId} onClose={onClose} title="Task Detail" maxWidth="max-w-2xl">
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      )}

      {error && <Alert variant="error" message={error} />}

      {!loading && task && (
        <div className="space-y-6">
          {/* ── Title ──────────────────────────────────────────────── */}
          <div>
            {editing === "title" ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="input flex-1 text-lg font-semibold"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveField("title", draft);
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <button onClick={() => saveField("title", draft)} className="btn-primary btn-sm" disabled={saving}>
                  {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            ) : (
              <h3
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-brand-600 transition-colors"
                onClick={() => startEdit("title", task.title)}
                title="Click to edit"
              >
                {task.title}
              </h3>
            )}
          </div>

          {/* ── Meta row ───────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Status */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
              {editing === "status" ? (
                <div className="flex gap-2">
                  <select
                    autoFocus
                    className="input py-1 text-sm"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  >
                    {TASK_STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button onClick={() => saveField("status", draft)} className="btn-primary btn-sm" disabled={saving}>
                    {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit("status", task.status)}
                  className={`${STATUS_BADGE[task.status]} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {STATUS_LABEL[task.status]}
                </button>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Assigned to</p>
              {editing === "assignee" ? (
                <div className="flex gap-2">
                  <select
                    autoFocus
                    className="input py-1 text-sm"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => {
                      const u = m.user ?? m;
                      return <option key={u._id} value={u._id}>{u.username}</option>;
                    })}
                  </select>
                  <button onClick={() => saveField("assignedTo", draft || null)} className="btn-primary btn-sm" disabled={saving}>
                    {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit("assignee", task.assignedTo?._id ?? "")}
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                >
                  {task.assignedTo ? (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                        {task.assignedTo.username.slice(0, 2).toUpperCase()}
                      </span>
                      {task.assignedTo.username}
                    </>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </button>
              )}
            </div>

            {/* Assigned by */}
            {task.assignedBy && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Created by</p>
                <p className="text-sm text-gray-700">{task.assignedBy.username}</p>
              </div>
            )}

            {/* Created at */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Created</p>
              <p className="text-sm text-gray-700">
                {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* ── Description ────────────────────────────────────────── */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Description</p>
            {editing === "description" ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  rows={4}
                  className="input resize-none text-sm"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => saveField("description", draft)} className="btn-primary btn-sm" disabled={saving}>
                    {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div
                className="min-h-[2.5rem] cursor-pointer rounded-lg border border-transparent px-2 py-1.5 text-sm text-gray-700 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => startEdit("description", task.description ?? "")}
                title="Click to edit description"
              >
                {task.description
                  ? <p className="whitespace-pre-wrap">{task.description}</p>
                  : <p className="text-gray-400 italic">Add a description…</p>
                }
              </div>
            )}
          </div>

          {/* ── Subtasks ───────────────────────────────────────────── */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Subtasks</p>
            <SubtaskList
              projectId={projectId}
              taskId={taskId}
              subtasks={subtasks}
              onRefresh={refetchTask}
            />
          </div>

          {/* ── Attachments ────────────────────────────────────────── */}
          {task.attachments?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Attachments ({task.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="max-w-[120px] truncate">{att.url.split("/").pop()}</span>
                    <span className="text-gray-400">({(att.size / 1024).toFixed(0)} KB)</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Danger zone ────────────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-4 flex justify-end">
            <button
              onClick={() => setShowDelete(true)}
              className="btn-danger btn-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete task
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete task"
        message={`Delete "${task?.title}"? All subtasks will also be removed.`}
        confirmLabel="Delete task"
      />
    </Modal>
  );
}
