import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidator, validate, updateProfile);
router.put('/password', protect, changePasswordValidator, validate, changePassword);

export default router;
