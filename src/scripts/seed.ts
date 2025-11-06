import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product.entity';
import { AdminUser, AdminRole } from '../entities/AdminUser.entity';
import { AuthService } from '../services/auth.service';
import { CATEGORY_NAMES } from '../config/categories';
import { config } from 'dotenv';

config();

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const productRepo = AppDataSource.getRepository(Product);
    const adminRepo = AppDataSource.getRepository(AdminUser);

    // Seed products - Les catégories de gâteaux
    const products = [
      {
        name: 'Tartes et tartelettes',
        description: 'Délicieuses tartes et tartelettes artisanales. Choisissez votre goût préféré lors de l\'ajout au panier.',
        price: 2500, // 25.00€ - prix de base
        options: {},
        image_url: '',
        available: true,
      },
      {
        name: 'Cookies',
        description: 'Cookies maison croustillants. Sélectionnez votre parfum favori lors de l\'ajout au panier.',
        price: 1200, // 12.00€ - prix de base
        options: {},
        image_url: '',
        available: true,
      },
      {
        name: 'Entremets',
        description: 'Entremets raffinés et élégants. Choisissez votre goût lors de l\'ajout au panier.',
        price: 4500, // 45.00€ - prix de base
        options: {},
        image_url: '',
        available: true,
      },
      {
        name: 'Flanc',
        description: 'Flancs onctueux et crémeux. Sélectionnez votre parfum préféré lors de l\'ajout au panier.',
        price: 2800, // 28.00€ - prix de base
        options: {},
        image_url: '',
        available: true,
      },
      {
        name: 'Layer cake',
        description: 'Layer cakes personnalisables. Choisissez votre goût et le nombre de parts (8, 12 ou 16) lors de l\'ajout au panier.',
        price: 3500, // 35.00€ - prix de base pour 8 parts
        options: {},
        image_url: '',
        available: true,
      },
    ];

    for (const productData of products) {
      const existing = await productRepo.findOne({ where: { name: productData.name } });
      if (!existing) {
        const product = new Product();
        Object.assign(product, productData);
        await productRepo.save(product);
        console.log(`Created product: ${product.name}`);
      }
    }

    // Seed admin user
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await adminRepo.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      const admin = new AdminUser();
      admin.username = adminUsername;
      admin.password_hash = await AuthService.hashPassword(adminPassword);
      admin.role = AdminRole.SUPER_ADMIN;
      admin.twofa_enabled = false;
      await adminRepo.save(admin);
      console.log(`Created admin user: ${adminUsername} / ${adminPassword}`);
    } else {
      console.log(`Admin user ${adminUsername} already exists`);
    }

    console.log('Seed completed successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();

