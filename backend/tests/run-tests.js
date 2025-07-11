import { runBasicTests } from './basic-tests.js';
import { runValidationTests } from './validation-tests.js';
import { runSecurityTests } from './security-tests.js';

async function runAllTests() {
  console.log('🚀 Starting Manual Test Suite...\n');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    // Run Basic Tests
    const basicResults = await runBasicTests();
    totalPassed += basicResults.passed;
    totalFailed += basicResults.failed;
    
    console.log('\n' + '=' .repeat(50));
    
    // Run Validation Tests
    const validationResults = await runValidationTests();
    totalPassed += validationResults.passed;
    totalFailed += validationResults.failed;
    
    console.log('\n' + '=' .repeat(50));
    
    // Run Security Tests
    const securityResults = await runSecurityTests();
    totalPassed += securityResults.passed;
    totalFailed += securityResults.failed;
    
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
    totalFailed++;
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Total: ${totalPassed + totalFailed}`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    process.exit(0);
  } else {
    console.log('\n💥 SOME TESTS FAILED! 💥');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
runAllTests();