import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

import { Product } from '../entities/Product.entity';
import { Order } from '../entities/Order.entity';
import { AdminUser } from '../entities/AdminUser.entity';
import { AuditLog } from '../entities/AuditLog.entity';

// Import explicite des entités pour éviter les problèmes de chemin
const entities = [Product, Order, AdminUser, AuditLog];

// Chemin des migrations
const migrationsPath = process.env.NODE_ENV === 'production'
  ? join(__dirname, '../migrations/**/*.js')
  : join(__dirname, '../migrations/**/*.ts');

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'patisserie_db',
  entities: entities,
  migrations: [migrationsPath],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});

