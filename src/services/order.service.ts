import { AppDataSource } from '../config/database';
import { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from '../entities/Order.entity';
import { Product } from '../entities/Product.entity';
import { AuditLog, AuditAction } from '../entities/AuditLog.entity';
import { generateOrderNumber } from '../utils/orderNumber';
import { EmailService } from './email.service';

export interface CreateOrderDto {
  client_name: string;
  client_phone: string;
  client_email?: string;
  items: OrderItem[];
  pickup_or_delivery_date: string;
  payment_method: PaymentMethod;
  notes?: string;
}

export class OrderService {
  static async calculateTotal(items: OrderItem[]): Promise<number> {
    const { total } = await this.resolveOrderItems(items);
    return total;
  }

  static async createOrder(dto: CreateOrderDto): Promise<Order> {
    const orderRepo = AppDataSource.getRepository(Order);
    const { total, sanitizedItems } = await this.resolveOrderItems(dto.items);

    const order = new Order();
    order.client_name = dto.client_name;
    order.client_phone = dto.client_phone;
    order.client_email = dto.client_email;
    order.items = sanitizedItems;
    order.total_price = total;
    order.payment_method = dto.payment_method;
    order.payment_status =
      dto.payment_method === PaymentMethod.CASH
        ? PaymentStatus.PENDING
        : PaymentStatus.PENDING;
    order.status = OrderStatus.PENDING;
    order.pickup_or_delivery_date = new Date(dto.pickup_or_delivery_date);
    order.notes = dto.notes;
    order.numero_commande = generateOrderNumber();

    const savedOrder = await orderRepo.save(order);

    // Send confirmation email
    await EmailService.sendOrderConfirmation(savedOrder);
    await EmailService.sendNewOrderAlert(savedOrder);

    return savedOrder;
  }

  private static async resolveOrderItems(
    items: OrderItem[]
  ): Promise<{ total: number; sanitizedItems: OrderItem[] }> {
    const productRepo = AppDataSource.getRepository(Product);
    const sanitizedItems: OrderItem[] = [];
    let total = 0;

    for (const item of items) {
      const product = await productRepo.findOne({
        where: { id: item.product_id },
        relations: ['flavors'],
      });
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (!product.available) {
        throw new Error(`Product ${product.name} is not available`);
      }

      const selectedOptions: Record<string, any> = item.options ? { ...item.options } : {};
      const selectedFlavorId = selectedOptions.flavor_id;
      const selectedFlavorName = selectedOptions.flavor_name || selectedOptions.flavor;

      let matchedFlavor = product.flavors?.find((flavor) => flavor.id === selectedFlavorId);

      if (!matchedFlavor && selectedFlavorName) {
        matchedFlavor = product.flavors?.find(
          (flavor) => flavor.name.toLowerCase() === String(selectedFlavorName).toLowerCase()
        );
      }

      if (selectedFlavorId && !matchedFlavor) {
        throw new Error(`Flavor ${selectedFlavorId} not available for product ${product.name}`);
      }
      if (!selectedFlavorId && selectedFlavorName && !matchedFlavor) {
        throw new Error(`Flavor ${selectedFlavorName} not available for product ${product.name}`);
      }

      const flavorModifier = matchedFlavor?.price_modifier ?? 0;
      const unitPrice = product.price + flavorModifier;
      total += unitPrice * item.qty;

      if (matchedFlavor) {
        selectedOptions.flavor_id = matchedFlavor.id;
        selectedOptions.flavor_name = matchedFlavor.name;
        selectedOptions.flavor = matchedFlavor.name;
        selectedOptions.flavor_price_modifier = matchedFlavor.price_modifier;
      } else {
        delete selectedOptions.flavor_id;
        delete selectedOptions.flavor_name;
        delete selectedOptions.flavor;
        delete selectedOptions.flavor_price_modifier;
      }

      const sanitizedOptions = Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined;

      sanitizedItems.push({
        product_id: product.id,
        name: product.name,
        qty: item.qty,
        price: unitPrice,
        options: sanitizedOptions,
      });
    }

    return { total, sanitizedItems };
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUserId: string,
    notes?: string
  ): Promise<Order> {
    const orderRepo = AppDataSource.getRepository(Order);
    const auditRepo = AppDataSource.getRepository(AuditLog);

    const order = await orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;
    if (notes) {
      order.notes_admin = notes;
    }
    order.last_modified_by = adminUserId;

    const savedOrder = await orderRepo.save(order);

    // Create audit log
    const auditLog = new AuditLog();
    auditLog.action = AuditAction.ORDER_STATUS_CHANGED;
    auditLog.order_id = orderId;
    auditLog.admin_user_id = adminUserId;
    auditLog.old_values = { status: oldStatus };
    auditLog.new_values = { status: newStatus };
    auditLog.description = `Status changed from ${oldStatus} to ${newStatus}`;
    await auditRepo.save(auditLog);

    // Send email if status changed to something meaningful
    if (newStatus !== oldStatus && savedOrder.client_email) {
      await EmailService.sendOrderStatusUpdate(savedOrder, newStatus);
    }

    return savedOrder;
  }

  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    adminUserId: string,
    paypalPaymentId?: string
  ): Promise<Order> {
    const orderRepo = AppDataSource.getRepository(Order);
    const auditRepo = AppDataSource.getRepository(AuditLog);

    const order = await orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    const oldPaymentStatus = order.payment_status;
    order.payment_status = paymentStatus;
    if (paypalPaymentId) {
      order.paypal_payment_id = paypalPaymentId;
    }
    if (adminUserId !== 'system') {
      order.last_modified_by = adminUserId;
    }

    const savedOrder = await orderRepo.save(order);

    // Create audit log only if not system update
    if (adminUserId !== 'system') {
      const auditLog = new AuditLog();
      auditLog.action = AuditAction.ORDER_PAYMENT_UPDATED;
      auditLog.order_id = orderId;
      auditLog.admin_user_id = adminUserId;
      auditLog.old_values = { payment_status: oldPaymentStatus };
      auditLog.new_values = { payment_status: paymentStatus };
      auditLog.description = `Payment status changed from ${oldPaymentStatus} to ${paymentStatus}`;
      await auditRepo.save(auditLog);
    }

    return savedOrder;
  }

  static async getOrders(filters?: {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    date_from?: Date;
    date_to?: Date;
  }): Promise<Order[]> {
    const orderRepo = AppDataSource.getRepository(Order);
    const queryBuilder = orderRepo.createQueryBuilder('order');

    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }
    if (filters?.payment_status) {
      queryBuilder.andWhere('order.payment_status = :payment_status', {
        payment_status: filters.payment_status,
      });
    }
    if (filters?.date_from) {
      queryBuilder.andWhere('order.pickup_or_delivery_date >= :date_from', {
        date_from: filters.date_from,
      });
    }
    if (filters?.date_to) {
      queryBuilder.andWhere('order.pickup_or_delivery_date <= :date_to', {
        date_to: filters.date_to,
      });
    }

    queryBuilder.orderBy('order.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const orderRepo = AppDataSource.getRepository(Order);
    return orderRepo.findOne({
      where: { id },
      relations: ['last_modified_by_user'],
    });
  }

  static async getOrdersByDateRange(dateFrom: Date, dateTo: Date): Promise<Order[]> {
    const orderRepo = AppDataSource.getRepository(Order);
    return orderRepo
      .createQueryBuilder('order')
      .where('order.pickup_or_delivery_date >= :dateFrom', { dateFrom })
      .andWhere('order.pickup_or_delivery_date <= :dateTo', { dateTo })
      .orderBy('order.pickup_or_delivery_date', 'ASC')
      .getMany();
  }

  static async getStats(): Promise<{
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    ordersByStatus: Record<string, number>;
  }> {
    const orderRepo = AppDataSource.getRepository(Order);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, allOrders] = await Promise.all([
      orderRepo.count(),
      orderRepo.find({ where: { payment_status: PaymentStatus.PAID } }),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total_price, 0);

    const todayOrdersQuery = orderRepo
      .createQueryBuilder('order')
      .where('order.created_at >= :today', { today })
      .andWhere('order.created_at < :tomorrow', { tomorrow });

    const todayOrders = await todayOrdersQuery.getCount();

    const todayRevenueQuery = orderRepo
      .createQueryBuilder('order')
      .where('order.created_at >= :today', { today })
      .andWhere('order.created_at < :tomorrow', { tomorrow })
      .andWhere('order.payment_status = :status', { status: PaymentStatus.PAID });

    const todayOrdersList = await todayRevenueQuery.getMany();
    const todayRevenue = todayOrdersList.reduce((sum, order) => sum + order.total_price, 0);

    const ordersByStatus: Record<string, number> = {};
    const statuses = Object.values(OrderStatus);
    for (const status of statuses) {
      ordersByStatus[status] = await orderRepo.count({ where: { status } });
    }

    return {
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      ordersByStatus,
    };
  }
}

