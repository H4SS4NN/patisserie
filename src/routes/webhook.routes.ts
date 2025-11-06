import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/paypal', WebhookController.handlePayPalWebhook);
router.post('/paypal/execute', WebhookController.executePayPalPayment);

export default router;

