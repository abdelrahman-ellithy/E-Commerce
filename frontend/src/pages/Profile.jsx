import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Package,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authApi } from '../api/auth.js';
import { getApiError, getFieldErrors } from '../api/client.js';
import Field from '../components/Field.jsx';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileErrors({});

    const errors = {};
    if (profile.name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (profile.phone && !/^[+\d][\d\s().-]*$/.test(profile.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setSavingProfile(true);

    try {
      const { data } = await authApi.updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      });

      updateUser(data.user);
      setProfile({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
      });
      toast.success('Profile updated.');
    } catch (requestError) {
      setProfileError(getApiError(requestError));
      setProfileErrors(getFieldErrors(requestError));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordErrors({});

    const errors = {};

    if (!passwords.currentPassword) {
      errors.currentPassword = 'Enter your current password.';
    }
    if (passwords.newPassword.length < 8) {
      errors.newPassword = 'Use at least 8 characters.';
    } else if (!/[A-Za-z]/.test(passwords.newPassword) || !/\d/.test(passwords.newPassword)) {
      errors.newPassword = 'Include at least one letter and one number.';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSavingPassword(true);

    try {
      const { data } = await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(data.message || 'Password updated.');
    } catch (requestError) {
      setPasswordError(getApiError(requestError));
      setPasswordErrors(getFieldErrors(requestError));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Account</span>
      </nav>

      <div className="mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Manage your details, password, and account preferences.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 font-display text-2xl font-bold text-brand-800">
              {initials || 'U'}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">{user?.name}</h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">{user?.email}</p>
            <div className="mt-3 flex justify-center gap-2">
              <span className="badge bg-slate-100 text-slate-600">
                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
              <span className="badge bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Active
              </span>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <Link
              to="/orders"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink"
            >
              <Package className="h-4 w-4" /> My orders
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Profile details</h2>
                <p className="text-xs text-slate-500">
                  Used for your account and order updates.
                </p>
              </div>
            </div>

            {profileError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
              <Field
                label="Full name"
                htmlFor="profile-name"
                required
                error={profileErrors.name}
              >
                <input
                  id="profile-name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  autoComplete="name"
                  className="input"
                />
              </Field>

              <Field
                label="Phone"
                htmlFor="profile-phone"
                error={profileErrors.phone}
                hint="Optional, used for delivery questions."
              >
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  autoComplete="tel"
                  placeholder="+1 555 010 2030"
                  className="input"
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="profile-email"
                required
                error={profileErrors.email}
                className="sm:col-span-2"
              >
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  autoComplete="email"
                  className="input"
                />
              </Field>

              <div className="sm:col-span-2">
                <button type="submit" disabled={savingProfile} className="btn-primary">
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Change password</h2>
                <p className="text-xs text-slate-500">
                  Use a unique password you don&apos;t use anywhere else.
                </p>
              </div>
            </div>

            {passwordError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
              <Field
                label="Current password"
                htmlFor="currentPassword"
                required
                error={passwordErrors.currentPassword}
                className="sm:col-span-2"
              >
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  className="input"
                />
              </Field>

              <Field
                label="New password"
                htmlFor="newPassword"
                required
                error={passwordErrors.newPassword}
              >
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="input"
                />
              </Field>

              <Field
                label="Confirm new password"
                htmlFor="confirmPassword"
                required
                error={passwordErrors.confirmPassword}
              >
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="input"
                />
              </Field>

              <div className="sm:col-span-2">
                <button type="submit" disabled={savingPassword} className="btn-secondary">
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
