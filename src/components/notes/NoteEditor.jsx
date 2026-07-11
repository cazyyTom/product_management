/**
 * NoteEditor.jsx
 *
 * Full-screen-ish modal for creating or editing a note.
 * Supports auto-save-on-blur and a manual Save button.
 *
 * Props:
 *   projectId   string
 *   note        object | null   – null = create mode
 *   open        boolean
 *   onClose     () => void
 *   onSaved     (note) => void  – called after create or update
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal }   from "@/components/ui/Modal";
import { Alert }   from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { createNote, updateNote } from "@/api/notes.api";

const MAX_CONTENT = 10_000;

export function NoteEditor({ projectId, note, open, onClose, onSaved }) {
  const isEdit = !!note;

  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [saved,   setSaved]   = useState(false);   // brief "Saved ✓" flash

  const titleRef = useRef(null);

  // Populate fields when the note prop changes (edit mode)
  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setError(null);
      setSaved(false);
      // Auto-focus the title on open
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, note]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      setError("A note needs at least a title or some content.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const res = await updateNote(projectId, note._id, { title: title.trim(), content });
        saved = res.data?.data?.note ?? res.data?.data;
      } else {
        const res = await createNote(projectId, { title: title.trim(), content });
        saved = res.data?.data?.note ?? res.data?.data;
      }
      onSaved(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!isEdit) onClose(); // close after create; stay open after edit
    } catch (err) {
      setError(err.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }, [projectId, note, isEdit, title, content, onSaved, onClose]);

  // Ctrl/Cmd + S shortcut
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleSave]);

  const remaining = MAX_CONTENT - content.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Note" : "New Note"}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title…"
          className="w-full border-0 border-b border-gray-200 bg-transparent pb-2 text-lg font-semibold text-gray-900 placeholder-gray-300 focus:border-brand-400 focus:outline-none focus:ring-0 transition-colors"
          maxLength={200}
        />

        {/* Content */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT) setContent(e.target.value);
            }}
            placeholder="Start writing… (Ctrl+S to save)"
            rows={14}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-700 placeholder-gray-300 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          {/* Character counter */}
          <span
            className={`absolute bottom-3 right-3 text-[11px] transition-colors ${
              remaining < 200 ? (remaining < 50 ? "text-red-400" : "text-yellow-500") : "text-gray-300"
            }`}
          >
            {remaining.toLocaleString()} remaining
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isEdit && note?.updatedAt && (
              <span>
                Last saved {new Date(note.updatedAt).toLocaleString(undefined, {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              {isEdit ? "Close" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <><Spinner size="sm" className="text-white" /> Saving…</>
              ) : (
                isEdit ? "Save changes" : "Create note"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
