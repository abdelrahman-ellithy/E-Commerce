import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/shop?keyword=${encodeURIComponent(term)}` : '/shop');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-100 text-ink'
        : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
    }`;

  return (
    <>
      <div className="bg-ink text-white">
        <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <Package className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
          <span>Free shipping on orders over $100</span>
          <span className="hidden text-white/40 sm:inline">·</span>
          <span className="hidden text-white/70 sm:inline">30-day returns</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container-page">
          <div className="flex h-16 items-center gap-3 lg:h-[72px]">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                <span className="font-display text-lg font-extrabold leading-none">L</span>
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-white" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                LUMA<span className="text-brand-600">.</span>
              </span>
            </Link>

            <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              <NavLink to="/shop" className={navLinkClass}>
                Shop
              </NavLink>
              <Link
                to="/shop?sort=newest"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-ink"
              >
                New arrivals
              </Link>
              {user && (
                <NavLink to="/orders" className={navLinkClass}>
                  My orders
                </NavLink>
              )}
            </nav>

            <form
              onSubmit={handleSearch}
              className="relative ml-auto hidden w-full max-w-xs md:block lg:max-w-sm"
              role="search"
            >
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full rounded-full border border-transparent bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </form>

            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <Link
                to="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                aria-label={`Cart with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden lg:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-slate-100"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                      {initials || 'U'}
                    </span>
                    <span className="max-w-24 truncate text-sm font-medium text-slate-700">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        menuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-soft"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        to="/orders"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                      >
                        <Package className="h-4 w-4" /> My orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <Link to="/login" className="btn-ghost !px-3">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary !py-2">
                    Create account
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 lg:hidden"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="container-page space-y-4 py-4">
              <form onSubmit={handleSearch} className="relative" role="search">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </form>

              <nav className="grid gap-1" aria-label="Mobile navigation">
                <Link
                  to="/shop"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Shop all
                </Link>
                <Link
                  to="/shop?sort=newest"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  New arrivals
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      My orders
                    </Link>
                    <Link
                      to="/profile"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link to="/login" className="btn-secondary">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Create account
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
