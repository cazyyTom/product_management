/**
 * ProjectDetailPage.jsx  (Step 4)
 * Tabbed project detail view: Overview | Tasks | Notes | Members
 */

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSetPageTitle } from "@/hooks/usePageTitle";
import { useFetch }        from "@/hooks/useFetch";
import { useAuth }         from "@/context/AuthContext";
import { getProjectById, getProjectMembers, deleteProject } from "@/api/projects.api";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { MemberManager }    from "@/components/projects/MemberManager";
import { ConfirmDialog }    from "@/components/ui/ConfirmDialog";
import { Spinner }          from "@/components/ui/Spinner";
import { Alert }            from "@/components/ui/Alert";

const STATUS_STYLES = {
  planning: "badge bg-yellow-100 text-yellow-700",
  ongoing:  "badge bg-blue-100 text-blue-700",
  "on hold":"badge bg-orange-100 text-orange-700",
  finished: "badge bg-green-100 text-green-700",
};

const TABS = ["overview", "tasks", "notes", "members"];

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [activeTab, setActiveTab]   = useState("overview");
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: projData, isLoading: projLoading, error: projError, refetch: refetchProject } =
    useFetch(() => getProjectById(projectId), [projectId]);
  const project = projData?.project ?? projData;

  const { data: memData, isLoading: memLoading, refetch: refetchMembers } =
    useFetch(() => getProjectMembers(projectId), [projectId]);
  const members = memData?.members ?? (Array.isArray(memData) ? memData : []);

  useSetPageTitle(project?.name ?? "Project");

  const handleDelete = async () => {
    await deleteProject(projectId);
    navigate("/projects", { replace: true });
  };

  if (projLoading) {
    return <div className="flex items-center justify-center py-32"><Spinner size="lg" className="text-brand-500" /></div>;
  }
  if (projError || !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="btn-ghost btn-sm inline-flex">← Back to projects</Link>
        <Alert variant="error" message={projError ?? "Project not found."} />
      </div>
    );
  }

  const badgeCls = STATUS_STYLES[project.status] ?? "badge bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="page-title">{project.name}</h1>
                <span className={badgeCls}>{project.status}</span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 max-w-2xl">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                <span>Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                <span>·</span>
                <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setShowEdit(true)} className="btn-secondary btn-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button onClick={() => setShowDelete(true)} className="btn-danger btn-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={["whitespace-nowrap border-b-2 pb-3 text-sm font-medium capitalize transition-colors",
                activeTab === tab ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              ].join(" ")}>
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab project={project} members={members} />}

      {activeTab === "tasks" && (
        <div className="card">
          <div className="card-body flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700">Manage tasks on the Task Board</p>
            <p className="max-w-xs text-sm text-gray-400">Create tasks, assign teammates, track progress with Kanban or list view.</p>
            <Link to={`/projects/${projectId}/tasks`} className="btn-primary mt-1">
              Open Task Board →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="card">
          <div className="card-body flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-500">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700">Capture ideas and decisions</p>
            <p className="max-w-xs text-sm text-gray-400">Write and organise notes, meeting minutes, and documentation for this project.</p>
            <Link to={`/projects/${projectId}/notes`} className="btn-primary mt-1">
              Open Notes →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="card">
          <div className="card-header"><h2 className="section-title">Project Members</h2></div>
          <div className="card-body">
            {memLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" className="text-brand-500" /></div>
            ) : (
              <MemberManager projectId={projectId} members={members} currentUser={user} onRefresh={refetchMembers} />
            )}
          </div>
        </div>
      )}

      <EditProjectModal open={showEdit} onClose={() => setShowEdit(false)} project={project} onUpdated={() => refetchProject()} />
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete project" message={`Delete "${project.name}"? All tasks and notes will be permanently removed.`}
        confirmLabel="Delete project" />
    </div>
  );
}

function OverviewTab({ project, members }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Members" value={members.length} colour="brand" icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      } />
      <StatCard label="Status" value={project.status ?? "planning"} colour="indigo" icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      } />
      <StatCard label="Created" value={new Date(project.createdAt).toLocaleDateString()} colour="emerald" icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      } />
      {members.length > 0 && (
        <div className="card sm:col-span-3">
          <div className="card-header"><h3 className="section-title text-sm">Team</h3></div>
          <div className="card-body flex flex-wrap gap-3">
            {members.map((m) => {
              const u = m.user ?? m;
              return (
                <div key={u._id} className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                    {u.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{u.username}</span>
                  <span className="text-xs text-gray-400">{m.role === "project_admin" ? "Admin" : "Member"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, colour, icon }) {
  const bg = { brand:"bg-brand-50 text-brand-600", indigo:"bg-indigo-50 text-indigo-600", emerald:"bg-emerald-50 text-emerald-600" }[colour] ?? "bg-gray-50 text-gray-600";
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
      </div>
    </div>
  );
}
