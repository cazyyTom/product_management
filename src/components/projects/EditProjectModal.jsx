/**
 * EditProjectModal.jsx
 * Modal form to edit an existing project's name, description and status.
 *
 * Props:
 *   open      boolean
 *   onClose   () => void
 *   project   object  – the project being edited
 *   onUpdated (project) => void
 */

import { useActionState } from "react";
import { Modal }    from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Alert }    from "@/components/ui/Alert";
import { Spinner }  from "@/components/ui/Spinner";
import { updateProject } from "@/api/projects.api";

const STATUSES = ["planning", "ongoing", "on hold", "finished"];

function editAction(projectId, onUpdated, onClose) {
  return async function action(_prev, formData) {
    const name        = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const status      = formData.get("status")?.toString();

    if (!name) return { ok: false, message: "Project name is required." };

    try {
      const res = await updateProject(projectId, { name, description, status });
      const updated = res.data?.data?.project ?? res.data?.data;
      onUpdated(updated);
      onClose();
      return { ok: true, message: null };
    } catch (err) {
      return { ok: false, message: err.message || "Failed to update project." };
    }
  };
}

export function EditProjectModal({ open, onClose, project, onUpdated }) {
  const [state, formAction, isPending] = useActionState(
    editAction(project?._id, onUpdated, onClose),
    { ok: false, message: null },
  );

  if (!project) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Project">
      <form action={formAction} noValidate className="space-y-4">
        {state.message && <Alert variant="error" message={state.message} />}

        <FormField label="Project name *" id="edit-proj-name">
          <input
            id="edit-proj-name"
            name="name"
            type="text"
            defaultValue={project.name}
            autoFocus
            className="input"
          />
        </FormField>

        <FormField label="Description" id="edit-proj-desc">
          <textarea
            id="edit-proj-desc"
            name="description"
            rows={3}
            defaultValue={project.description ?? ""}
            className="input resize-none"
          />
        </FormField>

        <FormField label="Status" id="edit-proj-status">
          <select id="edit-proj-status" name="status" defaultValue={project.status} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <><Spinner size="sm" className="text-white" /> Saving…</> : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
