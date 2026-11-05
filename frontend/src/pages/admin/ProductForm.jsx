import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Link2,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { productApi } from '../../api/products.js';
import { getApiError, getFieldErrors } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Field from '../../components/Field.jsx';
import PageLoader from '../../components/PageLoader.jsx';
import SmartImage from '../../components/SmartImage.jsx';
import { formatCurrency, getDiscountPercent } from '../../utils/format.js';

const EMPTY_FORM = {
  name: '',
  description: '',
  brand: '',
  category: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  image: '',
  images: [''],
  featured: false,
  isActive: true,
};

const URL_PATTERN = /^https?:\/\/\S+$/i;

function buildFormState(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || '',
    price: product.price !== undefined && product.price !== null ? String(product.price) : '',
    compareAtPrice:
      product.compareAtPrice !== undefined && product.compareAtPrice !== null
        ? String(product.compareAtPrice)
        : '',
    stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
    image: product.image || '',
    images: Array.isArray(product.images) && product.images.length > 0 ? [...product.images] : [''],
    featured: Boolean(product.featured),
    isActive: product.isActive !== false,
  };
}

function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}>
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const { data } = await productApi.categories();
        if (active) setCategories(data.data || []);
      } catch {
        // The category datalist is optional; free text still works.
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setForm(EMPTY_FORM);
      setLoading(false);
      setLoadError('');
      return undefined;
    }

    let active = true;

    async function loadProduct() {
      setLoading(true);
      setLoadError('');

      try {
        const { data } = await productApi.adminGet(id);
        if (!active) return;

        setForm(buildFormState(data.data));
        setErrors({});
      } catch (requestError) {
        if (active) {
          setLoadError(getApiError(requestError));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, isEditing, reloadKey]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  };

  const handleImageChange = (index, value) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? value : image
      ),
    }));
    setErrors((current) => ({ ...current, [`images-${index}`]: undefined }));
    setFormError('');
  };

  const addImageField = () => {
    setForm((current) =>
      current.images.length >= 6
        ? current
        : { ...current, images: [...current.images, ''] }
    );
  };

  const removeImageField = (index) => {
    setForm((current) => {
      const next = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, images: next.length > 0 ? next : [''] };
    });
  };

  const validate = () => {
    const nextErrors = {};
    const price = Number(form.price);
    const compareAtPrice = form.compareAtPrice.trim() === '' ? null : Number(form.compareAtPrice);
    const stock = Number(form.stock);

    if (form.name.trim().length < 2 || form.name.trim().length > 120) {
      nextErrors.name = 'Use between 2 and 120 characters.';
    }
    if (form.description.trim().length < 20 || form.description.trim().length > 5000) {
      nextErrors.description = 'Use between 20 and 5,000 characters.';
    }
    if (!form.brand.trim() || form.brand.trim().length > 60) {
      nextErrors.brand = 'Enter a brand name (up to 60 characters).';
    }
    if (form.category.trim().length < 2 || form.category.trim().length > 60) {
      nextErrors.category = 'Use between 2 and 60 characters.';
    }
    if (!Number.isFinite(price) || form.price === '' || price < 0 || price > 1_000_000) {
      nextErrors.price = 'Enter a price between 0 and 1,000,000.';
    }
    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < 0 || compareAtPrice > 1_000_000)
    ) {
      nextErrors.compareAtPrice = 'Enter a valid compare-at price.';
    } else if (compareAtPrice !== null && Number.isFinite(price) && compareAtPrice < price) {
      nextErrors.compareAtPrice = 'Compare-at price must be at least the selling price.';
    }
    if (!Number.isInteger(stock) || form.stock === '' || stock < 0 || stock > 1_000_000) {
      nextErrors.stock = 'Enter a whole number between 0 and 1,000,000.';
    }
    if (form.image.trim() && !URL_PATTERN.test(form.image.trim())) {
      nextErrors.image = 'Use a full http(s) image URL.';
    }

    form.images.forEach((image, index) => {
      if (image.trim() && !URL_PATTERN.test(image.trim())) {
        nextErrors[`images-${index}`] = 'Use a full http(s) image URL.';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!validate()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      compareAtPrice:
        form.compareAtPrice.trim() === '' ? null : Number(form.compareAtPrice),
      stock: Number(form.stock),
      image: form.image.trim(),
      images: form.images.map((image) => image.trim()).filter(Boolean),
      featured: form.featured,
      isActive: form.isActive,
    };

    setSaving(true);

    try {
      const { data } = isEditing
        ? await productApi.update(id, payload)
        : await productApi.create(payload);

      toast.success(
        data.message || (isEditing ? 'Product updated.' : 'Product created.')
      );
      navigate('/admin/products');
    } catch (requestError) {
      setFormError(getApiError(requestError));
      setErrors(getFieldErrors(requestError));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading product…" />;
  }

  if (loadError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="We couldn't load this product"
        description={loadError}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link to="/admin/products" className="btn-primary">
              Back to products
            </Link>
          </div>
        }
      />
    );
  }

  const previewPrice = Number(form.price);
  const previewCompare =
    form.compareAtPrice.trim() === '' ? null : Number(form.compareAtPrice);
  const discount = getDiscountPercent(previewPrice, previewCompare);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to products
          </Link>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            {isEditing ? 'Edit product' : 'New product'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {isEditing
              ? 'Update the details shown on the storefront and in checkout.'
              : 'Add a new item to the LUMA catalogue.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="btn-secondary !py-2.5 text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary !py-2.5 text-sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SectionCard
            title="Product details"
            description="This is what customers read before adding an item to their cart."
          >
            <div className="space-y-5">
              <Field label="Product name" htmlFor="name" error={errors.name} required>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Aura Wireless Headphones"
                  className="input"
                  maxLength={120}
                  required
                />
              </Field>

              <Field
                label="Description"
                htmlFor="description"
                error={errors.description}
                hint={`${form.description.trim().length}/5000 characters — at least 20 required.`}
                required
              >
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the materials, features, and what makes this product worth buying."
                  className="input resize-y"
                  maxLength={5000}
                  required
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Brand" htmlFor="brand" error={errors.brand} required>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Auralis"
                    className="input"
                    maxLength={60}
                    required
                  />
                </Field>

                <Field
                  label="Category"
                  htmlFor="category"
                  error={errors.category}
                  hint="Choose an existing category or type a new one."
                  required
                >
                  <input
                    id="category"
                    name="category"
                    type="text"
                    list="category-options"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Audio"
                    className="input"
                    maxLength={60}
                    required
                  />
                  <datalist id="category-options">
                    {categories.map((item) => (
                      <option key={item.name} value={item.name} />
                    ))}
                  </datalist>
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Pricing & inventory"
            description="Prices are in USD. Orders always use the price stored on the server."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Price" htmlFor="price" error={errors.price} required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="input !pl-8"
                    required
                  />
                </div>
              </Field>

              <Field
                label="Compare-at price"
                htmlFor="compareAtPrice"
                error={errors.compareAtPrice}
                hint="Optional — shows a strike-through discount."
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>
                  <input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="input !pl-8"
                  />
                </div>
              </Field>

              <Field
                label="Stock"
                htmlFor="stock"
                error={errors.stock}
                hint="Units available to sell. 0 marks the item sold out."
                required
              >
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                  required
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Imagery"
            description="Use direct image URLs. A local placeholder is shown if an image fails to load."
          >
            <div className="space-y-5">
              <Field
                label="Primary image"
                htmlFor="image"
                error={errors.image}
                hint="This image appears on product cards, cart lines, and order summaries."
              >
                <div className="flex items-center gap-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <SmartImage
                      src={form.image}
                      alt="Primary preview"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="relative flex-1">
                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="image"
                      name="image"
                      type="url"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://images.example.com/product.jpg"
                      className="input !pl-10"
                    />
                  </div>
                </div>
              </Field>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Gallery images</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Up to six extra angles shown on the product page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addImageField}
                    disabled={form.images.length >= 6}
                    className="btn-secondary !py-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add image
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {form.images.map((image, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <SmartImage
                          src={image}
                          alt={`Gallery preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={image}
                          onChange={(event) => handleImageChange(index, event.target.value)}
                          placeholder={`Gallery image ${index + 1} URL`}
                          className="input"
                          aria-label={`Gallery image ${index + 1}`}
                        />
                        {errors[`images-${index}`] && (
                          <p className="field-error">{errors[`images-${index}`]}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="mt-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove gallery image ${index + 1}`}
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Visibility" description="Control how this product appears across the store.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={form.isActive}
                onChange={(value) =>
                  setForm((current) => ({ ...current, isActive: value }))
                }
                label="Active in storefront"
                description="Inactive products are hidden from browsing and cannot be ordered."
              />
              <Toggle
                checked={form.featured}
                onChange={(value) =>
                  setForm((current) => ({ ...current, featured: value }))
                }
                label="Feature on homepage"
                description="Featured products appear in the homepage collection."
              />
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-brand-600" /> Storefront preview
              </h3>
              <span
                className={`badge ${
                  form.isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {form.isActive ? 'Live' : 'Hidden'}
              </span>
            </div>

            <div className="relative aspect-[4/3] bg-slate-100">
              <SmartImage
                src={form.image}
                alt="Product preview"
                className="h-full w-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">
                  −{discount}%
                </span>
              )}
              {form.featured && (
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-amber-500 shadow-sm">
                  <Star className="h-4 w-4 fill-current" />
                </span>
              )}
            </div>

            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {form.brand.trim() || 'Brand'}
              </p>
              <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-ink">
                {form.name.trim() || 'Product name'}
              </h4>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-base font-bold text-ink">
                  {Number.isFinite(previewPrice) ? formatCurrency(previewPrice) : '$0.00'}
                </span>
                {previewCompare !== null &&
                  Number.isFinite(previewCompare) &&
                  previewCompare > previewPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(previewCompare)}
                    </span>
                  )}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Package className="h-3.5 w-3.5" />
                {form.stock === '' || Number(form.stock) <= 0
                  ? 'Out of stock'
                  : `${Number(form.stock)} unit${Number(form.stock) === 1 ? '' : 's'} available`}
              </p>
            </div>
          </section>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-card">
            <p className="flex items-center gap-2 font-semibold text-slate-700">
              <ImageIcon className="h-4 w-4 text-slate-400" /> Image tips
            </p>
            <ul className="mt-2 space-y-1.5">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Square or 4:3 images at 1000px or wider look best.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Use a direct https URL that ends in .jpg, .png, or .webp.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Keep the product centred with a clean background.
              </li>
            </ul>
          </div>

          {isEditing && (
            <Link
              to={`/product/${id}`}
              className="btn-secondary w-full !py-2.5 text-xs"
              target="_blank"
              rel="noreferrer"
            >
              <ImageIcon className="h-4 w-4" /> Open in storefront
            </Link>
          )}
        </aside>
      </div>
    </form>
  );
}
