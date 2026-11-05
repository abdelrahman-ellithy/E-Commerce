import mongoose from 'mongoose';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      maxlength: 80,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      maxlength: 30,
    },
    address: {
      type: String,
      required: [true, 'Street address is required.'],
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
      maxlength: 80,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required.'],
      trim: true,
      maxlength: 20,
    },
    country: {
      type: String,
      required: [true, 'Country is required.'],
      trim: true,
      maxlength: 80,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    note: { type: String, trim: true, maxlength: 200, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cod'],
        message: 'Unsupported payment method.',
      },
      default: 'cod',
    },
    itemsPrice: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0 },
    taxPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre('validate', function generateOrderNumber(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `LM-${timestamp}-${random}`;
  }

  next();
});

export { ORDER_STATUSES };
const Order = mongoose.model('Order', orderSchema);

export default Order;
