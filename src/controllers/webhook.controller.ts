import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, PaymentStatus } from '../entities/Order.entity';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';

export class WebhookController {
  static async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;

      // Handle payment completed event
      if (event.event_type === 'PAYMENT.SALE.COMPLETED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const paymentId = event.resource?.parent_payment || event.resource?.id;

        if (!paymentId) {
          res.status(400).json({ error: 'Payment ID missing' });
          return;
        }

        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({ where: { paypal_payment_id: paymentId } });

        if (!order) {
          console.warn(`Order not found for PayPal payment ID: ${paymentId}`);
          res.status(404).json({ error: 'Order not found' });
          return;
        }

        // Update payment status to PAID
        await OrderService.updatePaymentStatus(
          order.id,
          PaymentStatus.PAID,
          'system', // System user for webhook updates
          paymentId
        );

        res.json({ success: true, message: 'Payment status updated' });
        return;
      }

      // Handle other PayPal events
      res.json({ success: true, message: 'Webhook received' });
    } catch (error: any) {
      console.error('PayPal webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  static async executePayPalPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, payerId, orderId } = req.body;

      if (!paymentId || !payerId || !orderId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const result = await PaymentService.executePayPalPayment(paymentId, payerId);

      if (result.success) {
        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({ where: { id: orderId } });

        if (order) {
          await OrderService.updatePaymentStatus(
            order.id,
            PaymentStatus.PAID,
            'system',
            paymentId
          );
        }

        res.json({ success: true, transactionId: result.transactionId });
      } else {
        res.status(400).json({ error: 'Payment execution failed' });
      }
    } catch (error: any) {
      console.error('Execute PayPal payment error:', error);
      res.status(500).json({ error: error.message || 'Payment execution failed' });
    }
  }
}

