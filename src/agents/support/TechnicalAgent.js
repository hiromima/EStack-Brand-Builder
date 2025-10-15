/**
 * @file TechnicalAgent.js
 * @description Technical analysis and system optimization agent
 * @responsibilities
 * - Analyze system architecture and dependencies
 * - Identify technical debt and optimization opportunities
 * - Generate technical recommendations and reports
 * - Monitor system health and performance metrics
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * TechnicalAgent クラス
 *
 * システムの技術的分析と最適化を担当するエージェント。
 * アーキテクチャ分析、依存関係チェック、技術的負債の検出を行います。
 *
 * @extends BaseAgent
 */
export class TechnicalAgent extends BaseAgent {
  /**
   * @param {Object} options - Agent configuration options
   * @param {Object} [options.logger] - Logger instance
   * @param {string} [options.analysisLevel='standard'] - Analysis depth (quick, standard, deep)
   * @param {Object} [options.rules] - Custom analysis rules
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.TECHNICAL,
      name: 'TechnicalAgent',
      logger: options.logger || console
    });

    this.analysisLevel = options.analysisLevel || 'standard';
    this.rules = options.rules || this._getDefaultRules();
  }

  /**
   * Agent initialization
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[TechnicalAgent] Initializing...');

    // Validate configuration
    const validLevels = ['quick', 'standard', 'deep'];
    if (!validLevels.includes(this.analysisLevel)) {
      throw new Error(`Invalid analysis level: ${this.analysisLevel}. Must be one of: ${validLevels.join(', ')}`);
    }

    this.logger?.info('[TechnicalAgent] Initialized successfully', {
      analysisLevel: this.analysisLevel,
      rulesCount: Object.keys(this.rules).length
    });
  }

  /**
   * Main processing method - performs technical analysis
   *
   * @param {Object} input - Input data for technical analysis
   * @param {string} [input.code] - Source code to analyze
   * @param {string} [input.filePath] - File path for context
   * @param {string} [input.type] - Analysis type (architecture, dependencies, performance, security)
   * @param {Object} [input.metadata] - Additional metadata
   * @returns {Promise<Object>} Technical analysis result
   */
  async process(input) {
    this.logger?.info('[TechnicalAgent] Processing technical analysis...', {
      hasCode: !!input?.code,
      type: input?.type,
      filePath: input?.filePath
    });

    try {
      // Validate input
      this._validateInput(input);

      const code = input.code;
      const analysisType = input.type || 'architecture';

      // Perform analysis based on type
      let analysis;
      switch (analysisType) {
        case 'architecture':
          analysis = await this._analyzeArchitecture(code, input);
          break;
        case 'dependencies':
          analysis = await this._analyzeDependencies(code, input);
          break;
        case 'performance':
          analysis = await this._analyzePerformance(code, input);
          break;
        case 'security':
          analysis = await this._analyzeSecurity(code, input);
          break;
        default:
          analysis = await this._analyzeArchitecture(code, input);
      }

      // Calculate overall metrics
      const overallMetrics = this._calculateOverallMetrics(analysis);

      return {
        success: true,
        result: {
          ...analysis,
          type: analysisType,
          level: this.analysisLevel,
          overallMetrics
        },
        metadata: {
          agent: this.name,
          analysisLevel: this.analysisLevel,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger?.error('[TechnicalAgent] Processing failed:', error);

      return {
        success: false,
        error: error.message,
        metadata: {
          agent: this.name,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze architecture
   *
   * @private
   * @param {string} code - Source code
   * @param {Object} input - Original input
   * @returns {Promise<Object>} Architecture analysis
   */
  async _analyzeArchitecture(code, input) {
    const findings = [];
    const recommendations = [];

    // File size analysis
    const lines = code.split('\n');
    const lineCount = lines.length;

    if (lineCount > this.rules.architecture.maxFileSize) {
      findings.push({
        severity: 'warning',
        category: 'architecture',
        issue: 'Large file size',
        details: `File has ${lineCount} lines (max: ${this.rules.architecture.maxFileSize})`,
        location: { file: input.filePath }
      });
      recommendations.push({
        priority: 'medium',
        action: 'Split large file into smaller modules',
        rationale: 'Improves maintainability and testability'
      });
    }

    // Function length analysis
    const functions = this._extractFunctions(code);
    for (const func of functions) {
      if (func.lineCount > this.rules.architecture.maxFunctionLength) {
        findings.push({
          severity: 'warning',
          category: 'architecture',
          issue: 'Long function',
          details: `Function '${func.name}' has ${func.lineCount} lines (max: ${this.rules.architecture.maxFunctionLength})`,
          location: { function: func.name, line: func.startLine }
        });
        recommendations.push({
          priority: 'medium',
          action: `Refactor function '${func.name}' into smaller functions`,
          rationale: 'Improves readability and testability'
        });
      }
    }

    // Class complexity analysis
    const classes = this._extractClasses(code);
    for (const cls of classes) {
      const complexity = cls.methodCount + cls.propertyCount;
      if (complexity > this.rules.architecture.maxClassComplexity) {
        findings.push({
          severity: 'warning',
          category: 'architecture',
          issue: 'High class complexity',
          details: `Class '${cls.name}' has ${complexity} members (max: ${this.rules.architecture.maxClassComplexity})`,
          location: { class: cls.name, line: cls.startLine }
        });
        recommendations.push({
          priority: 'high',
          action: `Refactor class '${cls.name}' using composition or inheritance`,
          rationale: 'Reduces complexity and improves maintainability'
        });
      }
    }

    return {
      findings,
      recommendations,
      metrics: {
        fileSize: lineCount,
        functionCount: functions.length,
        classCount: classes.length,
        averageFunctionLength: functions.length > 0
          ? Math.round(functions.reduce((sum, f) => sum + f.lineCount, 0) / functions.length)
          : 0
      }
    };
  }

  /**
   * Analyze dependencies
   *
   * @private
   * @param {string} code - Source code
   * @param {Object} input - Original input
   * @returns {Promise<Object>} Dependencies analysis
   */
  async _analyzeDependencies(code, input) {
    const findings = [];
    const recommendations = [];

    // Extract imports
    const imports = this._extractImports(code);

    // Check for circular dependencies (simplified check)
    if (this.rules.dependencies.checkCircular) {
      const selfImports = imports.filter(imp =>
        input.filePath && imp.source.includes(input.filePath.replace(/\.[^.]+$/, ''))
      );

      if (selfImports.length > 0) {
        findings.push({
          severity: 'error',
          category: 'dependencies',
          issue: 'Potential circular dependency',
          details: `File may have circular dependency with: ${selfImports.map(i => i.source).join(', ')}`,
          location: { file: input.filePath }
        });
        recommendations.push({
          priority: 'high',
          action: 'Refactor to eliminate circular dependencies',
          rationale: 'Prevents runtime errors and improves module loading'
        });
      }
    }

    // Check for unused imports (simplified - checks if import name appears in code)
    if (this.rules.dependencies.checkUnused) {
      for (const imp of imports) {
        const importNames = [imp.default, ...imp.named].filter(Boolean);
        const unusedImports = importNames.filter(name => {
          const regex = new RegExp(`\\b${name}\\b`, 'g');
          const matches = (code.match(regex) || []).length;
          return matches <= 1; // Only appears in import statement
        });

        if (unusedImports.length > 0) {
          findings.push({
            severity: 'info',
            category: 'dependencies',
            issue: 'Unused import',
            details: `Unused imports: ${unusedImports.join(', ')} from '${imp.source}'`,
            location: { file: input.filePath }
          });
          recommendations.push({
            priority: 'low',
            action: `Remove unused imports: ${unusedImports.join(', ')}`,
            rationale: 'Reduces bundle size and improves code clarity'
          });
        }
      }
    }

    return {
      findings,
      recommendations,
      metrics: {
        totalImports: imports.length,
        externalDependencies: imports.filter(i => !i.source.startsWith('.')).length,
        localDependencies: imports.filter(i => i.source.startsWith('.')).length
      }
    };
  }

  /**
   * Analyze performance
   *
   * @private
   * @param {string} code - Source code
   * @param {Object} input - Original input
   * @returns {Promise<Object>} Performance analysis
   */
  async _analyzePerformance(code, input) {
    const findings = [];
    const recommendations = [];

    // Initialize variables for metrics
    let nestedLoops = [];
    let blockingOps = [];

    // Check for nested loops (O(n²) or worse)
    if (this.rules.performance.checkAlgorithmComplexity) {
      nestedLoops = this._detectNestedLoops(code);

      if (nestedLoops.length > 0) {
        findings.push({
          severity: 'warning',
          category: 'performance',
          issue: 'Nested loops detected',
          details: `Found ${nestedLoops.length} nested loop(s) which may cause performance issues`,
          location: { lines: nestedLoops }
        });
        recommendations.push({
          priority: 'medium',
          action: 'Consider optimizing nested loops or using more efficient algorithms',
          rationale: 'Reduces time complexity and improves performance for large datasets'
        });
      }
    }

    // Check for potential memory leaks
    if (this.rules.performance.checkMemoryLeaks) {
      const memoryIssues = this._detectMemoryIssues(code);

      for (const issue of memoryIssues) {
        findings.push({
          severity: 'warning',
          category: 'performance',
          issue: 'Potential memory leak',
          details: issue.details,
          location: { line: issue.line }
        });
        recommendations.push({
          priority: 'high',
          action: issue.recommendation,
          rationale: 'Prevents memory leaks and improves application stability'
        });
      }
    }

    // Check for synchronous blocking operations
    if (this.rules.performance.checkBottlenecks) {
      blockingOps = this._detectBlockingOperations(code);

      if (blockingOps.length > 0) {
        findings.push({
          severity: 'warning',
          category: 'performance',
          issue: 'Synchronous blocking operations',
          details: `Found ${blockingOps.length} potentially blocking operation(s)`,
          location: { operations: blockingOps }
        });
        recommendations.push({
          priority: 'medium',
          action: 'Consider using async/await for I/O operations',
          rationale: 'Prevents blocking the event loop and improves responsiveness'
        });
      }
    }

    return {
      findings,
      recommendations,
      metrics: {
        nestedLoops: nestedLoops.length,
        asyncFunctions: (code.match(/async\s+function/g) || []).length,
        potentialBottlenecks: blockingOps.length
      }
    };
  }

  /**
   * Analyze security
   *
   * @private
   * @param {string} code - Source code
   * @param {Object} input - Original input
   * @returns {Promise<Object>} Security analysis
   */
  async _analyzeSecurity(code, input) {
    const findings = [];
    const recommendations = [];

    // Initialize variables for metrics
    let secrets = [];
    let injections = [];

    // Check for hardcoded secrets
    if (this.rules.security.checkHardcodedSecrets) {
      secrets = this._detectHardcodedSecrets(code);

      for (const secret of secrets) {
        findings.push({
          severity: 'error',
          category: 'security',
          issue: 'Hardcoded secret detected',
          details: secret.details,
          location: { line: secret.line }
        });
        recommendations.push({
          priority: 'critical',
          action: 'Move secrets to environment variables or secure vault',
          rationale: 'Prevents exposure of sensitive credentials'
        });
      }
    }

    // Check for SQL injection vulnerabilities
    if (this.rules.security.checkInjections) {
      injections = this._detectInjectionVulnerabilities(code);

      for (const injection of injections) {
        findings.push({
          severity: 'error',
          category: 'security',
          issue: 'Potential injection vulnerability',
          details: injection.details,
          location: { line: injection.line }
        });
        recommendations.push({
          priority: 'critical',
          action: injection.recommendation,
          rationale: 'Prevents injection attacks and data breaches'
        });
      }
    }

    // Check for eval usage
    const evalUsage = (code.match(/\beval\s*\(/g) || []).length;
    if (evalUsage > 0) {
      findings.push({
        severity: 'error',
        category: 'security',
        issue: 'Unsafe eval() usage',
        details: `Found ${evalUsage} usage(s) of eval()`,
        location: { file: input.filePath }
      });
      recommendations.push({
        priority: 'critical',
        action: 'Remove eval() and use safer alternatives',
        rationale: 'Prevents code injection and arbitrary code execution'
      });
    }

    return {
      findings,
      recommendations,
      metrics: {
        hardcodedSecrets: secrets.length,
        injectionRisks: injections.length,
        unsafeEval: evalUsage
      }
    };
  }

  /**
   * Extract functions from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted functions
   */
  _extractFunctions(code) {
    const functions = [];
    const lines = code.split('\n');

    const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      const funcName = match[1];
      const startLine = code.substring(0, match.index).split('\n').length;

      // Count lines until closing brace (simplified)
      let braceCount = 0;
      let endLine = startLine;
      let foundStart = false;

      for (let i = startLine - 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('{')) {
          braceCount += (line.match(/{/g) || []).length;
          foundStart = true;
        }
        if (line.includes('}')) {
          braceCount -= (line.match(/}/g) || []).length;
        }
        if (foundStart && braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }

      functions.push({
        name: funcName,
        startLine,
        endLine,
        lineCount: endLine - startLine + 1
      });
    }

    return functions;
  }

  /**
   * Extract classes from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted classes
   */
  _extractClasses(code) {
    const classes = [];
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      const startLine = code.substring(0, match.index).split('\n').length;

      // Extract class body
      const classBodyMatch = code.substring(match.index).match(/class\s+\w+[\s\S]*?\{([\s\S]*?)\n\}/);
      const classBody = classBodyMatch ? classBodyMatch[1] : '';

      // Count methods and properties
      const methodCount = (classBody.match(/(?:async\s+)?(\w+)\s*\(/g) || []).length;
      const propertyCount = (classBody.match(/this\.(\w+)\s*=/g) || []).length;

      classes.push({
        name: className,
        startLine,
        methodCount,
        propertyCount
      });
    }

    return classes;
  }

  /**
   * Extract imports from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted imports
   */
  _extractImports(code) {
    const imports = [];
    const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const [, namedImports, defaultImport, source] = match;

      imports.push({
        source,
        default: defaultImport || null,
        named: namedImports ? namedImports.split(',').map(i => i.trim()) : []
      });
    }

    return imports;
  }

  /**
   * Detect nested loops
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<number>} Line numbers with nested loops
   */
  _detectNestedLoops(code) {
    const lines = code.split('\n');
    const nestedLoops = [];
    let loopDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/\b(for|while)\s*\(/.test(line)) {
        loopDepth++;
        if (loopDepth > 1) {
          nestedLoops.push(i + 1);
        }
      }

      if (line.includes('}')) {
        const closeCount = (line.match(/}/g) || []).length;
        loopDepth = Math.max(0, loopDepth - closeCount);
      }
    }

    return nestedLoops;
  }

  /**
   * Detect memory issues
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Memory issues
   */
  _detectMemoryIssues(code) {
    const issues = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for event listeners without cleanup
      if (/addEventListener\s*\(/.test(line) && !/removeEventListener/.test(code)) {
        issues.push({
          line: i + 1,
          details: 'Event listener added without corresponding cleanup',
          recommendation: 'Add removeEventListener in cleanup/unmount phase'
        });
      }

      // Check for setInterval without clearInterval
      if (/setInterval\s*\(/.test(line) && !/clearInterval/.test(code)) {
        issues.push({
          line: i + 1,
          details: 'setInterval used without clearInterval',
          recommendation: 'Store interval ID and call clearInterval when done'
        });
      }
    }

    return issues;
  }

  /**
   * Detect blocking operations
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<string>} Blocking operations
   */
  _detectBlockingOperations(code) {
    const blockingOps = [];

    // Check for synchronous file operations
    if (/fs\.(readFileSync|writeFileSync|readdirSync)/.test(code)) {
      blockingOps.push('Synchronous file system operations');
    }

    // Check for JSON.parse on large data without try-catch
    if (/JSON\.parse\s*\(/.test(code)) {
      blockingOps.push('JSON.parse (consider streaming for large data)');
    }

    return blockingOps;
  }

  /**
   * Detect hardcoded secrets
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Detected secrets
   */
  _detectHardcodedSecrets(code) {
    const secrets = [];
    const lines = code.split('\n');

    const secretPatterns = [
      { pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/, type: 'password' },
      { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{16,}['"]/, type: 'API key' },
      { pattern: /secret\s*[:=]\s*['"][^'"]{16,}['"]/, type: 'secret' },
      { pattern: /token\s*[:=]\s*['"][^'"]{20,}['"]/, type: 'token' }
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      for (const { pattern, type } of secretPatterns) {
        if (pattern.test(line)) {
          secrets.push({
            line: i + 1,
            details: `Potential hardcoded ${type} detected`
          });
        }
      }
    }

    return secrets;
  }

  /**
   * Detect injection vulnerabilities
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Injection vulnerabilities
   */
  _detectInjectionVulnerabilities(code) {
    const vulnerabilities = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // SQL injection check
      if (/query\s*\(\s*`.*\$\{/.test(line) || /query\s*\(\s*".*\+/.test(line)) {
        vulnerabilities.push({
          line: i + 1,
          details: 'Potential SQL injection - dynamic query construction',
          recommendation: 'Use parameterized queries or ORM'
        });
      }

      // Command injection check
      if (/exec\s*\(\s*`.*\$\{/.test(line) || /spawn\s*\(\s*.*\+/.test(line)) {
        vulnerabilities.push({
          line: i + 1,
          details: 'Potential command injection',
          recommendation: 'Sanitize input and use allowlists for commands'
        });
      }

      // XSS check (innerHTML with variables)
      if (/innerHTML\s*=\s*.*\$\{/.test(line)) {
        vulnerabilities.push({
          line: i + 1,
          details: 'Potential XSS vulnerability - unsanitized innerHTML',
          recommendation: 'Use textContent or sanitize HTML input'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Calculate overall metrics
   *
   * @private
   * @param {Object} analysis - Analysis result
   * @returns {Object} Overall metrics
   */
  _calculateOverallMetrics(analysis) {
    const criticalIssues = analysis.findings.filter(f => f.severity === 'error').length;
    const warnings = analysis.findings.filter(f => f.severity === 'warning').length;
    const infos = analysis.findings.filter(f => f.severity === 'info').length;

    // Calculate score (100 - penalties)
    let score = 100;
    score -= criticalIssues * 20;
    score -= warnings * 5;
    score -= infos * 1;
    score = Math.max(0, score);

    return {
      score,
      totalFindings: analysis.findings.length,
      criticalIssues,
      warnings,
      infos,
      recommendationCount: analysis.recommendations.length
    };
  }

  /**
   * Validate input data
   *
   * @private
   * @param {Object} input - Input to validate
   * @throws {Error} When input is invalid
   */
  _validateInput(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('Input must be an object');
    }

    if (!input.code && !input.filePath) {
      throw new Error('Either code or filePath must be provided');
    }

    if (input.code && typeof input.code !== 'string') {
      throw new Error('Code must be a string');
    }
  }

  /**
   * Get default analysis rules
   *
   * @private
   * @returns {Object} Default rules
   */
  _getDefaultRules() {
    return {
      architecture: {
        maxFileSize: 500,
        maxFunctionLength: 50,
        maxClassComplexity: 10
      },
      dependencies: {
        checkCircular: true,
        checkUnused: true,
        checkOutdated: true
      },
      performance: {
        checkAlgorithmComplexity: true,
        checkMemoryLeaks: true,
        checkBottlenecks: true
      },
      security: {
        checkVulnerabilities: true,
        checkHardcodedSecrets: true,
        checkInjections: true
      }
    };
  }
}

export default TechnicalAgent;
