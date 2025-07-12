import request from 'supertest';
import { app } from '../index.js';

export async function runValidationTests() {
  console.log('\n🧪 Running Validation Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Login with missing email
  try {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      });
    
    if (response.status === 400) {
      console.log('✅ Test 1: Login with missing email - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 1: Login with missing email - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 1: Login with missing email - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 2: Login with missing password
  try {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
      });
    
    if (response.status === 400) {
      console.log('✅ Test 2: Login with missing password - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 2: Login with missing password - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 2: Login with missing password - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 3: Register with missing fields
  try {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
        // Missing password, name, role
      });
    
    if (response.status === 400) {
      console.log('✅ Test 3: Register with missing fields - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 3: Register with missing fields - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 3: Register with missing fields - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 4: Register with invalid email
  try {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'STUDENT'
      });
    
    if (response.status === 400) {
      console.log('✅ Test 4: Register with invalid email - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 4: Register with invalid email - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 4: Register with invalid email - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 5: Create ticket without authentication
  try {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'MEDIUM',
        category: 'TECHNICAL'
      });
    
    if (response.status === 401) {
      console.log('✅ Test 5: Create ticket without authentication - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 5: Create ticket without authentication - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 5: Create ticket without authentication - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 6: Get tickets without authentication
  try {
    const response = await request(app)
      .get('/api/tickets');
    
    if (response.status === 401) {
      console.log('✅ Test 6: Get tickets without authentication - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 6: Get tickets without authentication - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 6: Get tickets without authentication - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  return { passed, failed };
}