import { STATUS_STYLES, capitalize } from '../utils/format.js';

export default function StatusBadge({ status, showDot = true, className = '' }) {
  const tone = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';

  return (
    <span className={`badge ${tone} ${className}`}>
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {capitalize(status || 'unknown')}
    </span>
  );
}
