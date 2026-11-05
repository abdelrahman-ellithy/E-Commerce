import { Router } from 'express';
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderValidator,
  orderIdValidator,
} from '../validators/orderValidators.js';

const router = Router();

router.use(protect);

router.post('/', createOrderValidator, validate, createOrder);
router.get('/mine', getMyOrders);
router.get('/:id', orderIdValidator, validate, getOrder);
router.patch('/:id/cancel', orderIdValidator, validate, cancelOrder);

export default router;
