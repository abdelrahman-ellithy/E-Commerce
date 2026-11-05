import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LUMA API is running.',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;
