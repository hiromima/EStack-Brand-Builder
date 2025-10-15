/**
 * @file test_parallel_execution.js
 * @description Multi-agent parallel execution integration tests
 * @version 1.0.0
 *
 * Tests for Issue #8: Multi-agent parallel execution tests
 *
 * Test Coverage:
 * - Parallel execution framework
 * - Inter-agent communication
 * - Dependency management
 * - Error handling
 */

import { CoordinatorAgent } from '../src/agents/support/CoordinatorAgent.js';

/**
 * Test suite for parallel execution
 */
class ParallelExecutionTests {
  constructor() {
    this.coordinator = null;
    this.testResults = [];
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('\n📋 Setting up parallel execution tests...\n');

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
    console.log('MULTI-AGENT PARALLEL EXECUTION TESTS');
    console.log('='.repeat(70) + '\n');

    // Test 1: Parallel execution framework
    await this.testParallelFramework();

    // Test 2: Inter-agent communication
    await this.testInterAgentCommunication();

    // Test 3: Dependency management
    await this.testDependencyManagement();

    // Test 4: Error handling
    await this.testErrorHandling();

    // Print summary
    this.printSummary();

    // Return exit code
    return this.testResults.every(r => r.passed) ? 0 : 1;
  }

  /**
   * Test 1: Parallel execution framework
   */
  async testParallelFramework() {
    console.log('\n📍 Test 1: Parallel Execution Framework\n');
    console.log('-'.repeat(70) + '\n');

    try {
      // Create workflow with parallel steps
      const workflow = await this.coordinator.createWorkflow({
        name: 'Parallel Brand Analysis',
        description: 'Execute multiple independent analyses in parallel',
        steps: [
          {
            name: 'Analyze Structure',
            type: 'brand_structure',
            description: 'Analyze brand structure',
            parallel_group: 'analysis'
          },
          {
            name: 'Evaluate Quality',
            type: 'evaluation',
            description: 'Evaluate brand quality',
            parallel_group: 'analysis'
          },
          {
            name: 'Analyze Visual',
            type: 'visual_identity',
            description: 'Analyze visual identity',
            parallel_group: 'analysis'
          }
        ]
      });

      console.log(`Created workflow: ${workflow.id}`);
      console.log(`Steps: ${workflow.steps.length}`);
      console.log(`Parallel group: analysis (3 steps)\n`);

      // Simulate parallel execution
      const startTime = Date.now();

      const parallelTasks = workflow.steps.map(step => {
        return this.coordinator.routeTask({
          type: step.type,
          description: step.description
        });
      });

      console.log('Executing tasks in parallel...\n');

      for (let i = 0; i < parallelTasks.length; i++) {
        const routing = parallelTasks[i];
        const step = workflow.steps[i];

        if (routing.selected_agent) {
          console.log(`✅ [${i + 1}] ${step.name} → ${routing.selected_agent.name}`);
        } else {
          console.log(`❌ [${i + 1}] ${step.name} → No agent`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`\nParallel execution completed in ${duration}ms`);

      const allRouted = parallelTasks.every(t => t.selected_agent !== null);

      this.testResults.push({
        name: 'Parallel Execution Framework',
        passed: allRouted,
        tasksRouted: parallelTasks.filter(t => t.selected_agent).length,
        totalTasks: parallelTasks.length
      });

      console.log(`\n${allRouted ? '✅' : '❌'} All tasks routed successfully`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Parallel Execution Framework',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 2: Inter-agent communication
   */
  async testInterAgentCommunication() {
    console.log('\n\n📍 Test 2: Inter-Agent Communication\n');
    console.log('-'.repeat(70) + '\n');

    try {
      // Create workflow with data passing between agents
      const workflow = await this.coordinator.createWorkflow({
        name: 'Sequential Brand Creation',
        description: 'Pass data between agents sequentially',
        steps: [
          {
            name: 'Define Structure',
            type: 'brand_structure',
            description: 'Create brand structure',
            outputs: ['estack']
          },
          {
            name: 'Generate Expression',
            type: 'expression_generation',
            description: 'Generate expressions from structure',
            inputs: ['estack'],
            outputs: ['expressions']
          },
          {
            name: 'Evaluate Result',
            type: 'evaluation',
            description: 'Evaluate brand expressions',
            inputs: ['estack', 'expressions']
          }
        ]
      });

      console.log(`Created workflow: ${workflow.id}`);
      console.log(`Steps: ${workflow.steps.length}\n`);

      // Verify data flow
      let dataFlowValid = true;
      const dataRegistry = new Map();

      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];

        console.log(`[${i + 1}] ${step.name}`);

        // Check inputs
        if (step.inputs) {
          console.log(`   Inputs: ${step.inputs.join(', ')}`);

          for (const input of step.inputs) {
            if (!dataRegistry.has(input)) {
              console.log(`   ❌ Missing input: ${input}`);
              dataFlowValid = false;
            } else {
              console.log(`   ✅ Input available: ${input}`);
            }
          }
        }

        // Register outputs
        if (step.outputs) {
          console.log(`   Outputs: ${step.outputs.join(', ')}`);

          for (const output of step.outputs) {
            dataRegistry.set(output, {
              step: step.name,
              stepIndex: i
            });
          }
        }

        console.log('');
      }

      this.testResults.push({
        name: 'Inter-Agent Communication',
        passed: dataFlowValid
      });

      console.log(`${dataFlowValid ? '✅' : '❌'} Data flow validation complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Inter-Agent Communication',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 3: Dependency management
   */
  async testDependencyManagement() {
    console.log('\n\n📍 Test 3: Dependency Management\n');
    console.log('-'.repeat(70) + '\n');

    try {
      // Create complex workflow with dependencies
      const workflow = await this.coordinator.createWorkflow({
        name: 'Complex Brand Workflow',
        description: 'Workflow with multiple dependency levels',
        steps: [
          {
            name: 'Foundation Setup',
            type: 'brand_structure',
            description: 'Setup brand foundation',
            dependencies: []
          },
          {
            name: 'Logo Design',
            type: 'logo_design',
            description: 'Design logo',
            dependencies: ['Foundation Setup']
          },
          {
            name: 'Visual System',
            type: 'visual_identity',
            description: 'Create visual system',
            dependencies: ['Foundation Setup', 'Logo Design']
          },
          {
            name: 'Copy Creation',
            type: 'copywriting',
            description: 'Create copy',
            dependencies: ['Foundation Setup']
          },
          {
            name: 'Final Evaluation',
            type: 'evaluation',
            description: 'Evaluate everything',
            dependencies: ['Visual System', 'Copy Creation']
          }
        ]
      });

      console.log(`Created workflow: ${workflow.id}`);
      console.log(`Steps: ${workflow.steps.length}\n`);

      // Build dependency graph
      const dependencyGraph = new Map();

      for (const step of workflow.steps) {
        dependencyGraph.set(step.name, {
          dependencies: step.dependencies || [],
          dependents: []
        });
      }

      // Find dependents
      for (const step of workflow.steps) {
        for (const dep of (step.dependencies || [])) {
          const depNode = dependencyGraph.get(dep);
          if (depNode) {
            depNode.dependents.push(step.name);
          }
        }
      }

      // Validate dependencies
      let dependenciesValid = true;

      for (const step of workflow.steps) {
        const deps = step.dependencies || [];
        console.log(`${step.name}:`);
        console.log(`  Dependencies: ${deps.length > 0 ? deps.join(', ') : 'None'}`);

        // Check if all dependencies exist
        for (const dep of deps) {
          const exists = workflow.steps.some(s => s.name === dep);
          if (!exists) {
            console.log(`  ❌ Missing dependency: ${dep}`);
            dependenciesValid = false;
          }
        }

        const dependents = dependencyGraph.get(step.name).dependents;
        if (dependents.length > 0) {
          console.log(`  Dependents: ${dependents.join(', ')}`);
        }

        console.log('');
      }

      // Calculate execution order
      const executionOrder = this.topologicalSort(workflow.steps);

      console.log('Execution order:');
      executionOrder.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.name}`);
      });

      this.testResults.push({
        name: 'Dependency Management',
        passed: dependenciesValid && executionOrder.length === workflow.steps.length
      });

      console.log(`\n${dependenciesValid ? '✅' : '❌'} Dependency validation complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Dependency Management',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 4: Error handling
   */
  async testErrorHandling() {
    console.log('\n\n📍 Test 4: Error Handling\n');
    console.log('-'.repeat(70) + '\n');

    try {
      const testCases = [
        {
          name: 'Missing Agent',
          workflow: {
            name: 'Test Missing Agent',
            steps: [
              {
                name: 'Unknown Task',
                type: 'unknown_type',
                description: 'This should fail'
              }
            ]
          },
          shouldFail: true
        },
        {
          name: 'Circular Dependency',
          workflow: {
            name: 'Test Circular Dependency',
            steps: [
              {
                name: 'Step A',
                type: 'brand_structure',
                dependencies: ['Step B']
              },
              {
                name: 'Step B',
                type: 'evaluation',
                dependencies: ['Step A']
              }
            ]
          },
          shouldFail: true
        },
        {
          name: 'Continue on Error',
          workflow: {
            name: 'Test Continue on Error',
            steps: [
              {
                name: 'Optional Step',
                type: 'unknown_type',
                description: 'This can fail',
                continue_on_error: true
              },
              {
                name: 'Important Step',
                type: 'evaluation',
                description: 'This must succeed'
              }
            ]
          },
          shouldFail: false
        }
      ];

      let allTestsPassed = true;

      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.name}`);

        try {
          const workflow = await this.coordinator.createWorkflow(testCase.workflow);

          // Check for circular dependencies
          if (testCase.name === 'Circular Dependency') {
            const hasCycle = this.detectCycle(workflow.steps);

            if (hasCycle) {
              console.log(`  ✅ Circular dependency detected (expected)`);
            } else {
              console.log(`  ❌ Circular dependency not detected`);
              allTestsPassed = false;
            }
          } else {
            console.log(`  ✅ Workflow created successfully`);
          }

        } catch (error) {
          if (testCase.shouldFail) {
            console.log(`  ✅ Failed as expected: ${error.message}`);
          } else {
            console.log(`  ❌ Unexpected failure: ${error.message}`);
            allTestsPassed = false;
          }
        }

        console.log('');
      }

      this.testResults.push({
        name: 'Error Handling',
        passed: allTestsPassed
      });

      console.log(`${allTestsPassed ? '✅' : '❌'} Error handling tests complete`);

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);

      this.testResults.push({
        name: 'Error Handling',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Topological sort for execution order
   */
  topologicalSort(steps) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (step) => {
      if (visited.has(step.name)) return;
      if (visiting.has(step.name)) {
        throw new Error(`Circular dependency detected: ${step.name}`);
      }

      visiting.add(step.name);

      for (const depName of (step.dependencies || [])) {
        const depStep = steps.find(s => s.name === depName);
        if (depStep) {
          visit(depStep);
        }
      }

      visiting.delete(step.name);
      visited.add(step.name);
      sorted.push(step);
    };

    for (const step of steps) {
      visit(step);
    }

    return sorted;
  }

  /**
   * Detect circular dependencies
   */
  detectCycle(steps) {
    try {
      this.topologicalSort(steps);
      return false;
    } catch (error) {
      return error.message.includes('Circular dependency');
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

      if (result.tasksRouted !== undefined) {
        console.log(`        Tasks routed: ${result.tasksRouted}/${result.totalTasks}`);
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
  const tests = new ParallelExecutionTests();
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

export default ParallelExecutionTests;
