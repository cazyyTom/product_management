/**
 * SubtaskList.jsx
 *
 * Inline checklist rendered inside a TaskDetailModal or TaskCard.
 *
 * Props:
 *   projectId   string
 *   taskId      string
 *   subtasks    array   – current subtask list
 *   onRefresh   () => void
 *   compact     boolean – if true, show only the list (no add form header)
 */

import { useState, useRef } from "react";
import { createSubtask, updateSubtask, deleteSubtask } from "@/api/tasks.api";
import { Spinner } from "@/components/ui/Spinner";

export function SubtaskList({ projectId, taskId, subtasks = [], onRefresh, compact = false }) {
  const [newTitle, setNewTitle]     = useState("");
  const [adding, setAdding]         = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);

  const completed = subtasks.filter((s) => s.isCompleted).length;
  const total     = subtasks.length;

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    try {
      await createSubtask(projectId, taskId, { title });
      setNewTitle("");
      onRefresh();
      inputRef.current?.focus();
    } catch {
      // silently fail — parent can add a toast layer later
    } finally {
      setAdding(false);
    }
  };

  // ── Toggle complete ───────────────────────────────────────────────────────
  const handleToggle = async (subtask) => {
    setTogglingId(subtask._id);
    try {
      await updateSubtask(projectId, subtask._id, {
        isCompleted: !subtask.isCompleted,
      });
      onRefresh();
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (subtaskId) => {
    setDeletingId(subtaskId);
    try {
      await deleteSubtask(projectId, subtaskId);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header + progress */}
      {!compact && total > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Subtasks — {completed}/{total}
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: total ? `${(completed / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      {/* List */}
      {subtasks.length > 0 && (
        <ul className="space-y-1.5">
          {subtasks.map((sub) => {
            const isToggling = togglingId === sub._id;
            const isDeleting = deletingId === sub._id;

            return (
              <li
                key={sub._id}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(sub)}
                  disabled={isToggling}
                  className="shrink-0"
                  aria-label={sub.isCompleted ? "Mark incomplete" : "Mark complete"}
                >
                  {isToggling ? (
                    <Spinner size="sm" className="text-brand-500" />
                  ) : sub.isCompleted ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-brand-600 text-white">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 rounded border-2 border-gray-300 hover:border-brand-400 transition-colors" />
                  )}
                </button>

                {/* Title */}
                <span
                  className={`flex-1 text-sm transition-colors ${
                    sub.isCompleted ? "text-gray-400 line-through" : "text-gray-700"
                  }`}
                >
                  {sub.title}
                </span>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(sub._id)}
                  disabled={isDeleting}
                  className="invisible rounded p-0.5 text-gray-300 hover:text-red-500 group-hover:visible transition-colors"
                  aria-label="Delete subtask"
                >
                  {isDeleting ? (
                    <Spinner size="sm" className="text-red-400" />
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add subtask input */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask…"
          className="input flex-1 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="btn-primary btn-sm shrink-0"
        >
          {adding ? <Spinner size="sm" className="text-white" /> : "Add"}
        </button>
      </form>
    </div>
  );
}
