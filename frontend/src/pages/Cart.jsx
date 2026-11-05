import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Minus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Plus,
} from 'lucide-react';
import SmartImage from '../components/SmartImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency } from '../utils/format.js';
import { FREE_SHIPPING_THRESHOLD } from '../utils/pricing.js';

export default function Cart() {
  const {
    items,
    itemCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const toast = useToast();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - itemsPrice);
  const progress = Math.min(100, (itemsPrice / FREE_SHIPPING_THRESHOLD) * 100);

  const handleRemove = (item) => {
    removeItem(item._id);
    toast.info(`${item.name} removed from your cart.`);
  };

  const handleClear = () => {
    clearCart();
    setConfirmClearOpen(false);
    toast.info('Your cart is now empty.');
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the collection and add a few considered essentials. Your cart will be waiting here."
          action={
            <Link to="/shop" className="btn-primary">
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Cart</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Your cart
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        <Link to="/shop" className="btn-link">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {items.map((item, index) => (
              <div
                key={item._id}
                className={`flex gap-4 p-4 sm:p-5 ${
                  index > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <Link
                  to={`/product/${item._id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.brand && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {item.brand}
                        </p>
                      )}
                      <Link
                        to={`/product/${item._id}`}
                        className="mt-0.5 block truncate text-sm font-semibold text-ink hover:text-brand-700 sm:text-base"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 border-x border-slate-100 py-1.5 text-center text-sm font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.stock > 0 && item.quantity >= item.stock}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.stock > 0 && item.quantity >= item.stock && (
                      <span className="text-[11px] font-medium text-amber-700">
                        Max available quantity
                      </span>
                    )}

                    <p className="font-display text-base font-bold text-ink">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="text-xs font-semibold text-slate-500 transition hover:text-red-600"
            >
              Clear cart
            </button>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-brand-600" /> Free over $100
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-brand-600" /> 30-day returns
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink">Order summary</h2>

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                {amountToFreeShipping > 0 ? (
                  <>
                    <p className="text-xs font-medium text-slate-600">
                      You&apos;re{' '}
                      <span className="font-bold text-ink">
                        {formatCurrency(amountToFreeShipping)}
                      </span>{' '}
                      away from free shipping.
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-emerald-700">
                    Free shipping unlocked. Nice.
                  </p>
                )}
              </div>

              <PriceSummary
                className="mt-5"
                itemsPrice={itemsPrice}
                shippingPrice={shippingPrice}
                taxPrice={taxPrice}
                totalPrice={totalPrice}
                note="Shipping and tax are confirmed on the server when your order is placed."
              />

              <Link to="/checkout" className="btn-primary mt-5 w-full !py-3">
                Continue to checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secure checkout, protected by JWT
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-ink">Payment</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Cash on delivery is available at checkout. Pay when your order
                arrives — no card details required.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold tracking-wide text-slate-500">
                <span className="rounded border border-slate-200 px-2 py-1">COD</span>
                <span className="rounded border border-slate-200 px-2 py-1">VISA</span>
                <span className="rounded border border-slate-200 px-2 py-1">
                  MASTERCARD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear your cart?"
        description="This removes every item from your cart. You can always add them back from the shop."
        confirmLabel="Clear cart"
        onConfirm={handleClear}
        onClose={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
