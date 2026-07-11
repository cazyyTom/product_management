/**
 * NoteCard.jsx
 * Compact card displayed in the NoteGrid.
 *
 * Props:
 *   note      object
 *   onClick   () => void  – open NoteEditor
 *   onDelete  () => void
 */

// Deterministic pastel colour from note title
const CARD_COLOURS = [
  "bg-yellow-50  border-yellow-200",
  "bg-blue-50    border-blue-200",
  "bg-green-50   border-green-200",
  "bg-pink-50    border-pink-200",
  "bg-purple-50  border-purple-200",
  "bg-orange-50  border-orange-200",
  "bg-teal-50    border-teal-200",
  "bg-rose-50    border-rose-200",
];

function cardColour(title = "") {
  return CARD_COLOURS[title.charCodeAt(0) % CARD_COLOURS.length];
}

export function NoteCard({ note, onClick, onDelete }) {
  const { title, content, createdBy, createdAt, updatedAt } = note;
  const colourCls = cardColour(title);
  const displayDate = updatedAt ?? createdAt;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border-2 p-4 cursor-pointer transition-all duration-150 hover:shadow-md active:scale-[0.99] ${colourCls}`}
      onClick={onClick}
    >
      {/* Delete button — shown on hover */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 opacity-0 hover:bg-black/10 hover:text-red-500 group-hover:opacity-100 transition-all"
        aria-label="Delete note"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Title */}
      <h3 className="pr-6 text-sm font-semibold text-gray-900 line-clamp-2">
        {title || <span className="italic text-gray-400">Untitled</span>}
      </h3>

      {/* Content preview */}
      {content && (
        <p className="mt-2 flex-1 text-xs text-gray-600 line-clamp-5 whitespace-pre-wrap">
          {content}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
        <span>{createdBy?.username ?? "—"}</span>
        <span>
          {new Date(displayDate).toLocaleDateString(undefined, {
            month: "short", day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
