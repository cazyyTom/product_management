/**
 * CreateProjectModal.jsx
 * Modal form to create a new project.
 *
 * Props:
 *   open      boolean
 *   onClose   () => void
 *   onCreated (project) => void  — called after successful creation
 */

import { useActionState } from "react";
import { Modal }   from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Alert }   from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { createProject } from "@/api/projects.api";

const STATUSES = ["planning", "ongoing", "on hold", "finished"];

function createAction(onCreated, onClose) {
  return async function action(_prev, formData) {
    const name        = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const status      = formData.get("status")?.toString();

    if (!name) return { ok: false, message: "Project name is required." };

    try {
      const res = await createProject({ name, description, status });
      const project = res.data?.data?.project ?? res.data?.data;
      onCreated(project);
      onClose();
      return { ok: true, message: null };
    } catch (err) {
      return { ok: false, message: err.message || "Failed to create project." };
    }
  };
}

export function CreateProjectModal({ open, onClose, onCreated }) {
  const [state, formAction, isPending] = useActionState(
    createAction(onCreated, onClose),
    { ok: false, message: null },
  );

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form action={formAction} noValidate className="space-y-4">
        {state.message && <Alert variant="error" message={state.message} />}

        <FormField label="Project name *" id="proj-name">
          <input
            id="proj-name"
            name="name"
            type="text"
            autoFocus
            placeholder="e.g. Website Redesign"
            className="input"
          />
        </FormField>

        <FormField label="Description" id="proj-desc">
          <textarea
            id="proj-desc"
            name="description"
            rows={3}
            placeholder="What is this project about?"
            className="input resize-none"
          />
        </FormField>

        <FormField label="Status" id="proj-status">
          <select id="proj-status" name="status" className="input">
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
            {isPending ? <><Spinner size="sm" className="text-white" /> Creating…</> : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
