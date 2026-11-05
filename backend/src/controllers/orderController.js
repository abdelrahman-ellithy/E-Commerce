import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateOrderTotals } from '../utils/pricing.js';
import {
  buildPagination,
  escapeRegex,
  getPagination,
} from '../utils/pagination.js';

const MAX_QUANTITY_PER_ITEM = 99;

async function restoreStock(items) {
  try {
    await Promise.all(
      items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
      )
    );
  } catch (error) {
    console.error(`Failed to restore inventory for order items: ${error.message}`);
  }
}

function mergeCartItems(items) {
  const quantities = new Map();

  for (const item of items) {
    const current = quantities.get(item.product) || 0;
    quantities.set(item.product, current + item.quantity);
  }

  return quantities;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

  const quantities = mergeCartItems(items);

  for (const [productId, quantity] of quantities) {
    if (quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw ApiError.badRequest(
        `Quantity for a single product must be between 1 and ${MAX_QUANTITY_PER_ITEM}.`
      );
    }

    if (!productId) {
      throw ApiError.badRequest('A cart item is missing its product id.');
    }
  }

  const productIds = [...quantities.keys()];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  if (products.length !== productIds.length) {
    throw ApiError.badRequest('One or more products are no longer available.');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const orderItems = productIds.map((productId) => {
    const product = productMap.get(productId);
    const quantity = quantities.get(productId);

    if (product.stock < quantity) {
      throw ApiError.conflict(
        `Only ${product.stock} unit(s) of "${product.name}" are left in stock.`
      );
    }

    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    };
  });

  const totals = calculateOrderTotals(orderItems);

  // Reserve inventory before creating the order. If anything fails, every
  // reservation made in this request is rolled back.
  const reserved = [];
  try {
    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount !== 1) {
        throw ApiError.conflict(
          `"${item.name}" sold out while you were checking out. Please review your cart.`
        );
      }

      reserved.push(item);
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      ...totals,
      status: 'pending',
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order,
    });
  } catch (error) {
    await restoreStock(reserved);
    throw error;
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: buildPagination(page, limit, total),
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email phone createdAt'
  );

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  const ownerId = order.user?._id?.toString() || order.user?.toString();
  const isOwner = ownerId === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You can only view your own orders.');
  }

  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You can only cancel your own orders.');
  }

  if (order.status === 'cancelled') {
    throw ApiError.badRequest('This order is already cancelled.');
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    throw ApiError.badRequest(
      'Orders that have already shipped or been delivered cannot be cancelled.'
    );
  }

  await restoreStock(order.items);

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.statusHistory.push({
    status: 'cancelled',
    note: isAdmin ? 'Cancelled by an administrator' : 'Cancelled by the customer',
  });

  await order.save();
  await order.populate('user', 'name email phone createdAt');

  res.json({
    success: true,
    message: 'Order cancelled and inventory restored.',
    data: order,
  });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.keyword) {
    filter.orderNumber = {
      $regex: escapeRegex(req.query.keyword.trim()),
      $options: 'i',
    };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: buildPagination(page, limit, total),
  });
});

const ALLOWED_TRANSITIONS = {
  pending: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
};

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  if (order.status === 'cancelled') {
    throw ApiError.badRequest('A cancelled order cannot be updated.');
  }

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];

  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Order cannot move from "${order.status}" to "${status}".`
    );
  }

  order.status = status;
  order.statusHistory.push({
    status,
    note: note || `Status changed to ${status} by an administrator`,
  });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  await order.populate('user', 'name email phone createdAt');

  res.json({
    success: true,
    message: `Order marked as ${status}.`,
    data: order,
  });
});

export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  if (order.status === 'cancelled') {
    throw ApiError.badRequest('A cancelled order cannot be marked as paid.');
  }

  if (order.isPaid) {
    throw ApiError.badRequest('This order is already marked as paid.');
  }

  order.isPaid = true;
  order.paidAt = new Date();

  await order.save();
  await order.populate('user', 'name email phone createdAt');

  res.json({
    success: true,
    message: 'Order marked as paid.',
    data: order,
  });
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [users, products, orders, revenue, statusCounts, lowStock, recentOrders, monthly] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.find({ isActive: true, stock: { $lte: 5 } })
        .select('name image stock price')
        .sort({ stock: 1 })
        .limit(6)
        .lean(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

  const statusBreakdown = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const revenueByMonth = monthly.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    revenue: Math.round(item.revenue * 100) / 100,
    orders: item.orders,
  }));

  res.json({
    success: true,
    data: {
      totals: {
        users,
        products,
        orders,
        revenue: Math.round((revenue[0]?.total || 0) * 100) / 100,
      },
      statusBreakdown,
      lowStock,
      recentOrders,
      revenueByMonth,
    },
  });
});
