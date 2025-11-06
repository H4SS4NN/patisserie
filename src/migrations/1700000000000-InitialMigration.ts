import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Products table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INT NOT NULL COMMENT 'Price in centimes',
        options JSON,
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_available (available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Admin users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
        twofa_secret VARCHAR(255),
        twofa_enabled BOOLEAN DEFAULT FALSE,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Orders table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        client_email VARCHAR(255),
        items JSON NOT NULL,
        total_price INT NOT NULL COMMENT 'Total price in centimes',
        payment_method ENUM('CASH', 'PAYPAL') DEFAULT 'CASH',
        payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
        status ENUM('PENDING', 'CONFIRMED', 'EN_PREPARATION', 'EN_CUISSON', 'PRETE', 'LIVREE', 'CANCELLED') DEFAULT 'PENDING',
        pickup_or_delivery_date DATETIME NOT NULL,
        notes TEXT,
        notes_admin TEXT,
        numero_commande VARCHAR(50) UNIQUE NOT NULL,
        paypal_payment_id VARCHAR(255),
        last_modified_by VARCHAR(36),
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_pickup_date (pickup_or_delivery_date),
        INDEX idx_numero_commande (numero_commande),
        FOREIGN KEY (last_modified_by) REFERENCES admin_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Audit logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        action ENUM('ORDER_STATUS_CHANGED', 'ORDER_PAYMENT_UPDATED', 'ORDER_UPDATED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED') NOT NULL,
        order_id VARCHAR(36),
        admin_user_id VARCHAR(36),
        old_values JSON,
        new_values JSON,
        description TEXT,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX idx_action (action),
        INDEX idx_order_id (order_id),
        INDEX idx_admin_user_id (admin_user_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS admin_users`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
  }
}

