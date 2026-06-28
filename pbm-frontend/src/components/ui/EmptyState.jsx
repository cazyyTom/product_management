/**
 * EmptyState.jsx
 * Friendly placeholder shown when a list has no items.
 *
 * Props:
 *   icon      ReactNode  (SVG)
 *   title     string
 *   message   string
 *   action    ReactNode  (optional CTA button)
 */
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center px-4">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-base font-medium text-gray-700">{title}</p>
      {message && <p className="max-w-xs text-sm text-gray-400">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
