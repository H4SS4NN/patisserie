import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../../config/database';
import authRoutes from '../../routes/auth.routes';
import orderRoutes from '../../routes/order.routes';

const createTestApp = () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/auth', authRoutes);
  testApp.use('/orders', orderRoutes);
  return testApp;
};

const app = createTestApp();
import { Order } from '../../entities/Order.entity';
import { Product } from '../../entities/Product.entity';
import { AdminUser } from '../../entities/AdminUser.entity';
import { AuthService } from '../../services/auth.service';
import { PaymentMethod } from '../../entities/Order.entity';

describe('Order Integration Tests', () => {
  let adminToken: string;
  let testProductId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();

    // Create test admin
    const adminRepo = AppDataSource.getRepository(AdminUser);
    const admin = new AdminUser();
    admin.username = 'testadmin';
    admin.password_hash = await AuthService.hashPassword('testpass123');
    admin.role = 'ADMIN';
    await adminRepo.save(admin);

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'testadmin',
        password: 'testpass123',
      });
    adminToken = loginResponse.body.token;

    // Create test product
    const productRepo = AppDataSource.getRepository(Product);
    const product = new Product();
    product.name = 'Test Product';
    product.price = 5000; // 50.00€
    product.available = true;
    const savedProduct = await productRepo.save(product);
    testProductId = savedProduct.id;
  });

  afterAll(async () => {
    // Cleanup
    const orderRepo = AppDataSource.getRepository(Order);
    const productRepo = AppDataSource.getRepository(Product);
    const adminRepo = AppDataSource.getRepository(AdminUser);

    await orderRepo.delete({});
    await productRepo.delete({});
    await adminRepo.delete({ username: 'testadmin' });

    await AppDataSource.destroy();
  });

  describe('POST /orders', () => {
    it('should create order with valid data (CASH)', async () => {
      const orderData = {
        client_name: 'Sami Dupont',
        client_phone: '+33612345678',
        client_email: 'sami@example.com',
        items: [
          {
            product_id: testProductId,
            name: 'Test Product',
            qty: 1,
            price: 5000,
          },
        ],
        pickup_or_delivery_date: '2025-12-24T10:00:00+01:00',
        payment_method: PaymentMethod.CASH,
        notes: 'Test order',
      };

      const response = await request(app).post('/orders').send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.numero_commande).toBeDefined();
      expect(response.body.order.payment_method).toBe(PaymentMethod.CASH);
    });

    it('should reject order with invalid data', async () => {
      const response = await request(app).post('/orders').send({
        client_name: 'Test',
        // Missing required fields
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /admin/orders', () => {
    it('should get orders list (admin only)', async () => {
      const response = await request(app)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toBeDefined();
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/admin/orders');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /admin/orders/:id/status', () => {
    it('should update order status', async () => {
      // First create an order
      const orderData = {
        client_name: 'Test User',
        client_phone: '+33612345678',
        items: [
          {
            product_id: testProductId,
            name: 'Test Product',
            qty: 1,
            price: 5000,
          },
        ],
        pickup_or_delivery_date: '2025-12-24T10:00:00+01:00',
        payment_method: PaymentMethod.CASH,
      };

      const createResponse = await request(app).post('/orders').send(orderData);
      const orderId = createResponse.body.order.id;

      // Update status
      const updateResponse = await request(app)
        .patch(`/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'CONFIRMED',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.order.status).toBe('CONFIRMED');
    });
  });
});

