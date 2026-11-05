import { Loader2 } from 'lucide-react';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
