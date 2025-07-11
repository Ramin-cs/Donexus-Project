import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../db/index.js';

describe('Integration Tests', () => {
  let testUser;
  let accessToken;
  let testCompany;

  beforeAll(async () => {
    // Create test company
    testCompany = await prisma.company.create({
      data: {
        title: 'Test Company'
      }
    });

    // Create test user
    testUser = await prisma.person.create({
      data: {
        fullName: 'Test User',
        emailAddress: 'test@example.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqy', // password123
        userType: 'ADMIN',
        companyId: testCompany.id
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
    // Clean up test data
    await prisma.person.delete({ where: { id: testUser.id } });
    await prisma.company.delete({ where: { id: testCompany.id } });
    await prisma.$disconnect();
  });

  describe('Complete User Workflow', () => {
    it('should allow complete user registration and login workflow', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'New Integration User',
          email: 'integration@example.com',
          password: 'password123',
          companyId: testCompany.id
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.data).toHaveProperty('user');
      expect(registerResponse.body.data).toHaveProperty('accessToken');

      const newUserToken = registerResponse.body.data.accessToken;

      // 2. Login with new user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data).toHaveProperty('user');
      expect(loginResponse.body.data).toHaveProperty('accessToken');

      // 3. Create ticket with new user
      const ticketResponse = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          subject: 'Integration Test Ticket',
          details: 'This is a test ticket created during integration testing'
        });

      expect(ticketResponse.status).toBe(201);
      expect(ticketResponse.body.data).toHaveProperty('ticket');

      const ticketId = ticketResponse.body.data.ticket.id;

      // 4. Update ticket status
      const updateResponse = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`) // Use admin token
        .send({
          state: 'pending'
        });

      expect(updateResponse.status).toBe(200);

      // 5. Get updated ticket
      const getResponse = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.ticket.state).toBe('pending');

      // 6. Delete ticket
      const deleteResponse = await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);

      // Clean up
      await prisma.person.delete({
        where: { emailAddress: 'integration@example.com' }
      });
    });
  });

  describe('Admin Workflow', () => {
    it('should allow admin to manage users and companies', async () => {
      // 1. Create new company
      const createCompanyResponse = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Integration Test Company'
        });

      expect(createCompanyResponse.status).toBe(201);
      expect(createCompanyResponse.body.data).toHaveProperty('company');

      const newCompanyId = createCompanyResponse.body.data.company.id;

      // 2. Create new user in new company
      const createUserResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 'Integration Test User',
          email: 'integrationtest@example.com',
          password: 'password123',
          userType: 'SUPPORT',
          companyId: newCompanyId
        });

      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.body.data).toHaveProperty('user');

      const newUserId = createUserResponse.body.data.user.id;

      // 3. Get all users
      const getUsersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getUsersResponse.status).toBe(200);
      expect(getUsersResponse.body.data.users).toBeInstanceOf(Array);

      // 4. Get all companies
      const getCompaniesResponse = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getCompaniesResponse.status).toBe(200);
      expect(getCompaniesResponse.body.data.companies).toBeInstanceOf(Array);

      // 5. Delete user
      const deleteUserResponse = await request(app)
        .delete(`/api/users/${newUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteUserResponse.status).toBe(200);

      // 6. Delete company
      const deleteCompanyResponse = await request(app)
        .delete(`/api/companies/${newCompanyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteCompanyResponse.status).toBe(200);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // 1. Create ticket
      const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subject: 'Consistency Test Ticket',
          details: 'Testing data consistency'
        });

      expect(createTicketResponse.status).toBe(201);
      const ticketId = createTicketResponse.body.data.ticket.id;

      // 2. Verify ticket exists
      const getTicketResponse = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getTicketResponse.status).toBe(200);
      expect(getTicketResponse.body.data.ticket.id).toBe(ticketId);

      // 3. Update ticket
      const updateResponse = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          state: 'resolved'
        });

      expect(updateResponse.status).toBe(200);

      // 4. Verify update persisted
      const verifyResponse = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.data.ticket.state).toBe('resolved');

      // 5. Clean up
      await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // 1. Try to access non-existent resource
      const notFoundResponse = await request(app)
        .get('/api/tickets/999999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(notFoundResponse.status).toBe(404);

      // 2. Try to update non-existent resource
      const updateNotFoundResponse = await request(app)
        .patch('/api/tickets/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          state: 'open'
        });

      expect(updateNotFoundResponse.status).toBe(404);

      // 3. Try to delete non-existent resource
      const deleteNotFoundResponse = await request(app)
        .delete('/api/tickets/999999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteNotFoundResponse.status).toBe(404);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      // Create 10 concurrent ticket creation requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/tickets')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              subject: `Concurrent Test Ticket ${i}`,
              details: `Concurrent test details ${i}`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Clean up created tickets
      const cleanupPromises = responses.map(response => 
        request(app)
          .delete(`/api/tickets/${response.body.data.ticket.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      await Promise.all(cleanupPromises);
    });
  });
});