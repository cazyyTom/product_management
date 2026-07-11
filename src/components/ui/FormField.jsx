/**
 * FormField.jsx
 * Label + input + error message in one composable unit.
 */
export function FormField({
  label,
  id,
  error,
  className = "",
  inputClassName = "",
  children,
  ...inputProps
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      {children ? (
        children
      ) : (
        <input
          id={id}
          className={`input ${error ? "input-error" : ""} ${inputClassName}`}
          {...inputProps}
        />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
