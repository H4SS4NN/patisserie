import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminUser } from './AdminUser.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  PAYPAL = 'PAYPAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EN_PREPARATION = 'EN_PREPARATION',
  EN_CUISSON = 'EN_CUISSON',
  PRETE = 'PRETE',
  LIVREE = 'LIVREE',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  options?: Record<string, any>;
  price: number; // in centimes
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  client_name!: string;

  @Column({ type: 'varchar', length: 50 })
  client_phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_email?: string;

  @Column({ type: 'json' })
  items!: OrderItem[];

  @Column({ type: 'int', comment: 'Total price in centimes' })
  total_price!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  payment_method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'datetime' })
  pickup_or_delivery_date!: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  notes_admin?: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero_commande!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paypal_payment_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'uuid', nullable: true })
  last_modified_by?: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'last_modified_by' })
  last_modified_by_user?: AdminUser;
}

