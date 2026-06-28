/**
 * KanbanBoard.jsx
 *
 * Three-column Kanban view: To Do | In Progress | Done
 * Each column shows TaskCards for that status and has an "+ Add" shortcut.
 *
 * Props:
 *   tasks         array
 *   projectId     string
 *   members       array
 *   onTaskClick   (taskId) => void
 *   onTaskUpdate  () => void    – refetch after any mutation
 *   onAddTask     (status) => void  – open CreateTaskModal pre-set to that column
 */

import { TaskCard }     from "./TaskCard";
import { EmptyState }   from "@/components/ui/EmptyState";
import { KANBAN_COLUMNS } from "@/utils/taskConstants";

export function KanbanBoard({ tasks, projectId, onTaskClick, onTaskUpdate, onAddTask }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className={`flex flex-col rounded-xl border-2 ${col.color} bg-white`}>
            {/* Column header */}
            <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col.id)}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/80 hover:text-gray-700 transition-colors"
                title={`Add task to ${col.label}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 max-h-[calc(100vh-280px)] scrollbar-hide">
              {colTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-400">No tasks here</p>
                  <button
                    onClick={() => onAddTask(col.id)}
                    className="mt-2 text-xs text-brand-500 hover:text-brand-700 hover:underline"
                  >
                    + Add one
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    projectId={projectId}
                    onClick={() => onTaskClick(task._id)}
                    onStatusChange={onTaskUpdate}
                  />
                ))
              )}
            </div>

            {/* Column footer add button */}
            <button
              onClick={() => onAddTask(col.id)}
              className="flex items-center gap-2 rounded-b-xl px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors border-t border-gray-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}
