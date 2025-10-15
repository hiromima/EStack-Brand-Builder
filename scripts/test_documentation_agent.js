/**
 * @file test_documentation_agent.js
 * @description BaseAgent compliance tests for DocumentationAgent
 * @version 1.0.0
 */

import { DocumentationAgent } from '../src/agents/support/DocumentationAgent.js';

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
  console.log('DOCUMENTATIONAGENT BASEAGENT COMPLIANCE TESTS');
  console.log('='.repeat(70) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Constructor with options parameter
  try {
    console.log('Test 1: Constructor with options parameter');
    const agent = new DocumentationAgent({
      logger: mockLogger,
      format: 'markdown'
    });

    if (agent.name === 'DocumentationAgent' && agent.format === 'markdown') {
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
    const agent = new DocumentationAgent({ logger: mockLogger });
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
    const agent = new DocumentationAgent({ logger: mockLogger });
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
    const agent = new DocumentationAgent({ logger: mockLogger });
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

  // Test 5: Format configuration
  try {
    console.log('Test 5: Format configuration');
    const agent = new DocumentationAgent({
      logger: mockLogger,
      format: 'html'
    });
    await agent.initialize();

    if (agent.format === 'html') {
      console.log('✅ PASS - Format properly configured\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Format not configured correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Format test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 6: Invalid format handling
  try {
    console.log('Test 6: Invalid format handling');
    const agent = new DocumentationAgent({
      logger: mockLogger,
      format: 'invalid'
    });

    try {
      await agent.initialize();
      console.log('❌ FAIL - Should throw error for invalid format\n');
      failedTests++;
    } catch (error) {
      if (error.message.includes('Invalid format')) {
        console.log('✅ PASS - Properly rejects invalid format\n');
        passedTests++;
      } else {
        console.log('❌ FAIL - Wrong error message\n');
        failedTests++;
      }
    }
  } catch (error) {
    console.log('❌ FAIL - Invalid format test failed:', error.message, '\n');
    failedTests++;
  }

  // Test 7: Error handling
  try {
    console.log('Test 7: Error handling');
    const agent = new DocumentationAgent({ logger: mockLogger });
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
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: 'const x = 1;',
      filePath: 'test.js'
    });

    if (result.metadata &&
        result.metadata.agent === 'DocumentationAgent' &&
        result.metadata.timestamp) {
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
    console.log('DocumentationAgent is ready for core functionality implementation.\n');
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
