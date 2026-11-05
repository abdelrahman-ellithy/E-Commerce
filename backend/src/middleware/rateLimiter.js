import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Brute-force protection for sign-in / registration endpoints.
 * Disabled during automated tests to keep them deterministic.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 10_000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 100_000 : 1_000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});
