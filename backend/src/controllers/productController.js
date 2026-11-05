import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  buildPagination,
  escapeRegex,
  getPagination,
  getSortOption,
} from '../utils/pagination.js';

const PRODUCT_FIELDS = [
  'name',
  'description',
  'brand',
  'category',
  'price',
  'compareAtPrice',
  'stock',
  'image',
  'images',
  'featured',
  'isActive',
];

function pickProductFields(body) {
  const payload = {};

  for (const field of PRODUCT_FIELDS) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  if (payload.compareAtPrice === '') {
    payload.compareAtPrice = null;
  }

  if (payload.image === null || payload.image === undefined) {
    payload.image = '';
  }

  if (Array.isArray(payload.images)) {
    payload.images = payload.images.map((image) => String(image).trim()).filter(Boolean);
  }

  return payload;
}

function buildFilter(query, includeInactive) {
  const filter = {};

  if (includeInactive) {
    if (query.active === 'true') filter.isActive = true;
    if (query.active === 'false') filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  if (query.keyword) {
    const regex = new RegExp(escapeRegex(query.keyword.trim()), 'i');
    filter.$or = [{ name: regex }, { brand: regex }, { category: regex }];
  }

  if (query.category && query.category !== 'all') {
    filter.category = {
      $regex: `^${escapeRegex(query.category.trim())}$`,
      $options: 'i',
    };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.minRating !== undefined) {
    filter.rating = { $gte: Number(query.minRating) };
  }

  if (query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  return filter;
}

async function listProducts(req, res, includeInactive) {
  const filter = buildFilter(req.query, includeInactive);
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews -__v')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: buildPagination(page, limit, total),
  });
}

export const getProducts = asyncHandler(async (req, res) => {
  await listProducts(req, res, false);
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  await listProducts(req, res, true);
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, name: '$_id', count: 1 } },
  ]);

  res.json({ success: true, data: categories });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });

  if (!product) {
    throw ApiError.notFound('Product not found or no longer available.');
  }

  res.json({ success: true, data: product });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = pickProductFields(req.body);
  payload.createdBy = req.user._id;

  const product = await Product.create(payload);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  const payload = pickProductFields(req.body);

  if (Object.keys(payload).length === 0) {
    throw ApiError.badRequest('Provide at least one field to update.');
  }

  Object.assign(product, payload);
  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: `"${product.name}" was deleted.`,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found or no longer available.');
  }

  const alreadyReviewed = product.reviews.some(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw ApiError.conflict('You have already reviewed this product.');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating =
    Math.round(
      (product.reviews.reduce((total, review) => total + review.rating, 0) /
        product.reviews.length) *
        10
    ) / 10;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been added.',
    data: product,
  });
});
