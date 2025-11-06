import { Request, Response } from 'express';
import { OrderService, CreateOrderDto } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { PaymentMethod } from '../entities/Order.entity';
import { AuthRequest } from '../middlewares/auth.middleware';

export class OrderController {
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateOrderDto = {
        client_name: req.body.client_name,
        client_phone: req.body.client_phone,
        client_email: req.body.client_email,
        items: req.body.items,
        pickup_or_delivery_date: req.body.pickup_or_delivery_date,
        payment_method: req.body.payment_method,
        notes: req.body.notes,
      };

      const order = await OrderService.createOrder(dto);

      let paymentData = null;
      if (order.payment_method === PaymentMethod.PAYPAL) {
        try {
          const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success`;
          const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/cancel`;
          const payment = await PaymentService.createPayPalPayment(order, returnUrl, cancelUrl);
          paymentData = {
            paymentId: payment.paymentId,
            approvalUrl: payment.approvalUrl,
          };
        } catch (paypalError: any) {
          console.error('PayPal payment creation failed:', paypalError);
          
          // Si PayPal échoue, on retourne quand même la commande mais avec une erreur PayPal
          // L'admin pourra changer le mode de paiement en CASH si nécessaire
          res.status(201).json({
            success: true,
            order: {
              id: order.id,
              numero_commande: order.numero_commande,
              total_price: order.total_price,
              payment_method: order.payment_method,
              payment_status: order.payment_status,
              status: order.status,
            },
            payment: null,
            paypalError: paypalError.response?.error_description || paypalError.message || 'PayPal authentication failed. Please configure PayPal credentials or use CASH payment.',
          });
          return;
        }
      }

      res.status(201).json({
        success: true,
        order: {
          id: order.id,
          numero_commande: order.numero_commande,
          total_price: order.total_price,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          status: order.status,
        },
        payment: paymentData,
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(400).json({ error: error.message || 'Failed to create order' });
    }
  }

  static async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: any = {};
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.payment_status) {
        filters.payment_status = req.query.payment_status;
      }
      if (req.query.date_from) {
        filters.date_from = new Date(req.query.date_from as string);
      }
      if (req.query.date_to) {
        filters.date_to = new Date(req.query.date_to as string);
      }

      const orders = await OrderService.getOrders(filters);
      res.json({ orders });
    } catch (error: any) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch orders' });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json({ order });
    } catch (error: any) {
      console.error('Get order error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch order' });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { status, notes } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        status,
        req.user.userId,
        notes
      );
      res.json({ success: true, order });
    } catch (error: any) {
      console.error('Update order status error:', error);
      res.status(400).json({ error: error.message || 'Failed to update order status' });
    }
  }

  static async updatePaymentStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { payment_status, paypal_payment_id } = req.body;
      const order = await OrderService.updatePaymentStatus(
        req.params.id,
        payment_status,
        req.user.userId,
        paypal_payment_id
      );
      res.json({ success: true, order });
    } catch (error: any) {
      console.error('Update payment status error:', error);
      res.status(400).json({ error: error.message || 'Failed to update payment status' });
    }
  }

  static async getCalendar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dateFrom = req.query.date_from
        ? new Date(req.query.date_from as string)
        : new Date();
      const dateTo = req.query.date_to
        ? new Date(req.query.date_to as string)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

      const orders = await OrderService.getOrdersByDateRange(dateFrom, dateTo);

      // Group by date
      const grouped: Record<string, any[]> = {};
      orders.forEach((order) => {
        const dateKey = order.pickup_or_delivery_date.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(order);
      });

      res.json({ calendar: grouped });
    } catch (error: any) {
      console.error('Get calendar error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch calendar' });
    }
  }

  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await OrderService.getStats();
      res.json({ stats });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
  }
}

