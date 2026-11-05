import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
];

function getPageTitle(pathname) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.includes('/products')) return 'Products';
  if (pathname.includes('/orders')) return 'Orders';
  return 'Admin';
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-slate-300">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink">
            <span className="font-display text-lg font-extrabold leading-none">L</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-ink" />
          </span>
          <div>
            <span className="block font-display text-lg font-extrabold leading-none tracking-tight text-white">
              LUMA<span className="text-brand-400">.</span>
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Admin studio
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Admin navigation">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Manage
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Storefront
        </p>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <Store className="h-[18px] w-[18px]" aria-hidden="true" />
          View store
        </Link>
        <Link
          to="/shop"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
          Continue shopping
        </Link>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            {initials || 'A'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Admin
              </p>
              <h1 className="text-lg font-semibold leading-tight text-ink">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/"
                className="btn-secondary !px-3 !py-2 text-xs"
                title="Open storefront"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                {initials || 'A'}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
