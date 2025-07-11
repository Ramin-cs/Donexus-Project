import request from 'supertest';
import { app } from '../index.js';

export async function runBasicTests() {
  console.log('\n🧪 Running Basic API Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: 404 for non-existent route
  try {
    const response = await request(app)
      .get('/api/non-existent-route');
    
    if (response.status === 404) {
      console.log('✅ Test 1: 404 for non-existent route - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 1: 404 for non-existent route - FAILED (Status: ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 1: 404 for non-existent route - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 2: Health check endpoint
  try {
    const response = await request(app)
      .get('/ping');
    
    if (response.status === 200 && response.body.message === 'pong') {
      console.log('✅ Test 2: Health check endpoint - PASSED');
      passed++;
    } else {
      console.log(`❌ Test 2: Health check endpoint - FAILED (Status: ${response.status}, Body: ${JSON.stringify(response.body)})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 2: Health check endpoint - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  // Test 3: Security headers
  try {
    const response = await request(app)
      .get('/ping');
    
    const hasSecurityHeaders = response.headers['x-frame-options'] && 
                              response.headers['x-content-type-options'] && 
                              response.headers['x-xss-protection'];
    
    if (hasSecurityHeaders) {
      console.log('✅ Test 3: Security headers - PASSED');
      passed++;
    } else {
      console.log('❌ Test 3: Security headers - FAILED (Missing security headers)');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 3: Security headers - FAILED (Error: ${error.message})`);
    failed++;
  }
  
  return { passed, failed };
}