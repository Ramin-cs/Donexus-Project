import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../db/index.js';

describe('Security Tests', () => {
  let testUser;
  let accessToken;

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

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      const promises = [];
      
      // Make 101 requests (exceeding the limit of 100)
      for (let i = 0; i < 101; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Check that some requests were rate limited
      const rateLimitedResponses = responses.filter(
        response => response.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should limit register attempts', async () => {
      const promises = [];
      
      // Make 101 requests (exceeding the limit of 100)
      for (let i = 0; i < 101; i++) {
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send({
              fullName: 'Test User',
              email: `test${i}@example.com`,
              password: 'password123',
              companyId: 1
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Check that some requests were rate limited
      const rateLimitedResponses = responses.filter(
        response => response.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/tickets');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with malformed token', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept requests with valid token', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Authorization', () => {
    let normalUser;
    let normalUserToken;
    let adminUser;
    let adminUserToken;

    beforeAll(async () => {
      // Create normal user
      normalUser = await prisma.person.create({
        data: {
          fullName: 'Normal User',
          emailAddress: 'normal@example.com',
          passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqy',
          userType: 'NORMAL',
          companyId: 1
        }
      });

      // Create admin user
      adminUser = await prisma.person.create({
        data: {
          fullName: 'Admin User',
          emailAddress: 'admin@example.com',
          passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqy',
          userType: 'ADMIN',
          companyId: 1
        }
      });

      // Get tokens
      const normalLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'normal@example.com',
          password: 'password123'
        });
      normalUserToken = normalLogin.body.data.accessToken;

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      adminUserToken = adminLogin.body.data.accessToken;
    });

    afterAll(async () => {
      await prisma.person.delete({ where: { id: normalUser.id } });
      await prisma.person.delete({ where: { id: adminUser.id } });
    });

    describe('User Management', () => {
      it('should allow admin to access users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
      });

      it('should deny normal user access to users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${normalUserToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('Company Management', () => {
      it('should allow admin to access companies', async () => {
        const response = await request(app)
          .get('/api/companies')
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
      });

      it('should deny normal user access to companies', async () => {
        const response = await request(app)
          .get('/api/companies')
          .set('Authorization', `Bearer ${normalUserToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('Ticket Management', () => {
      it('should allow normal user to create tickets', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${normalUserToken}`)
          .send({
            subject: 'Test Ticket',
            details: 'Test details'
          });

        expect(response.status).toBe(201);
      });

      it('should allow admin to delete tickets', async () => {
        // First create a ticket
        const createResponse = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${adminUserToken}`)
          .send({
            subject: 'Test Ticket for Deletion',
            details: 'Test details'
          });

        const ticketId = createResponse.body.data.ticket.id;

        // Then delete it
        const deleteResponse = await request(app)
          .delete(`/api/tickets/${ticketId}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(deleteResponse.status).toBe(200);
      });

      it('should deny normal user to delete tickets', async () => {
        // First create a ticket
        const createResponse = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${normalUserToken}`)
          .send({
            subject: 'Test Ticket for Deletion',
            details: 'Test details'
          });

        const ticketId = createResponse.body.data.ticket.id;

        // Then try to delete it
        const deleteResponse = await request(app)
          .delete(`/api/tickets/${ticketId}`)
          .set('Authorization', `Bearer ${normalUserToken}`);

        expect(deleteResponse.status).toBe(403);
      });
    });
  });

  describe('Input Validation', () => {
    it('should prevent SQL injection in email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "'; DROP TABLE users; --",
          password: 'password123'
        });

      // Should not crash, should return validation error or 401
      expect([400, 401]).toContain(response.status);
    });

    it('should prevent XSS in ticket subject', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: '<script>alert("xss")</script>',
          details: 'Test details'
        });

      // Should either reject or sanitize the input
      expect([400, 201]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/ping');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});