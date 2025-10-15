/**
 * @file test_documentation_agent_core.js
 * @description Core functionality tests for DocumentationAgent
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
 * Sample code for testing
 */
const testCode = {
  classCode: `/**
 * @file TestClass.js
 * @description Sample test class for documentation generation
 * @version 1.0.0
 * @author Test Author
 */

import { BaseAgent } from '../base/BaseAgent.js';

/**
 * TestClass - Example class for testing
 *
 * This class demonstrates documentation generation
 *
 * @extends BaseAgent
 */
export class TestClass extends BaseAgent {
  /**
   * Constructor for TestClass
   *
   * @param {Object} options - Configuration options
   * @param {string} options.name - Name of the instance
   * @param {number} [options.value=0] - Optional numeric value
   */
  constructor(options = {}) {
    super(options);
    this.name = options.name;
    this.value = options.value || 0;
  }

  /**
   * Process data asynchronously
   *
   * @param {Object} input - Input data to process
   * @returns {Promise<Object>} Processed result
   */
  async process(input) {
    return { success: true, data: input };
  }

  /**
   * Calculate sum
   *
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Sum of a and b
   */
  calculate(a, b) {
    return a + b;
  }
}

export default TestClass;
`,

  functionsCode: `/**
 * @file utilities.js
 * @description Utility functions for testing
 * @version 2.0.0
 */

/**
 * Add two numbers together
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
export function add(a, b) {
  return a + b;
}

/**
 * Fetch data from API
 *
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} API response data
 */
export async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Process array with callback
 *
 * @param {Array} items - Items to process
 * @param {Function} callback - Processing callback
 * @returns {Array} Processed items
 */
const processArray = async (items, callback) => {
  return Promise.all(items.map(callback));
};

export { processArray };
`,

  simpleCode: `/**
 * @file simple.js
 * @description Simple test file
 */

export const getValue = () => 42;
export const name = "test";
`
};

/**
 * Run core functionality tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('DOCUMENTATIONAGENT CORE FUNCTIONALITY TESTS');
  console.log('='.repeat(70) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: API Documentation Generation (Class)
  try {
    console.log('Test 1: API Documentation Generation (Class)');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'api',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('# API Documentation') &&
        result.result.content.includes('TestClass') &&
        result.result.content.includes('process') &&
        result.result.content.includes('calculate') &&
        result.result.extracted.classes === 1 &&
        result.result.extracted.functions === 0) {
      console.log('✅ PASS - API documentation generated correctly for class\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - API documentation generation failed\n');
      console.log('Result:', JSON.stringify(result, null, 2));
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 1 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 2: API Documentation Generation (Functions)
  try {
    console.log('Test 2: API Documentation Generation (Functions)');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.functionsCode,
      type: 'api',
      filePath: 'utilities.js'
    });

    if (result.success &&
        result.result.content.includes('# API Documentation') &&
        result.result.content.includes('add') &&
        result.result.content.includes('fetchData') &&
        result.result.content.includes('processArray') &&
        result.result.extracted.functions >= 2) {
      console.log('✅ PASS - API documentation generated correctly for functions\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Function documentation generation failed\n');
      console.log('Extracted:', result.result.extracted);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 2 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 3: README Generation
  try {
    console.log('Test 3: README Generation');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'readme',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('# README') &&
        result.result.content.includes('## Installation') &&
        result.result.content.includes('## Usage') &&
        result.result.content.includes('## API') &&
        result.result.content.includes('## Contributing') &&
        result.result.content.includes('## License') &&
        result.result.content.includes('TestClass')) {
      console.log('✅ PASS - README documentation generated correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - README generation failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 3 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 4: Guide Generation
  try {
    console.log('Test 4: Guide Generation');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'guide',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('# User Guide') &&
        result.result.content.includes('## Getting Started') &&
        result.result.content.includes('## Basic Usage') &&
        result.result.content.includes('## Advanced Topics') &&
        result.result.content.includes('## Troubleshooting')) {
      console.log('✅ PASS - Guide documentation generated correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Guide generation failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 4 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 5: HTML Format Output
  try {
    console.log('Test 5: HTML Format Output');
    const agent = new DocumentationAgent({
      logger: mockLogger,
      format: 'html'
    });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.simpleCode,
      type: 'api',
      filePath: 'simple.js'
    });

    if (result.success &&
        result.result.format === 'html' &&
        result.result.content.includes('<h1>') &&
        result.result.content.includes('<div class="documentation">')) {
      console.log('✅ PASS - HTML format output generated correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - HTML format generation failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 5 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 6: JSON Format Output
  try {
    console.log('Test 6: JSON Format Output');
    const agent = new DocumentationAgent({
      logger: mockLogger,
      format: 'json'
    });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.simpleCode,
      type: 'api',
      filePath: 'simple.js'
    });

    if (result.success &&
        result.result.format === 'json') {
      const parsed = JSON.parse(result.result.content);
      if (parsed.documentation) {
        console.log('✅ PASS - JSON format output generated correctly\n');
        passedTests++;
      } else {
        console.log('❌ FAIL - JSON structure invalid\n');
        failedTests++;
      }
    } else {
      console.log('❌ FAIL - JSON format generation failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 6 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 7: Parameter Documentation Extraction
  try {
    console.log('Test 7: Parameter Documentation Extraction');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.functionsCode,
      type: 'api',
      filePath: 'utilities.js'
    });

    // Check that parameters are properly extracted and formatted
    const hasParameterSection = result.result.content.includes('**Parameters:**');
    const hasParameterDocs = result.result.content.includes('`a`') &&
                             result.result.content.includes('(number)');
    const noRawJSDoc = !result.result.content.includes('@param');

    if (result.success && hasParameterSection && hasParameterDocs && noRawJSDoc) {
      console.log('✅ PASS - Parameter documentation extracted and formatted correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Parameter documentation extraction failed\n');
      console.log('Has param section:', hasParameterSection);
      console.log('Has param docs:', hasParameterDocs);
      console.log('No raw JSDoc:', noRawJSDoc);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 7 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 8: File-level Documentation
  try {
    console.log('Test 8: File-level Documentation');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'api',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('## Overview') &&
        result.result.content.includes('Sample test class') &&
        result.result.content.includes('**Version:** 1.0.0')) {
      console.log('✅ PASS - File-level documentation extracted correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - File-level documentation extraction failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 8 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 9: Class Method Extraction
  try {
    console.log('Test 9: Class Method Extraction');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'api',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('#### Methods') &&
        result.result.content.includes('##### constructor') &&
        result.result.content.includes('##### process') &&
        result.result.content.includes('##### calculate') &&
        result.result.content.includes('**Async:** Yes')) {
      console.log('✅ PASS - Class methods extracted correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Class method extraction failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 9 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 10: Export Detection
  try {
    console.log('Test 10: Export Detection');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'api',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('## Exports') &&
        result.result.extracted.exports >= 1) {
      console.log('✅ PASS - Exports detected correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Export detection failed\n');
      console.log('Extracted exports:', result.result.extracted.exports);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 10 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 11: Inheritance Detection
  try {
    console.log('Test 11: Inheritance Detection');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.classCode,
      type: 'api',
      filePath: 'TestClass.js'
    });

    if (result.success &&
        result.result.content.includes('**Extends:** `BaseAgent`')) {
      console.log('✅ PASS - Class inheritance detected correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Inheritance detection failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 11 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 12: Async Function Detection
  try {
    console.log('Test 12: Async Function Detection');
    const agent = new DocumentationAgent({ logger: mockLogger });
    await agent.initialize();

    const result = await agent.process({
      code: testCode.functionsCode,
      type: 'api',
      filePath: 'utilities.js'
    });

    const asyncCount = (result.result.content.match(/\*\*Async:\*\* Yes/g) || []).length;

    if (result.success && asyncCount >= 1) {
      console.log('✅ PASS - Async functions detected correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Async function detection failed\n');
      console.log('Async count:', asyncCount);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 12 failed:', error.message, '\n');
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
    console.log('✅ All core functionality tests passed!\n');
    console.log('DocumentationAgent is production-ready.\n');
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
