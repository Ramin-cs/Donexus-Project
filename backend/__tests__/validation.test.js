import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../db/index.js';

describe('Validation Tests', () => {
  let testUser;
  let accessToken;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.person.create({
      data: {
        fullName: 'Test User',
        emailAddress: 'test@example.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqy', // password123
        userType: 'ADMIN',
        companyId: 1
      }
    });

    // Login to get access token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.person.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  describe('Authentication Validation', () => {
    describe('POST /api/auth/login', () => {
      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'password123'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should require email field', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            password: 'password123'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should require password field', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });
    });

    describe('POST /api/auth/register', () => {
      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            fullName: 'Test User',
            email: 'invalid-email',
            password: 'password123',
            companyId: 1
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate password length', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            fullName: 'Test User',
            email: 'test@example.com',
            password: '123', // too short
            companyId: 1
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate fullName length', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            fullName: 'A', // too short
            email: 'test@example.com',
            password: 'password123',
            companyId: 1
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate companyId is number', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            companyId: 'invalid'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });
    });
  });

  describe('Ticket Validation', () => {
    describe('POST /api/tickets', () => {
      it('should validate subject is required', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            details: 'Test details'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate subject length', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            subject: 'A', // too short
            details: 'Test details'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate subject max length', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            subject: 'A'.repeat(256), // too long
            details: 'Test details'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });
    });

    describe('PATCH /api/tickets/:id', () => {
      it('should validate state enum values', async () => {
        const response = await request(app)
          .patch('/api/tickets/1')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            state: 'invalid-state'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });
    });
  });

  describe('User Validation', () => {
    describe('POST /api/users', () => {
      it('should validate userType enum values', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            userType: 'INVALID_TYPE',
            companyId: 1
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate email uniqueness', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            fullName: 'Test User',
            email: 'test@example.com', // already exists
            password: 'password123',
            userType: 'NORMAL',
            companyId: 1
          });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('code', 'DUPLICATE_ENTRY');
      });
    });
  });

  describe('Company Validation', () => {
    describe('POST /api/companies', () => {
      it('should validate title is required', async () => {
        const response = await request(app)
          .post('/api/companies')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate title length', async () => {
        const response = await request(app)
          .post('/api/companies')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'A' // too short
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });

      it('should validate title max length', async () => {
        const response = await request(app)
          .post('/api/companies')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'A'.repeat(101) // too long
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      });
    });
  });
});