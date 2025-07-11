import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../db/index.js';

describe('Tickets Endpoints', () => {
  let testUser, testTicket, accessToken;

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
    // Clean up
    await prisma.issue.deleteMany({
      where: { personId: testUser.id }
    });
    await prisma.person.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/tickets', () => {
    it('should create a new ticket', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: 'Test Ticket',
          details: 'This is a test ticket'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data.ticket');
      expect(response.body.data.ticket.subject).toBe('Test Ticket');
      
      testTicket = response.body.data.ticket;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: 'Test'
          // missing details
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/tickets', () => {
    it('should get all tickets for user', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.tickets');
      expect(Array.isArray(response.body.data.tickets)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tickets?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should get specific ticket', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.ticket');
      expect(response.body.data.ticket.id).toBe(testTicket.id);
    });

    it('should return 404 for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/tickets/99999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    it('should update ticket status', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          state: 'pending'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.ticket.state).toBe('pending');
    });
  });

  describe('GET /api/tickets/:id/messages', () => {
    it('should get messages for ticket', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicket.id}/messages`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data.messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });
  });

  describe('POST /api/tickets/:id/messages', () => {
    it('should create a new message', async () => {
      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/messages`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'This is a test message'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data.message');
      expect(response.body.data.message.content).toBe('This is a test message');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/messages`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: '' // empty content
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });
});