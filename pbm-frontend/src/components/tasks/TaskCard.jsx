/**
 * TaskCard.jsx
 *
 * Compact task card used in both the Kanban and List views.
 *
 * Props:
 *   task        object
 *   onClick     () => void   – open detail modal
 *   onStatusChange (taskId, newStatus) => void
 *   projectId   string
 */

import { useState } from "react";
import { STATUS_BADGE, STATUS_LABEL, TASK_STATUS_LIST } from "@/utils/taskConstants";
import { updateTask } from "@/api/tasks.api";
import { Spinner } from "@/components/ui/Spinner";

export function TaskCard({ task, onClick, onStatusChange, projectId }) {
  const [changingStatus, setChangingStatus] = useState(false);

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    setChangingStatus(true);
    try {
      await updateTask(projectId, task._id, { status: newStatus });
      onStatusChange(task._id, newStatus);
    } finally {
      setChangingStatus(false);
    }
  };

  const completedSubs  = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
  const totalSubs      = task.subtasks?.length ?? 0;
  const hasAttachments = (task.attachments?.length ?? 0) > 0;

  return (
    <div
      onClick={onClick}
      className="group card cursor-pointer p-4 hover:shadow-md hover:border-brand-200 transition-all duration-150 active:scale-[0.99]"
    >
      {/* Title */}
      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
        {task.title}
      </p>

      {/* Description snippet */}
      {task.description && (
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Status quick-change */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {changingStatus ? (
            <Spinner size="sm" className="text-brand-500" />
          ) : (
            <select
              value={task.status}
              onChange={handleStatusChange}
              className={`${STATUS_BADGE[task.status]} border-0 cursor-pointer bg-transparent pr-1 py-0 text-xs font-medium focus:ring-0 focus:outline-none`}
              title="Change status"
            >
              {TASK_STATUS_LIST.map((s) => (
                <option key={s} value={s} className="bg-white text-gray-900">
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Assignee */}
        {task.assignedTo && (
          <span
            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            title={task.assignedTo.username}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-200 text-[9px] font-bold text-brand-800">
              {task.assignedTo.username.slice(0, 1).toUpperCase()}
            </span>
            {task.assignedTo.username}
          </span>
        )}

        {/* Subtask progress */}
        {totalSubs > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {completedSubs}/{totalSubs}
          </span>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {task.attachments.length}
          </span>
        )}
      </div>
    </div>
  );
}
