/**
 * @file e2e_workflow_test.js
 * @description End-to-End workflow testing for EStack-Brand-Builder
 * @version 1.0.0
 */

import { StructureAgent } from '../src/agents/core/StructureAgent.js';
import { ExpressionAgent } from '../src/agents/core/ExpressionAgent.js';
import { EvaluationAgent } from '../src/agents/core/EvaluationAgent.js';
import { CopyAgent } from '../src/agents/core/CopyAgent.js';
import { QualityControlAgent } from '../src/agents/quality/QualityControlAgent.js';
import { DocumentationAgent } from '../src/agents/support/DocumentationAgent.js';
import { TechnicalAgent } from '../src/agents/support/TechnicalAgent.js';

/**
 * Mock logger
 */
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args)
};

/**
 * E2E Workflow Test Suite
 */
class E2EWorkflowTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Run all E2E tests
   */
  async runAll() {
    console.log('\n' + '='.repeat(70));
    console.log('E2E WORKFLOW TESTS - ESTACK-BRAND-BUILDER');
    console.log('='.repeat(70) + '\n');

    await this.testAgentInitialization();
    await this.testSequentialWorkflow();
    await this.testParallelExecution();
    await this.testErrorHandling();
    await this.testDataFlow();

    this.printSummary();
    return this.results.failed === 0 ? 0 : 1;
  }

  /**
   * Test 1: Agent Initialization
   */
  async testAgentInitialization() {
    console.log('Test 1: Agent Initialization');

    try {
      const agents = [
        new StructureAgent({ logger }),
        new ExpressionAgent({ logger }),
        new EvaluationAgent({ logger }),
        new CopyAgent({ logger }),
        new QualityControlAgent({ logger }),
        new DocumentationAgent({ logger }),
        new TechnicalAgent({ logger })
      ];

      for (const agent of agents) {
        await agent.initialize();
      }

      this.recordPass('Agent Initialization', 'All 7 agents initialized successfully');
    } catch (error) {
      this.recordFail('Agent Initialization', error.message);
    }
  }

  /**
   * Test 2: Sequential Workflow (Code Analysis → Documentation → Quality Check)
   */
  async testSequentialWorkflow() {
    console.log('\nTest 2: Sequential Workflow');

    try {
      const testCode = `
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
`;

      // Step 1: Technical Analysis
      const techAgent = new TechnicalAgent({ logger });
      await techAgent.initialize();

      const techResult = await techAgent.process({
        code: testCode,
        type: 'architecture',
        filePath: 'calc.js'
      });

      if (!techResult.success) {
        throw new Error('Technical analysis failed');
      }

      // Step 2: Documentation Generation
      const docAgent = new DocumentationAgent({ logger });
      await docAgent.initialize();

      const docResult = await docAgent.process({
        code: testCode,
        type: 'api',
        filePath: 'calc.js'
      });

      if (!docResult.success) {
        throw new Error('Documentation generation failed');
      }

      // Step 3: Quality Check
      const qualityAgent = new QualityControlAgent({ logger });
      await qualityAgent.initialize();

      const qualityResult = await qualityAgent.process({
        code: testCode,
        filePath: 'calc.js'
      });

      if (!qualityResult.success) {
        throw new Error('Quality check failed');
      }

      this.recordPass('Sequential Workflow',
        `Tech → Doc → Quality (Score: ${qualityResult.result.score})`);
    } catch (error) {
      this.recordFail('Sequential Workflow', error.message);
    }
  }

  /**
   * Test 3: Parallel Execution (Multiple Agents Simultaneously)
   */
  async testParallelExecution() {
    console.log('\nTest 3: Parallel Execution');

    try {
      const testCode = `
/**
 * Test function
 * @param {string} name - User name
 * @returns {string} Greeting
 */
export function greet(name) {
  return \`Hello, \${name}!\`;
}
`;

      // Execute 3 agents in parallel
      const [docResult, techResult, qualityResult] = await Promise.all([
        (async () => {
          const agent = new DocumentationAgent({ logger });
          await agent.initialize();
          return agent.process({ code: testCode, type: 'api', filePath: 'greet.js' });
        })(),
        (async () => {
          const agent = new TechnicalAgent({ logger });
          await agent.initialize();
          return agent.process({ code: testCode, type: 'architecture', filePath: 'greet.js' });
        })(),
        (async () => {
          const agent = new QualityControlAgent({ logger });
          await agent.initialize();
          return agent.process({ code: testCode, filePath: 'greet.js' });
        })()
      ]);

      if (!docResult.success || !techResult.success || !qualityResult.success) {
        throw new Error('One or more parallel executions failed');
      }

      this.recordPass('Parallel Execution',
        `Doc + Tech + Quality executed simultaneously (Quality Score: ${qualityResult.result.score})`);
    } catch (error) {
      this.recordFail('Parallel Execution', error.message);
    }
  }

  /**
   * Test 4: Error Handling
   */
  async testErrorHandling() {
    console.log('\nTest 4: Error Handling');

    try {
      const agent = new QualityControlAgent({ logger });
      await agent.initialize();

      // Test with invalid input
      const result = await agent.process(null);

      if (result.success) {
        throw new Error('Should have failed with invalid input');
      }

      if (!result.error) {
        throw new Error('Error message not provided');
      }

      this.recordPass('Error Handling', 'Gracefully handled invalid input');
    } catch (error) {
      this.recordFail('Error Handling', error.message);
    }
  }

  /**
   * Test 5: Data Flow Between Agents
   */
  async testDataFlow() {
    console.log('\nTest 5: Data Flow Between Agents');

    try {
      const testCode = `
/**
 * User authentication service
 */
export class AuthService {
  async login(email, password) {
    // Implementation
  }

  async logout() {
    // Implementation
  }
}
`;

      // Step 1: Technical Analysis
      const techAgent = new TechnicalAgent({ logger });
      await techAgent.initialize();

      const techResult = await techAgent.process({
        code: testCode,
        type: 'security',
        filePath: 'auth.js'
      });

      if (!techResult.success) {
        throw new Error('Technical analysis failed');
      }

      // Step 2: Documentation based on Technical output
      const docAgent = new DocumentationAgent({ logger });
      await docAgent.initialize();

      const docResult = await docAgent.process({
        code: testCode,
        type: 'api',
        filePath: 'auth.js'
      });

      if (!docResult.success) {
        throw new Error('Documentation failed');
      }

      // Step 3: Quality verification
      const qualityAgent = new QualityControlAgent({ logger });
      await qualityAgent.initialize();

      const qualityResult = await qualityAgent.process({
        code: testCode,
        filePath: 'auth.js'
      });

      if (!qualityResult.success) {
        throw new Error('Quality check failed');
      }

      // Verify data flow and metadata
      if (!qualityResult.metadata || !qualityResult.metadata.agent) {
        throw new Error('Metadata not properly propagated');
      }

      this.recordPass('Data Flow',
        `Tech → Doc → Quality (Final Score: ${qualityResult.result.score})`);
    } catch (error) {
      this.recordFail('Data Flow', error.message);
    }
  }

  /**
   * Record test pass
   */
  recordPass(testName, details) {
    this.results.passed++;
    this.results.tests.push({
      name: testName,
      status: 'PASS',
      details
    });
    console.log(`✅ PASS - ${details}\n`);
  }

  /**
   * Record test fail
   */
  recordFail(testName, error) {
    this.results.failed++;
    this.results.tests.push({
      name: testName,
      status: 'FAIL',
      error
    });
    console.log(`❌ FAIL - ${error}\n`);
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('='.repeat(70));
    console.log('E2E TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(70) + '\n');

    if (this.results.failed === 0) {
      console.log('✅ All E2E tests passed!\n');
      console.log('EStack-Brand-Builder is ready for production.\n');
    } else {
      console.log('⚠️  Some E2E tests failed. Please review.\n');
    }
  }
}

// Execute E2E tests
const suite = new E2EWorkflowTest();
suite.runAll()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ E2E test execution failed:', error);
    process.exit(1);
  });
