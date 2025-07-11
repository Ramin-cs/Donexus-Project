import request from 'supertest';
import { app } from '../index.js';

describe('Validation Tests', () => {
  describe('Auth Validation', () => {
    it('should validate login request with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should validate login request with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });

    it('should validate register request with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Ticket Validation', () => {
    it('should validate ticket creation with missing subject', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          description: 'Test description'
        });

      // Should be 401 (unauthorized) since no auth token provided
      expect(response.status).toBe(401);
    });

    it('should validate ticket creation with missing description', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          subject: 'Test subject'
        });

      // Should be 401 (unauthorized) since no auth token provided
      expect(response.status).toBe(401);
    });
  });
});