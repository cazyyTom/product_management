/**
 * CreateTaskModal.jsx
 *
 * Modal form to create a new task in a project.
 *
 * Props:
 *   projectId   string
 *   members     array   – project members for assignee selector
 *   open        boolean
 *   onClose     () => void
 *   onCreated   () => void
 *   defaultStatus string  – pre-select column status (optional)
 */

import { useActionState } from "react";
import { Modal }    from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Alert }    from "@/components/ui/Alert";
import { Spinner }  from "@/components/ui/Spinner";
import { createTask } from "@/api/tasks.api";
import { TASK_STATUS_LIST, STATUS_LABEL } from "@/utils/taskConstants";

function makeCreateAction(projectId, onCreated, onClose) {
  return async function action(_prev, formData) {
    const title       = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const status      = formData.get("status")?.toString();
    const assignedTo  = formData.get("assignedTo")?.toString() || null;
    const files       = formData.getAll("attachments").filter((f) => f.size > 0);

    if (!title) return { ok: false, message: "Task title is required." };

    try {
      // Build FormData only if files are attached, else send JSON
      if (files.length > 0) {
        const fd = new FormData();
        fd.append("title",       title);
        fd.append("description", description ?? "");
        fd.append("status",      status);
        if (assignedTo) fd.append("assignedTo", assignedTo);
        files.forEach((f) => fd.append("attachments", f));
        await createTask(projectId, fd);
      } else {
        await createTask(projectId, { title, description, status, assignedTo });
      }

      onCreated();
      onClose();
      return { ok: true, message: null };
    } catch (err) {
      return { ok: false, message: err.message || "Failed to create task." };
    }
  };
}

export function CreateTaskModal({ projectId, members = [], open, onClose, onCreated, defaultStatus = "todo" }) {
  const [state, formAction, isPending] = useActionState(
    makeCreateAction(projectId, onCreated, onClose),
    { ok: false, message: null },
  );

  return (
    <Modal open={open} onClose={onClose} title="New Task" maxWidth="max-w-lg">
      <form action={formAction} noValidate className="space-y-4">
        {state.message && <Alert variant="error" message={state.message} />}

        <FormField label="Title *" id="task-title">
          <input
            id="task-title"
            name="title"
            type="text"
            autoFocus
            placeholder="What needs to be done?"
            className="input"
          />
        </FormField>

        <FormField label="Description" id="task-desc">
          <textarea
            id="task-desc"
            name="description"
            rows={3}
            placeholder="Add more context…"
            className="input resize-none"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status" id="task-status">
            <select id="task-status" name="status" defaultValue={defaultStatus} className="input">
              {TASK_STATUS_LIST.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Assign to" id="task-assignee">
            <select id="task-assignee" name="assignedTo" className="input">
              <option value="">Unassigned</option>
              {members.map((m) => {
                const u = m.user ?? m;
                return <option key={u._id} value={u._id}>{u.username}</option>;
              })}
            </select>
          </FormField>
        </div>

        <FormField label="Attachments" id="task-files">
          <input
            id="task-files"
            name="attachments"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <><Spinner size="sm" className="text-white" /> Creating…</> : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
