import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  createProductValidation,
  createFlavorValidation,
  updateFlavorValidation,
  validate,
} from '../middlewares/validation.middleware';

const router = Router();

// Public routes (when mounted at /products)
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Admin routes (when mounted at /admin/products)
// These will be: POST /admin/products, PATCH /admin/products/:id, DELETE /admin/products/:id
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validate(createProductValidation),
  ProductController.createProduct
);
router.patch('/:id', authenticateToken, requireAdmin, ProductController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);
router.get('/:id/flavors', authenticateToken, requireAdmin, ProductController.listProductFlavors);
router.post(
  '/:id/flavors',
  authenticateToken,
  requireAdmin,
  validate(createFlavorValidation),
  ProductController.addFlavor
);
router.patch(
  '/:id/flavors/:flavorId',
  authenticateToken,
  requireAdmin,
  validate(updateFlavorValidation),
  ProductController.updateFlavor
);
router.delete(
  '/:id/flavors/:flavorId',
  authenticateToken,
  requireAdmin,
  ProductController.deleteFlavor
);

export default router;

