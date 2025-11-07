import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';

const router = Router();

router.get('/:slug', ContentController.getPage);

export default router;


