import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Filter,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import { productApi } from '../api/products.js';
import { getApiError } from '../api/client.js';
import { formatCurrency } from '../utils/format.js';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);
  const currentCategory = searchParams.get('category') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = searchParams.get('sort') || 'newest';
  const inStock = searchParams.get('inStock') === 'true';
  const minRating = searchParams.get('minRating') || '';

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const [priceDraft, setPriceDraft] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [priceError, setPriceError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const { data } = await productApi.categories();
        if (active) setCategories(data.data || []);
      } catch {
        if (active) setCategories([]);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const params = Object.fromEntries(new URLSearchParams(queryString));
        const { data } = await productApi.list({ ...params, limit: 12 });

        if (!active) return;

        setProducts(data.data || []);
        setPagination(data.pagination || null);
      } catch (requestError) {
        if (active) {
          setError(getApiError(requestError));
          setProducts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [queryString, reloadKey]);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    setKeywordDraft(params.get('keyword') || '');
    setPriceDraft({
      min: params.get('minPrice') || '',
      max: params.get('maxPrice') || '',
    });
    setFiltersOpen(false);
  }, [queryString]);

  const updateParams = (updates, { resetPage = true } = {}) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (resetPage) next.delete('page');

      return next;
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateParams({ keyword: keywordDraft.trim() });
  };

  const applyPrice = (event) => {
    event.preventDefault();
    setPriceError('');

    const min = priceDraft.min === '' ? null : Number(priceDraft.min);
    const max = priceDraft.max === '' ? null : Number(priceDraft.max);

    if ((min !== null && (!Number.isFinite(min) || min < 0)) ||
        (max !== null && (!Number.isFinite(max) || max < 0))) {
      setPriceError('Enter valid positive prices.');
      return;
    }

    if (min !== null && max !== null && min > max) {
      setPriceError('Minimum price cannot be greater than maximum price.');
      return;
    }

    updateParams({
      minPrice: priceDraft.min,
      maxPrice: priceDraft.max,
    });
  };

  const clearFilters = () => {
    setPriceDraft({ min: '', max: '' });
    setPriceError('');
    setKeywordDraft('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (nextPage) => {
    updateParams({ page: nextPage }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentCategory) count += 1;
    if (keyword) count += 1;
    if (searchParams.get('minPrice')) count += 1;
    if (searchParams.get('maxPrice')) count += 1;
    if (minRating) count += 1;
    if (inStock) count += 1;
    return count;
  }, [currentCategory, keyword, minRating, inStock, searchParams]);

  const priceLabel = useMemo(() => {
    const min = searchParams.get('minPrice');
    const max = searchParams.get('maxPrice');
    if (!min && !max) return '';
    if (min && max) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
    if (min) return `From ${formatCurrency(min)}`;
    return `Up to ${formatCurrency(max)}`;
  }, [searchParams]);

  const title = keyword
    ? `Results for “${keyword}”`
    : currentCategory || 'All products';

  const filterContent = (
    <div className="space-y-6">
      <form onSubmit={handleSearch}>
        <label htmlFor="shop-search" className="label">
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="shop-search"
            type="search"
            value={keywordDraft}
            onChange={(event) => setKeywordDraft(event.target.value)}
            placeholder="Headphones, lamp…"
            className="input pl-9"
          />
        </div>
      </form>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Category</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParams({ category: '' })}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              !currentCategory
                ? 'bg-ink text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All products
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => updateParams({ category: category.name })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                currentCategory === category.name
                  ? 'bg-ink text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-xs ${
                  currentCategory === category.name ? 'text-white/60' : 'text-slate-400'
                }`}
              >
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={applyPrice} className="border-t border-slate-200 pt-5">
        <p className="mb-3 text-sm font-semibold text-ink">Price range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={priceDraft.min}
            onChange={(event) =>
              setPriceDraft((current) => ({ ...current, min: event.target.value }))
            }
            placeholder="Min"
            aria-label="Minimum price"
            className="input"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={priceDraft.max}
            onChange={(event) =>
              setPriceDraft((current) => ({ ...current, max: event.target.value }))
            }
            placeholder="Max"
            aria-label="Maximum price"
            className="input"
          />
        </div>
        {priceError && <p className="field-error">{priceError}</p>}
        <button type="submit" className="btn-secondary mt-3 w-full !py-2 text-xs">
          Apply price
        </button>
      </form>

      <div className="border-t border-slate-200 pt-5">
        <p className="mb-3 text-sm font-semibold text-ink">Rating</p>
        <div className="flex flex-wrap gap-2">
          {['4', '3'].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                updateParams({ minRating: minRating === rating ? '' : rating })
              }
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                minRating === rating
                  ? 'border-ink bg-ink text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) =>
              updateParams({ inStock: event.target.checked ? 'true' : '' })
            }
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          In stock only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full border-t border-slate-200 pt-5 text-left text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8 lg:py-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Shop</span>
        {currentCategory && (
          <>
            <span>/</span>
            <span className="font-medium text-slate-700">{currentCategory}</span>
          </>
        )}
      </nav>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {loading
              ? 'Loading the collection…'
              : `${pagination?.total || 0} ${
                  pagination?.total === 1 ? 'product' : 'products'
                } found`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="btn-secondary relative !py-2 text-xs lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
              aria-label="Sort products"
              className="input appearance-none !w-auto !py-2 pr-9 text-xs font-medium"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {currentCategory && (
            <button
              type="button"
              onClick={() => updateParams({ category: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              {currentCategory} <X className="h-3 w-3" />
            </button>
          )}
          {keyword && (
            <button
              type="button"
              onClick={() => updateParams({ keyword: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              “{keyword}” <X className="h-3 w-3" />
            </button>
          )}
          {priceLabel && (
            <button
              type="button"
              onClick={() => updateParams({ minPrice: '', maxPrice: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              {priceLabel} <X className="h-3 w-3" />
            </button>
          )}
          {minRating && (
            <button
              type="button"
              onClick={() => updateParams({ minRating: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              {minRating}★ & up <X className="h-3 w-3" />
            </button>
          )}
          {inStock && (
            <button
              type="button"
              onClick={() => updateParams({ inStock: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              In stock <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Clear all
          </button>
        </div>
      )}

      {filtersOpen && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Filter className="h-4 w-4" /> Filters
            </p>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {filterContent}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
            {filterContent}
          </div>
        </aside>

        <div>
          {loading ? (
            <ProductGridSkeleton count={9} />
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
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match those filters"
              description="Try adjusting your search or clearing a filter to see more of the collection."
              action={
                <button type="button" onClick={clearFilters} className="btn-primary">
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <Pagination
                page={pagination?.page || page}
                pages={pagination?.pages || 1}
                onChange={handlePageChange}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl bg-ink px-6 py-7 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            Free shipping when you spend $100
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Stock up on the essentials — returns are free for 30 days.
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-100"
        >
          View cart <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
