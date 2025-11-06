import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entities/AdminUser.entity';
import { generateToken, JwtPayload } from '../utils/jwt';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async validateUser(username: string, password: string): Promise<AdminUser | null> {
    const userRepo = AppDataSource.getRepository(AdminUser);
    const user = await userRepo.findOne({ where: { username } });

    if (!user) {
      return null;
    }

    const isValid = await this.comparePassword(password, user.password_hash);
    return isValid ? user : null;
  }

  static async generate2FASecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const userRepo = AppDataSource.getRepository(AdminUser);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `Patisserie Admin (${user.username})`,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32 || '',
      qrCodeUrl,
    };
  }

  static async enable2FA(userId: string, secret: string, token: string): Promise<boolean> {
    const userRepo = AppDataSource.getRepository(AdminUser);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (verified) {
      user.twofa_secret = secret;
      user.twofa_enabled = true;
      await userRepo.save(user);
      return true;
    }

    return false;
  }

  static async verify2FA(userId: string, token: string): Promise<boolean> {
    const userRepo = AppDataSource.getRepository(AdminUser);
    const user = await userRepo.findOne({ where: { id: userId, twofa_enabled: true } });

    if (!user || !user.twofa_secret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  static generateJwtToken(user: AdminUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    return generateToken(payload);
  }
}

