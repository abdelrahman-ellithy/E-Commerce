export default function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
