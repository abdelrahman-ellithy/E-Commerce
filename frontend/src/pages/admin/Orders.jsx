import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Inbox,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/admin.js';
import { getApiError } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const params = { page, limit: 15 };
        if (status) params.status = status;
        if (keyword) params.keyword = keyword;

        const { data } = await adminApi.getOrders(params);
        if (!active) return;

        setOrders(data.data || []);
        setPagination(data.pagination || null);
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setOrders([]);
          setPagination(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [page, status, keyword, reloadKey]);

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setStatus('');
    setPage(1);
  };

  const hasFilters = Boolean(keyword || status);
  const total = pagination?.total ?? orders.length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Fulfilment
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
          Orders
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Review purchases, move orders through fulfilment, and record cash payments.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Search by order number, e.g. LM-…"
                className="input !pl-10"
                maxLength={60}
                aria-label="Search orders"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary !py-2.5 text-xs">
                Search
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-ghost !py-2.5 text-xs"
                >
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
            </div>
          </form>

          <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value || 'all'}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  status === tab.value
                    ? 'bg-ink text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
                <div className="skeleton h-7 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-7 w-7 text-red-500" />
            <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="btn-secondary mt-4 !py-2 text-xs"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title={hasFilters ? 'No matching orders' : 'No orders yet'}
              description={
                hasFilters
                  ? 'Try a different order number or status tab.'
                  : 'Orders placed by customers will show up here for fulfilment.'
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={clearFilters} className="btn-secondary">
                    Clear filters
                  </button>
                ) : (
                  <Link to="/admin/products" className="btn-primary">
                    Manage products
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Order
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Items
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Payment
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const itemCount = order.items.reduce(
                      (quantity, item) => quantity + item.quantity,
                      0
                    );

                    return (
                      <tr key={order._id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="font-semibold text-ink hover:text-brand-700"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-700">
                            {order.user?.name || 'Deleted customer'}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {order.user?.email || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-ink">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`badge ${
                              order.isPaid
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.status === 'cancelled'
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.isPaid ? (
                              <>
                                <CreditCard className="h-3 w-3" /> Paid
                              </>
                            ) : order.status === 'cancelled' ? (
                              'Void'
                            ) : (
                              'Unpaid'
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                          >
                            View <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <ShoppingBag className="h-4 w-4" />
                Showing{' '}
                <span className="font-semibold text-slate-700">{orders.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{total}</span> orders
              </p>
              <Pagination
                page={pagination?.page || page}
                pages={pagination?.pages || 1}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
