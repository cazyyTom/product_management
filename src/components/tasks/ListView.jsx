/**
 * ListView.jsx
 *
 * Flat list/table view of all tasks with sortable columns.
 *
 * Props:
 *   tasks         array
 *   projectId     string
 *   onTaskClick   (taskId) => void
 *   onTaskUpdate  () => void
 *   onAddTask     () => void
 */

import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { STATUS_BADGE, STATUS_LABEL } from "@/utils/taskConstants";
import { updateTask } from "@/api/tasks.api";

export function ListView({ tasks, projectId, onTaskClick, onTaskUpdate, onAddTask }) {
  const [sortBy, setSortBy]   = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    let av = a[sortBy] ?? "";
    let bv = b[sortBy] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-brand-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (tasks.length === 0) {
    return (
      <div className="card">
        <div className="p-12 text-center text-gray-400 text-sm space-y-3">
          <p>No tasks yet.</p>
          <button onClick={onAddTask} className="btn-primary btn-sm">
            + Create your first task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => toggleSort("title")}
              >
                Task <SortIcon field="title" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => toggleSort("status")}
              >
                Status <SortIcon field="status" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Assignee
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => toggleSort("createdAt")}
              >
                Created <SortIcon field="createdAt" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Subtasks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((task) => {
              const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
              const totalSubs     = task.subtasks?.length ?? 0;

              return (
                <tr
                  key={task._id}
                  onClick={() => onTaskClick(task._id)}
                  className="cursor-pointer hover:bg-brand-50/30 transition-colors"
                >
                  {/* Title + description */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[task.status]}>
                      {STATUS_LABEL[task.status]}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                          {task.assignedTo.username.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-gray-700">{task.assignedTo.username}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric",
                    })}
                  </td>

                  {/* Subtask progress */}
                  <td className="px-4 py-3">
                    {totalSubs > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{completedSubs}/{totalSubs}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
