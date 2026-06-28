/**
 * ProjectCard.jsx
 * Card displayed in the project dashboard grid.
 *
 * Props:
 *   project     object
 *   onEdit      () => void
 *   onDelete    () => void
 */

import { Link } from "react-router-dom";

const statusStyles = {
  planning: "badge bg-yellow-100 text-yellow-700",
  ongoing:  "badge bg-blue-100 text-blue-700",
  "on hold":"badge bg-orange-100 text-orange-700",
  finished: "badge bg-green-100 text-green-700",
};

// Deterministic colour from project name for the card accent bar
const ACCENT_COLOURS = [
  "bg-brand-500","bg-pink-500","bg-emerald-500",
  "bg-amber-500","bg-sky-500","bg-violet-500","bg-rose-500","bg-teal-500",
];
function accentColour(name = "") {
  const idx = name.charCodeAt(0) % ACCENT_COLOURS.length;
  return ACCENT_COLOURS[idx];
}

export function ProjectCard({ project, onEdit, onDelete }) {
  const {
    _id, name, description, status,
    createdAt, members,
  } = project;

  const badgeCls = statusStyles[status] ?? "badge bg-gray-100 text-gray-700";

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Accent bar */}
      <div className={`h-1.5 w-full rounded-t-xl ${accentColour(name)}`} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/projects/${_id}`}
            className="flex-1 text-base font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
          >
            {name}
          </Link>

          {/* Action menu */}
          <div className="relative flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Edit project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status badge */}
        <span className={`mt-2 self-start ${badgeCls}`}>
          {status ?? "planning"}
        </span>

        {/* Description */}
        {description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-400">
          <span>
            {members?.length ?? 0} member{members?.length !== 1 ? "s" : ""}
          </span>
          <span>
            {createdAt
              ? new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
              : ""}
          </span>
        </div>

        {/* View button */}
        <Link
          to={`/projects/${_id}`}
          className="btn-secondary btn-sm mt-3 w-full justify-center"
        >
          Open project →
        </Link>
      </div>
    </div>
  );
}
