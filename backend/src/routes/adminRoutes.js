import { Router } from 'express';
import {
  getAdminOrders,
  getDashboardStats,
  markOrderPaid,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminOrderQueryValidator,
  markPaidValidator,
  updateOrderStatusValidator,
} from '../validators/orderValidators.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/orders', adminOrderQueryValidator, validate, getAdminOrders);
router.patch(
  '/orders/:id/status',
  updateOrderStatusValidator,
  validate,
  updateOrderStatus
);
router.patch('/orders/:id/pay', markPaidValidator, validate, markOrderPaid);

export default router;
