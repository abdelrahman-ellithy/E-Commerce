import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { adminApi } from '../../api/admin.js';
import { getApiError } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import SmartImage from '../../components/SmartImage.jsx';
import { capitalize, formatCurrency, formatDate } from '../../utils/format.js';

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_BAR_TONES = {
  pending: 'bg-amber-400',
  processing: 'bg-sky-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-400',
};

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function buildRevenueSeries(rows = []) {
  const byKey = new Map(
    rows.map((row) => [`${row.year}-${row.month}`, row.revenue || 0])
  );
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    return {
      key,
      label: MONTH_SHORT[date.getMonth()],
      fullLabel: `${MONTH_SHORT[date.getMonth()]} ${year}`,
      revenue: Number(byKey.get(key)) || 0,
    };
  });
}

function StatCard({ label, value, hint, icon: Icon, tone, to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {value}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
        {hint}
        {to && <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />}
      </p>
    </>
  );

  const className =
    'block rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300';

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError('');

      try {
        const { data } = await adminApi.getStats();
        if (active) setStats(data.data);
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setStats(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const revenueSeries = useMemo(
    () => buildRevenueSeries(stats?.revenueByMonth),
    [stats?.revenueByMonth]
  );

  if (loading) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
        <h2 className="mt-3 text-base font-semibold text-red-800">
          We couldn&apos;t load the dashboard
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-red-700">
          {error || 'The dashboard data is unavailable right now.'}
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="btn-secondary mt-5 !py-2 text-xs"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }

  const { totals, statusBreakdown = {}, lowStock = [], recentOrders = [] } = stats;
  const totalOrders = totals.orders || 0;
  const maxRevenue = Math.max(...revenueSeries.map((item) => item.revenue), 1);
  const revenueWindow = revenueSeries.reduce((sum, item) => sum + item.revenue, 0);
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Store overview
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Here&apos;s how LUMA is performing across orders, inventory, and customers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products/new" className="btn-primary !py-2 text-xs">
            <Plus className="h-4 w-4" /> New product
          </Link>
          <Link to="/admin/orders" className="btn-secondary !py-2 text-xs">
            <Receipt className="h-4 w-4" /> Manage orders
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(totals.revenue)}
          hint="Excludes cancelled orders"
          icon={CircleDollarSign}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Orders"
          value={totalOrders.toLocaleString()}
          hint="Across every status"
          icon={ShoppingBag}
          tone="bg-brand-50 text-brand-600"
          to="/admin/orders"
        />
        <StatCard
          label="Active products"
          value={totals.products.toLocaleString()}
          hint="Visible in the storefront"
          icon={Boxes}
          tone="bg-violet-50 text-violet-600"
          to="/admin/products"
        />
        <StatCard
          label="Customers"
          value={totals.users.toLocaleString()}
          hint="Registered accounts"
          icon={Users}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <TrendingUp className="h-4 w-4 text-brand-600" /> Revenue
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Last six months of non-cancelled orders
              </p>
            </div>
            <p className="text-right">
              <span className="block font-display text-xl font-bold text-ink">
                {formatCurrency(revenueWindow)}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                6-month total
              </span>
            </p>
          </div>

          <div className="mt-6 flex h-48 items-end gap-2 sm:gap-4">
            {revenueSeries.map((item) => {
              const height = item.revenue
                ? Math.max(6, Math.round((item.revenue / maxRevenue) * 100))
                : 2;

              return (
                <div key={item.key} className="group flex h-full flex-1 flex-col justify-end">
                  <div className="relative flex flex-1 items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        item.revenue ? 'bg-brand-500 group-hover:bg-brand-600' : 'bg-slate-200'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.fullLabel}: ${formatCurrency(item.revenue)}`}
                    >
                      <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-base font-semibold text-ink">Orders by status</h3>
          <p className="mt-1 text-xs text-slate-500">
            {totalOrders === 0
              ? 'No orders have been placed yet.'
              : `${totalOrders.toLocaleString()} order${totalOrders === 1 ? '' : 's'} in total`}
          </p>

          <div className="mt-5 space-y-4">
            {STATUS_ORDER.map((status) => {
              const count = statusBreakdown[status] || 0;
              const width = totalOrders
                ? Math.max(count ? 3 : 0, Math.round((count / totalOrders) * 100))
                : 0;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-600">
                      {capitalize(status)}
                    </span>
                    <span className="text-sm font-semibold text-ink">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_TONES[status]}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/admin/orders"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Review all orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-ink">Recent orders</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                The five most recent purchases
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <ShoppingBag className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">No orders yet</p>
              <p className="mt-1 text-xs text-slate-400">
                New orders will appear here as customers check out.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/admin/orders/${order._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.user?.name || 'Deleted customer'} ·{' '}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <StatusBadge status={order.status} className="mt-1 !px-2 !py-0.5 !text-[10px]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div>
              <h3 className="text-base font-semibold text-ink">Low stock</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Active products with five units or fewer
              </p>
            </div>
          </div>

          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <Package className="h-8 w-8 text-emerald-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                Inventory looks healthy
              </p>
              <p className="mt-1 text-xs text-slate-400">
                No active product is running low on stock.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.map((product) => (
                <li key={product._id}>
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <SmartImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        product.stock === 0
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {product.stock === 0 ? 'Sold out' : `${product.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
