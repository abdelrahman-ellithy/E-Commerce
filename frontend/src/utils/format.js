export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getDiscountPercent = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  processing: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

export const ORDER_STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

export const capitalize = (value = '') =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const getStockLabel = (stock) => {
  if (stock <= 0) return { label: 'Out of stock', tone: 'text-red-600 bg-red-50' };
  if (stock <= 5) {
    return { label: `Only ${stock} left`, tone: 'text-amber-700 bg-amber-50' };
  }
  return { label: 'In stock', tone: 'text-emerald-700 bg-emerald-50' };
};
