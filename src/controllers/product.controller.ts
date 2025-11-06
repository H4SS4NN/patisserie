import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product.entity';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProductController {
  static async getProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Vérifier que la base de données est initialisée
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const productRepo = AppDataSource.getRepository(Product);
      const where: any = {};

      // Only show available products for public
      if (!req.user) {
        where.available = true;
      }

      const products = await productRepo.find({
        where,
        order: { created_at: 'DESC' },
      });

      res.json({ products });
    } catch (error: any) {
      console.error('Get products error:', error);
      console.error('Error details:', error.stack);
      res.status(500).json({ 
        error: error.message || 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  static async getProductById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productRepo = AppDataSource.getRepository(Product);
      const where: any = { id: req.params.id };

      if (!req.user) {
        where.available = true;
      }

      const product = await productRepo.findOne({ where });
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json({ product });
    } catch (error: any) {
      console.error('Get product error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch product' });
    }
  }

  static async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productRepo = AppDataSource.getRepository(Product);
      const product = new Product();
      product.name = req.body.name;
      product.description = req.body.description;
      product.category = req.body.category;
      product.price = req.body.price;
      product.options = req.body.options;
      product.image_url = req.body.image_url;
      product.available = req.body.available !== undefined ? req.body.available : true;

      const savedProduct = await productRepo.save(product);
      res.status(201).json({ success: true, product: savedProduct });
    } catch (error: any) {
      console.error('Create product error:', error);
      res.status(400).json({ error: error.message || 'Failed to create product' });
    }
  }

  static async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productRepo = AppDataSource.getRepository(Product);
      const product = await productRepo.findOne({ where: { id: req.params.id } });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      if (req.body.name) product.name = req.body.name;
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.category !== undefined) product.category = req.body.category;
      if (req.body.price !== undefined) product.price = req.body.price;
      if (req.body.options !== undefined) product.options = req.body.options;
      if (req.body.image_url !== undefined) product.image_url = req.body.image_url;
      if (req.body.available !== undefined) product.available = req.body.available;

      const savedProduct = await productRepo.save(product);
      res.json({ success: true, product: savedProduct });
    } catch (error: any) {
      console.error('Update product error:', error);
      res.status(400).json({ error: error.message || 'Failed to update product' });
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productRepo = AppDataSource.getRepository(Product);
      const product = await productRepo.findOne({ where: { id: req.params.id } });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      await productRepo.remove(product);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      console.error('Delete product error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete product' });
    }
  }
}

