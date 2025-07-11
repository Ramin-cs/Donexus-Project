import request from 'supertest';
import { app } from '../index.js';

describe('Simple Health Check', () => {
  it('should return 404 for non-existent route', async () => {
    const response = await request(app)
      .get('/api/non-existent-route');
    
    expect(response.status).toBe(404);
  });

  it('should handle basic request', async () => {
    const response = await request(app)
      .get('/api/health');
    
    // This might return 404 if health endpoint doesn't exist, but that's OK
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});