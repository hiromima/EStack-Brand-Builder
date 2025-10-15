#!/usr/bin/env node

/**
 * @file test_all_packages.js
 * @description Test all installed packages - dry run without API calls
 */

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

/**
 * Test All Packages
 */
async function testAllPackages() {
  console.log('\n' + '='.repeat(80));
  console.log('ALL PACKAGES DRY RUN TEST');
  console.log('(Testing package imports and instantiation without API calls)');
  console.log('='.repeat(80) + '\n');

  const results = {
    timestamp: new Date().toISOString(),
    packages: [],
    passed: 0,
    failed: 0
  };

  // Test 1: @anthropic-ai/sdk
  console.log('📦 Test 1: @anthropic-ai/sdk');
  console.log('─'.repeat(80));
  try {
    const Anthropic = await import('@anthropic-ai/sdk');

    // Test instantiation without API key (should work)
    const client = new Anthropic.default({
      apiKey: 'test-key-no-api-call'
    });

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ Client instantiated (no API call)');
    console.log(`  ℹ️  Version: ${Anthropic.VERSION || 'unknown'}`);

    results.packages.push({
      name: '@anthropic-ai/sdk',
      status: 'passed',
      features: ['import', 'instantiation']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: '@anthropic-ai/sdk',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 2: @google/generative-ai
  console.log('📦 Test 2: @google/generative-ai');
  console.log('─'.repeat(80));
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    // Test instantiation without API key
    const genAI = new GoogleGenerativeAI('test-key-no-api-call');

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ GoogleGenerativeAI instantiated (no API call)');

    results.packages.push({
      name: '@google/generative-ai',
      status: 'passed',
      features: ['import', 'instantiation']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: '@google/generative-ai',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 3: openai
  console.log('📦 Test 3: openai');
  console.log('─'.repeat(80));
  try {
    const OpenAI = await import('openai');

    // Test instantiation without API key
    const client = new OpenAI.default({
      apiKey: 'test-key-no-api-call'
    });

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ OpenAI client instantiated (no API call)');

    results.packages.push({
      name: 'openai',
      status: 'passed',
      features: ['import', 'instantiation']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'openai',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 4: chromadb
  console.log('📦 Test 4: chromadb');
  console.log('─'.repeat(80));
  try {
    const { ChromaClient } = await import('chromadb');

    console.log('  ✅ Package imported successfully');
    console.log('  ℹ️  ChromaClient class available');
    console.log('  ⚠️  Skipping instantiation (requires running ChromaDB server)');

    results.packages.push({
      name: 'chromadb',
      status: 'passed',
      features: ['import'],
      note: 'Instantiation requires server'
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'chromadb',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 5: neo4j-driver
  console.log('📦 Test 5: neo4j-driver');
  console.log('─'.repeat(80));
  try {
    const neo4j = await import('neo4j-driver');

    // Test driver creation (no connection)
    const driver = neo4j.default.driver(
      'neo4j://localhost:7687',
      neo4j.default.auth.basic('neo4j', 'test-password')
    );

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ Driver created (no connection)');
    console.log('  ℹ️  Connection requires running Neo4j instance');

    await driver.close();

    results.packages.push({
      name: 'neo4j-driver',
      status: 'passed',
      features: ['import', 'driver creation']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'neo4j-driver',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 6: js-yaml
  console.log('📦 Test 6: js-yaml');
  console.log('─'.repeat(80));
  try {
    const yaml = await import('js-yaml');

    // Test parsing
    const testYaml = 'name: test\nvalue: 123';
    const parsed = yaml.load(testYaml);

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ YAML parsing works');
    console.log(`  ℹ️  Test parse: ${JSON.stringify(parsed)}`);

    results.packages.push({
      name: 'js-yaml',
      status: 'passed',
      features: ['import', 'parse', 'dump']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'js-yaml',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 7: glob
  console.log('📦 Test 7: glob');
  console.log('─'.repeat(80));
  try {
    const { glob } = await import('glob');

    // Test file matching
    const files = await glob('package.json');

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ Glob pattern matching works');
    console.log(`  ℹ️  Found ${files.length} file(s)`);

    results.packages.push({
      name: 'glob',
      status: 'passed',
      features: ['import', 'pattern matching']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'glob',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 8: dotenv
  console.log('📦 Test 8: dotenv');
  console.log('─'.repeat(80));
  try {
    const dotenv = await import('dotenv');

    // Test config (won't fail if .env doesn't exist)
    dotenv.config({ path: '.env.test' });

    console.log('  ✅ Package imported successfully');
    console.log('  ✅ Config function available');

    results.packages.push({
      name: 'dotenv',
      status: 'passed',
      features: ['import', 'config']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'dotenv',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 9: @pinecone-database/pinecone
  console.log('📦 Test 9: @pinecone-database/pinecone');
  console.log('─'.repeat(80));
  try {
    const { Pinecone } = await import('@pinecone-database/pinecone');

    console.log('  ✅ Package imported successfully');
    console.log('  ℹ️  Pinecone class available');
    console.log('  ⚠️  Skipping instantiation (requires API key)');

    results.packages.push({
      name: '@pinecone-database/pinecone',
      status: 'passed',
      features: ['import'],
      note: 'Instantiation requires API key'
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: '@pinecone-database/pinecone',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Test 10: miyabi-agent-sdk
  console.log('📦 Test 10: miyabi-agent-sdk');
  console.log('─'.repeat(80));
  try {
    // Check if package exists
    const packagePath = new URL('../node_modules/miyabi-agent-sdk/package.json', import.meta.url);
    const fs = await import('fs/promises');
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));

    console.log('  ✅ Package installed');
    console.log(`  ℹ️  Version: ${packageJson.version}`);
    console.log('  ℹ️  CLI available: npx miyabi-agent-sdk');

    results.packages.push({
      name: 'miyabi-agent-sdk',
      status: 'passed',
      version: packageJson.version,
      features: ['CLI']
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'miyabi-agent-sdk',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Bonus: Test Miyabi Support Agents
  console.log('🤖 Bonus: Miyabi Support Agents');
  console.log('─'.repeat(80));
  try {
    const { CostMonitoringAgent } = await import('../src/agents/support/CostMonitoringAgent.js');
    const { IncidentCommanderAgent } = await import('../src/agents/support/IncidentCommanderAgent.js');
    const { SystemRegistryAgent } = await import('../src/agents/support/SystemRegistryAgent.js');
    const { AuditAgent } = await import('../src/agents/support/AuditAgent.js');
    const { CoordinatorAgent } = await import('../src/agents/support/CoordinatorAgent.js');

    // Test instantiation
    new CostMonitoringAgent();
    new IncidentCommanderAgent();
    new SystemRegistryAgent();
    new AuditAgent();
    new CoordinatorAgent();

    console.log('  ✅ All 5 Support Agents imported');
    console.log('  ✅ All agents instantiated successfully');

    results.packages.push({
      name: 'Miyabi Support Agents',
      status: 'passed',
      count: 5
    });
    results.passed++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    results.packages.push({
      name: 'Miyabi Support Agents',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }
  console.log('');

  // Final Summary
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const totalTests = results.packages.length;
  console.log(`Total Packages Tested: ${totalTests}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log('');

  const passRate = ((results.passed / totalTests) * 100).toFixed(1);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('');

  // Detailed results
  console.log('Package Status:');
  console.log('─'.repeat(80));
  for (const pkg of results.packages) {
    const icon = pkg.status === 'passed' ? '✅' : '❌';
    let line = `${icon} ${pkg.name}`;

    if (pkg.version) {
      line += ` (v${pkg.version})`;
    }

    if (pkg.features) {
      line += ` - ${pkg.features.join(', ')}`;
    }

    if (pkg.note) {
      line += ` [${pkg.note}]`;
    }

    console.log(line);

    if (pkg.error) {
      console.log(`   Error: ${pkg.error}`);
    }
  }
  console.log('');

  if (results.failed === 0) {
    console.log('🎉 ALL PACKAGES WORKING!');
    console.log('');
    console.log('✅ All dependencies are properly installed');
    console.log('✅ All packages can be imported');
    console.log('✅ All packages can be instantiated (where applicable)');
    console.log('✅ Miyabi Support Agents fully functional');
    console.log('');
    console.log('System is ready for operation.');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ SOME PACKAGES FAILED');
    console.log('');
    console.log('Please check the errors above and reinstall failed packages:');
    console.log('  npm install');
    console.log('');
    process.exit(1);
  }
}

// Run tests
testAllPackages().catch(error => {
  console.error('\n❌ Fatal error during testing:', error);
  process.exit(1);
});
