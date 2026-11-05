import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CreditCard,
  MapPin,
  Phone,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import OrderStatusTimeline from '../components/OrderStatusTimeline.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import SmartImage from '../components/SmartImage.jsx';
import PageLoader from '../components/PageLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { orderApi } from '../api/orders.js';
import { getApiError } from '../api/client.js';
import {
  capitalize,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError('');

      try {
        const { data } = await orderApi.get(id);
        if (active) setOrder(data.data);
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setOrder(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      const { data } = await orderApi.cancel(id);
      setOrder(data.data);
      setCancelOpen(false);
      toast.success(data.message || 'Order cancelled.');
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <PageLoader label="Loading order…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={AlertCircle}
          title="We couldn't load this order"
          description={error || 'The order may not exist, or it belongs to another account.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="btn-secondary"
              >
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
              <Link to="/orders" className="btn-primary">
                Back to orders
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const canCancel = ['pending', 'processing'].includes(order.status);
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const history = [...(order.statusHistory || [])].reverse();

  return (
    <div className="container-page py-8 lg:py-10">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Placed {formatDateTime(order.createdAt)}
            </span>
            <span>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="btn-secondary !py-2 text-xs text-red-600 hover:border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" /> Cancel order
            </button>
          )}
          <Link to="/shop" className="btn-secondary !py-2 text-xs">
            Shop again
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <OrderStatusTimeline
          status={order.status}
          statusHistory={order.statusHistory}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.product} className="flex items-center gap-4 p-4 sm:p-5">
                  <Link
                    to={`/product/${item.product}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-20"
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${item.product}`}
                      className="block truncate text-sm font-semibold text-ink hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <MapPin className="h-4 w-4 text-brand-600" /> Shipping address
            </h2>
            <div className="mt-4 grid gap-1 text-sm leading-6 text-slate-600 sm:grid-cols-2">
              <p className="font-semibold text-ink">
                {order.shippingAddress.fullName}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500 sm:justify-end">
                <Phone className="h-3.5 w-3.5" />
                {order.shippingAddress.phone}
              </p>
              <p className="sm:col-span-2">{order.shippingAddress.address}</p>
              <p className="sm:col-span-2">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="sm:col-span-2">{order.shippingAddress.country}</p>
            </div>
          </section>

          {history.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-ink">Order activity</h2>
              <ul className="mt-4 space-y-3">
                {history.map((entry, index) => (
                  <li key={`${entry.status}-${index}`} className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        entry.status === 'cancelled' ? 'bg-red-500' : 'bg-brand-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">
                          {capitalize(entry.status)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(entry.at)}
                        </p>
                      </div>
                      {entry.note && (
                        <p className="text-xs leading-5 text-slate-500">{entry.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <CreditCard className="h-4 w-4 text-brand-600" /> Payment
            </h2>

            <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Banknote className="h-4 w-4 text-slate-500" />
                {order.paymentMethod === 'cod'
                  ? 'Cash on delivery'
                  : order.paymentMethod}
              </p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  order.isPaid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {order.isPaid
                  ? `Paid${order.paidAt ? ` on ${formatDate(order.paidAt)}` : ''}`
                  : 'Payment due on delivery'}
              </p>
            </div>

            <PriceSummary
              className="mt-5"
              itemsPrice={order.itemsPrice}
              shippingPrice={order.shippingPrice}
              taxPrice={order.taxPrice}
              totalPrice={order.totalPrice}
              note="Totals were calculated and validated by the server at checkout."
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink">Need help?</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Questions about this order? Email{' '}
              <a
                href="mailto:hello@luma.dev"
                className="font-semibold text-brand-700 hover:text-brand-800"
              >
                hello@luma.dev
              </a>{' '}
              and include your order number.
            </p>
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
              Order placed {formatDate(order.createdAt)}
            </p>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this order?"
        description={`Order ${order.orderNumber} will be cancelled and the items returned to inventory. This cannot be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}
