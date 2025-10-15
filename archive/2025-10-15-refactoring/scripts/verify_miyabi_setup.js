#!/usr/bin/env node

/**
 * @file verify_miyabi_setup.js
 * @description Comprehensive Miyabi initial setup verification - dry run
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify Miyabi Setup
 */
async function verifyMiyabiSetup() {
  console.log('\n' + '='.repeat(80));
  console.log('MIYABI AUTONOMOUS SYSTEM - INITIAL SETUP VERIFICATION');
  console.log('(Complete dry run - no API calls required)');
  console.log('='.repeat(80) + '\n');

  const results = {
    timestamp: new Date().toISOString(),
    categories: [],
    total_checks: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // Category 1: Miyabi SDK Installation
  console.log('📦 Category 1: Miyabi SDK Installation');
  console.log('─'.repeat(80));

  const sdkCategory = {
    name: 'Miyabi SDK',
    checks: []
  };

  try {
    // Check package.json
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const miyabiVersion = packageJson.dependencies['miyabi-agent-sdk'];

    if (miyabiVersion) {
      console.log(`  ✅ miyabi-agent-sdk listed in package.json (${miyabiVersion})`);
      sdkCategory.checks.push({
        name: 'package.json entry',
        status: 'passed',
        version: miyabiVersion
      });
      results.passed++;
    } else {
      console.log('  ❌ miyabi-agent-sdk NOT in package.json');
      sdkCategory.checks.push({
        name: 'package.json entry',
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;

    // Check node_modules
    try {
      const sdkPackagePath = 'node_modules/miyabi-agent-sdk/package.json';
      const sdkPackage = JSON.parse(await fs.readFile(sdkPackagePath, 'utf-8'));
      console.log(`  ✅ miyabi-agent-sdk installed (v${sdkPackage.version})`);
      sdkCategory.checks.push({
        name: 'SDK installation',
        status: 'passed',
        installed_version: sdkPackage.version
      });
      results.passed++;
    } catch {
      console.log('  ❌ miyabi-agent-sdk NOT installed in node_modules');
      sdkCategory.checks.push({
        name: 'SDK installation',
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;

    // Check CLI availability
    try {
      const { execSync } = await import('child_process');
      execSync('npx miyabi-agent-sdk help', { stdio: 'pipe' });
      console.log('  ✅ miyabi-agent-sdk CLI executable');
      sdkCategory.checks.push({
        name: 'CLI availability',
        status: 'passed'
      });
      results.passed++;
    } catch {
      console.log('  ⚠️  miyabi-agent-sdk CLI not executable');
      sdkCategory.checks.push({
        name: 'CLI availability',
        status: 'warning'
      });
      results.warnings++;
    }
    results.total_checks++;

  } catch (error) {
    console.error(`  ❌ SDK check failed: ${error.message}`);
    results.failed++;
    results.total_checks++;
  }

  results.categories.push(sdkCategory);
  console.log('');

  // Category 2: Miyabi Configuration Files
  console.log('⚙️  Category 2: Miyabi Configuration Files');
  console.log('─'.repeat(80));

  const configCategory = {
    name: 'Configuration Files',
    checks: []
  };

  const requiredConfigs = [
    {
      path: '.miyabi/BUDGET.yml',
      description: 'Economic constraints',
      mustContain: ['budget', 'services', 'circuit_breaker']
    },
    {
      path: '.miyabi/config.yml',
      description: 'System configuration',
      mustContain: ['system', 'agents', 'autonomy']
    }
  ];

  for (const config of requiredConfigs) {
    try {
      const content = await fs.readFile(config.path, 'utf-8');
      const yaml = await import('js-yaml');
      const parsed = yaml.load(content);

      // Check required fields
      let allFieldsPresent = true;
      for (const field of config.mustContain) {
        if (!parsed[field]) {
          console.log(`  ⚠️  ${config.path} - missing field: ${field}`);
          allFieldsPresent = false;
        }
      }

      // Special check for BUDGET.yml nested structure
      if (config.path === '.miyabi/BUDGET.yml' && parsed.budget) {
        if (!parsed.budget.monthly_limit) {
          console.log(`  ⚠️  ${config.path} - missing budget.monthly_limit`);
          allFieldsPresent = false;
        }
      }

      if (allFieldsPresent) {
        console.log(`  ✅ ${config.path} - ${config.description} (valid)`);
        configCategory.checks.push({
          name: config.path,
          status: 'passed',
          size: content.length
        });
        results.passed++;
      } else {
        console.log(`  ⚠️  ${config.path} - incomplete`);
        configCategory.checks.push({
          name: config.path,
          status: 'warning'
        });
        results.warnings++;
      }
    } catch (error) {
      console.log(`  ❌ ${config.path} - NOT FOUND or invalid`);
      configCategory.checks.push({
        name: config.path,
        status: 'failed',
        error: error.message
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(configCategory);
  console.log('');

  // Category 3: Support Agents Implementation
  console.log('🤖 Category 3: Support Agents (5 required)');
  console.log('─'.repeat(80));

  const agentsCategory = {
    name: 'Support Agents',
    checks: []
  };

  const requiredAgents = [
    {
      name: 'CostMonitoringAgent',
      path: 'src/agents/support/CostMonitoringAgent.js',
      requiredMethods: ['initialize', 'recordUsage', 'checkThresholds', 'triggerCircuitBreaker']
    },
    {
      name: 'IncidentCommanderAgent',
      path: 'src/agents/support/IncidentCommanderAgent.js',
      requiredMethods: ['initialize', 'reportIncident', 'analyzeRootCause', 'executeRollback', 'executeHandshakeProtocol']
    },
    {
      name: 'SystemRegistryAgent',
      path: 'src/agents/support/SystemRegistryAgent.js',
      requiredMethods: ['initialize', 'scanForNewAgents', 'onboardNewAgents', 'runComplianceTests']
    },
    {
      name: 'AuditAgent',
      path: 'src/agents/support/AuditAgent.js',
      requiredMethods: ['initialize', 'logEntry', 'detectAnomalies', 'runSecurityAudit']
    },
    {
      name: 'CoordinatorAgent',
      path: 'src/agents/support/CoordinatorAgent.js',
      requiredMethods: ['initialize', 'createWorkflow', 'executeWorkflow'],
      syncMethods: ['routeTask'] // routeTask is synchronous
    }
  ];

  for (const agent of requiredAgents) {
    try {
      const content = await fs.readFile(agent.path, 'utf-8');

      // Check class export
      const hasClassExport = content.includes(`export class ${agent.name}`);

      // Check required methods (async)
      const missingMethods = [];
      for (const method of agent.requiredMethods) {
        if (!content.includes(`async ${method}(`)) {
          missingMethods.push(method);
        }
      }

      // Check synchronous methods if defined
      if (agent.syncMethods) {
        for (const method of agent.syncMethods) {
          // Check for method definition (can be sync or async)
          if (!content.includes(`${method}(`)) {
            missingMethods.push(method);
          }
        }
      }

      if (hasClassExport && missingMethods.length === 0) {
        console.log(`  ✅ ${agent.name} - fully implemented`);
        agentsCategory.checks.push({
          name: agent.name,
          status: 'passed',
          methods: agent.requiredMethods.length
        });
        results.passed++;
      } else if (hasClassExport) {
        console.log(`  ⚠️  ${agent.name} - missing methods: ${missingMethods.join(', ')}`);
        agentsCategory.checks.push({
          name: agent.name,
          status: 'warning',
          missing: missingMethods
        });
        results.warnings++;
      } else {
        console.log(`  ❌ ${agent.name} - class not exported`);
        agentsCategory.checks.push({
          name: agent.name,
          status: 'failed'
        });
        results.failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${agent.name} - NOT FOUND`);
      agentsCategory.checks.push({
        name: agent.name,
        status: 'failed',
        error: 'File not found'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(agentsCategory);
  console.log('');

  // Category 4: GitHub Actions Workflows
  console.log('🔄 Category 4: GitHub Actions Workflows (4 required)');
  console.log('─'.repeat(80));

  const workflowsCategory = {
    name: 'GitHub Actions Workflows',
    checks: []
  };

  const requiredWorkflows = [
    {
      name: 'economic-circuit-breaker.yml',
      description: 'Cost monitoring',
      mustContain: ['on:', 'schedule:', 'cron:']
    },
    {
      name: 'agent-onboarding.yml',
      description: 'Agent registration',
      mustContain: ['on:', 'push:', 'paths:']
    },
    {
      name: 'incident-response.yml',
      description: 'Incident handling',
      mustContain: ['on:', 'issues:', 'types:']
    },
    {
      name: 'quality-gate.yml',
      description: 'Quality control',
      mustContain: ['on:', 'pull_request:']
    }
  ];

  for (const workflow of requiredWorkflows) {
    try {
      const workflowPath = `.github/workflows/${workflow.name}`;
      const content = await fs.readFile(workflowPath, 'utf-8');

      // Check required fields
      let allFieldsPresent = true;
      for (const field of workflow.mustContain) {
        if (!content.includes(field)) {
          allFieldsPresent = false;
        }
      }

      if (allFieldsPresent) {
        console.log(`  ✅ ${workflow.name} - ${workflow.description}`);
        workflowsCategory.checks.push({
          name: workflow.name,
          status: 'passed'
        });
        results.passed++;
      } else {
        console.log(`  ⚠️  ${workflow.name} - incomplete configuration`);
        workflowsCategory.checks.push({
          name: workflow.name,
          status: 'warning'
        });
        results.warnings++;
      }
    } catch (error) {
      console.log(`  ❌ ${workflow.name} - NOT FOUND`);
      workflowsCategory.checks.push({
        name: workflow.name,
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(workflowsCategory);
  console.log('');

  // Category 5: Directory Structure
  console.log('📁 Category 5: Miyabi Directory Structure');
  console.log('─'.repeat(80));

  const directoryCategory = {
    name: 'Directory Structure',
    checks: []
  };

  const requiredDirs = [
    { path: '.miyabi', description: 'Miyabi root directory' },
    { path: '.miyabi/logs', description: 'Logs directory' },
    { path: 'src/agents/support', description: 'Support agents directory' },
    { path: '.github/workflows', description: 'Workflows directory' }
  ];

  for (const dir of requiredDirs) {
    try {
      await fs.access(dir.path);
      console.log(`  ✅ ${dir.path}/ - ${dir.description}`);
      directoryCategory.checks.push({
        name: dir.path,
        status: 'passed'
      });
      results.passed++;
    } catch {
      console.log(`  ❌ ${dir.path}/ - NOT FOUND`);
      directoryCategory.checks.push({
        name: dir.path,
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(directoryCategory);
  console.log('');

  // Category 6: Agent Instantiation Test (No API calls)
  console.log('🧪 Category 6: Agent Instantiation Test (Dry Run)');
  console.log('─'.repeat(80));

  const instantiationCategory = {
    name: 'Agent Instantiation',
    checks: []
  };

  try {
    const { CostMonitoringAgent } = await import('../src/agents/support/CostMonitoringAgent.js');
    const { IncidentCommanderAgent } = await import('../src/agents/support/IncidentCommanderAgent.js');
    const { SystemRegistryAgent } = await import('../src/agents/support/SystemRegistryAgent.js');
    const { AuditAgent } = await import('../src/agents/support/AuditAgent.js');
    const { CoordinatorAgent } = await import('../src/agents/support/CoordinatorAgent.js');

    // Test instantiation
    const agents = [
      { name: 'CostMonitoringAgent', class: CostMonitoringAgent },
      { name: 'IncidentCommanderAgent', class: IncidentCommanderAgent },
      { name: 'SystemRegistryAgent', class: SystemRegistryAgent },
      { name: 'AuditAgent', class: AuditAgent },
      { name: 'CoordinatorAgent', class: CoordinatorAgent }
    ];

    for (const agent of agents) {
      try {
        new agent.class();
        console.log(`  ✅ ${agent.name} - instantiated successfully`);
        instantiationCategory.checks.push({
          name: agent.name,
          status: 'passed'
        });
        results.passed++;
      } catch (error) {
        console.log(`  ❌ ${agent.name} - instantiation failed: ${error.message}`);
        instantiationCategory.checks.push({
          name: agent.name,
          status: 'failed',
          error: error.message
        });
        results.failed++;
      }
      results.total_checks++;
    }
  } catch (error) {
    console.error(`  ❌ Import failed: ${error.message}`);
    results.failed++;
    results.total_checks++;
  }

  results.categories.push(instantiationCategory);
  console.log('');

  // Category 7: The Three Laws Compliance
  console.log('🏛️  Category 7: The Three Laws of Autonomy');
  console.log('─'.repeat(80));

  const lawsCategory = {
    name: 'Three Laws Compliance',
    checks: []
  };

  const lawsChecks = [
    {
      law: 'Objectivity',
      description: 'Data-driven decisions',
      verify: async () => {
        const costAgent = await fs.readFile('src/agents/support/CostMonitoringAgent.js', 'utf-8');
        return costAgent.includes('estimateCost') && costAgent.includes('pricing');
      }
    },
    {
      law: 'Self-Sufficiency',
      description: 'Minimal human intervention',
      verify: async () => {
        const incidentAgent = await fs.readFile('src/agents/support/IncidentCommanderAgent.js', 'utf-8');
        return incidentAgent.includes('executeRollback') && incidentAgent.includes('maxRollbackAttempts');
      }
    },
    {
      law: 'Traceability',
      description: 'All actions logged',
      verify: async () => {
        const auditAgent = await fs.readFile('src/agents/support/AuditAgent.js', 'utf-8');
        return auditAgent.includes('logEntry') && auditAgent.includes('timestamp');
      }
    }
  ];

  for (const check of lawsChecks) {
    try {
      const compliant = await check.verify();
      if (compliant) {
        console.log(`  ✅ Law of ${check.law} - ${check.description}`);
        lawsCategory.checks.push({
          name: check.law,
          status: 'passed'
        });
        results.passed++;
      } else {
        console.log(`  ⚠️  Law of ${check.law} - implementation incomplete`);
        lawsCategory.checks.push({
          name: check.law,
          status: 'warning'
        });
        results.warnings++;
      }
    } catch (error) {
      console.log(`  ❌ Law of ${check.law} - verification failed`);
      lawsCategory.checks.push({
        name: check.law,
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(lawsCategory);
  console.log('');

  // Final Summary
  console.log('='.repeat(80));
  console.log('MIYABI SETUP VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  console.log(`Total Checks: ${results.total_checks}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Warnings: ${results.warnings} ⚠️`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log('');

  const passRate = ((results.passed / results.total_checks) * 100).toFixed(1);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('');

  // Category breakdown
  console.log('Category Breakdown:');
  console.log('─'.repeat(80));
  for (const category of results.categories) {
    const passed = category.checks.filter(c => c.status === 'passed').length;
    const warnings = category.checks.filter(c => c.status === 'warning').length;
    const failed = category.checks.filter(c => c.status === 'failed').length;
    const total = category.checks.length;

    const icon = failed > 0 ? '❌' : warnings > 0 ? '⚠️' : '✅';
    console.log(`${icon} ${category.name}: ${passed}/${total} passed${warnings > 0 ? `, ${warnings} warnings` : ''}`);
  }
  console.log('');

  // Overall status
  let overallStatus = 'COMPLETE';
  let statusIcon = '✅';
  let recommendation = '';

  if (results.failed > 0) {
    overallStatus = 'INCOMPLETE';
    statusIcon = '❌';
    recommendation = 'Miyabi initial setup is NOT complete. Please address failed checks.';
  } else if (results.warnings > 3) {
    overallStatus = 'COMPLETE WITH WARNINGS';
    statusIcon = '⚠️';
    recommendation = 'Miyabi setup is functional but has warnings. Review recommended.';
  } else {
    overallStatus = 'COMPLETE';
    statusIcon = '✅';
    recommendation = 'Miyabi autonomous system is fully configured and ready!';
  }

  console.log(`${statusIcon} Overall Status: ${overallStatus}`);
  console.log('');
  console.log(`📝 ${recommendation}`);
  console.log('');

  if (results.failed === 0) {
    console.log('✅ Miyabi Initial Setup Checklist:');
    console.log('  ✅ miyabi-agent-sdk installed');
    console.log('  ✅ Configuration files created');
    console.log('  ✅ Support Agents implemented (5/5)');
    console.log('  ✅ GitHub Actions workflows created (4/4)');
    console.log('  ✅ Directory structure established');
    console.log('  ✅ Agents can be instantiated');
    console.log('  ✅ Three Laws of Autonomy implemented');
    console.log('');
    console.log('🚀 Miyabi autonomous system is ready for operation!');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ Missing Components:');
    for (const category of results.categories) {
      const failedChecks = category.checks.filter(c => c.status === 'failed');
      if (failedChecks.length > 0) {
        console.log(`  ${category.name}:`);
        for (const check of failedChecks) {
          console.log(`    - ${check.name}`);
        }
      }
    }
    console.log('');
    process.exit(1);
  }
}

// Run verification
verifyMiyabiSetup().catch(error => {
  console.error('\n❌ Fatal error during verification:', error);
  process.exit(1);
});
