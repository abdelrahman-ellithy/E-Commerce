import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import SmartImage from '../components/SmartImage.jsx';
import RatingStars from '../components/RatingStars.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import PageLoader from '../components/PageLoader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { productApi } from '../api/products.js';
import { getApiError } from '../api/client.js';
import {
  formatCurrency,
  formatDate,
  getDiscountPercent,
  getStockLabel,
} from '../utils/format.js';

const FEATURES = [
  { icon: Truck, title: 'Free shipping', text: 'On orders over $100' },
  { icon: RotateCcw, title: '30-day returns', text: 'No questions asked' },
  { icon: ShieldCheck, title: '2-year warranty', text: 'Covered by LUMA' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError('');

      try {
        const { data } = await productApi.get(id);
        if (!active) return;

        const loaded = data.data;
        setProduct(loaded);
        setQuantity(1);
        setActiveImage(loaded.image || loaded.images?.[0] || '');
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setProduct(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    if (!product?.category) return undefined;

    let active = true;

    async function loadRelated() {
      try {
        const { data } = await productApi.list({
          category: product.category,
          limit: 5,
          sort: 'rating',
        });

        if (active) {
          setRelated(
            (data.data || [])
              .filter((item) => item._id !== product._id)
              .slice(0, 4)
          );
        }
      } catch {
        if (active) setRelated([]);
      }
    }

    loadRelated();

    return () => {
      active = false;
    };
  }, [product?._id, product?.category]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  }, [product]);

  const selectedImage = activeImage || gallery[0] || '';
  const discount = product
    ? getDiscountPercent(product.price, product.compareAtPrice)
    : 0;
  const stockInfo = product ? getStockLabel(product.stock) : null;
  const outOfStock = Number(product?.stock) <= 0;

  const handleAddToCart = () => {
    const added = addItem(product, quantity);

    if (added) {
      toast.success(`${product.name} added to your cart.`);
    } else {
      toast.error('This product is currently out of stock.');
    }
  };

  const handleBuyNow = () => {
    const added = addItem(product, quantity);

    if (added) {
      navigate('/checkout');
    } else {
      toast.error('This product is currently out of stock.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError('');

    if (review.comment.trim().length < 3) {
      setReviewError('Please write at least a few words about the product.');
      return;
    }

    setSubmittingReview(true);

    try {
      await productApi.addReview(id, {
        rating: Number(review.rating),
        comment: review.comment.trim(),
      });

      toast.success('Thank you — your review has been added.');
      setReview({ rating: 5, comment: '' });

      const { data } = await productApi.get(id);
      setProduct(data.data);
    } catch (requestError) {
      setReviewError(getApiError(requestError));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <PageLoader label="Loading product…" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={AlertCircle}
          title="We couldn't load this product"
          description={error || 'The product may have been removed or is no longer available.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="btn-secondary"
              >
                Try again
              </button>
              <Link to="/shop" className="btn-primary">
                Back to shop
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <nav
        className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-ink">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-ink"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="max-w-56 truncate font-medium text-slate-700">
          {product.name}
        </span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <SmartImage
              src={selectedImage}
              alt={product.name}
              loading="eager"
              className="aspect-square w-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                Save {discount}%
              </span>
            )}
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <span className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                  Sold out
                </span>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`overflow-hidden rounded-xl border-2 bg-white transition ${
                    selectedImage === image
                      ? 'border-ink'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  aria-label="View product image"
                >
                  <SmartImage
                    src={image}
                    alt={`${product.name} preview`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
                >
                  <Icon className="h-4 w-4 text-brand-600" />
                  <p className="mt-2 text-xs font-semibold text-ink">{feature.title}</p>
                  <p className="text-[11px] text-slate-500">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              {product.category}
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {product.brand}
            </span>
            {product.featured && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Featured
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {product.numReviews > 0 ? (
              <>
                <RatingStars
                  rating={product.rating}
                  showValue
                  size={16}
                />
                <a href="#reviews" className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline">
                  {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
                </a>
              </>
            ) : (
              <span className="text-sm text-slate-500">
                No reviews yet — be the first.
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-display text-3xl font-bold text-ink">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="pb-1 text-base text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <span className="mb-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                  You save {formatCurrency(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Tax calculated at checkout · Free shipping over $100
          </p>

          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
            {product.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={`badge ${stockInfo.tone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {stockInfo.label}
            </span>
            <span className="text-xs text-slate-400">
              Ships within 1–2 business days
            </span>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <QuantityStepper
                value={quantity}
                max={product.stock}
                onChange={setQuantity}
                disabled={outOfStock}
              />

              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="btn-primary flex-1 !py-3"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {outOfStock ? 'Sold out' : 'Add to cart'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className="btn-secondary flex-1 !py-3"
                >
                  Buy now
                </button>
              </div>
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mt-3 text-xs font-medium text-amber-700">
                Selling quickly — only {product.stock} left in stock.
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2.5 border-t border-slate-200 pt-5 text-xs text-slate-500">
            <p className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Secure checkout with JWT-protected order APIs
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Cash on delivery available at checkout
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Need help? Email hello@luma.dev
            </p>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-slate-200 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  Reviews
                </p>
                <h2 className="mt-1 text-2xl font-bold text-ink">
                  What people are saying
                </h2>
              </div>
              {product.numReviews > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <span className="font-display text-2xl font-bold text-ink">
                    {product.rating.toFixed(1)}
                  </span>
                  <div>
                    <RatingStars rating={product.rating} size={13} />
                    <p className="text-[11px] text-slate-500">
                      {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {product.reviews?.length > 0 ? (
                product.reviews
                  .slice()
                  .reverse()
                  .map((item) => (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                          {item.name
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-ink">{item.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {formatDate(item.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-3.5 w-3.5 ${
                                    index < item.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-none text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No reviews yet. If you own this piece, tell us how it&apos;s holding up.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink">Write a review</h3>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  <div>
                    <span className="label">Your rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setReview((current) => ({ ...current, rating: value }))
                          }
                          aria-label={`Rate ${value} out of 5`}
                          className="rounded-md p-0.5 transition hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              value <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comment" className="label">
                      Your review
                    </label>
                    <textarea
                      id="review-comment"
                      rows={5}
                      value={review.comment}
                      onChange={(event) =>
                        setReview((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      placeholder="What did you like? How does it feel day to day?"
                      className="input resize-none"
                      maxLength={1000}
                    />
                  </div>

                  {reviewError && <p className="field-error">{reviewError}</p>}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary w-full"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      'Submit review'
                    )}
                  </button>

                  <p className="text-[11px] leading-5 text-slate-500">
                    Reviews are public and attached to your account name. You can
                    review each product once.
                  </p>
                </form>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-500">
                    Sign in to share your experience with other shoppers.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="btn-primary mt-4 w-full"
                  >
                    Sign in to review
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                You may also like
              </p>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                More from {product.category}
              </h2>
            </div>
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="btn-link shrink-0"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
