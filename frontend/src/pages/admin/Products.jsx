import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Filter,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { productApi } from '../../api/products.js';
import { getApiError } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import SmartImage from '../../components/SmartImage.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const ACTIVE_FILTERS = [
  { value: '', label: 'All products' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
];

function StockPill({ stock }) {
  const tone =
    stock === 0
      ? 'bg-red-50 text-red-700'
      : stock <= 5
        ? 'bg-amber-50 text-amber-700'
        : 'bg-emerald-50 text-emerald-700';

  return (
    <span className={`badge ${tone}`}>
      {stock === 0 ? 'Out of stock' : `${stock} in stock`}
    </span>
  );
}

export default function AdminProducts() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let activeRequest = true;

    async function loadCategories() {
      try {
        const { data } = await productApi.categories();
        if (activeRequest) setCategories(data.data || []);
      } catch {
        // Category filters are a convenience; the table still works without them.
      }
    }

    loadCategories();

    return () => {
      activeRequest = false;
    };
  }, []);

  useEffect(() => {
    let activeRequest = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const params = { page, limit: 10, sort };
        if (keyword) params.keyword = keyword;
        if (active) params.active = active;
        if (category) params.category = category;

        const { data } = await productApi.adminList(params);
        if (!activeRequest) return;

        setProducts(data.data || []);
        setPagination(data.pagination || null);
      } catch (requestError) {
        if (activeRequest) {
          setError(getApiError(requestError));
          setProducts([]);
          setPagination(null);
        }
      } finally {
        if (activeRequest) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      activeRequest = false;
    };
  }, [page, keyword, active, category, sort, reloadKey]);

  const applyFilter = (setter, value) => {
    setter(value);
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
    setActive('');
    setCategory('');
    setSort('newest');
    setPage(1);
  };

  const hasFilters = Boolean(keyword || active || category || sort !== 'newest');

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { data } = await productApi.remove(deleteTarget._id);
      toast.success(data.message || 'Product deleted.');
      setDeleteTarget(null);

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setDeleting(false);
    }
  };

  const total = pagination?.total ?? products.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Catalogue
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
            Products
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Create, price, and publish the products customers see in the store.
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Search by name, brand, or category"
                className="input !pl-10"
                aria-label="Search products"
              />
            </div>
            <div className="flex flex-wrap gap-2">
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

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {ACTIVE_FILTERS.map((filter) => (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  onClick={() => applyFilter(setActive, filter.value)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active === filter.value
                      ? 'bg-ink text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  value={category}
                  onChange={(event) => applyFilter(setCategory, event.target.value)}
                  className="input !w-auto !py-2 !pl-9 !pr-8 text-xs"
                  aria-label="Filter by category"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => applyFilter(setSort, event.target.value)}
                  className="input !w-auto !py-2 !pr-8 text-xs"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/2" />
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
        ) : products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Package}
              title={hasFilters ? 'No matching products' : 'No products yet'}
              description={
                hasFilters
                  ? 'Try a different keyword, category, or status filter.'
                  : 'Add your first product to start building the LUMA catalogue.'
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={clearFilters} className="btn-secondary">
                    Clear filters
                  </button>
                ) : (
                  <Link to="/admin/products/new" className="btn-primary">
                    <PackagePlus className="h-4 w-4" /> Add product
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Stock
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            <SmartImage
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                              <span className="truncate">{product.name}</span>
                              {product.featured && (
                                <Star
                                  className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                                  aria-label="Featured"
                                />
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {product.brand} · added {formatDate(product.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{product.category}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink">
                          {formatCurrency(product.price)}
                        </p>
                        {product.compareAtPrice > product.price && (
                          <p className="text-[11px] text-slate-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StockPill stock={product.stock} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`badge ${
                            product.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/product/${product._id}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                            title="View in store"
                            aria-label={`View ${product.name} in the store`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{products.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{total}</span> products
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from the catalogue. Past orders keep their own copy of the product details.`
            : ''
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
