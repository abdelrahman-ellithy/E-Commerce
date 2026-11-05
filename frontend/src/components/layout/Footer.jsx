import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, ShieldCheck, Truck } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

const shopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'Audio', to: '/shop?category=Audio' },
  { label: 'Wearables', to: '/shop?category=Wearables' },
  { label: 'Workspace', to: '/shop?category=Workspace' },
  { label: 'Home', to: '/shop?category=Home' },
];

const helpLinks = [
  { label: 'Track your order', to: '/orders' },
  { label: 'Shipping & returns', to: '/shop' },
  { label: 'Contact us', href: 'mailto:hello@luma.dev' },
  { label: 'Privacy policy', to: '/shop' },
];

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    toast.success('Thanks for subscribing — welcome to LUMA.');
  };

  return (
    <footer className="mt-auto bg-ink text-slate-300">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink">
                <span className="font-display text-lg font-extrabold leading-none">L</span>
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-ink" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                LUMA<span className="text-brand-400">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Considered essentials for everyday life. Carefully sourced, honestly
              priced, and built to last.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <Truck className="h-3.5 w-3.5 text-brand-300" /> Free shipping $100+
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-300" /> Secure checkout
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Help</h3>
            <ul className="mt-4 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Join the list
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              New arrivals, restocks, and occasional notes. No noise.
            </p>
            {subscribed ? (
              <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                You&apos;re on the list. Talk soon.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4">
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400 focus:bg-white/10"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-ink transition hover:bg-brand-100"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  By subscribing you agree to receive occasional emails from LUMA.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LUMA. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/10 px-2 py-1 font-semibold tracking-wide text-slate-400">
              VISA
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 font-semibold tracking-wide text-slate-400">
              MASTERCARD
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 font-semibold tracking-wide text-slate-400">
              CASH ON DELIVERY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
