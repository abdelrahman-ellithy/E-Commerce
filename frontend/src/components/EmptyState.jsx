export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
