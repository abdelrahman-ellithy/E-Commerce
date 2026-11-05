import { Check, X } from 'lucide-react';
import { ORDER_STATUS_FLOW, capitalize, formatDateTime } from '../utils/format.js';

export default function OrderStatusTimeline({ status, statusHistory = [] }) {
  const history = new Map(
    (statusHistory || []).map((entry) => [entry.status, entry])
  );

  if (status === 'cancelled') {
    const cancelled = history.get('cancelled');
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-red-700">Order cancelled</p>
          <p className="mt-0.5 text-xs text-red-600">
            {cancelled?.at
              ? `Cancelled on ${formatDateTime(cancelled.at)}.`
              : 'This order was cancelled.'}{' '}
            Any reserved stock has been returned to inventory.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[480px] items-start">
        {ORDER_STATUS_FLOW.map((step, index) => {
          const complete = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const entry = history.get(step);

          return (
            <li key={step} className="flex flex-1 flex-col">
              <div className="flex items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    complete
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {complete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < ORDER_STATUS_FLOW.length - 1 && (
                  <span
                    className={`mx-2 h-0.5 flex-1 rounded-full ${
                      index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <div className="mt-2 pr-2">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-ink'
                      : complete
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                  }`}
                >
                  {capitalize(step)}
                </p>
                {entry?.at && (
                  <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                    {formatDateTime(entry.at)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
