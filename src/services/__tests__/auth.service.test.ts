import { AuthService } from '../auth.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const mockHash = '$2b$12$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await AuthService.hashPassword('password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toBe(mockHash);
    });
  });

  describe('comparePassword', () => {
    it('should compare password with hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.comparePassword('password123', 'hash');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hash');
      expect(result).toBe(true);
    });
  });
});

