import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = 'md',
}) {
  const decrement = () => onChange?.(Math.max(min, value - 1));
  const increment = () => onChange?.(Math.min(max, value + 1));
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const inputWidth = size === 'sm' ? 'w-8' : 'w-10';

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className={`${buttonSize} inline-flex items-center justify-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300`}
        aria-label="Decrease quantity"
      >
        <Minus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
      <input
        type="text"
        value={value}
        readOnly
        aria-label="Quantity"
        className={`${inputWidth} border-x border-slate-100 bg-transparent py-1.5 text-center text-sm font-semibold text-slate-900 outline-none`}
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className={`${buttonSize} inline-flex items-center justify-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300`}
        aria-label="Increase quantity"
      >
        <Plus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
