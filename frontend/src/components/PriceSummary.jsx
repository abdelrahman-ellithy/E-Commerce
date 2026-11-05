import { formatCurrency } from '../utils/format.js';

export default function PriceSummary({
  itemsPrice = 0,
  shippingPrice = 0,
  taxPrice = 0,
  totalPrice = 0,
  note,
  className = '',
}) {
  return (
    <div className={`space-y-3 text-sm ${className}`}>
      <div className="flex items-center justify-between text-slate-600">
        <span>Subtotal</span>
        <span className="font-medium text-slate-900">{formatCurrency(itemsPrice)}</span>
      </div>
      <div className="flex items-center justify-between text-slate-600">
        <span>Shipping</span>
        <span className="font-medium text-slate-900">
          {shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}
        </span>
      </div>
      <div className="flex items-center justify-between text-slate-600">
        <span>Estimated tax</span>
        <span className="font-medium text-slate-900">{formatCurrency(taxPrice)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
        <span className="font-semibold text-ink">Total</span>
        <span className="font-display text-xl font-bold text-ink">
          {formatCurrency(totalPrice)}
        </span>
      </div>
      {note && <p className="text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}
