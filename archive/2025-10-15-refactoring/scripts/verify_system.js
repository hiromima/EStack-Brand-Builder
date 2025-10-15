#!/usr/bin/env node

/**
 * @file verify_system.js
 * @description Complete system verification - packages, configs, agents, and workflows
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify System
 */
async function verifySystem() {
  console.log('\n' + '='.repeat(80));
  console.log('BRAND BUILDER SYSTEM VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const results = {
    timestamp: new Date().toISOString(),
    categories: [],
    total_checks: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // Category 1: Package Dependencies
  console.log('📦 Category 1: Package Dependencies');
  console.log('─'.repeat(80));

  const packageCategory = {
    name: 'Package Dependencies',
    checks: []
  };

  const requiredPackages = [
    { name: '@anthropic-ai/sdk', version: '^0.65.0', description: 'Claude API SDK' },
    { name: '@google/generative-ai', version: '^0.24.1', description: 'Gemini API SDK' },
    { name: '@pinecone-database/pinecone', version: '^6.1.2', description: 'Pinecone Vector DB (future use)' },
    { name: 'chromadb', version: '^3.0.17', description: 'ChromaDB Vector Store' },
    { name: 'dotenv', version: '^17.2.3', description: 'Environment variables' },
    { name: 'glob', version: '^11.0.3', description: 'File pattern matching' },
    { name: 'js-yaml', version: '^4.1.0', description: 'YAML parser' },
    { name: 'miyabi-agent-sdk', version: '^0.1.0-alpha.1', description: 'Miyabi SDK' },
    { name: 'neo4j-driver', version: '^6.0.0', description: 'Neo4j Graph DB' },
    { name: 'openai', version: '^6.3.0', description: 'OpenAI API SDK' }
  ];

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    for (const pkg of requiredPackages) {
      const installed = packageJson.dependencies[pkg.name];
      const status = installed === pkg.version ? 'passed' : installed ? 'warning' : 'failed';

      packageCategory.checks.push({
        name: pkg.name,
        description: pkg.description,
        expected: pkg.version,
        actual: installed || 'NOT INSTALLED',
        status
      });

      if (status === 'passed') {
        console.log(`  ✅ ${pkg.name} - ${pkg.description}`);
        results.passed++;
      } else if (status === 'warning') {
        console.log(`  ⚠️  ${pkg.name} - version mismatch (expected: ${pkg.version}, got: ${installed})`);
        results.warnings++;
      } else {
        console.log(`  ❌ ${pkg.name} - NOT INSTALLED`);
        results.failed++;
      }
      results.total_checks++;
    }
  } catch (error) {
    console.error(`  ❌ Failed to read package.json: ${error.message}`);
    results.failed++;
    results.total_checks++;
  }

  results.categories.push(packageCategory);
  console.log('');

  // Category 2: Configuration Files
  console.log('⚙️  Category 2: Configuration Files');
  console.log('─'.repeat(80));

  const configCategory = {
    name: 'Configuration Files',
    checks: []
  };

  const requiredConfigs = [
    { path: '.miyabi/BUDGET.yml', description: 'Economic constraints configuration' },
    { path: '.miyabi/config.yml', description: 'Master system configuration' },
    { path: '.env.example', description: 'Environment variables template', optional: true },
    { path: 'package.json', description: 'Node.js package manifest' },
    { path: 'docs/AGENTS.md', description: 'Agent architecture documentation' },
    { path: 'docs/IMPLEMENTATION_PLAN.md', description: 'Implementation plan' }
  ];

  for (const config of requiredConfigs) {
    try {
      const fullPath = path.join(process.cwd(), config.path);
      await fs.access(fullPath);

      const stats = await fs.stat(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      configCategory.checks.push({
        name: config.path,
        description: config.description,
        status: 'passed',
        size: `${sizeKB} KB`
      });

      console.log(`  ✅ ${config.path} (${sizeKB} KB)`);
      results.passed++;
    } catch (error) {
      if (config.optional) {
        console.log(`  ⚠️  ${config.path} - optional, not found`);
        configCategory.checks.push({
          name: config.path,
          description: config.description,
          status: 'warning'
        });
        results.warnings++;
      } else {
        console.log(`  ❌ ${config.path} - NOT FOUND`);
        configCategory.checks.push({
          name: config.path,
          description: config.description,
          status: 'failed'
        });
        results.failed++;
      }
    }
    results.total_checks++;
  }

  results.categories.push(configCategory);
  console.log('');

  // Category 3: Support Agents
  console.log('🤖 Category 3: Support Agents');
  console.log('─'.repeat(80));

  const agentsCategory = {
    name: 'Support Agents',
    checks: []
  };

  const requiredAgents = [
    { name: 'CostMonitoringAgent', path: 'src/agents/support/CostMonitoringAgent.js' },
    { name: 'IncidentCommanderAgent', path: 'src/agents/support/IncidentCommanderAgent.js' },
    { name: 'SystemRegistryAgent', path: 'src/agents/support/SystemRegistryAgent.js' },
    { name: 'AuditAgent', path: 'src/agents/support/AuditAgent.js' },
    { name: 'CoordinatorAgent', path: 'src/agents/support/CoordinatorAgent.js' }
  ];

  for (const agent of requiredAgents) {
    try {
      const fullPath = path.join(process.cwd(), agent.path);
      const content = await fs.readFile(fullPath, 'utf-8');

      // Check for required methods
      const hasInitialize = content.includes('async initialize()');
      const hasClass = content.includes(`export class ${agent.name}`);
      const hasJSDoc = content.includes('@file');

      const lines = content.split('\n').length;

      let status = 'passed';
      let issues = [];

      if (!hasClass) {
        status = 'failed';
        issues.push('missing class export');
      }
      if (!hasInitialize) {
        status = 'warning';
        issues.push('missing initialize()');
      }
      if (!hasJSDoc) {
        status = 'warning';
        issues.push('missing JSDoc');
      }

      agentsCategory.checks.push({
        name: agent.name,
        path: agent.path,
        lines,
        status,
        issues
      });

      if (status === 'passed') {
        console.log(`  ✅ ${agent.name} (${lines} lines)`);
        results.passed++;
      } else if (status === 'warning') {
        console.log(`  ⚠️  ${agent.name} (${lines} lines) - ${issues.join(', ')}`);
        results.warnings++;
      } else {
        console.log(`  ❌ ${agent.name} - ${issues.join(', ')}`);
        results.failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${agent.name} - NOT FOUND`);
      agentsCategory.checks.push({
        name: agent.name,
        path: agent.path,
        status: 'failed',
        error: error.message
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(agentsCategory);
  console.log('');

  // Category 4: GitHub Actions Workflows
  console.log('🔄 Category 4: GitHub Actions Workflows');
  console.log('─'.repeat(80));

  const workflowsCategory = {
    name: 'GitHub Actions Workflows',
    checks: []
  };

  const requiredWorkflows = [
    { name: 'economic-circuit-breaker.yml', description: 'Cost monitoring workflow' },
    { name: 'agent-onboarding.yml', description: 'Agent registration workflow' },
    { name: 'incident-response.yml', description: 'Incident handling workflow' },
    { name: 'quality-gate.yml', description: 'Quality control workflow' }
  ];

  for (const workflow of requiredWorkflows) {
    try {
      const fullPath = path.join(process.cwd(), '.github/workflows', workflow.name);
      const content = await fs.readFile(fullPath, 'utf-8');

      const lines = content.split('\n').length;
      const hasName = content.includes('name:');
      const hasOn = content.includes('on:');
      const hasJobs = content.includes('jobs:');

      const status = (hasName && hasOn && hasJobs) ? 'passed' : 'warning';

      workflowsCategory.checks.push({
        name: workflow.name,
        description: workflow.description,
        lines,
        status
      });

      if (status === 'passed') {
        console.log(`  ✅ ${workflow.name} - ${workflow.description} (${lines} lines)`);
        results.passed++;
      } else {
        console.log(`  ⚠️  ${workflow.name} - incomplete workflow structure`);
        results.warnings++;
      }
    } catch (error) {
      console.log(`  ❌ ${workflow.name} - NOT FOUND`);
      workflowsCategory.checks.push({
        name: workflow.name,
        description: workflow.description,
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(workflowsCategory);
  console.log('');

  // Category 5: Core Agents (optional check)
  console.log('🎨 Category 5: Core Agents');
  console.log('─'.repeat(80));

  const coreAgentsCategory = {
    name: 'Core Agents',
    checks: []
  };

  const coreAgents = [
    { name: 'StructureAgent', path: 'src/agents/core/StructureAgent.js' },
    { name: 'ExpressionAgent', path: 'src/agents/core/ExpressionAgent.js' },
    { name: 'EvaluationAgent', path: 'src/agents/core/EvaluationAgent.js' },
    { name: 'CopyAgent', path: 'src/agents/core/CopyAgent.js' },
    { name: 'LogoAgent', path: 'src/agents/core/LogoAgent.js' },
    { name: 'VisualAgent', path: 'src/agents/core/VisualAgent.js' }
  ];

  for (const agent of coreAgents) {
    try {
      const fullPath = path.join(process.cwd(), agent.path);
      await fs.access(fullPath);

      const stats = await fs.stat(fullPath);
      const lines = (await fs.readFile(fullPath, 'utf-8')).split('\n').length;

      coreAgentsCategory.checks.push({
        name: agent.name,
        path: agent.path,
        lines,
        status: 'info'
      });

      console.log(`  ℹ️  ${agent.name} (${lines} lines) - requires Miyabi compliance`);
    } catch (error) {
      console.log(`  ⚠️  ${agent.name} - not found (will be created in Phase 3)`);
      coreAgentsCategory.checks.push({
        name: agent.name,
        path: agent.path,
        status: 'pending'
      });
    }
  }

  results.categories.push(coreAgentsCategory);
  console.log('');

  // Category 6: Scripts
  console.log('📜 Category 6: Scripts');
  console.log('─'.repeat(80));

  const scriptsCategory = {
    name: 'Scripts',
    checks: []
  };

  const requiredScripts = [
    { name: 'test_miyabi_system.js', description: 'Miyabi system integration test' },
    { name: 'demo_phase0.js', description: 'Phase 0 demonstration' },
    { name: 'test_evaluation_system.js', description: 'Evaluation system test' }
  ];

  for (const script of requiredScripts) {
    try {
      const fullPath = path.join(process.cwd(), 'scripts', script.name);
      await fs.access(fullPath);

      const lines = (await fs.readFile(fullPath, 'utf-8')).split('\n').length;

      scriptsCategory.checks.push({
        name: script.name,
        description: script.description,
        lines,
        status: 'passed'
      });

      console.log(`  ✅ ${script.name} - ${script.description} (${lines} lines)`);
      results.passed++;
    } catch (error) {
      console.log(`  ❌ ${script.name} - NOT FOUND`);
      scriptsCategory.checks.push({
        name: script.name,
        description: script.description,
        status: 'failed'
      });
      results.failed++;
    }
    results.total_checks++;
  }

  results.categories.push(scriptsCategory);
  console.log('');

  // Category 7: Environment Variables
  console.log('🔐 Category 7: Environment Variables');
  console.log('─'.repeat(80));

  const envCategory = {
    name: 'Environment Variables',
    checks: []
  };

  const requiredEnvVars = [
    { name: 'ANTHROPIC_API_KEY', description: 'Claude API access', optional: false },
    { name: 'OPENAI_API_KEY', description: 'OpenAI API access', optional: false },
    { name: 'GOOGLE_API_KEY', description: 'Gemini API access', optional: false },
    { name: 'NEO4J_URI', description: 'Neo4j database connection', optional: true },
    { name: 'NEO4J_USER', description: 'Neo4j username', optional: true },
    { name: 'NEO4J_PASSWORD', description: 'Neo4j password', optional: true }
  ];

  try {
    // Try to load .env file
    const envPath = path.join(process.cwd(), '.env');
    try {
      await fs.access(envPath);
      console.log(`  ℹ️  .env file found`);
    } catch {
      console.log(`  ⚠️  .env file not found (using system environment variables)`);
    }

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar.name];
      const isSet = value && value.length > 0;

      if (isSet) {
        const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
        envCategory.checks.push({
          name: envVar.name,
          description: envVar.description,
          status: 'passed',
          value: masked
        });
        console.log(`  ✅ ${envVar.name} - ${envVar.description} (${masked})`);
        results.passed++;
      } else {
        if (envVar.optional) {
          envCategory.checks.push({
            name: envVar.name,
            description: envVar.description,
            status: 'warning'
          });
          console.log(`  ⚠️  ${envVar.name} - ${envVar.description} (optional, not set)`);
          results.warnings++;
        } else {
          envCategory.checks.push({
            name: envVar.name,
            description: envVar.description,
            status: 'failed'
          });
          console.log(`  ❌ ${envVar.name} - ${envVar.description} (NOT SET)`);
          results.failed++;
        }
      }
      results.total_checks++;
    }
  } catch (error) {
    console.error(`  ❌ Environment check failed: ${error.message}`);
  }

  results.categories.push(envCategory);
  console.log('');

  // Final Summary
  console.log('='.repeat(80));
  console.log('VERIFICATION SUMMARY');
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

  // Status determination
  let overallStatus = 'PASS';
  let statusIcon = '✅';
  let recommendation = '';

  if (results.failed > 0) {
    overallStatus = 'FAIL';
    statusIcon = '❌';
    recommendation = 'Critical issues found. Please resolve failed checks before deployment.';
  } else if (results.warnings > 5) {
    overallStatus = 'PASS WITH WARNINGS';
    statusIcon = '⚠️';
    recommendation = 'System is functional but has warnings. Review recommended.';
  } else if (results.warnings > 0) {
    overallStatus = 'PASS';
    statusIcon = '✅';
    recommendation = 'System is operational. Minor warnings can be addressed later.';
  } else {
    overallStatus = 'PERFECT';
    statusIcon = '🎉';
    recommendation = 'All checks passed! System is production-ready.';
  }

  console.log(`${statusIcon} Overall Status: ${overallStatus}`);
  console.log('');
  console.log(`📝 Recommendation: ${recommendation}`);
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
    console.log(`${icon} ${category.name}: ${passed}/${total} passed`);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('');

  // Exit with appropriate code
  if (results.failed > 0) {
    console.log('❌ Verification FAILED. Please address the issues above.');
    process.exit(1);
  } else {
    console.log('✅ Verification PASSED. System is ready for operation.');
    process.exit(0);
  }
}

// Run verification
verifySystem().catch(error => {
  console.error('\n❌ Fatal error during verification:', error);
  process.exit(1);
});
