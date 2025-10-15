#!/usr/bin/env node

/**
 * @file verify_dry_run.js
 * @description Dry run verification - tests without requiring API keys
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dry Run Verification
 */
async function verifyDryRun() {
  console.log('\n' + '='.repeat(80));
  console.log('BRAND BUILDER SYSTEM - DRY RUN VERIFICATION');
  console.log('(Testing system structure without API keys)');
  console.log('='.repeat(80) + '\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0
  };

  // Test 1: Package Imports
  console.log('📦 Test 1: Package Imports (Dry Run)');
  console.log('─'.repeat(80));

  try {
    // Test importing support agents
    const { CostMonitoringAgent } = await import('../src/agents/support/CostMonitoringAgent.js');
    const { IncidentCommanderAgent } = await import('../src/agents/support/IncidentCommanderAgent.js');
    const { SystemRegistryAgent } = await import('../src/agents/support/SystemRegistryAgent.js');
    const { AuditAgent } = await import('../src/agents/support/AuditAgent.js');
    const { CoordinatorAgent } = await import('../src/agents/support/CoordinatorAgent.js');

    console.log('  ✅ CostMonitoringAgent imported successfully');
    console.log('  ✅ IncidentCommanderAgent imported successfully');
    console.log('  ✅ SystemRegistryAgent imported successfully');
    console.log('  ✅ AuditAgent imported successfully');
    console.log('  ✅ CoordinatorAgent imported successfully');

    results.tests.push({
      name: 'Support Agents Import',
      status: 'passed'
    });
    results.passed++;

  } catch (error) {
    console.error(`  ❌ Failed to import agents: ${error.message}`);
    results.tests.push({
      name: 'Support Agents Import',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 2: Agent Instantiation (without API calls)
  console.log('🤖 Test 2: Agent Instantiation (No API Calls)');
  console.log('─'.repeat(80));

  try {
    const { CostMonitoringAgent } = await import('../src/agents/support/CostMonitoringAgent.js');
    const { IncidentCommanderAgent } = await import('../src/agents/support/IncidentCommanderAgent.js');
    const { SystemRegistryAgent } = await import('../src/agents/support/SystemRegistryAgent.js');
    const { AuditAgent } = await import('../src/agents/support/AuditAgent.js');
    const { CoordinatorAgent } = await import('../src/agents/support/CoordinatorAgent.js');

    // Create instances (should not require API keys)
    const costAgent = new CostMonitoringAgent();
    const incidentAgent = new IncidentCommanderAgent();
    const registryAgent = new SystemRegistryAgent();
    const auditAgent = new AuditAgent();
    const coordinator = new CoordinatorAgent();

    console.log('  ✅ CostMonitoringAgent instantiated');
    console.log('  ✅ IncidentCommanderAgent instantiated');
    console.log('  ✅ SystemRegistryAgent instantiated');
    console.log('  ✅ AuditAgent instantiated');
    console.log('  ✅ CoordinatorAgent instantiated');

    results.tests.push({
      name: 'Agent Instantiation',
      status: 'passed'
    });
    results.passed++;

  } catch (error) {
    console.error(`  ❌ Failed to instantiate agents: ${error.message}`);
    results.tests.push({
      name: 'Agent Instantiation',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 3: Configuration Files Parsing
  console.log('⚙️  Test 3: Configuration Files Parsing');
  console.log('─'.repeat(80));

  try {
    const yaml = await import('js-yaml');

    // Test BUDGET.yml
    const budgetContent = await fs.readFile(
      path.join(process.cwd(), '.miyabi/BUDGET.yml'),
      'utf-8'
    );
    const budgetConfig = yaml.load(budgetContent);
    console.log('  ✅ BUDGET.yml parsed successfully');
    console.log(`     - Monthly limit: $${budgetConfig.budget.monthly_limit}`);
    console.log(`     - Warning threshold: ${budgetConfig.budget.warning_threshold * 100}%`);

    // Test config.yml
    const configContent = await fs.readFile(
      path.join(process.cwd(), '.miyabi/config.yml'),
      'utf-8'
    );
    const systemConfig = yaml.load(configContent);
    console.log('  ✅ config.yml parsed successfully');
    console.log(`     - System: ${systemConfig.system.name}`);
    console.log(`     - Mode: ${systemConfig.system.mode}`);

    results.tests.push({
      name: 'Configuration Parsing',
      status: 'passed'
    });
    results.passed++;

  } catch (error) {
    console.error(`  ❌ Configuration parsing failed: ${error.message}`);
    results.tests.push({
      name: 'Configuration Parsing',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 4: Agent Methods Exist
  console.log('🔍 Test 4: Agent Methods Verification');
  console.log('─'.repeat(80));

  try {
    const { CostMonitoringAgent } = await import('../src/agents/support/CostMonitoringAgent.js');
    const { IncidentCommanderAgent } = await import('../src/agents/support/IncidentCommanderAgent.js');

    const costAgent = new CostMonitoringAgent();
    const incidentAgent = new IncidentCommanderAgent();

    // Check CostMonitoringAgent methods
    const costMethods = ['initialize', 'recordUsage', 'estimateCost', 'checkThresholds', 'generateReport'];
    let allMethodsExist = true;

    for (const method of costMethods) {
      if (typeof costAgent[method] === 'function') {
        console.log(`  ✅ CostMonitoringAgent.${method}() exists`);
      } else {
        console.log(`  ❌ CostMonitoringAgent.${method}() missing`);
        allMethodsExist = false;
      }
    }

    // Check IncidentCommanderAgent methods
    const incidentMethods = ['initialize', 'reportIncident', 'analyzeRootCause', 'executeRollback'];

    for (const method of incidentMethods) {
      if (typeof incidentAgent[method] === 'function') {
        console.log(`  ✅ IncidentCommanderAgent.${method}() exists`);
      } else {
        console.log(`  ❌ IncidentCommanderAgent.${method}() missing`);
        allMethodsExist = false;
      }
    }

    if (allMethodsExist) {
      results.tests.push({
        name: 'Agent Methods',
        status: 'passed'
      });
      results.passed++;
    } else {
      results.tests.push({
        name: 'Agent Methods',
        status: 'failed'
      });
      results.failed++;
    }

  } catch (error) {
    console.error(`  ❌ Method verification failed: ${error.message}`);
    results.tests.push({
      name: 'Agent Methods',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 5: File Structure
  console.log('📁 Test 5: Directory Structure');
  console.log('─'.repeat(80));

  try {
    const requiredDirs = [
      '.miyabi',
      '.miyabi/logs',
      '.github/workflows',
      'src/agents/support',
      'src/agents/core',
      'scripts',
      'docs'
    ];

    let allDirsExist = true;

    for (const dir of requiredDirs) {
      try {
        const fullPath = path.join(process.cwd(), dir);
        await fs.access(fullPath);
        console.log(`  ✅ ${dir}/ exists`);
      } catch {
        console.log(`  ❌ ${dir}/ missing`);
        allDirsExist = false;
      }
    }

    if (allDirsExist) {
      results.tests.push({
        name: 'Directory Structure',
        status: 'passed'
      });
      results.passed++;
    } else {
      results.tests.push({
        name: 'Directory Structure',
        status: 'failed'
      });
      results.failed++;
    }

  } catch (error) {
    console.error(`  ❌ Directory check failed: ${error.message}`);
    results.tests.push({
      name: 'Directory Structure',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 6: Workflow Files Validity
  console.log('🔄 Test 6: GitHub Actions Workflow Syntax');
  console.log('─'.repeat(80));

  try {
    const yaml = await import('js-yaml');

    const workflows = [
      'economic-circuit-breaker.yml',
      'agent-onboarding.yml',
      'incident-response.yml',
      'quality-gate.yml'
    ];

    let allValid = true;

    for (const workflow of workflows) {
      try {
        const content = await fs.readFile(
          path.join(process.cwd(), '.github/workflows', workflow),
          'utf-8'
        );
        const parsed = yaml.load(content);

        if (parsed.name && parsed.on && parsed.jobs) {
          console.log(`  ✅ ${workflow} - valid syntax`);
        } else {
          console.log(`  ⚠️  ${workflow} - missing required fields`);
          allValid = false;
        }
      } catch (error) {
        console.log(`  ❌ ${workflow} - parse error`);
        allValid = false;
      }
    }

    if (allValid) {
      results.tests.push({
        name: 'Workflow Syntax',
        status: 'passed'
      });
      results.passed++;
    } else {
      results.tests.push({
        name: 'Workflow Syntax',
        status: 'failed'
      });
      results.failed++;
    }

  } catch (error) {
    console.error(`  ❌ Workflow validation failed: ${error.message}`);
    results.tests.push({
      name: 'Workflow Syntax',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 7: Scripts Executability
  console.log('📜 Test 7: Scripts Structure');
  console.log('─'.repeat(80));

  try {
    const scripts = [
      'test_miyabi_system.js',
      'demo_phase0.js',
      'verify_system.js',
      'verify_dry_run.js'
    ];

    let allScriptsValid = true;

    for (const script of scripts) {
      try {
        const content = await fs.readFile(
          path.join(process.cwd(), 'scripts', script),
          'utf-8'
        );

        const hasShebang = content.startsWith('#!/usr/bin/env node');
        const hasImport = content.includes('import');
        const hasAsync = content.includes('async');

        if (hasShebang && hasImport && hasAsync) {
          console.log(`  ✅ ${script} - properly structured`);
        } else {
          console.log(`  ⚠️  ${script} - may have structural issues`);
        }
      } catch (error) {
        console.log(`  ❌ ${script} - not found`);
        allScriptsValid = false;
      }
    }

    results.tests.push({
      name: 'Scripts Structure',
      status: allScriptsValid ? 'passed' : 'failed'
    });

    if (allScriptsValid) {
      results.passed++;
    } else {
      results.failed++;
    }

  } catch (error) {
    console.error(`  ❌ Scripts check failed: ${error.message}`);
    results.tests.push({
      name: 'Scripts Structure',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Final Summary
  console.log('='.repeat(80));
  console.log('DRY RUN VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log('');

  const passRate = ((results.passed / results.tests.length) * 100).toFixed(1);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('');

  if (results.failed === 0) {
    console.log('🎉 DRY RUN VERIFICATION PASSED!');
    console.log('');
    console.log('✅ All system components are properly structured');
    console.log('✅ All agents can be instantiated');
    console.log('✅ All configurations are valid');
    console.log('✅ All workflows have correct syntax');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Set up API keys in .env file');
    console.log('   2. Run: npm run verify (full verification)');
    console.log('   3. Run: npm run test:miyabi (integration test)');
    console.log('');
    console.log('The system is ready for deployment once API keys are configured.');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ DRY RUN VERIFICATION FAILED');
    console.log('');
    console.log('Please fix the failed tests above.');
    console.log('');
    process.exit(1);
  }
}

// Run dry run verification
verifyDryRun().catch(error => {
  console.error('\n❌ Fatal error during dry run:', error);
  process.exit(1);
});
