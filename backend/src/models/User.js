import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [60, 'Name cannot exceed 60 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      maxlength: [72, 'Password cannot exceed 72 characters.'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters.'],
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin.',
      },
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
