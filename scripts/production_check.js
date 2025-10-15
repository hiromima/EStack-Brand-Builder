/**
 * @file production_check.js
 * @description Production readiness check for EStack-Brand-Builder
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

/**
 * Production Readiness Checker
 */
class ProductionChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Run all production checks
   */
  async runAll() {
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCTION READINESS CHECK - ESTACK-BRAND-BUILDER');
    console.log('='.repeat(70) + '\n');

    this.checkEnvironmentFile();
    this.checkDockerFiles();
    this.checkAgentFiles();
    this.checkTestCoverage();
    this.checkDependencies();
    this.checkSecurityConfig();
    this.checkLoggingSetup();

    this.printSummary();
    return this.errors.length === 0 ? 0 : 1;
  }

  /**
   * Check 1: Environment configuration
   */
  checkEnvironmentFile() {
    console.log('Check 1: Environment Configuration');

    if (fs.existsSync('.env.example')) {
      this.recordPass('Environment', '.env.example exists');
    } else {
      this.recordError('Environment', '.env.example not found');
      return;
    }

    if (fs.existsSync('.env')) {
      this.recordWarning('Environment', '.env file detected (should not be in git)');
    }

    this.recordPass('Environment', 'Configuration files ready');
  }

  /**
   * Check 2: Docker configuration
   */
  checkDockerFiles() {
    console.log('Check 2: Docker Configuration');

    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'ecosystem.config.js'];
    let allPresent = true;

    for (const file of dockerFiles) {
      if (fs.existsSync(file)) {
        this.recordPass('Docker', `${file} exists`);
      } else {
        this.recordError('Docker', `${file} not found`);
        allPresent = false;
      }
    }

    if (allPresent) {
      this.recordPass('Docker', 'All deployment files present');
    }
  }

  /**
   * Check 3: Agent files
   */
  checkAgentFiles() {
    console.log('Check 3: Agent Implementation');

    const agentDirs = ['src/agents/core', 'src/agents/support', 'src/agents/quality'];
    let totalAgents = 0;

    for (const dir of agentDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
        totalAgents += files.length;
      }
    }

    if (totalAgents >= 10) {
      this.recordPass('Agents', `${totalAgents} agents implemented`);
    } else {
      this.recordWarning('Agents', `Only ${totalAgents} agents found (expected 10+)`);
    }
  }

  /**
   * Check 4: Test coverage
   */
  checkTestCoverage() {
    console.log('Check 4: Test Coverage');

    if (!fs.existsSync('scripts')) {
      this.recordError('Tests', 'scripts directory not found');
      return;
    }

    const testFiles = fs.readdirSync('scripts')
      .filter(f => f.includes('test') && f.endsWith('.js'));

    if (testFiles.length >= 5) {
      this.recordPass('Tests', `${testFiles.length} test files found`);
    } else {
      this.recordWarning('Tests', `Only ${testFiles.length} test files (recommend 5+)`);
    }

    if (testFiles.some(f => f.includes('e2e'))) {
      this.recordPass('Tests', 'E2E tests present');
    } else {
      this.recordError('Tests', 'E2E tests missing');
    }
  }

  /**
   * Check 5: Dependencies
   */
  checkDependencies() {
    console.log('Check 5: Dependencies');

    if (!fs.existsSync('package.json')) {
      this.recordError('Dependencies', 'package.json not found');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (pkg.dependencies) {
      this.recordPass('Dependencies', `${Object.keys(pkg.dependencies).length} production dependencies`);
    }

    if (pkg.devDependencies) {
      this.recordPass('Dependencies', `${Object.keys(pkg.devDependencies).length} dev dependencies`);
    }

    if (pkg.engines && pkg.engines.node) {
      this.recordPass('Dependencies', `Node version specified: ${pkg.engines.node}`);
    } else {
      this.recordWarning('Dependencies', 'Node version not specified in package.json');
    }
  }

  /**
   * Check 6: Security configuration
   */
  checkSecurityConfig() {
    console.log('Check 6: Security Configuration');

    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        this.recordPass('Security', '.env is gitignored');
      } else {
        this.recordError('Security', '.env not in .gitignore');
      }

      if (gitignore.includes('node_modules')) {
        this.recordPass('Security', 'node_modules is gitignored');
      }
    } else {
      this.recordError('Security', '.gitignore not found');
    }

    if (fs.existsSync('src/agents/support/TechnicalAgent.js')) {
      this.recordPass('Security', 'Security analysis agent present');
    }
  }

  /**
   * Check 7: Logging setup
   */
  checkLoggingSetup() {
    console.log('Check 7: Logging Setup');

    if (fs.existsSync('logs') || fs.existsSync('.ai/logs')) {
      this.recordPass('Logging', 'Log directories present');
    } else {
      this.recordWarning('Logging', 'Log directories not found (will be created at runtime)');
    }

    if (fs.existsSync('ecosystem.config.js')) {
      const config = fs.readFileSync('ecosystem.config.js', 'utf8');
      if (config.includes('error_file') && config.includes('out_file')) {
        this.recordPass('Logging', 'PM2 logging configured');
      }
    }
  }

  /**
   * Record check pass
   */
  recordPass(category, message) {
    this.checks.push({ category, status: 'PASS', message });
    console.log(`  ✅ ${message}`);
  }

  /**
   * Record check warning
   */
  recordWarning(category, message) {
    this.warnings.push({ category, message });
    console.log(`  ⚠️  ${message}`);
  }

  /**
   * Record check error
   */
  recordError(category, message) {
    this.errors.push({ category, message });
    console.log(`  ❌ ${message}`);
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCTION READINESS SUMMARY');
    console.log('='.repeat(70));
    console.log(`Checks Passed: ${this.checks.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log('='.repeat(70) + '\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Production ready! All checks passed.\n');
    } else if (this.errors.length === 0) {
      console.log('⚠️  Production ready with warnings. Review recommended.\n');
    } else {
      console.log('❌ Not production ready. Critical issues must be resolved.\n');
      console.log('Critical Issues:');
      this.errors.forEach(e => console.log(`  - [${e.category}] ${e.message}`));
      console.log('');
    }
  }
}

// Run checks
const checker = new ProductionChecker();
checker.runAll()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Production check failed:', error);
    process.exit(1);
  });
