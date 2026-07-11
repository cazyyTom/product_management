/**
 * NoteViewer.jsx
 * Read-only expanded view of a single note with Edit / Delete actions.
 *
 * Props:
 *   note      object | null
 *   open      boolean
 *   onClose   () => void
 *   onEdit    () => void   – switch to NoteEditor for this note
 *   onDelete  () => void
 */

import { Modal }         from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState }      from "react";

export function NoteViewer({ note, open, onClose, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!note) return null;

  const handleDelete = async () => {
    await onDelete();
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
        {/* Custom header (no default title so we can render richer markup) */}
        <div className="-mt-5 -mx-6 mb-5 flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
            {note.title || <span className="italic text-gray-400">Untitled</span>}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-400">
          {note.createdBy && (
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">
                {note.createdBy.username.slice(0, 2).toUpperCase()}
              </span>
              {note.createdBy.username}
            </span>
          )}
          <span>
            Created {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <span>
              · Edited {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short", day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[8rem] rounded-lg bg-gray-50 px-4 py-4">
          {note.content ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {note.content}
            </p>
          ) : (
            <p className="italic text-gray-400 text-sm">No content yet.</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="btn-danger btn-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <button type="button" onClick={onEdit} className="btn-primary btn-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete note"
        message={`Delete "${note.title || "this note"}"? This cannot be undone.`}
        confirmLabel="Delete note"
      />
    </>
  );
}
