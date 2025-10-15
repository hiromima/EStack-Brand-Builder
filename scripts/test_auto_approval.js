/**
 * @file test_auto_approval.js
 * @description Auto-approval system integration tests
 * @version 1.0.0
 *
 * Tests for Issue #10: Threshold-based auto-approval system
 *
 * Test Coverage:
 * - Quality Gate workflow extension
 * - 90+ points: Auto-approval
 * - 80-89 points: Warning + approval
 * - <80 points: Rejection + recommendations
 */

import { ZeroHumanApproval } from '../src/evaluation/ZeroHumanApproval.js';

/**
 * Test suite for auto-approval system
 */
class AutoApprovalTests {
  constructor() {
    this.protocol = null;
    this.testResults = [];
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('\n📋 Setting up auto-approval tests...\n');

    // Initialize ZeroHumanApproval protocol
    this.protocol = new ZeroHumanApproval({
      approvalThreshold: 90,
      consensusThreshold: 0.7,
      enableHistory: false // Disable history for testing
    });

    // Mock the evaluator to avoid API calls
    this.protocol.evaluator = {
      loadRubrics: async () => {},
      evaluate: async (proposal, rubrics, threshold) => {
        // Return mock evaluation based on proposal score
        const mockScore = proposal._mockScore || 85;

        return {
          approved: mockScore >= threshold,
          score: {
            overall: mockScore,
            breakdown: [
              { model: 'claude', score: mockScore + 2, weight: 0.4 },
              { model: 'gpt', score: mockScore, weight: 0.3 },
              { model: 'gemini', score: mockScore - 1, weight: 0.3 }
            ],
            agreement: 0.85,
            confidence: mockScore >= 90 ? 'high' : mockScore >= 80 ? 'medium' : 'low'
          },
          evaluations: [],
          threshold,
          recommendations: mockScore < 90 ? [
            {
              category: 'BrandConsistency',
              criterion: 'foundationAlignment',
              score: mockScore - 5,
              reason: 'Foundation alignment could be stronger'
            }
          ] : []
        };
      }
    };

    this.protocol.initialized = true;

    console.log('✅ Auto-approval system initialized\n');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    await this.setup();

    console.log('\n' + '='.repeat(70));
    console.log('AUTO-APPROVAL SYSTEM TESTS');
    console.log('='.repeat(70) + '\n');

    // Test 1: Auto-approval (90+ points)
    await this.testAutoApproval();

    // Test 2: Warning approval (80-89 points)
    await this.testWarningApproval();

    // Test 3: Rejection (<80 points)
    await this.testRejection();

    // Test 4: Quality Gate workflow
    await this.testQualityGateWorkflow();

    // Print summary
    this.printSummary();

    // Return exit code
    return this.testResults.every(r => r.passed) ? 0 : 1;
  }

  /**
   * Test 1: Auto-approval (90+ points)
   */
  async testAutoApproval() {
    console.log('\n📍 Test 1: Auto-Approval (90+ points)\n');
    console.log('-'.repeat(70) + '\n');

    try {
      const testCases = [
        { score: 95, expectedStatus: 'AUTO_APPROVED', description: 'Excellent quality' },
        { score: 92, expectedStatus: 'AUTO_APPROVED', description: 'Very good quality' },
        { score: 90, expectedStatus: 'AUTO_APPROVED', description: 'Threshold boundary' }
      ];

      let allPassed = true;

      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.description} (${testCase.score} points)`);

        const proposal = {
          brandName: `Test Brand ${testCase.score}`,
          _mockScore: testCase.score
        };

        const result = await this.protocol.evaluate(proposal);

        const statusMatch = result.approvalDecision.status === testCase.expectedStatus;
        const autoApproved = result.approvalDecision.autoApproved === true;
        const scoreCorrect = result.evaluation.score.overall === testCase.score;

        const passed = statusMatch && autoApproved && scoreCorrect;

        console.log(`  Score: ${result.evaluation.score.overall}/100`);
        console.log(`  Status: ${result.approvalDecision.status} ${statusMatch ? '✅' : '❌'}`);
        console.log(`  Auto-Approved: ${result.approvalDecision.autoApproved ? 'YES ✅' : 'NO ❌'}`);
        console.log(`  Confidence: ${result.evaluation.score.confidence}`);
        console.log(`  Agreement: ${(result.evaluation.score.agreement * 100).toFixed(1)}%`);
        console.log('');

        if (!passed) {
          allPassed = false;
        }
      }

      this.testResults.push({
        name: 'Auto-Approval (90+ points)',
        passed: allPassed
      });

      console.log(`${allPassed ? '✅' : '❌'} Auto-approval test complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Auto-Approval (90+ points)',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 2: Warning approval (80-89 points)
   */
  async testWarningApproval() {
    console.log('\n\n📍 Test 2: Warning Approval (80-89 points)\n');
    console.log('-'.repeat(70) + '\n');

    try {
      const testCases = [
        { score: 89, description: 'Just below threshold' },
        { score: 85, description: 'Mid-range quality' },
        { score: 80, description: 'Lower boundary' }
      ];

      let allPassed = true;

      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.description} (${testCase.score} points)`);

        const proposal = {
          brandName: `Test Brand ${testCase.score}`,
          _mockScore: testCase.score
        };

        const result = await this.protocol.evaluate(proposal);

        // 80-89 should be NEEDS_IMPROVEMENT or CONDITIONAL_APPROVAL
        const validStatuses = ['NEEDS_IMPROVEMENT', 'CONDITIONAL_APPROVAL'];
        const statusValid = validStatuses.includes(result.approvalDecision.status);
        const notAutoApproved = result.approvalDecision.autoApproved === false;
        const hasRecommendations = result.evaluation.recommendations.length > 0;

        const passed = statusValid && notAutoApproved && hasRecommendations;

        console.log(`  Score: ${result.evaluation.score.overall}/100`);
        console.log(`  Status: ${result.approvalDecision.status} ${statusValid ? '✅' : '❌'}`);
        console.log(`  Auto-Approved: ${result.approvalDecision.autoApproved ? 'YES' : 'NO'} ${notAutoApproved ? '✅' : '❌'}`);
        console.log(`  Has Recommendations: ${hasRecommendations ? 'YES ✅' : 'NO ❌'}`);
        console.log(`  Recommendations: ${result.evaluation.recommendations.length} items`);
        console.log('');

        if (!passed) {
          allPassed = false;
        }
      }

      this.testResults.push({
        name: 'Warning Approval (80-89 points)',
        passed: allPassed
      });

      console.log(`${allPassed ? '✅' : '❌'} Warning approval test complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Warning Approval (80-89 points)',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 3: Rejection (<80 points)
   */
  async testRejection() {
    console.log('\n\n📍 Test 3: Rejection (<80 points)\n');
    console.log('-'.repeat(70) + '\n');

    try {
      const testCases = [
        { score: 79, description: 'Just below warning threshold', expectedStatus: 'NEEDS_IMPROVEMENT' },
        { score: 65, description: 'Low quality', expectedStatus: 'REJECTED' },
        { score: 50, description: 'Very low quality', expectedStatus: 'REJECTED' }
      ];

      let allPassed = true;

      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.description} (${testCase.score} points)`);

        const proposal = {
          brandName: `Test Brand ${testCase.score}`,
          _mockScore: testCase.score
        };

        const result = await this.protocol.evaluate(proposal);

        const statusMatch = result.approvalDecision.status === testCase.expectedStatus;
        const notAutoApproved = result.approvalDecision.autoApproved === false;
        const hasRecommendations = result.evaluation.recommendations.length > 0;

        const passed = statusMatch && notAutoApproved && hasRecommendations;

        console.log(`  Score: ${result.evaluation.score.overall}/100`);
        console.log(`  Expected Status: ${testCase.expectedStatus}`);
        console.log(`  Actual Status: ${result.approvalDecision.status} ${statusMatch ? '✅' : '❌'}`);
        console.log(`  Auto-Approved: ${result.approvalDecision.autoApproved ? 'YES' : 'NO'} ${notAutoApproved ? '✅' : '❌'}`);
        console.log(`  Has Recommendations: ${hasRecommendations ? 'YES ✅' : 'NO ❌'}`);
        console.log(`  Reasoning: ${result.approvalDecision.reasoning}`);
        console.log('');

        if (!passed) {
          allPassed = false;
        }
      }

      this.testResults.push({
        name: 'Rejection (<80 points)',
        passed: allPassed
      });

      console.log(`${allPassed ? '✅' : '❌'} Rejection test complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Rejection (<80 points)',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 4: Quality Gate workflow
   */
  async testQualityGateWorkflow() {
    console.log('\n\n📍 Test 4: Quality Gate Workflow\n');
    console.log('-'.repeat(70) + '\n');

    try {
      console.log('Testing complete quality gate workflow:\n');

      // Simulate a workflow with multiple proposals
      const proposals = [
        { brandName: 'Excellent Brand', _mockScore: 95 },
        { brandName: 'Good Brand', _mockScore: 85 },
        { brandName: 'Poor Brand', _mockScore: 65 }
      ];

      const results = [];

      for (const proposal of proposals) {
        const result = await this.protocol.evaluate(proposal);
        results.push(result);

        console.log(`${proposal.brandName}:`);
        console.log(`  Score: ${result.evaluation.score.overall}/100`);
        console.log(`  Status: ${result.approvalDecision.status}`);
        console.log(`  Auto-Approved: ${result.approvalDecision.autoApproved ? 'YES ✅' : 'NO ❌'}`);
        console.log('');
      }

      // Validate workflow behavior
      const excellentApproved = results[0].approvalDecision.status === 'AUTO_APPROVED';
      const goodNeedsImprovement = ['NEEDS_IMPROVEMENT', 'CONDITIONAL_APPROVAL'].includes(results[1].approvalDecision.status);
      const poorRejected = results[2].approvalDecision.status === 'REJECTED';

      const passed = excellentApproved && goodNeedsImprovement && poorRejected;

      // Test statistics
      const stats = this.protocol.getStatistics();
      console.log('Protocol Statistics:');
      console.log(`  Total Evaluations: ${stats.totalEvaluations}`);
      console.log(`  Auto-Approvals: ${stats.autoApprovals}`);
      console.log(`  Rejections: ${stats.rejections}`);
      console.log(`  Auto-Approval Rate: ${stats.autoApprovalRate}%`);
      console.log(`  Rejection Rate: ${stats.rejectionRate}%`);
      console.log(`  Avg Evaluation Time: ${stats.avgEvaluationTime}ms`);

      this.testResults.push({
        name: 'Quality Gate Workflow',
        passed,
        stats
      });

      console.log(`\n${passed ? '✅' : '❌'} Quality gate workflow test complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Quality Gate Workflow',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70) + '\n');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);

      if (result.stats) {
        console.log(`        Total Evaluations: ${result.stats.totalEvaluations}`);
        console.log(`        Auto-Approval Rate: ${result.stats.autoApprovalRate}%`);
      }

      if (result.error) {
        console.log(`        Error: ${result.error}`);
      }
    }

    console.log('\n' + '-'.repeat(70));
    console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
    console.log(`Success Rate: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    console.log('='.repeat(70) + '\n');

    if (passedTests === totalTests) {
      console.log('✅ All tests passed!\n');
      console.log('Quality Gate Decision Matrix:');
      console.log('  90-100 points: AUTO_APPROVED ✅');
      console.log('  80-89 points:  NEEDS_IMPROVEMENT ⚠️ (with recommendations)');
      console.log('  0-79 points:   REJECTED ❌ (with recommendations)');
      console.log('');
    } else {
      console.log('❌ Some tests failed. Please review and fix.\n');
    }
  }
}

/**
 * Run tests
 */
async function runTests() {
  const tests = new AutoApprovalTests();
  const exitCode = await tests.runAllTests();
  process.exit(exitCode);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export default AutoApprovalTests;
