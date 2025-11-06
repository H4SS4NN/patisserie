import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToProducts1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products 
      ADD COLUMN category VARCHAR(100) NULL AFTER description,
      ADD INDEX idx_category (category)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products 
      DROP INDEX idx_category,
      DROP COLUMN category
    `);
  }
}

