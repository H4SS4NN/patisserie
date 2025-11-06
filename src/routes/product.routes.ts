import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  createProductValidation,
  validate,
} from '../middlewares/validation.middleware';

const router = Router();

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Admin routes
router.post(
  '/admin/products',
  authenticateToken,
  requireAdmin,
  validate(createProductValidation),
  ProductController.createProduct
);
router.patch('/admin/products/:id', authenticateToken, requireAdmin, ProductController.updateProduct);
router.delete('/admin/products/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

export default router;

