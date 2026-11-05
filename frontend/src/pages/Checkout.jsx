import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orderApi } from '../api/orders.js';
import { getApiError, getFieldErrors } from '../api/client.js';
import SmartImage from '../components/SmartImage.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import Field from '../components/Field.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatCurrency } from '../utils/format.js';

const PHONE_REGEX = /^[+\d][\d\s().-]{5,29}$/;

const initialForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United States',
};

export default function Checkout() {
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      phone: current.phone || user?.phone || '',
    }));
  }, [user]);

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          description="Your cart is empty. Add a few pieces before heading to checkout."
          action={
            <Link to="/shop" className="btn-primary">
              Browse the collection
            </Link>
          }
        />
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};

    if (form.fullName.trim().length < 2) {
      errors.fullName = 'Enter the recipient’s full name.';
    }
    if (!PHONE_REGEX.test(form.phone.trim())) {
      errors.phone = 'Enter a valid phone number, including country code.';
    }
    if (form.address.trim().length < 5) {
      errors.address = 'Enter a complete street address.';
    }
    if (form.city.trim().length < 2) {
      errors.city = 'Enter a city.';
    }
    if (form.postalCode.trim().length < 2) {
      errors.postalCode = 'Enter a postal code.';
    }
    if (form.country.trim().length < 2) {
      errors.country = 'Enter a country.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await orderApi.create({
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        paymentMethod: 'cod',
      });

      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed. Thank you for shopping with LUMA.');
      navigate(`/orders/${data.data._id}`, { replace: true });
    } catch (requestError) {
      setFormError(getApiError(requestError));
      const serverErrors = getFieldErrors(requestError);
      const mapped = {};
      Object.entries(serverErrors).forEach(([key, message]) => {
        mapped[key.replace('shippingAddress.', '')] = message;
      });
      setFieldErrors(mapped);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/cart" className="hover:text-ink">
          Cart
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Checkout</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Checkout
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Almost there — where should we send your order?
          </p>
        </div>
        <Link to="/cart" className="btn-link">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <Check className="h-3.5 w-3.5" /> Cart
        </span>
        <span className="h-px w-8 bg-slate-300" />
        <span className="text-ink">Delivery</span>
        <span className="h-px w-8 bg-slate-300" />
        <span>Confirmation</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Shipping details</h2>
              <span className="text-[11px] font-medium text-slate-400">
                All fields required
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                htmlFor="fullName"
                required
                error={fieldErrors.fullName}
                className="sm:col-span-2"
              >
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className="input"
                />
              </Field>

              <Field label="Phone" htmlFor="phone" required error={fieldErrors.phone}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555 010 2030"
                  className="input"
                />
              </Field>

              <Field label="Country" htmlFor="country" required error={fieldErrors.country}>
                <input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="input"
                />
              </Field>

              <Field
                label="Street address"
                htmlFor="address"
                required
                error={fieldErrors.address}
                className="sm:col-span-2"
              >
                <input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="1200 Market Street, Suite 400"
                  className="input"
                />
              </Field>

              <Field label="City" htmlFor="city" required error={fieldErrors.city}>
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  className="input"
                />
              </Field>

              <Field
                label="Postal code"
                htmlFor="postalCode"
                required
                error={fieldErrors.postalCode}
              >
                <input
                  id="postalCode"
                  name="postalCode"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="94103"
                  className="input"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink">Payment method</h2>
            <div className="mt-4 rounded-xl border-2 border-ink bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                  <Banknote className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Cash on delivery</p>
                    <span className="badge bg-emerald-50 text-emerald-700">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay in cash when your order is delivered. No card details are
                    collected or stored.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              Orders are created on our server, where prices, stock, and totals are
              validated again before your order is confirmed.
            </p>
          </section>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Placing your order…
              </>
            ) : (
              <>Place order · {formatCurrency(totalPrice)}</>
            )}
          </button>
        </form>

        <div>
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-ink">
                Your order ({items.length})
              </h2>

              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <SmartImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-ink">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <PriceSummary
                className="mt-5 border-t border-slate-200 pt-4"
                itemsPrice={itemsPrice}
                shippingPrice={shippingPrice}
                taxPrice={taxPrice}
                totalPrice={totalPrice}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Protected checkout
              </p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Your order is tied to your account and can be tracked from the
                orders page. Need to change something? Cancel before it ships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
