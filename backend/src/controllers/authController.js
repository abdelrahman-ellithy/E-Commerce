import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

const PUBLIC_USER_FIELDS = '-password';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with that email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Email or password is incorrect.');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw ApiError.unauthorized('Email or password is incorrect.');
  }

  const token = signToken(user);
  user.password = undefined;

  res.json({
    success: true,
    message: 'Signed in successfully.',
    token,
    user,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(PUBLIC_USER_FIELDS);

  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (name === undefined && email === undefined && phone === undefined) {
    throw ApiError.badRequest('Provide at least one field to update.');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (email && email !== user.email) {
    const emailTaken = await User.exists({ email, _id: { $ne: user._id } });
    if (emailTaken) {
      throw ApiError.conflict('An account with that email already exists.');
    }
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw ApiError.badRequest('Your current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully.',
  });
});
