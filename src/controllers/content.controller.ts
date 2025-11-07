import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { PageContent } from '../entities/PageContent.entity';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ContentController {
  static async listPages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PageContent);
      const pages = await repo.find({ order: { updated_at: 'DESC' } });
      res.json({ pages });
    } catch (error: any) {
      console.error('List pages error:', error);
      res.status(500).json({ error: error.message || 'Failed to list pages' });
    }
  }

  static async getPage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PageContent);
      const page = await repo.findOne({ where: { slug: req.params.slug } });
      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }
      res.json({ page });
    } catch (error: any) {
      console.error('Get page error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch page' });
    }
  }

  static async upsertPage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PageContent);
      const existing = await repo.findOne({ where: { slug: req.params.slug } });

      if (!existing) {
        const page = repo.create({
          slug: req.params.slug,
          title: req.body.title,
          description: req.body.description,
          content: req.body.content,
          metadata: req.body.metadata,
        });
        const saved = await repo.save(page);
        res.status(201).json({ success: true, page: saved });
        return;
      }

      if (req.body.title !== undefined) existing.title = req.body.title;
      if (req.body.description !== undefined) existing.description = req.body.description;
      if (req.body.content !== undefined) existing.content = req.body.content;
      if (req.body.metadata !== undefined) existing.metadata = req.body.metadata;

      const saved = await repo.save(existing);
      res.json({ success: true, page: saved });
    } catch (error: any) {
      console.error('Upsert page error:', error);
      res.status(400).json({ error: error.message || 'Failed to save page' });
    }
  }

  static async createPage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PageContent);
      const page = repo.create({
        slug: req.body.slug,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        metadata: req.body.metadata,
      });

      const saved = await repo.save(page);
      res.status(201).json({ success: true, page: saved });
    } catch (error: any) {
      console.error('Create page error:', error);
      res.status(400).json({ error: error.message || 'Failed to create page' });
    }
  }

  static async deletePage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PageContent);
      const page = await repo.findOne({ where: { slug: req.params.slug } });

      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      await repo.remove(page);
      res.json({ success: true, message: 'Page deleted' });
    } catch (error: any) {
      console.error('Delete page error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete page' });
    }
  }
}


