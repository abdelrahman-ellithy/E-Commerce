import { Router } from 'express';
import {
  addReview,
  createProduct,
  deleteProduct,
  getAdminProduct,
  getAdminProducts,
  getCategories,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProductValidator,
  productIdValidator,
  productQueryValidator,
  reviewValidator,
  updateProductValidator,
} from '../validators/productValidators.js';

const router = Router();

router.get('/', productQueryValidator, validate, getProducts);
router.get('/categories', getCategories);

// Admin-only collection endpoints must be declared before `/:id`.
router.get(
  '/admin/all',
  protect,
  authorize('admin'),
  productQueryValidator,
  validate,
  getAdminProducts
);
router.get(
  '/admin/:id',
  protect,
  authorize('admin'),
  productIdValidator,
  validate,
  getAdminProduct
);

router.get('/:id', productIdValidator, validate, getProduct);

router.post(
  '/',
  protect,
  authorize('admin'),
  createProductValidator,
  validate,
  createProduct
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  productIdValidator,
  updateProductValidator,
  validate,
  updateProduct
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  productIdValidator,
  validate,
  deleteProduct
);

router.post('/:id/reviews', protect, reviewValidator, validate, addReview);

export default router;
