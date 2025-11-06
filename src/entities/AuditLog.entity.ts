import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminUser } from './AdminUser.entity';
import { Order } from './Order.entity';

export enum AuditAction {
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  ORDER_PAYMENT_UPDATED = 'ORDER_PAYMENT_UPDATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ type: 'uuid', nullable: true })
  order_id?: string;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @Column({ type: 'uuid', nullable: true })
  admin_user_id?: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'admin_user_id' })
  admin_user?: AdminUser;

  @Column({ type: 'json', nullable: true })
  old_values?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  new_values?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;
}

