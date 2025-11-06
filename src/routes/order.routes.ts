import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
  validate,
} from '../middlewares/validation.middleware';
import { orderRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Public routes (when mounted at /orders)
router.post('/', orderRateLimiter, validate(createOrderValidation), OrderController.createOrder);

// Admin routes (when mounted at /admin/orders)
// These will be: GET /admin/orders, GET /admin/orders/:id, etc.
router.get('/', authenticateToken, requireAdmin, OrderController.getOrders);
router.get('/calendar', authenticateToken, requireAdmin, OrderController.getCalendar);
router.get('/stats', authenticateToken, requireAdmin, OrderController.getStats);
router.get('/:id', authenticateToken, requireAdmin, OrderController.getOrderById);
router.patch(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  validate(updateOrderStatusValidation),
  OrderController.updateOrderStatus
);
router.patch(
  '/:id/payment',
  authenticateToken,
  requireAdmin,
  validate(updatePaymentStatusValidation),
  OrderController.updatePaymentStatus
);

export default router;

