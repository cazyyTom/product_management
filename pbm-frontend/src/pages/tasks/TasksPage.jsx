/**
 * TasksPage.jsx  (Step 5)
 *
 * Full task board for a project.
 * - Fetches tasks + project members
 * - Toggles between Kanban and List view
 * - Filter by status / assignee / search
 * - Opens CreateTaskModal and TaskDetailModal
 */

import { useState, useCallback, useMemo } from "react";
import { useParams, Link }  from "react-router-dom";
import { useSetPageTitle }  from "@/hooks/usePageTitle";
import { useFetch }         from "@/hooks/useFetch";
import { useAuth }          from "@/context/AuthContext";
import { getProjectTasks }  from "@/api/tasks.api";
import { getProjectById, getProjectMembers } from "@/api/projects.api";

import { KanbanBoard }      from "@/components/tasks/KanbanBoard";
import { ListView }         from "@/components/tasks/ListView";
import { CreateTaskModal }  from "@/components/tasks/CreateTaskModal";
import { TaskDetailModal }  from "@/components/tasks/TaskDetailModal";
import { Spinner }          from "@/components/ui/Spinner";
import { Alert }            from "@/components/ui/Alert";
import { STATUS_LABEL, TASK_STATUS_LIST } from "@/utils/taskConstants";

export default function TasksPage() {
  const { projectId } = useParams();
  const { user }      = useAuth();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: projData } = useFetch(() => getProjectById(projectId), [projectId]);
  const projectName = projData?.project?.name ?? projData?.name ?? "Project";
  useSetPageTitle(`${projectName} — Tasks`);

  const {
    data: taskData, isLoading, error, refetch,
  } = useFetch(() => getProjectTasks(projectId), [projectId]);
  const tasks = useMemo(() => taskData?.tasks ?? (Array.isArray(taskData) ? taskData : []), [taskData]);

  const { data: memData } = useFetch(() => getProjectMembers(projectId), [projectId]);
  const members = memData?.members ?? (Array.isArray(memData) ? memData : []);

  // ── View + filter state ────────────────────────────────────────────────────
  const [view, setView]               = useState("kanban"); // "kanban" | "list"
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]     = useState(false);
  const [createStatus, setCreateStatus] = useState("todo");
  const [activeTaskId, setActiveTaskId] = useState(null);

  // ── Filtered tasks ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterAssignee !== "all") {
        const assigneeId = t.assignedTo?._id ?? null;
        if (filterAssignee === "unassigned" && assigneeId) return false;
        if (filterAssignee !== "unassigned" && assigneeId !== filterAssignee) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filterStatus, filterAssignee, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddTask = useCallback((status = "todo") => {
    setCreateStatus(status);
    setShowCreate(true);
  }, []);

  const handleTaskUpdate = useCallback(() => refetch(), [refetch]);

  // Stats
  const stats = useMemo(() => ({
    total:       tasks.length,
    todo:        tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
  }), [tasks]);

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-gray-600 transition-colors">{projectName}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Tasks</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Task Board</h1>
          <div className="mt-1 flex gap-4 text-xs text-gray-400">
            <span>{stats.total} total</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">{stats.todo} to do</span>
            <span className="text-brand-500">{stats.in_progress} in progress</span>
            <span className="text-green-600">{stats.done} done</span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "kanban" ? "bg-brand-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list" ? "bg-brand-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
          <button onClick={() => handleAddTask("todo")} className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New task
          </button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-52"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-36"
        >
          <option value="all">All statuses</option>
          {TASK_STATUS_LIST.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        {/* Assignee filter */}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="input w-40"
        >
          <option value="all">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => {
            const u = m.user ?? m;
            return <option key={u._id} value={u._id}>{u.username}</option>;
          })}
        </select>

        {/* Clear filters */}
        {(search || filterStatus !== "all" || filterAssignee !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterStatus("all"); setFilterAssignee("all"); }}
            className="btn-ghost btn-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      )}

      {!isLoading && error && <Alert variant="error" message={error} />}

      {!isLoading && !error && (
        view === "kanban" ? (
          <KanbanBoard
            tasks={filtered}
            projectId={projectId}
            members={members}
            onTaskClick={setActiveTaskId}
            onTaskUpdate={handleTaskUpdate}
            onAddTask={handleAddTask}
          />
        ) : (
          <ListView
            tasks={filtered}
            projectId={projectId}
            onTaskClick={setActiveTaskId}
            onTaskUpdate={handleTaskUpdate}
            onAddTask={() => handleAddTask("todo")}
          />
        )
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        members={members}
        defaultStatus={createStatus}
        onCreated={() => { refetch(); setShowCreate(false); }}
      />

      <TaskDetailModal
        projectId={projectId}
        taskId={activeTaskId}
        members={members}
        onClose={() => setActiveTaskId(null)}
        onUpdated={() => { refetch(); }}
      />
    </div>
  );
}
