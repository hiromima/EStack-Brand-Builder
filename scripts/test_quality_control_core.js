/**
 * @file test_quality_control_core.js
 * @description Core functionality tests for QualityControlAgent
 * @version 1.0.0
 */

import { QualityControlAgent } from '../src/agents/quality/QualityControlAgent.js';
import fs from 'fs/promises';

/**
 * Mock logger for testing
 */
const mockLogger = {
  info: () => {}, // Silent for clean output
  error: (...args) => console.error('[TEST ERROR]', ...args),
  warn: (...args) => console.warn('[TEST WARN]', ...args)
};

/**
 * Test samples
 */
const testSamples = {
  excellent: `/**
 * @file excellent.js
 * @description High quality code sample
 */

/**
 * Calculate sum of array
 * @param {Array<number>} numbers - Numbers to sum
 * @returns {number} Sum result
 */
function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

/**
 * User class
 */
class UserManager {
  /**
   * @param {Object} options - Configuration
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUser(userId) {
    try {
      const response = await fetch(\`/api/users/\${userId}\`);
      return await response.json();
    } catch (error) {
      throw new Error(\`Failed to get user: \${error.message}\`);
    }
  }
}

export { calculateSum, UserManager };
`,

  poor: `var x = 1;
var y = 2;

function test() {
if (x == y) {
console.log("equal");
}
// TODO: fix this
if (x > 0) { if (y > 0) { if (x < 10) { if (y < 10) { console.log("complex"); } } } }
}

class badname {
constructor() {
this.data = null;
}
}
`,

  moderate: `/**
 * @file moderate.js
 */

function processData(data) {
  if (!data) {
    return null;
  }

  const results = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active === true) {
      results.push(data[i]);
    }
  }

  return results;
}

class DataProcessor {
  constructor() {
    this.cache = new Map();
  }

  process(input) {
    return input.map(item => item.value);
  }
}
`
};

/**
 * Run core functionality tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('QUALITYCONTROLAGENT CORE FUNCTIONALITY TESTS');
  console.log('='.repeat(70) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Analyze excellent code
  try {
    console.log('Test 1: Analyze high-quality code sample');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      threshold: 80
    });
    await agent.initialize();

    const result = await agent.process({
      code: testSamples.excellent,
      filePath: 'excellent.js'
    });

    console.log(`  Score: ${result.result.score}/100`);
    console.log(`  Passed: ${result.passed ? '✅' : '❌'}`);
    console.log(`  Linting: ${result.result.checks.linting.score}`);
    console.log(`  Complexity: ${result.result.checks.complexity.score}`);
    console.log(`  Documentation: ${result.result.checks.documentation.score}`);
    console.log(`  Naming: ${result.result.checks.naming.score}`);
    console.log(`  Best Practices: ${result.result.checks.bestPractices.score}`);

    if (result.success && result.result.score >= 85) {
      console.log('✅ PASS - High quality code correctly identified\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected score >= 85\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 1 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 2: Analyze poor code
  try {
    console.log('Test 2: Analyze low-quality code sample');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      threshold: 80
    });
    await agent.initialize();

    const result = await agent.process({
      code: testSamples.poor,
      filePath: 'poor.js'
    });

    console.log(`  Score: ${result.result.score}/100`);
    console.log(`  Passed: ${result.passed ? '✅' : '❌'}`);
    console.log(`  Issues found: ${result.result.recommendations.length}`);
    console.log(`  Top issues:`);
    result.result.recommendations.slice(0, 3).forEach(rec => {
      console.log(`    - ${rec.substring(0, 60)}...`);
    });

    // Poor code should have multiple issues detected
    const hasMultipleIssues = result.result.recommendations.length > 0 &&
                              result.result.score < 90;

    if (result.success && hasMultipleIssues) {
      console.log('✅ PASS - Low quality code correctly identified with issues\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected multiple quality issues to be detected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 2 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 3: Detailed analysis metrics
  try {
    console.log('Test 3: Verify detailed analysis metrics');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      threshold: 70
    });
    await agent.initialize();

    const result = await agent.process({
      code: testSamples.moderate,
      filePath: 'moderate.js'
    });

    const metrics = result.result.metrics;
    console.log(`  Lines of Code: ${metrics.linesOfCode}`);
    console.log(`  Functions: ${metrics.functions}`);
    console.log(`  Classes: ${metrics.classes}`);
    console.log(`  Comments: ${metrics.comments}`);

    if (metrics.linesOfCode > 0 && metrics.functions > 0 && metrics.classes > 0) {
      console.log('✅ PASS - Metrics correctly calculated\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Metrics not calculated correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 3 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 4: Linting checks
  try {
    console.log('Test 4: Linting checks (console.log, TODO)');
    const agent = new QualityControlAgent({ logger: mockLogger });
    await agent.initialize();

    const codeWithIssues = `
      console.log("debug");
      console.log("more debug");
      // TODO: fix this
      // TODO: and this
    `;

    const result = await agent.process({
      code: codeWithIssues,
      filePath: 'test.js'
    });

    const lintingIssues = result.result.checks.linting.issues;
    console.log(`  Issues found: ${lintingIssues.length}`);
    lintingIssues.forEach(issue => console.log(`    - ${issue}`));

    if (lintingIssues.length >= 2) {
      console.log('✅ PASS - Linting issues detected\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected at least 2 linting issues\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 4 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 5: Complexity analysis
  try {
    console.log('Test 5: Complexity analysis');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      rules: { maxComplexity: 5 }
    });
    await agent.initialize();

    const complexCode = `
      function complexFunction(x, y, z) {
        if (x > 0) {
          if (y > 0) {
            if (z > 0) {
              for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                  while (x < y) {
                    x++;
                  }
                }
              }
            }
          }
        }
        return x + y + z;
      }
    `;

    const result = await agent.process({
      code: complexCode,
      filePath: 'complex.js'
    });

    const complexityCheck = result.result.checks.complexity;
    console.log(`  Complexity score: ${complexityCheck.score}`);
    console.log(`  High complexity functions: ${complexityCheck.details.highComplexityCount}`);

    if (complexityCheck.details.highComplexityCount > 0) {
      console.log('✅ PASS - High complexity detected\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected high complexity detection\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 5 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 6: Documentation coverage
  try {
    console.log('Test 6: Documentation coverage check');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      rules: { requireJSDoc: true }
    });
    await agent.initialize();

    const undocumentedCode = `
      function foo() { return 1; }
      function bar() { return 2; }
      class Baz { constructor() {} }
    `;

    const result = await agent.process({
      code: undocumentedCode,
      filePath: 'undocumented.js'
    });

    const docCheck = result.result.checks.documentation;
    console.log(`  Documentation score: ${docCheck.score}`);
    console.log(`  Coverage ratio: ${(docCheck.details.coverageRatio * 100).toFixed(1)}%`);

    if (docCheck.score < 90) {
      console.log('✅ PASS - Low documentation detected\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected low documentation score\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 6 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 7: Naming conventions
  try {
    console.log('Test 7: Naming convention checks');
    const agent = new QualityControlAgent({
      logger: mockLogger,
      rules: { enforceNaming: true }
    });
    await agent.initialize();

    const badNamingCode = `
      function BAD_NAME() {}
      function another_bad() {}
      class lowercase {}
    `;

    const result = await agent.process({
      code: badNamingCode,
      filePath: 'naming.js'
    });

    const namingCheck = result.result.checks.naming;
    console.log(`  Naming score: ${namingCheck.score}`);
    console.log(`  Naming issues: ${namingCheck.issues.length}`);

    if (namingCheck.issues.length > 0) {
      console.log('✅ PASS - Naming violations detected\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected naming violations\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 7 failed:', error.message, '\n');
    failedTests++;
  }

  // Test 8: Best practices checks
  try {
    console.log('Test 8: Best practices validation');
    const agent = new QualityControlAgent({ logger: mockLogger });
    await agent.initialize();

    const badPracticesCode = `
      var oldStyle = 1;
      var another = 2;

      function test(x, y) {
        if (x == y) {
          return true;
        }
        return false;
      }
    `;

    const result = await agent.process({
      code: badPracticesCode,
      filePath: 'practices.js'
    });

    const practicesCheck = result.result.checks.bestPractices;
    console.log(`  Best practices score: ${practicesCheck.score}`);
    console.log(`  var usage: ${practicesCheck.details.varUsage}`);
    console.log(`  Loose equality: ${practicesCheck.details.looseEquality}`);

    if (practicesCheck.score < 100) {
      console.log('✅ PASS - Best practice violations detected\n');
      passedTests++;
    } else {
      console.log('❌ FAIL - Expected best practice violations\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL - Test 8 failed:', error.message, '\n');
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
    console.log('QualityControlAgent is production-ready.\n');
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
