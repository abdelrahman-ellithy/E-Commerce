const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export function getPagination(query, defaultLimit = DEFAULT_LIMIT) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));

  return { page, limit, skip: (page - 1) * limit };
}

export function buildPagination(page, limit, total) {
  const pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

export function getSortOption(sort) {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1, numReviews: -1 },
    name: { name: 1 },
  };

  return sortOptions[sort] || sortOptions.newest;
}

export function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
