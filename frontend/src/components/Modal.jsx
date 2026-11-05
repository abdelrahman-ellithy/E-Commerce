import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`w-full ${maxWidth} animate-fade-up rounded-2xl border border-slate-200 bg-white shadow-soft`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children && <div className="px-6 py-5">{children}</div>}

        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
