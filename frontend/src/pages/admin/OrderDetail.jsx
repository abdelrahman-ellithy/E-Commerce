import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../api/admin.js';
import { orderApi } from '../../api/orders.js';
import { getApiError } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Field from '../../components/Field.jsx';
import Modal from '../../components/Modal.jsx';
import OrderStatusTimeline from '../../components/OrderStatusTimeline.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import PriceSummary from '../../components/PriceSummary.jsx';
import SmartImage from '../../components/SmartImage.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { capitalize, formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';

const NEXT_STATUS = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const NEXT_ACTION_LABEL = {
  pending: 'Start processing',
  processing: 'Mark as shipped',
  shipped: 'Mark as delivered',
};

const NEXT_ACTION_DESCRIPTION = {
  pending: 'Move the order into fulfilment and let the customer know it is being prepared.',
  processing: 'Mark the parcel as handed to the carrier.',
  shipped: 'Confirm the customer received the order and close fulfilment.',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
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

  const openStatusModal = () => {
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!order) return;
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    setUpdatingStatus(true);

    try {
      const payload = { status: nextStatus };
      if (statusNote.trim()) payload.note = statusNote.trim();

      const { data } = await adminApi.updateOrderStatus(order._id, payload);
      setOrder(data.data);
      setStatusModalOpen(false);
      setStatusNote('');
      toast.success(data.message || `Order marked as ${nextStatus}.`);
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!order) return;
    setMarkingPaid(true);

    try {
      const { data } = await adminApi.markOrderPaid(order._id);
      setOrder(data.data);
      toast.success(data.message || 'Order marked as paid.');
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);

    try {
      const { data } = await orderApi.cancel(order._id);
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
    return <PageLoader label="Loading order…" />;
  }

  if (error || !order) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="We couldn't load this order"
        description={error || 'The order may have been removed.'}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link to="/admin/orders" className="btn-primary">
              Back to orders
            </Link>
          </div>
        }
      />
    );
  }

  const nextStatus = NEXT_STATUS[order.status];
  const canCancel = ['pending', 'processing'].includes(order.status);
  const canMarkPaid = !order.isPaid && order.status !== 'cancelled';
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const history = [...(order.statusHistory || [])].reverse();

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                {order.orderNumber}
              </h2>
              <StatusBadge status={order.status} />
              {order.isPaid && (
                <span className="badge bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Paid
                </span>
              )}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Placed {formatDateTime(order.createdAt)}
              </span>
              <span>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="font-semibold text-ink">{formatCurrency(order.totalPrice)}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canMarkPaid && (
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={markingPaid}
                className="btn-secondary !py-2 text-xs"
              >
                {markingPaid ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {markingPaid ? 'Saving…' : 'Mark as paid'}
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="btn-secondary !py-2 text-xs text-red-600 hover:border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" /> Cancel order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <OrderStatusTimeline status={order.status} statusHistory={order.statusHistory} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Package className="h-4 w-4 text-brand-600" /> Items
              </h3>
              <span className="text-xs text-slate-500">
                {order.items.length} line{order.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.product} className="flex items-center gap-4 p-4 sm:px-5">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
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

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <UserRound className="h-4 w-4 text-brand-600" /> Customer
              </h3>
              {order.user ? (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold text-ink">{order.user.name}</p>
                  <a
                    href={`mailto:${order.user.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-700"
                  >
                    <Mail className="h-3.5 w-3.5" /> {order.user.email}
                  </a>
                  {order.user.phone && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-3.5 w-3.5" /> {order.user.phone}
                    </p>
                  )}
                  <p className="pt-2 text-xs text-slate-400">
                    Account customer since {formatDate(order.user.createdAt)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  This customer account has been deleted. The shipping details below are still
                  valid for fulfilment.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <MapPin className="h-4 w-4 text-brand-600" /> Shipping address
              </h3>
              <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-ink">{order.shippingAddress.fullName}</p>
                <p className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-3.5 w-3.5" /> {order.shippingAddress.phone}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="text-base font-semibold text-ink">Order activity</h3>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {history.map((entry, index) => (
                  <li key={`${entry.status}-${entry.at}-${index}`} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        entry.status === 'cancelled'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-brand-50 text-brand-600'
                      }`}
                    >
                      {entry.status === 'cancelled' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : entry.status === 'delivered' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : entry.status === 'shipped' ? (
                        <Truck className="h-3.5 w-3.5" />
                      ) : (
                        <Package className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="flex-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {capitalize(entry.status)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(entry.at)}
                        </p>
                      </div>
                      {entry.note && (
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">{entry.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {nextStatus && (
            <section className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                <ArrowRight className="h-4 w-4" /> Next step
              </h3>
              <p className="mt-2 text-xs leading-5 text-brand-800/80">
                {NEXT_ACTION_DESCRIPTION[order.status]}
              </p>
              <button
                type="button"
                onClick={openStatusModal}
                className="btn-primary mt-4 w-full !py-2.5 text-sm"
              >
                {NEXT_ACTION_LABEL[order.status]}
              </button>
              <p className="mt-2 text-center text-[11px] text-brand-800/60">
                Moves the order to {capitalize(nextStatus)}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
              <CreditCard className="h-4 w-4 text-brand-600" /> Payment
            </h3>

            <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Banknote className="h-4 w-4 text-slate-500" />
                {order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod}
              </p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  order.isPaid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {order.isPaid
                  ? `Paid${order.paidAt ? ` on ${formatDate(order.paidAt)}` : ''}`
                  : order.status === 'cancelled'
                    ? 'Payment void — order cancelled'
                    : 'Awaiting payment on delivery'}
              </p>
            </div>

            {canMarkPaid && (
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={markingPaid}
                className="btn-secondary mt-3 w-full !py-2 text-xs"
              >
                {markingPaid ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" />
                )}
                {markingPaid ? 'Saving…' : 'Record payment'}
              </button>
            )}

            <PriceSummary
              className="mt-5"
              itemsPrice={order.itemsPrice}
              shippingPrice={order.shippingPrice}
              taxPrice={order.taxPrice}
              totalPrice={order.totalPrice}
              note="Totals were calculated and validated by the server at checkout."
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="text-base font-semibold text-ink">Fulfilment details</h3>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Order ID</dt>
                <dd className="max-w-[60%] truncate font-mono text-[11px] text-slate-600">
                  {order._id}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Placed</dt>
                <dd className="font-medium text-slate-700">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Delivered</dt>
                <dd className="font-medium text-slate-700">
                  {order.deliveredAt ? formatDate(order.deliveredAt) : '—'}
                </dd>
              </div>
              {order.cancelledAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Cancelled</dt>
                  <dd className="font-medium text-red-600">{formatDate(order.cancelledAt)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>

      <Modal
        open={statusModalOpen}
        onClose={updatingStatus ? undefined : () => setStatusModalOpen(false)}
        title={nextStatus ? NEXT_ACTION_LABEL[order.status] : 'Update order'}
        description={
          nextStatus
            ? `Order ${order.orderNumber} will move from ${order.status} to ${nextStatus}. This is recorded in the order timeline.`
            : ''
        }
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              disabled={updatingStatus}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updatingStatus}
              className="btn-primary"
            >
              {updatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {updatingStatus ? 'Updating…' : 'Confirm update'}
            </button>
          </>
        }
      >
        <Field
          label="Internal note"
          htmlFor="status-note"
          hint="Optional. Shown in the order history to help your team."
        >
          <textarea
            id="status-note"
            value={statusNote}
            onChange={(event) => setStatusNote(event.target.value)}
            rows={3}
            maxLength={200}
            placeholder="e.g. Packed with care and handed to the courier."
            className="input resize-y"
          />
        </Field>
        <p className="mt-2 text-right text-[11px] text-slate-400">
          {statusNote.length}/200
        </p>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this order?"
        description={`Order ${order.orderNumber} will be cancelled and all ${itemCount} item${
          itemCount === 1 ? '' : 's'
        } returned to inventory. This cannot be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}
