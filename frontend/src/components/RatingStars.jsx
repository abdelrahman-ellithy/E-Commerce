import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  count,
  size = 14,
  showValue = false,
  className = '',
}) {
  const filled = Math.round(Number(rating) || 0);

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      aria-label={`Rated ${Number(rating).toFixed(1)} out of 5`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            style={{ width: size, height: size }}
            className={
              value <= filled
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-slate-300'
            }
            aria-hidden="true"
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-slate-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-500">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
