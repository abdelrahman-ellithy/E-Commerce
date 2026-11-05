import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(page, pages) {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  const result = [1];

  if (page > 3) result.push('ellipsis-start');

  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  for (let value = start; value <= end; value += 1) {
    result.push(value);
  }

  if (page < pages - 2) result.push('ellipsis-end');

  result.push(pages);

  return result;
}

export default function Pagination({ page = 1, pages = 1, onChange, className = '' }) {
  if (pages <= 1) return null;

  const pageNumbers = getPageNumbers(page, pages);

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="px-1 text-sm text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
              item === page
                ? 'border-ink bg-ink text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
