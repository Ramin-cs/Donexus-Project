import request from 'supertest';
import { app } from '../index.js';

describe('Basic API Tests', () => {
  it('should return 404 for non-existent route', async () => {
    const response = await request(app)
      .get('/api/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Route not found');
  });

  it('should handle health check endpoint', async () => {
    const response = await request(app)
      .get('/ping');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'pong');
  });

  it('should have proper security headers', async () => {
    const response = await request(app)
      .get('/ping');
    
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
  });
});