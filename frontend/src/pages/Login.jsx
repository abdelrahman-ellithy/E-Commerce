import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getApiError } from '../api/client.js';
import Field from '../components/Field.jsx';
import SmartImage from '../components/SmartImage.jsx';

const DEMO_ACCOUNTS = [
  {
    label: 'Customer demo',
    email: 'demo@luma.dev',
    password: 'Demo123!',
  },
  {
    label: 'Admin demo',
    email: 'admin@luma.dev',
    password: 'Admin123!',
  },
];

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const signedInUser = await login({
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(`Welcome back, ${signedInUser.name.split(' ')[0]}.`);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between">
        <SmartImage
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
          alt="A considered retail space"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />

        <div className="relative p-10 xl:p-14">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink">
              <span className="font-display text-xl font-extrabold leading-none">L</span>
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-ink" />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white">
              LUMA<span className="text-brand-400">.</span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-lg p-10 xl:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            Welcome back
          </p>
          <blockquote className="mt-4 font-display text-3xl font-semibold leading-tight text-white xl:text-4xl">
            &ldquo;The kind of store you return to because everything just
            works.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
              MK
            </span>
            <span>Maya K. · Verified customer</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-white">
              L
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              LUMA<span className="text-brand-600">.</span>
            </span>
          </Link>
          <Link to="/register" className="btn-secondary !px-3 !py-2 text-xs">
            Create account
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <LockKeyhole className="h-3.5 w-3.5" /> Secure sign in
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access your orders, saved details, and a faster checkout.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Field label="Email address" htmlFor="email" required>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                />
              </Field>

              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Demo accounts
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemo(account)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Seeded credentials — run <code className="rounded bg-white px-1">npm run seed</code>
              </p>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              New to LUMA?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
