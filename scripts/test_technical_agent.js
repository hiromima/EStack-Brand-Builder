/**
 * @file test_technical_agent.js
 * @description BaseAgent compliance tests for TechnicalAgent
 * @version 1.0.0
 */

import { TechnicalAgent } from '../src/agents/support/TechnicalAgent.js';

/**
 * Mock logger for testing
 */
const mockLogger = {
  info: (...args) => console.log('[TEST INFO]', ...args),
  error: (...args) => console.error('[TEST ERROR]', ...args),
  warn: (...args) => console.warn('[TEST WARN]', ...args)
};

/**
 * Run BaseAgent compliance tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('TECHNICALAGENT BASEAGENT COMPLIANCE TESTS');
  console.log('='.repeat(70) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Constructor with options parameter
  try {
    console.log('Test 1: Constructor with options parameter');
    const agent = new TechnicalAgent({
      logger: mockLogger,
      analysisLevel: 'standard'
    });

    if (agent.name === 'TechnicalAgent' && agent.analysisLevel === 'standard') {
      console.log('✅ PASS - Constructor accepts options parameter\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Constructor not properly configured\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Constructor test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 2: Async initialize() method
  try {
    console.log('Test 2: Async initialize() method');
    const agent = new TechnicalAgent({ logger: mockLogger });
    await agent.initialize();

    console.log('✅ PASS - Has async initialize() method\n');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL - Initialize test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 3: Async process() method
  try {
    console.log('Test 3: Async process() method');
    const agent = new TechnicalAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: 'function test() { return true; }',
      filePath: 'test.js'
    });

    if (result.success !== undefined && result.metadata) {
      console.log('✅ PASS - Has async process() method with proper return structure\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Process method does not return proper structure\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Process test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 4: Input validation
  try {
    console.log('Test 4: Input validation');
    const agent = new TechnicalAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process(null);

    if (!result.success && result.error) {
      console.log('✅ PASS - Properly validates input\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Input validation not working\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Input validation test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 5: Analysis level configuration
  try {
    console.log('Test 5: Analysis level configuration');
    const agent = new TechnicalAgent({
      logger: mockLogger,
      analysisLevel: 'deep'
    });
    await agent.initialize();

    if (agent.analysisLevel === 'deep') {
      console.log('✅ PASS - Analysis level properly configured\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Analysis level not configured correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Analysis level test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 6: Invalid analysis level handling
  try {
    console.log('Test 6: Invalid analysis level handling');
    const agent = new TechnicalAgent({
      logger: mockLogger,
      analysisLevel: 'invalid'
    });

    try {
      await agent.initialize();
      console.log('❌ FAIL - Should throw error for invalid analysis level\n');
      failedTests++;
    } catch (error) {
      if (error.message.includes('Invalid analysis level')) {
        console.log('✅ PASS - Properly rejects invalid analysis level\n');
        passedTests++;
      } else {
        console.log('❌ FAIL - Wrong error message\n');
        failedTests++;
      }
    }
  } catch (error) {
    console.log('❌ FAIL - Invalid analysis level test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 7: Error handling
  try {
    console.log('Test 7: Error handling');
    const agent = new TechnicalAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: null,
      filePath: null
    });

    if (!result.success && result.error) {
      console.log('✅ PASS - Proper error handling\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Error handling not working\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error handling test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 8: Response metadata
  try {
    console.log('Test 8: Response metadata');
    const agent = new TechnicalAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: 'const x = 1;',
      filePath: 'test.js'
    });

    if (result.metadata &&
        result.metadata.agent === 'TechnicalAgent' &&
        result.metadata.timestamp &&
        result.metadata.analysisLevel === 'standard') {
      console.log('✅ PASS - Response includes proper metadata\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Response metadata missing or incorrect\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Metadata test failed:', error.message, '\n');
    failedTests++;
  }

  // Print summary
  console.log('='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${passedTests + failedTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('='.repeat(70) + '\n');

  if (failedTests === 0) {
    console.log('✅ All BaseAgent compliance tests passed!\n');
    console.log('TechnicalAgent is ready for core functionality implementation.\n');
    return 0;
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.\n');
    return 1;
  }
}

// Execute tests
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
