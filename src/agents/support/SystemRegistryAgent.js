/**
 * @file SystemRegistryAgent.js
 * @description Agent onboarding, compliance testing, and registration system
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SystemRegistryAgent
 *
 * Responsibilities:
 * 1. Detect new agents in the system
 * 2. Run compliance tests (constitution, interfaces)
 * 3. Register approved agents
 * 4. Maintain agent registry
 * 5. Generate onboarding reports
 */
export class SystemRegistryAgent {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || path.join(process.cwd(), '.miyabi/config.yml'),
      registryPath: options.registryPath || path.join(process.cwd(), '.miyabi/agent_registry.json'),
      agentsDir: options.agentsDir || path.join(process.cwd(), 'src/agents'),
      ...options
    };

    this.registry = {
      version: '1.0',
      agents: [],
      last_scan: null
    };
  }

  /**
   * Initialize agent
   */
  async initialize() {
    const registryDir = path.dirname(this.options.registryPath);
    await fs.mkdir(registryDir, { recursive: true });

    await this.loadRegistry();

    console.log('✅ SystemRegistryAgent initialized');
  }

  /**
   * Load agent registry
   */
  async loadRegistry() {
    try {
      const content = await fs.readFile(this.options.registryPath, 'utf-8');
      this.registry = JSON.parse(content);
      console.log(`📋 Agent registry loaded: ${this.registry.agents.length} agents`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.registry = {
          version: '1.0',
          agents: [],
          last_scan: null
        };
        console.log('📋 Agent registry initialized (new)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Save agent registry
   */
  async saveRegistry() {
    await fs.writeFile(
      this.options.registryPath,
      JSON.stringify(this.registry, null, 2),
      'utf-8'
    );
  }

  /**
   * Scan for new agents
   * @returns {Array} Newly discovered agents
   */
  async scanForNewAgents() {
    console.log('🔍 Scanning for new agents...');

    // Find all agent files
    const agentFiles = await glob('**/*Agent.js', {
      cwd: this.options.agentsDir,
      absolute: true
    });

    const newAgents = [];
    const registeredPaths = new Set(this.registry.agents.map(a => a.file_path));

    for (const filePath of agentFiles) {
      if (!registeredPaths.has(filePath)) {
        const agentInfo = await this.extractAgentInfo(filePath);
        if (agentInfo) {
          newAgents.push({
            ...agentInfo,
            file_path: filePath,
            discovered_at: new Date().toISOString(),
            status: 'pending_compliance'
          });
        }
      }
    }

    this.registry.last_scan = new Date().toISOString();

    console.log(`📦 Found ${newAgents.length} new agent(s)`);
    return newAgents;
  }

  /**
   * Extract agent information from file
   * @param {string} filePath - Path to agent file
   * @returns {Object|null} Agent information
   */
  async extractAgentInfo(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath, '.js');

      // Extract JSDoc metadata
      const metadataMatch = content.match(/@file\s+(\S+)\s*\n\s*\*\s*@description\s+(.+?)\n/);
      const versionMatch = content.match(/@version\s+(.+?)\n/);

      // Extract class name
      const classMatch = content.match(/export\s+class\s+(\w+)/);

      if (!classMatch) {
        console.warn(`⚠️  No exported class found in ${fileName}`);
        return null;
      }

      const className = classMatch[1];

      return {
        name: className,
        file_name: fileName,
        description: metadataMatch ? metadataMatch[2].trim() : 'No description',
        version: versionMatch ? versionMatch[1].trim() : 'unknown',
        category: this.detectCategory(filePath)
      };
    } catch (error) {
      console.error(`❌ Failed to extract info from ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Detect agent category from file path
   */
  detectCategory(filePath) {
    const relativePath = path.relative(this.options.agentsDir, filePath);
    const parts = relativePath.split(path.sep);

    if (parts.length > 1) {
      return parts[0]; // e.g., 'support', 'core', 'quality'
    }

    return 'uncategorized';
  }

  /**
   * Run compliance tests on agent
   * @param {Object} agent - Agent information
   * @returns {Object} Test results
   */
  async runComplianceTests(agent) {
    console.log(`\n🧪 Running compliance tests for ${agent.name}...`);

    const results = {
      agent: agent.name,
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      overall_status: 'pending'
    };

    // Test 1: File structure
    const structureTest = await this.testFileStructure(agent);
    results.tests.push(structureTest);
    if (structureTest.passed) results.passed++;
    else results.failed++;

    // Test 2: Constructor compliance
    const constructorTest = await this.testConstructor(agent);
    results.tests.push(constructorTest);
    if (constructorTest.passed) results.passed++;
    else results.failed++;

    // Test 3: Interface implementation
    const interfaceTest = await this.testInterface(agent);
    results.tests.push(interfaceTest);
    if (interfaceTest.passed) results.passed++;
    else results.failed++;

    // Test 4: Documentation
    const docTest = await this.testDocumentation(agent);
    results.tests.push(docTest);
    if (docTest.passed) results.passed++;
    else results.failed++;

    // Test 5: Constitution adherence
    const constitutionTest = await this.testConstitution(agent);
    results.tests.push(constitutionTest);
    if (constitutionTest.passed) results.passed++;
    else results.failed++;

    // Determine overall status
    results.overall_status = results.failed === 0 ? 'passed' : 'failed';

    console.log(`\n${results.overall_status === 'passed' ? '✅' : '❌'} Compliance: ${results.passed}/${results.tests.length} tests passed`);

    return results;
  }

  /**
   * Test file structure
   */
  async testFileStructure(agent) {
    const test = {
      name: 'File Structure',
      description: 'Validates agent file structure and exports',
      passed: false,
      details: []
    };

    try {
      const content = await fs.readFile(agent.file_path, 'utf-8');

      // Check for ESM imports
      if (content.includes('import ') && content.includes('from ')) {
        test.details.push('✓ Uses ES6 modules');
      } else {
        test.details.push('✗ Missing ES6 module imports');
        return test;
      }

      // Check for class export
      if (content.match(/export\s+class\s+\w+/)) {
        test.details.push('✓ Exports agent class');
      } else {
        test.details.push('✗ Missing class export');
        return test;
      }

      // Check for default export
      if (content.match(/export\s+default\s+\w+/)) {
        test.details.push('✓ Has default export');
      } else {
        test.details.push('⚠ Missing default export (optional)');
      }

      test.passed = true;
    } catch (error) {
      test.details.push(`✗ File read error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test constructor compliance
   */
  async testConstructor(agent) {
    const test = {
      name: 'Constructor Compliance',
      description: 'Validates constructor accepts options parameter',
      passed: false,
      details: []
    };

    try {
      const content = await fs.readFile(agent.file_path, 'utf-8');

      // Check for constructor with options
      const constructorMatch = content.match(/constructor\s*\(\s*(\w+)\s*=\s*\{\}\s*\)/);

      if (constructorMatch) {
        const paramName = constructorMatch[1];
        test.details.push(`✓ Constructor accepts options (${paramName})`);

        // Check if options are stored
        if (content.includes('this.options')) {
          test.details.push('✓ Stores options in instance');
          test.passed = true;
        } else {
          test.details.push('✗ Options not stored in instance');
        }
      } else {
        test.details.push('✗ Constructor does not accept options parameter');
      }
    } catch (error) {
      test.details.push(`✗ File read error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test interface implementation
   */
  async testInterface(agent) {
    const test = {
      name: 'Interface Implementation',
      description: 'Validates required methods are implemented',
      passed: false,
      details: []
    };

    const requiredMethods = ['initialize'];
    const recommendedMethods = ['execute', 'run', 'process'];

    try {
      const content = await fs.readFile(agent.file_path, 'utf-8');

      let hasRequired = true;
      for (const method of requiredMethods) {
        const methodRegex = new RegExp(`async\\s+${method}\\s*\\(`);
        if (methodRegex.test(content)) {
          test.details.push(`✓ Implements ${method}()`);
        } else {
          test.details.push(`✗ Missing required method: ${method}()`);
          hasRequired = false;
        }
      }

      // Check for at least one recommended method
      const hasRecommended = recommendedMethods.some(method => {
        const methodRegex = new RegExp(`async\\s+${method}\\s*\\(`);
        return methodRegex.test(content);
      });

      if (hasRecommended) {
        test.details.push('✓ Implements execution method');
      } else {
        test.details.push(`⚠ Missing recommended methods: ${recommendedMethods.join(', ')}`);
      }

      test.passed = hasRequired;
    } catch (error) {
      test.details.push(`✗ File read error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test documentation
   */
  async testDocumentation(agent) {
    const test = {
      name: 'Documentation',
      description: 'Validates JSDoc and code documentation',
      passed: false,
      details: []
    };

    try {
      const content = await fs.readFile(agent.file_path, 'utf-8');

      // Check for file-level JSDoc
      if (content.match(/@file\s+\S+/)) {
        test.details.push('✓ Has @file tag');
      } else {
        test.details.push('✗ Missing @file tag');
      }

      if (content.match(/@description\s+.+/)) {
        test.details.push('✓ Has @description tag');
      } else {
        test.details.push('✗ Missing @description tag');
      }

      if (content.match(/@version\s+.+/)) {
        test.details.push('✓ Has @version tag');
      } else {
        test.details.push('⚠ Missing @version tag');
      }

      // Check for class documentation
      const classJSDoc = content.match(/\/\*\*[\s\S]*?\*\/\s*export\s+class/);
      if (classJSDoc) {
        test.details.push('✓ Class has JSDoc comment');
      } else {
        test.details.push('⚠ Class missing JSDoc comment');
      }

      // Check for responsibilities documentation
      if (content.includes('Responsibilities:')) {
        test.details.push('✓ Documents responsibilities');
        test.passed = true;
      } else {
        test.details.push('⚠ Missing responsibilities documentation');
      }

      // Pass if has basic documentation
      if (content.match(/@file/) && content.match(/@description/)) {
        test.passed = true;
      }
    } catch (error) {
      test.details.push(`✗ File read error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test constitution adherence
   */
  async testConstitution(agent) {
    const test = {
      name: 'Constitution Adherence',
      description: 'Validates adherence to The Three Laws of Autonomy',
      passed: false,
      details: []
    };

    try {
      const content = await fs.readFile(agent.file_path, 'utf-8');

      // Law of Objectivity: Check for data-driven decisions
      const hasLogging = content.includes('console.log') || content.includes('logger');
      const hasDataStructures = content.includes('this.') && (content.includes('{}') || content.includes('[]'));

      if (hasLogging && hasDataStructures) {
        test.details.push('✓ Law of Objectivity: Uses logging and data structures');
      } else {
        test.details.push('⚠ Law of Objectivity: May need better observability');
      }

      // Law of Self-Sufficiency: Check for error handling
      const hasErrorHandling = content.includes('try {') && content.includes('catch (');
      const hasAsyncAwait = content.includes('async ') && content.includes('await ');

      if (hasErrorHandling && hasAsyncAwait) {
        test.details.push('✓ Law of Self-Sufficiency: Has error handling and async patterns');
      } else {
        test.details.push('⚠ Law of Self-Sufficiency: May need better error handling');
      }

      // Law of Traceability: Check for state persistence
      const hasPersistence = content.includes('writeFile') || content.includes('save');
      const hasTimestamps = content.includes('timestamp') || content.includes('Date()');

      if (hasPersistence || hasTimestamps) {
        test.details.push('✓ Law of Traceability: Implements persistence or timestamps');
      } else {
        test.details.push('⚠ Law of Traceability: May need state tracking');
      }

      // Pass if agent shows basic autonomous patterns
      test.passed = hasErrorHandling && (hasLogging || hasPersistence);

    } catch (error) {
      test.details.push(`✗ File read error: ${error.message}`);
    }

    return test;
  }

  /**
   * Register agent
   * @param {Object} agent - Agent information
   * @param {Object} complianceResults - Compliance test results
   */
  async registerAgent(agent, complianceResults) {
    const registration = {
      ...agent,
      status: complianceResults.overall_status === 'passed' ? 'registered' : 'failed_compliance',
      compliance_results: complianceResults,
      registered_at: new Date().toISOString()
    };

    // Find and update existing or add new
    const existingIndex = this.registry.agents.findIndex(a => a.file_path === agent.file_path);

    if (existingIndex >= 0) {
      this.registry.agents[existingIndex] = registration;
      console.log(`🔄 Updated registration: ${agent.name}`);
    } else {
      this.registry.agents.push(registration);
      console.log(`✅ Registered: ${agent.name}`);
    }

    await this.saveRegistry();

    return registration;
  }

  /**
   * Onboard new agents
   * @returns {Object} Onboarding report
   */
  async onboardNewAgents() {
    console.log('\n' + '='.repeat(70));
    console.log('AGENT ONBOARDING PROCESS');
    console.log('='.repeat(70) + '\n');

    const report = {
      timestamp: new Date().toISOString(),
      new_agents: [],
      registered: 0,
      failed: 0,
      details: []
    };

    // Scan for new agents
    const newAgents = await this.scanForNewAgents();

    if (newAgents.length === 0) {
      console.log('✅ No new agents to onboard');
      return report;
    }

    report.new_agents = newAgents;

    // Process each new agent
    for (const agent of newAgents) {
      console.log(`\nProcessing: ${agent.name}`);
      console.log(`Category: ${agent.category}`);
      console.log(`File: ${agent.file_name}`);

      // Run compliance tests
      const complianceResults = await this.runComplianceTests(agent);

      // Register agent
      const registration = await this.registerAgent(agent, complianceResults);

      if (registration.status === 'registered') {
        report.registered++;
        report.details.push({
          agent: agent.name,
          status: 'success',
          message: 'Agent registered successfully'
        });
      } else {
        report.failed++;
        report.details.push({
          agent: agent.name,
          status: 'failed',
          message: 'Failed compliance tests',
          failed_tests: complianceResults.tests.filter(t => !t.passed).map(t => t.name)
        });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`ONBOARDING COMPLETE: ${report.registered} registered, ${report.failed} failed`);
    console.log('='.repeat(70) + '\n');

    return report;
  }

  /**
   * Generate onboarding report
   */
  generateOnboardingReport(report) {
    let output = '\n' + '='.repeat(70) + '\n';
    output += 'AGENT ONBOARDING REPORT\n';
    output += '='.repeat(70) + '\n\n';

    output += `Timestamp: ${report.timestamp}\n`;
    output += `Total new agents: ${report.new_agents.length}\n`;
    output += `Successfully registered: ${report.registered}\n`;
    output += `Failed compliance: ${report.failed}\n\n`;

    if (report.details.length > 0) {
      output += 'Details:\n';
      output += '-'.repeat(70) + '\n';

      for (const detail of report.details) {
        const icon = detail.status === 'success' ? '✅' : '❌';
        output += `${icon} ${detail.agent}: ${detail.message}\n`;

        if (detail.failed_tests) {
          output += `   Failed tests: ${detail.failed_tests.join(', ')}\n`;
        }
      }
    }

    output += '\n' + '='.repeat(70) + '\n';

    return output;
  }

  /**
   * Get registry statistics
   */
  getStatistics() {
    const stats = {
      total: this.registry.agents.length,
      by_category: {},
      by_status: {},
      last_scan: this.registry.last_scan
    };

    for (const agent of this.registry.agents) {
      // By category
      stats.by_category[agent.category] = (stats.by_category[agent.category] || 0) + 1;

      // By status
      stats.by_status[agent.status] = (stats.by_status[agent.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get agent by name
   */
  getAgent(name) {
    return this.registry.agents.find(agent => agent.name === name);
  }

  /**
   * List all agents
   */
  listAgents(filter = {}) {
    let agents = this.registry.agents;

    if (filter.category) {
      agents = agents.filter(a => a.category === filter.category);
    }

    if (filter.status) {
      agents = agents.filter(a => a.status === filter.status);
    }

    return agents;
  }
}

/**
 * Default export
 */
export default SystemRegistryAgent;
