/**
 * taskConstants.js
 * Shared enums, labels, and style maps for task status.
 */

export const TASK_STATUS = {
  TODO:        "todo",
  IN_PROGRESS: "in_progress",
  DONE:        "done",
};

export const TASK_STATUS_LIST = [
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
];

export const STATUS_LABEL = {
  todo:        "To Do",
  in_progress: "In Progress",
  done:        "Done",
};

export const STATUS_BADGE = {
  todo:        "badge-todo",
  in_progress: "badge-progress",
  done:        "badge-done",
};

/** Kanban column definitions — order matters */
export const KANBAN_COLUMNS = [
  {
    id:    TASK_STATUS.TODO,
    label: "To Do",
    color: "border-gray-300",
    headerBg: "bg-gray-50",
    dot: "bg-gray-400",
  },
  {
    id:    TASK_STATUS.IN_PROGRESS,
    label: "In Progress",
    color: "border-blue-300",
    headerBg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  {
    id:    TASK_STATUS.DONE,
    label: "Done",
    color: "border-green-300",
    headerBg: "bg-green-50",
    dot: "bg-green-500",
  },
];
