import mongoose from 'mongoose';

const URL_REGEX = /^https?:\/\/\S+$/i;

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters.'],
      maxlength: [120, 'Product name cannot exceed 120 characters.'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters.'],
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required.'],
      trim: true,
      maxlength: [60, 'Brand cannot exceed 60 characters.'],
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
      maxlength: [60, 'Category cannot exceed 60 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
      max: [1_000_000, 'Price is too large.'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, 'Compare-at price cannot be negative.'],
      validate: {
        validator(value) {
          return value === null || value === undefined || value >= this.price;
        },
        message: 'Compare-at price must be greater than or equal to the price.',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },
    image: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          return !value || URL_REGEX.test(value);
        },
        message: 'Image must be a valid http(s) URL.',
      },
    },
    images: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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

productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, isActive: 1 });

function slugify(value) {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

productSchema.pre('validate', function generateSlug(next) {
  if (!this.slug || this.isModified('name')) {
    const base = slugify(this.name) || 'product';
    const suffix = Math.random().toString(36).slice(2, 7);
    this.slug = `${base}-${suffix}`;
  }

  if (Array.isArray(this.images)) {
    this.images = this.images.map((image) => image.trim()).filter(Boolean);
  }

  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
