import { OrderService } from '../order.service';
import { AppDataSource } from '../../config/database';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../entities/Order.entity';
import { Product } from '../../entities/Product.entity';

jest.mock('../../config/database');
jest.mock('../email.service');

describe('OrderService', () => {
  const mockProductRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Product) return mockProductRepo;
      if (entity === Order) return mockOrderRepo;
      return {};
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total from server-side prices', async () => {
      const items = [
        { product_id: '1', name: 'Product 1', qty: 2, price: 1000 },
        { product_id: '2', name: 'Product 2', qty: 1, price: 2000 },
      ];

      mockProductRepo.findOne
        .mockResolvedValueOnce({ id: '1', price: 1000, available: true })
        .mockResolvedValueOnce({ id: '2', price: 2000, available: true });

      const total = await OrderService.calculateTotal(items);

      expect(total).toBe(4000); // 2 * 1000 + 1 * 2000
    });

    it('should throw error if product not found', async () => {
      const items = [{ product_id: '1', name: 'Product 1', qty: 1, price: 1000 }];

      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(OrderService.calculateTotal(items)).rejects.toThrow('not found');
    });
  });

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const dto = {
        client_name: 'John Doe',
        client_phone: '+33612345678',
        client_email: 'john@example.com',
        items: [{ product_id: '1', name: 'Product 1', qty: 1, price: 1000 }],
        pickup_or_delivery_date: '2025-12-24T10:00:00Z',
        payment_method: PaymentMethod.CASH,
        notes: 'Test order',
      };

      mockProductRepo.findOne.mockResolvedValue({ id: '1', price: 1000, available: true });
      mockOrderRepo.save.mockResolvedValue({
        id: 'order-1',
        numero_commande: 'PAT-20251104-0001',
        ...dto,
        total_price: 1000,
        payment_status: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      });

      const order = await OrderService.createOrder(dto);

      expect(order).toBeDefined();
      expect(order.numero_commande).toBeDefined();
      expect(mockOrderRepo.save).toHaveBeenCalled();
    });
  });
});

