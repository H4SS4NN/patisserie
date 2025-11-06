import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../../config/database';
import { AdminUser } from '../../entities/AdminUser.entity';
import { AuthService } from '../../services/auth.service';
import authRoutes from '../../routes/auth.routes';

// Create test app instance
const createTestApp = () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/auth', authRoutes);
  return testApp;
};

const app = createTestApp();

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Clean up and create test admin
    const adminRepo = AppDataSource.getRepository(AdminUser);
    await adminRepo.delete({ username: 'testadmin' });

    const admin = new AdminUser();
    admin.username = 'testadmin';
    admin.password_hash = await AuthService.hashPassword('testpass123');
    admin.role = 'ADMIN';
    admin.twofa_enabled = false;
    await adminRepo.save(admin);
  });

  afterEach(async () => {
    const adminRepo = AppDataSource.getRepository(AdminUser);
    await adminRepo.delete({ username: 'testadmin' });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'testpass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testadmin');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should require username and password', async () => {
      const response = await request(app).post('/auth/login').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get profile with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'testpass123',
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/auth/profile');

      expect(response.status).toBe(401);
    });
  });
});

