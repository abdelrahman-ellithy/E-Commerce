import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Package,
  PackageSearch,
  XCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import SmartImage from '../components/SmartImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { orderApi } from '../api/orders.js';
import { getApiError } from '../api/client.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

const STATUS_TABS = [
  { value: '', label: 'All orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const params = { page, limit: 10 };
        if (status) params.status = status;

        const { data } = await orderApi.mine(params);
        if (!active) return;

        setOrders(data.data || []);
        setPagination(data.pagination || null);
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setOrders([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [page, status, reloadKey]);

  const handleTabChange = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      const { data } = await orderApi.cancel(cancelTarget._id);
      toast.success(data.message || 'Order cancelled.');
      setCancelTarget(null);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Orders</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Your orders
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track deliveries, review past purchases, and cancel before dispatch.
          </p>
        </div>
        <Link to="/shop" className="btn-secondary">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              status === tab.value
                ? 'border-ink text-ink'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-6 w-24 rounded-full" />
                </div>
                <div className="mt-5 flex gap-3">
                  <div className="skeleton h-16 w-16 rounded-xl" />
                  <div className="skeleton h-16 w-16 rounded-xl" />
                  <div className="skeleton h-16 w-16 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="btn-secondary mt-4 !py-2 text-xs"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={status ? `No ${status} orders` : 'No orders yet'}
            description={
              status
                ? 'Try another status tab to see the rest of your order history.'
                : 'Once you place an order, it will appear here with live status updates.'
            }
            action={
              <Link to="/shop" className="btn-primary">
                Find something you love
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const canCancel = ['pending', 'processing'].includes(order.status);
              const itemCount = order.items.reduce(
                (total, item) => total + item.quantity,
                0
              );

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-sm font-bold text-ink">{order.orderNumber}</p>
                      <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.product}
                            className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-slate-100"
                          >
                            <SmartImage
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Total{' '}
                          <span className="font-semibold text-ink">
                            {formatCurrency(order.totalPrice)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(order)}
                          className="btn-ghost !px-3 !py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> Cancel
                        </button>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-secondary !px-3.5 !py-2 text-xs"
                      >
                        View details <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && pagination && pagination.pages > 1 && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onChange={setPage}
            className="mt-8"
          />
        )}
      </div>

      {orders.length === 0 && !loading && !error && !status && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Package className="h-4 w-4" /> Orders are stored securely against your account.
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this order?"
        description={
          cancelTarget
            ? `Order ${cancelTarget.orderNumber} will be cancelled and the reserved items returned to inventory. This cannot be undone.`
            : ''
        }
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
