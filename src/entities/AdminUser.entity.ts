import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdminRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  role!: AdminRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twofa_secret?: string;

  @Column({ type: 'boolean', default: false })
  twofa_enabled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

