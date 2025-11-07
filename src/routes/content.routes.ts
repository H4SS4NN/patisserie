import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import {
  createPageContentValidation,
  updatePageContentValidation,
  validate,
} from '../middlewares/validation.middleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, ContentController.listPages);
router.get('/:slug', authenticateToken, requireAdmin, ContentController.getPage);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validate(createPageContentValidation),
  ContentController.createPage
);

router.put(
  '/:slug',
  authenticateToken,
  requireAdmin,
  validate(updatePageContentValidation),
  ContentController.upsertPage
);

router.patch(
  '/:slug',
  authenticateToken,
  requireAdmin,
  validate(updatePageContentValidation),
  ContentController.upsertPage
);

router.delete('/:slug', authenticateToken, requireAdmin, ContentController.deletePage);

export default router;


