import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../db/index.js';

describe('Authentication Endpoints', () => {
  let testUser;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.person.create({
      data: {
        fullName: 'Test User',
        emailAddress: 'test@example.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqy', // password123
        userType: 'NORMAL',
        companyId: 1
      }
    });
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.person.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.user');
      expect(response.body).toHaveProperty('data.accessToken');
      expect(response.body).toHaveProperty('data.refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          companyId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data.user');
      expect(response.body).toHaveProperty('data.accessToken');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate User',
          email: 'test@example.com', // already exists
          password: 'password123',
          companyId: 1
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('code', 'DUPLICATE_ENTRY');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.accessToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});