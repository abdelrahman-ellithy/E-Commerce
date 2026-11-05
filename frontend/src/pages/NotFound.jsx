import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <SearchX className="h-9 w-9" aria-hidden="true" />
        </span>

        <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.24em] text-brand-700">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          This page wandered off.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          The link may be broken, or the product might no longer be available. Let&apos;s
          get you back to something worth browsing.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link to="/shop" className="btn-secondary">
            <Compass className="h-4 w-4" /> Browse the shop
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ArrowLeft className="h-3.5 w-3.5" />
          Use the navigation above to keep exploring LUMA.
        </p>
      </div>
    </div>
  );
}
