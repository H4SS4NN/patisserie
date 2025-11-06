import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { loginValidation, validate } from '../middlewares/validation.middleware';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/login', authRateLimiter, validate(loginValidation), AuthController.login);
router.post('/2fa/verify', AuthController.verify2FA);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/2fa/setup', authenticateToken, requireAdmin, AuthController.setup2FA);
router.post('/2fa/enable', authenticateToken, requireAdmin, AuthController.enable2FA);

export default router;

