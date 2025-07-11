import request from 'supertest';
import { app } from '../index.js';

export async function runSecurityTests() {
  console.log('\n🧪 Running Security Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Security headers
  try {
    const response = await request(app)
      .get('/ping');
    
    const hasSecurityHeaders = response.headers['x-frame-options'] && 
                              response.headers['x-content-type-options'] && 
                              response.headers['x-xss-protection'];
    
    if (hasSecurityHeaders) {
      console.log('✅ Test 1: Security headers - PASSED');
      passed++;
    } else {
      console.log('❌ Test 1: Security headers - FAILED (Missing security headers)');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 1: Security headers - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 2: CORS headers
  try {
    const response = await request(app)
      .options('/ping')
      .set('Origin', 'http://localhost:3000');
    
    if (response.headers['access-control-allow-origin']) {
      console.log('✅ Test 2: CORS headers - PASSED');
      passed++;
    } else {
      console.log('❌ Test 2: CORS headers - FAILED (Missing CORS headers)');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 2: CORS headers - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 3: Rate limiting on auth routes
  try {
    // Make multiple requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
      );
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(res => res.status === 429);
    
    if (rateLimited) {
      console.log('✅ Test 3: Rate limiting on auth routes - PASSED');
      passed++;
    } else {
      console.log('❌ Test 3: Rate limiting on auth routes - FAILED (No rate limiting detected)');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 3: Rate limiting on auth routes - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 4: SQL injection protection
  try {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "'; DROP TABLE users; --",
        password: 'password123'
      });
    
    // Should not crash the server, should return 400 or 401
    if (response.status >= 400 && response.status < 500) {
      console.log('✅ Test 4: SQL injection protection - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 4: SQL injection protection - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 4: SQL injection protection - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 5: XSS protection
  try {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: '<script>alert("xss")</script>',
        role: 'STUDENT'
      });
    
    // Should sanitize the input or reject it
    if (response.status === 400) {
      console.log('✅ Test 5: XSS protection - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 5: XSS protection - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 5: XSS protection - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  return { passed, failed };
}