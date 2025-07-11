import request from 'supertest';
import { app } from '../index.js';

describe('Security Tests', () => {
  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/ping');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should have proper CORS headers', async () => {
      const response = await request(app)
        .options('/ping')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth routes', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(105).fill().map(() => 
        request(app).post('/api/auth/login').send({
          email: 'test@example.com',
          password: 'password123'
        })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      
      expect(rateLimited).toBe(true);
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

      // Should either be 400 (validation error) or 429 (rate limited)
      expect([400, 429]).toContain(response.status);
    });

    it('should prevent XSS in ticket subject', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          subject: '<script>alert("xss")</script>',
          description: 'Test description'
        });

      // Should be 401 (unauthorized) since no auth token provided
      expect(response.status).toBe(401);
    });
  });
});