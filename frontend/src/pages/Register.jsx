import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getApiError, getFieldErrors } from '../api/client.js';
import Field from '../components/Field.jsx';
import SmartImage from '../components/SmartImage.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = 'Include at least one letter and one number.';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const newUser = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(`Welcome to LUMA, ${newUser.name.split(' ')[0]}.`);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
      setFieldErrors(getFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-white">
              L
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              LUMA<span className="text-brand-600">.</span>
            </span>
          </Link>
          <Link to="/login" className="btn-secondary !px-3 !py-2 text-xs">
            Sign in
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Sparkles className="h-3.5 w-3.5" /> Join LUMA
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
                Create your account
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save your details, track orders, and check out in seconds.
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Full name" htmlFor="name" required error={fieldErrors.name}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className="input"
                />
              </Field>

              <Field label="Email address" htmlFor="email" required error={fieldErrors.email}>
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

              <Field
                label="Password"
                htmlFor="password"
                required
                error={fieldErrors.password}
                hint="At least 8 characters, including a letter and a number."
              >
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
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

              <Field
                label="Confirm password"
                htmlFor="confirmPassword"
                required
                error={fieldErrors.confirmPassword}
              >
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="input"
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                By creating an account you agree to our{' '}
                <span className="font-medium text-slate-700">Terms of Service</span> and{' '}
                <span className="font-medium text-slate-700">Privacy Policy</span>.
              </p>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Passwords are hashed with bcrypt. We never store them in plain text.
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
          alt="A curated collection of everyday essentials"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 max-w-lg p-10 xl:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            Considered essentials
          </p>
          <p className="mt-4 font-display text-3xl font-semibold leading-tight text-white xl:text-4xl">
            Fewer, better things for the everyday.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/70">
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Free shipping over $100
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              30-day returns
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Secure checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
