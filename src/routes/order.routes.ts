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

// Public routes
router.post('/', orderRateLimiter, validate(createOrderValidation), OrderController.createOrder);

// Admin routes (mounted at /orders, so these become /orders/admin/...)
router.get('/admin/orders', authenticateToken, requireAdmin, OrderController.getOrders);
router.get('/admin/orders/:id', authenticateToken, requireAdmin, OrderController.getOrderById);
router.patch(
  '/admin/orders/:id/status',
  authenticateToken,
  requireAdmin,
  validate(updateOrderStatusValidation),
  OrderController.updateOrderStatus
);
router.patch(
  '/admin/orders/:id/payment',
  authenticateToken,
  requireAdmin,
  validate(updatePaymentStatusValidation),
  OrderController.updatePaymentStatus
);
router.get('/admin/calendar', authenticateToken, requireAdmin, OrderController.getCalendar);
router.get('/admin/stats', authenticateToken, requireAdmin, OrderController.getStats);

export default router;

