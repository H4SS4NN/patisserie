import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePageContent1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS page_contents (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSON,
        metadata JSON,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_page_content_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS page_contents`);
  }
}


