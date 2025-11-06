import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entities/AdminUser.entity';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await AuthService.validateUser(username, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // If 2FA is enabled, require token
      if (user.twofa_enabled) {
        res.json({
          success: true,
          requires2FA: true,
          userId: user.id,
        });
        return;
      }

      const token = AuthService.generateJwtToken(user);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          twofa_enabled: user.twofa_enabled,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;

      const isValid = await AuthService.verify2FA(userId, token);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid 2FA token' });
        return;
      }

      const userRepo = AppDataSource.getRepository(AdminUser);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const jwtToken = AuthService.generateJwtToken(user);
      res.json({
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          twofa_enabled: user.twofa_enabled,
        },
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async setup2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { secret, qrCodeUrl } = await AuthService.generate2FASecret(req.user.userId);
      res.json({
        secret,
        qrCodeUrl,
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async enable2FA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { secret, token } = req.body;
      const success = await AuthService.enable2FA(req.user.userId, secret, token);

      if (success) {
        res.json({ success: true, message: '2FA enabled successfully' });
      } else {
        res.status(400).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userRepo = AppDataSource.getRepository(AdminUser);
      const user = await userRepo.findOne({
        where: { id: req.user.userId },
        select: ['id', 'username', 'role', 'twofa_enabled', 'created_at'],
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

