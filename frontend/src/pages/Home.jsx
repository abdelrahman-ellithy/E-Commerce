import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import RatingStars from '../components/RatingStars.jsx';
import SmartImage from '../components/SmartImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { productApi } from '../api/products.js';
import { getApiError } from '../api/client.js';
import { formatCurrency } from '../utils/format.js';

const CATEGORY_IMAGES = {
  Audio:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  Wearables:
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
  Footwear:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  Cameras:
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  Bags:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  Accessories:
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
  Home:
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
  Workspace:
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
};

const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';

const BENEFITS = [
  {
    icon: Truck,
    title: 'Free shipping',
    description: 'On every order over $100',
  },
  {
    icon: RotateCcw,
    title: '30-day returns',
    description: 'No questions, no restocking fees',
  },
  {
    icon: ShieldCheck,
    title: 'Secure checkout',
    description: 'Encrypted and privacy-first',
  },
  {
    icon: PackageCheck,
    title: 'Carefully packed',
    description: 'Plastic-free, recyclable packaging',
  },
];

const TESTIMONIALS = [
  {
    initials: 'MK',
    name: 'Maya K.',
    role: 'Verified buyer',
    quote:
      'Everything feels considered — the packaging, the materials, the little details. My new default for gifting.',
  },
  {
    initials: 'AR',
    name: 'Adam R.',
    role: 'Verified buyer',
    quote:
      'The headphones are exceptional and the checkout was painless. Delivery was faster than expected.',
  },
  {
    initials: 'SL',
    name: 'Sara L.',
    role: 'Verified buyer',
    quote:
      'I replaced three cheap things with one great one from LUMA. That is exactly the point, isn’t it?',
  },
];

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      setLoading(true);
      setError('');

      try {
        const [featuredResponse, newResponse, categoriesResponse] =
          await Promise.all([
            productApi.list({ featured: 'true', limit: 8, sort: 'newest' }),
            productApi.list({ limit: 4, sort: 'newest' }),
            productApi.categories(),
          ]);

        if (!active) return;

        const featuredProducts = featuredResponse.data.data || [];
        const newestProducts = newResponse.data.data || [];

        setFeatured(
          featuredProducts.length > 0 ? featuredProducts : newestProducts
        );
        setNewArrivals(newestProducts);
        setCategories(categoriesResponse.data.data || []);
      } catch (requestError) {
        if (active) setError(getApiError(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHome();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const heroProduct = featured[0];
  const displayCategories = useMemo(() => categories.slice(0, 8), [categories]);

  return (
    <div>
      <section className="relative overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20 xl:gap-16">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              New season · Everyday essentials
            </span>

            <h1 className="mt-5 max-w-xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl xl:text-6xl">
              Good design for the <span className="text-brand-700">everyday.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
              A tightly edited collection of audio, wearables, and workspace
              essentials. Considered materials, honest pricing, and nothing you
              don&apos;t need.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="btn-primary !px-6 !py-3">
                Shop the collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop?featured=true" className="btn-secondary !px-6 !py-3">
                Explore bestsellers
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['MK', 'AR', 'SL'].map((initials, index) => (
                    <span
                      key={initials}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream text-[10px] font-bold text-white ${
                        ['bg-brand-600', 'bg-ink', 'bg-amber-600'][index]
                      }`}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <div>
                  <RatingStars rating={5} size={13} />
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Loved by 12,000+ customers
                  </p>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-ink/10 sm:block" />
              <p className="text-xs font-medium text-slate-600">
                Free shipping over <span className="font-bold text-ink">$100</span>
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-200 shadow-soft">
              <SmartImage
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85"
                alt="Aura wireless headphones on a clean background"
                loading="eager"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5] lg:aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            </div>

            <div className="absolute right-3 top-3 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:right-5 sm:top-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-ink">30-day returns</p>
                  <p className="text-[10px] text-slate-500">Shop with confidence</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 left-3 w-[min(20rem,85%)] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-soft sm:left-5">
              {heroProduct ? (
                <Link
                  to={`/product/${heroProduct._id}`}
                  className="group flex items-center gap-3"
                >
                  <SmartImage
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                      Best seller
                    </p>
                    <p className="truncate text-sm font-semibold text-ink">
                      {heroProduct.name}
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {formatCurrency(heroProduct.price)}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink transition group-hover:bg-ink group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <Link to="/shop" className="group flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-ink">
                    <ShoppingBag className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                      Shop
                    </p>
                    <p className="text-sm font-semibold text-ink">Browse the collection</p>
                    <p className="text-xs text-slate-500">16 considered pieces</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-ink" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="relative border-t border-ink/10 bg-white/50 backdrop-blur">
          <div className="container-page grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{benefit.title}</p>
                    <p className="text-[11px] text-slate-500">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <div className="container-page pt-8">
          <div
            role="alert"
            className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section id="categories" className="container-page py-14 lg:py-18">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find your everyday upgrade"
          description="Eight small collections, each edited down to the pieces worth owning."
          action={
            <Link to="/shop" className="btn-link">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton aspect-[5/4] rounded-2xl" />
              ))
            : displayCategories.map((category) => (
                <Link
                  key={category.name}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-2xl bg-slate-200"
                >
                  <SmartImage
                    src={
                      CATEGORY_IMAGES[category.name] || FALLBACK_CATEGORY_IMAGE
                    }
                    alt={category.name}
                    className="aspect-[5/4] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                    <div>
                      <p className="font-display text-base font-bold text-white">
                        {category.name}
                      </p>
                      <p className="text-[11px] text-white/60">
                        {category.count} {category.count === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      <section className="bg-white py-14 lg:py-18">
        <div className="container-page">
          <SectionHeading
            eyebrow="Curated for you"
            title="Featured pieces"
            description="The ones we reach for most — tested, reordered, and genuinely recommended."
            action={
              <Link to="/shop?featured=true" className="btn-link">
                Shop featured <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="mt-8">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : featured.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {featured.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No products yet"
                description="Seed the database to populate the store, or add products from the admin dashboard."
                action={
                  <Link to="/admin/products" className="btn-primary">
                    Go to products
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-14 lg:py-18">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-3xl bg-ink lg:grid-cols-2">
          <div className="relative min-h-72">
            <SmartImage
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85"
              alt="A calm, considered workspace"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/30 lg:to-ink/60" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              Our approach
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              Designed to be used, not just admired.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              We work with a small number of makers, choose materials that age
              well, and skip the seasonal churn. The result is a collection that
              stays useful for years, not weeks.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                'Small-batch production with trusted makers',
                'Repairable designs and a 30-day return window',
                'Plastic-free packaging on every order',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/shop"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-100"
            >
              Explore the collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-18">
        <div className="container-page">
          <SectionHeading
            eyebrow="Just landed"
            title="New arrivals"
            description="Fresh additions to the collection, ready for everyday use."
            action={
              <Link to="/shop?sort=newest" className="btn-link">
                See what&apos;s new <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="mt-8">
            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14 lg:py-18">
        <div className="container-page">
          <SectionHeading
            eyebrow="Word of mouth"
            title="Loved in the wild"
            description="A few notes from people who use these things every day."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6"
              >
                <RatingStars rating={5} size={15} />
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                    <p className="text-[11px] text-slate-500">{testimonial.role}</p>
                  </div>
                  <Star className="ml-auto h-4 w-4 fill-amber-400 text-amber-400" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
