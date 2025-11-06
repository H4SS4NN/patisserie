import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../../config/database';
import webhookRoutes from '../../routes/webhook.routes';

const createTestApp = () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/webhooks', webhookRoutes);
  return testApp;
};

const app = createTestApp();
import { Order, PaymentStatus, PaymentMethod } from '../../entities/Order.entity';
import { Product } from '../../entities/Product.entity';

describe('Webhook Integration Tests', () => {
  let testOrderId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();

    // Create test product and order
    const productRepo = AppDataSource.getRepository(Product);
    const product = new Product();
    product.name = 'Test Product';
    product.price = 5000;
    product.available = true;
    const savedProduct = await productRepo.save(product);

    const orderRepo = AppDataSource.getRepository(Order);
    const order = new Order();
    order.client_name = 'Test Client';
    order.client_phone = '+33612345678';
    order.items = [
      {
        product_id: savedProduct.id,
        name: 'Test Product',
        qty: 1,
        price: 5000,
      },
    ];
    order.total_price = 5000;
    order.payment_method = PaymentMethod.PAYPAL;
    order.payment_status = PaymentStatus.PENDING;
    order.pickup_or_delivery_date = new Date('2025-12-24');
    order.numero_commande = 'PAT-TEST-001';
    order.paypal_payment_id = 'PAY-123456789';
    const savedOrder = await orderRepo.save(order);
    testOrderId = savedOrder.id;
  });

  afterAll(async () => {
    const orderRepo = AppDataSource.getRepository(Order);
    const productRepo = AppDataSource.getRepository(Product);

    await orderRepo.delete({});
    await productRepo.delete({});

    await AppDataSource.destroy();
  });

  describe('POST /webhooks/paypal', () => {
    it('should handle PayPal payment completed webhook', async () => {
      const webhookPayload = {
        event_type: 'PAYMENT.SALE.COMPLETED',
        resource: {
          parent_payment: 'PAY-123456789',
        },
      };

      const response = await request(app)
        .post('/webhooks/paypal')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify order payment status was updated
      const orderRepo = AppDataSource.getRepository(Order);
      const order = await orderRepo.findOne({ where: { id: testOrderId } });
      expect(order?.payment_status).toBe(PaymentStatus.PAID);
    });

    it('should handle missing payment ID gracefully', async () => {
      const webhookPayload = {
        event_type: 'PAYMENT.SALE.COMPLETED',
        resource: {},
      };

      const response = await request(app)
        .post('/webhooks/paypal')
        .send(webhookPayload);

      expect(response.status).toBe(400);
    });
  });
});

