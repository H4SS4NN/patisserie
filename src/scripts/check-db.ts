import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product.entity';
import { config } from 'dotenv';

config();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database...');
      await AppDataSource.initialize();
    }
    
    console.log('✓ Database connected');
    console.log('Database:', process.env.DB_DATABASE);
    console.log('Host:', process.env.DB_HOST);
    
    const productRepo = AppDataSource.getRepository(Product);
    const count = await productRepo.count();
    
    console.log(`✓ Products table exists. Total products: ${count}`);
    
    if (count === 0) {
      console.log('⚠ No products found. Run: npm run seed');
    } else {
      const products = await productRepo.find({ take: 5 });
      console.log('Sample products:');
      products.forEach(p => {
        console.log(`  - ${p.name} (${p.price / 100}€)`);
      });
    }
    
    await AppDataSource.destroy();
    console.log('✓ Check completed');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Database check failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkDatabase();

