import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import RatingStars from './RatingStars.jsx';
import { formatCurrency, getDiscountPercent } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const outOfStock = Number(product.stock) <= 0;

  const handleAdd = () => {
    const added = addItem(product, 1);

    if (added) {
      toast.success(`${product.name} added to your cart.`);
    } else {
      toast.error('This product is currently out of stock.');
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card">
      <div className="relative overflow-hidden bg-slate-100">
        <Link
          to={`/product/${product._id}`}
          className="block aspect-square"
          aria-label={`View ${product.name}`}
        >
          <SmartImage
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              outOfStock ? 'opacity-60 grayscale' : ''
            }`}
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              −{discount}%
            </span>
          )}
          {product.featured && !outOfStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Featured
            </span>
          )}
        </div>

        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-white">
            Sold out
          </span>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="truncate">{product.brand || 'LUMA'}</span>
          <span className="shrink-0 text-slate-400">{product.category}</span>
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-ink">
          <Link to={`/product/${product._id}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2">
          {product.numReviews > 0 ? (
            <RatingStars
              rating={product.rating}
              count={product.numReviews}
              size={13}
            />
          ) : (
            <span className="text-xs font-medium text-slate-400">New arrival</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-bold text-ink">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="shrink-0 text-[11px] font-semibold text-amber-600">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
