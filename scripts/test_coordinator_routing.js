/**
 * @file test_coordinator_routing.js
 * @description CoordinatorAgent task routing integration tests
 * @version 1.0.0
 *
 * Tests for Issue #7: CoordinatorAgent task routing integration tests
 *
 * Test Coverage:
 * - All 12 agents routing
 * - Fuzzy matching
 * - Confidence score validation
 * - Workflow execution
 */

import { CoordinatorAgent } from '../src/agents/support/CoordinatorAgent.js';

/**
 * Test suite for CoordinatorAgent routing
 */
class CoordinatorRoutingTests {
  constructor() {
    this.coordinator = null;
    this.testResults = [];
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('\n📋 Setting up CoordinatorAgent routing tests...\n');

    this.coordinator = new CoordinatorAgent({
      registryPath: '.miyabi/agent_registry.json'
    });

    await this.coordinator.initialize();
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    await this.setup();

    console.log('\n' + '='.repeat(70));
    console.log('COORDINATOR AGENT ROUTING TESTS');
    console.log('='.repeat(70) + '\n');

    // Test 1: Route to all 12 agents
    await this.testAllAgentRouting();

    // Test 2: Fuzzy matching
    await this.testFuzzyMatching();

    // Test 3: Confidence scores
    await this.testConfidenceScores();

    // Test 4: Workflow execution
    await this.testWorkflowExecution();

    // Print summary
    this.printSummary();

    // Return exit code
    return this.testResults.every(r => r.passed) ? 0 : 1;
  }

  /**
   * Test 1: Route to all 12 agents
   */
  async testAllAgentRouting() {
    console.log('\n📍 Test 1: All Agent Routing\n');
    console.log('-'.repeat(70) + '\n');

    const testTasks = [
      // Support Agents (5)
      { type: 'cost_monitoring', description: 'Check API costs for this month' },
      { type: 'incident_response', description: 'Handle critical system error' },
      { type: 'agent_onboarding', description: 'Register new agent to system' },
      { type: 'security_audit', description: 'Audit system security and access' },
      { type: 'task_routing', description: 'Route task to appropriate agent' }, // CoordinatorAgent

      // Core Agents (7)
      { type: 'brand_structure', description: 'Create E:Stack brand structure' },
      { type: 'expression_generation', description: 'Generate brand expression concepts' },
      { type: 'evaluation', description: 'Evaluate brand quality score' },
      { type: 'copywriting', description: 'Write brand tagline and messages' },
      { type: 'logo_design', description: 'Design brand logo and symbol' },
      { type: 'visual_identity', description: 'Create visual identity system' },
      { type: 'brand_copy', description: 'Generate copy for brand' } // CopyAgent
    ];

    const routings = [];

    for (const task of testTasks) {
      const routing = this.coordinator.routeTask(task);
      routings.push(routing);

      const status = routing.selected_agent ? '✅' : '❌';
      const agentName = routing.selected_agent ? routing.selected_agent.name : 'None';
      const confidence = (routing.confidence * 100).toFixed(0);

      console.log(`${status} ${task.type.padEnd(25)} → ${agentName.padEnd(25)} (${confidence}%)`);
    }

    // Validation
    const routedCount = routings.filter(r => r.selected_agent !== null).length;
    const expectedCount = testTasks.length;
    const passed = routedCount >= expectedCount * 0.9; // 90% success rate

    this.testResults.push({
      name: 'All Agent Routing',
      passed,
      routedCount,
      expectedCount,
      successRate: (routedCount / expectedCount * 100).toFixed(1)
    });

    console.log(`\n${passed ? '✅' : '❌'} Routed ${routedCount}/${expectedCount} tasks (${(routedCount / expectedCount * 100).toFixed(1)}%)`);
  }

  /**
   * Test 2: Fuzzy matching
   */
  async testFuzzyMatching() {
    console.log('\n\n📍 Test 2: Fuzzy Matching\n');
    console.log('-'.repeat(70) + '\n');

    const fuzzyTasks = [
      {
        description: 'I need help with brand identity design and visual guidelines',
        expected: 'VisualAgent'
      },
      {
        description: 'Create a compelling logo that represents our company values',
        expected: 'LogoAgent'
      },
      {
        description: 'Write persuasive copy for our new product launch',
        expected: 'CopyAgent'
      },
      {
        description: 'Analyze and evaluate the quality of our brand materials',
        expected: 'EvaluationAgent'
      },
      {
        description: 'Define our brand structure using the E:Stack method',
        expected: 'StructureAgent'
      }
    ];

    let correctMatches = 0;

    for (const task of fuzzyTasks) {
      const routing = this.coordinator.routeTask(task);
      const matched = routing.selected_agent?.name === task.expected;

      if (matched) correctMatches++;

      const status = matched ? '✅' : '❌';
      const agentName = routing.selected_agent ? routing.selected_agent.name : 'None';
      const confidence = (routing.confidence * 100).toFixed(0);

      console.log(`${status} Expected: ${task.expected.padEnd(20)} → Got: ${agentName.padEnd(20)} (${confidence}%)`);
      console.log(`   Task: "${task.description.substring(0, 60)}..."`);
      console.log('');
    }

    const passed = correctMatches >= fuzzyTasks.length * 0.7; // 70% accuracy for fuzzy

    this.testResults.push({
      name: 'Fuzzy Matching',
      passed,
      correctMatches,
      totalTasks: fuzzyTasks.length,
      accuracy: (correctMatches / fuzzyTasks.length * 100).toFixed(1)
    });

    console.log(`${passed ? '✅' : '❌'} Fuzzy matching accuracy: ${correctMatches}/${fuzzyTasks.length} (${(correctMatches / fuzzyTasks.length * 100).toFixed(1)}%)`);
  }

  /**
   * Test 3: Confidence scores
   */
  async testConfidenceScores() {
    console.log('\n\n📍 Test 3: Confidence Score Validation\n');
    console.log('-'.repeat(70) + '\n');

    const testCases = [
      {
        type: 'logo_design',
        description: 'Create company logo',
        expectedMinConfidence: 0.8
      },
      {
        type: 'visual_identity',
        description: 'Design visual system',
        expectedMinConfidence: 0.8
      },
      {
        description: 'I need help with some brand work',
        expectedMinConfidence: 0.0 // Vague task, may not match
      }
    ];

    let passed = true;

    for (const testCase of testCases) {
      const routing = this.coordinator.routeTask(testCase);
      const meetsThreshold = routing.confidence >= testCase.expectedMinConfidence;

      const status = meetsThreshold ? '✅' : '❌';
      const confidence = (routing.confidence * 100).toFixed(0);
      const threshold = (testCase.expectedMinConfidence * 100).toFixed(0);

      console.log(`${status} Confidence: ${confidence}% (threshold: ${threshold}%)`);
      console.log(`   Type: ${testCase.type || 'N/A'}`);
      console.log(`   Agent: ${routing.selected_agent?.name || 'None'}`);
      console.log('');

      if (!meetsThreshold) passed = false;
    }

    this.testResults.push({
      name: 'Confidence Score Validation',
      passed
    });

    console.log(`${passed ? '✅' : '❌'} All confidence scores meet thresholds`);
  }

  /**
   * Test 4: Workflow execution
   */
  async testWorkflowExecution() {
    console.log('\n\n📍 Test 4: Workflow Execution\n');
    console.log('-'.repeat(70) + '\n');

    const workflowDef = {
      name: 'Brand Creation Workflow',
      description: 'Complete brand creation from structure to visual identity',
      steps: [
        {
          name: 'Define Brand Structure',
          type: 'brand_structure',
          description: 'Create E:Stack structure'
        },
        {
          name: 'Generate Brand Expression',
          type: 'expression_generation',
          description: 'Generate expression concepts'
        },
        {
          name: 'Design Logo',
          type: 'logo_design',
          description: 'Create brand logo'
        },
        {
          name: 'Create Visual Identity',
          type: 'visual_identity',
          description: 'Design VI system'
        },
        {
          name: 'Evaluate Quality',
          type: 'evaluation',
          description: 'Evaluate brand quality'
        }
      ]
    };

    try {
      // Create workflow
      const workflow = await this.coordinator.createWorkflow(workflowDef);
      console.log(`Created workflow: ${workflow.id}\n`);

      // Execute workflow
      const result = await this.coordinator.executeWorkflow(workflow.id);

      // Validation
      const allStepsSucceeded = result.results.every(r => r.success);
      const passed = result.status === 'completed' && allStepsSucceeded;

      this.testResults.push({
        name: 'Workflow Execution',
        passed,
        status: result.status,
        completedSteps: result.results.length,
        totalSteps: result.steps.length
      });

      // Print workflow report
      const report = this.coordinator.generateWorkflowReport(result);
      console.log(report);

    } catch (error) {
      console.log(`❌ Workflow execution failed: ${error.message}`);

      this.testResults.push({
        name: 'Workflow Execution',
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

      if (result.routedCount !== undefined) {
        console.log(`        Routed: ${result.routedCount}/${result.expectedCount} (${result.successRate}%)`);
      }

      if (result.correctMatches !== undefined) {
        console.log(`        Accuracy: ${result.correctMatches}/${result.totalTasks} (${result.accuracy}%)`);
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
    } else {
      console.log('❌ Some tests failed. Please review and fix.\n');
    }
  }
}

/**
 * Run tests
 */
async function runTests() {
  const tests = new CoordinatorRoutingTests();
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

export default CoordinatorRoutingTests;
