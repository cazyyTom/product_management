/**
 * ConfirmDialog.jsx
 * Simple "Are you sure?" confirmation modal used for deletions.
 *
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   onConfirm   () => void | Promise<void>
 *   title       string
 *   message     string
 *   confirmLabel string  (default "Delete")
 *   danger      boolean  (red confirm button, default true)
 */

import { useState } from "react";
import { Modal }   from "./Modal";
import { Spinner } from "./Spinner";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  danger = true,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // errors handled by the caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={danger ? "btn-danger" : "btn-primary"}
        >
          {loading ? <><Spinner size="sm" className="text-white" /> Working…</> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
