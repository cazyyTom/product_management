/**
 * ProjectsPage.jsx  (Step 4)
 * Dashboard listing all projects the current user owns or is a member of.
 * Supports create, edit, and delete.
 */

import { useState, useCallback } from "react";
import { useSetPageTitle } from "@/hooks/usePageTitle";
import { useFetch }        from "@/hooks/useFetch";
import { useAuth }         from "@/context/AuthContext";
import { getProjects, deleteProject } from "@/api/projects.api";

import { ProjectCard }        from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { EditProjectModal }   from "@/components/projects/EditProjectModal";
import { ConfirmDialog }      from "@/components/ui/ConfirmDialog";
import { EmptyState }         from "@/components/ui/EmptyState";
import { Spinner }            from "@/components/ui/Spinner";
import { Alert }              from "@/components/ui/Alert";

export default function ProjectsPage() {
  useSetPageTitle("My Projects");
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useFetch(() => getProjects(), []);
  const projects = data?.projects ?? (Array.isArray(data) ? data : []);

  const [search, setSearch]             = useState("");
  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError]   = useState(null);

  const handleCreated = useCallback(() => refetch(), [refetch]);
  const handleUpdated = useCallback(() => refetch(), [refetch]);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteProject(deleteTarget._id);
      refetch();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete project.");
      throw err;
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New project
        </button>
      </div>

      {projects.length > 0 && (
        <div className="relative max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" placeholder="Search projects…" value={search}
            onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
      )}

      {deleteError && <Alert variant="error" message={deleteError} />}

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      )}

      {!isLoading && error && <Alert variant="error" message={error} />}

      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          title="No projects yet"
          message="Create your first project to start managing tasks and notes."
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create a project
            </button>
          }
        />
      )}

      {!isLoading && filtered.length === 0 && projects.length > 0 && (
        <p className="text-sm text-gray-400">No projects match your search.</p>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => setEditTarget(project)}
              onDelete={() => { setDeleteError(null); setDeleteTarget(project); }}
            />
          ))}
        </div>
      )}

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <EditProjectModal open={!!editTarget} onClose={() => setEditTarget(null)} project={editTarget} onUpdated={handleUpdated} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete project"
        message={`Delete "${deleteTarget?.name}"? All tasks and notes inside will also be removed. This cannot be undone.`}
        confirmLabel="Delete project"
      />
    </div>
  );
}
