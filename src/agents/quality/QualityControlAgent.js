/**
 * @file QualityControlAgent.js
 * @description Code quality analysis and control agent for autonomous system
 * @responsibilities
 * - Perform static code analysis and quality checks
 * - Calculate quality scores based on multiple metrics
 * - Validate code against project standards and best practices
 * - Generate quality reports with actionable recommendations
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * QualityControlAgent クラス
 *
 * コード品質の分析と評価を行うエージェント。
 * 静的解析、メトリクス計算、ベストプラクティス検証を実施します。
 *
 * @extends BaseAgent
 */
export class QualityControlAgent extends BaseAgent {
  /**
   * @param {Object} options - Agent configuration options
   * @param {Object} [options.logger] - Logger instance
   * @param {number} [options.threshold=80] - Quality score threshold (0-100)
   * @param {Object} [options.rules] - Custom quality rules
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.QUALITY_CONTROL,
      name: 'QualityControlAgent',
      logger: options.logger || console
    });

    this.options = options;
    this.threshold = options.threshold || 80;
    this.rules = options.rules || this._getDefaultRules();
  }

  /**
   * Agent initialization
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[QualityControlAgent] Initializing...');

    // Validate configuration
    if (this.threshold < 0 || this.threshold > 100) {
      throw new Error('Threshold must be between 0 and 100');
    }

    this.logger?.info('[QualityControlAgent] Initialized successfully', {
      threshold: this.threshold,
      rulesCount: Object.keys(this.rules).length
    });
  }

  /**
   * Main processing method - performs quality analysis
   *
   * @param {Object} input - Input data for quality analysis
   * @param {string} [input.code] - Source code to analyze
   * @param {string} [input.filePath] - File path for context
   * @param {Object} [input.metadata] - Additional metadata
   * @returns {Promise<Object>} Quality analysis result
   */
  async process(input) {
    this.logger?.info('[QualityControlAgent] Processing quality analysis...', {
      hasCode: !!input?.code,
      filePath: input?.filePath
    });

    try {
      // Validate input
      this._validateInput(input);

      const code = input.code;
      const startTime = Date.now();

      // Perform quality checks
      const checks = {
        linting: await this._checkLinting(code),
        complexity: await this._checkComplexity(code),
        documentation: await this._checkDocumentation(code),
        naming: await this._checkNaming(code),
        bestPractices: await this._checkBestPractices(code)
      };

      // Calculate overall score
      const score = this._calculateScore(checks);

      // Generate recommendations
      const recommendations = this._generateRecommendations(checks);

      const passed = score >= this.threshold;
      const duration = Date.now() - startTime;

      const results = {
        score,
        passed,
        checks,
        recommendations,
        metrics: {
          linesOfCode: code.split('\n').length,
          functions: this._countFunctions(code),
          classes: this._countClasses(code),
          comments: this._countComments(code)
        },
        metadata: {
          agent: this.name,
          threshold: this.threshold,
          duration,
          timestamp: new Date().toISOString()
        }
      };

      this.logger?.info('[QualityControlAgent] Analysis complete', {
        score,
        passed,
        duration
      });

      return {
        success: true,
        passed,
        result: results,
        metadata: {
          agent: this.name,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger?.error('[QualityControlAgent] Processing failed:', error);

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
   * Get default quality rules
   *
   * @private
   * @returns {Object} Default quality rules
   */
  _getDefaultRules() {
    return {
      maxComplexity: 10,
      maxLineLength: 120,
      maxFunctionLength: 50,
      requireJSDoc: true,
      enforceNaming: true
    };
  }

  /**
   * Check linting issues
   *
   * @private
   * @param {string} code - Source code
   * @returns {Promise<Object>} Linting check result
   */
  async _checkLinting(code) {
    const issues = [];
    let score = 100;

    // Check for console.log statements
    const consoleLogCount = (code.match(/console\.log/g) || []).length;
    if (consoleLogCount > 0) {
      issues.push(`Found ${consoleLogCount} console.log statement(s)`);
      score -= consoleLogCount * 5;
    }

    // Check for TODO comments
    const todoCount = (code.match(/\/\/\s*TODO/gi) || []).length;
    if (todoCount > 0) {
      issues.push(`Found ${todoCount} TODO comment(s)`);
      score -= todoCount * 2;
    }

    // Check line length
    const lines = code.split('\n');
    const longLines = lines.filter(line => line.length > this.rules.maxLineLength);
    if (longLines.length > 0) {
      issues.push(`${longLines.length} line(s) exceed ${this.rules.maxLineLength} characters`);
      score -= longLines.length * 1;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      details: {
        consoleLogCount,
        todoCount,
        longLinesCount: longLines.length
      }
    };
  }

  /**
   * Check code complexity
   *
   * @private
   * @param {string} code - Source code
   * @returns {Promise<Object>} Complexity check result
   */
  async _checkComplexity(code) {
    const issues = [];
    let score = 100;

    // Count control flow statements
    const ifCount = (code.match(/\bif\s*\(/g) || []).length;
    const forCount = (code.match(/\bfor\s*\(/g) || []).length;
    const whileCount = (code.match(/\bwhile\s*\(/g) || []).length;
    const switchCount = (code.match(/\bswitch\s*\(/g) || []).length;

    const totalComplexity = ifCount + forCount + whileCount + switchCount;

    // Estimate cyclomatic complexity
    const functions = this._extractFunctions(code);
    let highComplexityCount = 0;

    for (const func of functions) {
      const funcComplexity = this._calculateFunctionComplexity(func);
      if (funcComplexity > this.rules.maxComplexity) {
        highComplexityCount++;
        issues.push(`Function has complexity ${funcComplexity} (max: ${this.rules.maxComplexity})`);
      }
    }

    score -= highComplexityCount * 15;

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      details: {
        totalComplexity,
        highComplexityCount,
        functionsAnalyzed: functions.length
      }
    };
  }

  /**
   * Check documentation
   *
   * @private
   * @param {string} code - Source code
   * @returns {Promise<Object>} Documentation check result
   */
  async _checkDocumentation(code) {
    const issues = [];
    let score = 100;

    // Check for JSDoc comments
    const jsdocCount = (code.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
    const functions = this._extractFunctions(code);
    const classes = this._extractClasses(code);

    const totalItems = functions.length + classes.length;

    if (this.rules.requireJSDoc && totalItems > 0) {
      const documentationRatio = jsdocCount / totalItems;

      if (documentationRatio < 0.5) {
        issues.push(`Low documentation coverage: ${(documentationRatio * 100).toFixed(1)}%`);
        score -= 30;
      } else if (documentationRatio < 0.8) {
        issues.push(`Moderate documentation coverage: ${(documentationRatio * 100).toFixed(1)}%`);
        score -= 15;
      }
    }

    // Check file-level documentation
    if (!code.match(/^\/\*\*[\s\S]*?@file/m)) {
      issues.push('Missing file-level @file JSDoc comment');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      details: {
        jsdocCount,
        functionsCount: functions.length,
        classesCount: classes.length,
        coverageRatio: totalItems > 0 ? (jsdocCount / totalItems) : 1
      }
    };
  }

  /**
   * Check naming conventions
   *
   * @private
   * @param {string} code - Source code
   * @returns {Promise<Object>} Naming check result
   */
  async _checkNaming(code) {
    const issues = [];
    let score = 100;

    if (!this.rules.enforceNaming) {
      return { passed: true, score: 100, issues: [], details: {} };
    }

    // Check for camelCase functions
    const functionNames = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    for (const match of functionNames) {
      const name = match.replace('function ', '').trim();
      if (name && !this._isCamelCase(name) && !name.startsWith('_')) {
        issues.push(`Function "${name}" does not follow camelCase convention`);
        score -= 5;
      }
    }

    // Check for PascalCase classes
    const classNames = code.match(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    for (const match of classNames) {
      const name = match.replace('class ', '').trim();
      if (name && !this._isPascalCase(name)) {
        issues.push(`Class "${name}" does not follow PascalCase convention`);
        score -= 5;
      }
    }

    // Check for UPPER_CASE constants
    const constNames = code.match(/const\s+([A-Z_$][A-Z0-9_$]*)\s*=/g) || [];
    const validConstCount = constNames.length;

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      details: {
        functionsChecked: functionNames.length,
        classesChecked: classNames.length,
        constantsFound: validConstCount
      }
    };
  }

  /**
   * Check best practices
   *
   * @private
   * @param {string} code - Source code
   * @returns {Promise<Object>} Best practices check result
   */
  async _checkBestPractices(code) {
    const issues = [];
    let score = 100;

    // Check for var usage (should use let/const)
    const varCount = (code.match(/\bvar\s+/g) || []).length;
    if (varCount > 0) {
      issues.push(`Found ${varCount} usage(s) of 'var' (use 'let' or 'const' instead)`);
      score -= varCount * 10;
    }

    // Check for == instead of ===
    const looseEqualityCount = (code.match(/[^=!]==[^=]/g) || []).length;
    if (looseEqualityCount > 0) {
      issues.push(`Found ${looseEqualityCount} usage(s) of '==' (use '===' instead)`);
      score -= looseEqualityCount * 5;
    }

    // Check for async/await usage vs callbacks
    const callbackCount = (code.match(/\.then\(/g) || []).length;
    const asyncCount = (code.match(/async\s+/g) || []).length;

    if (callbackCount > 5 && asyncCount === 0) {
      issues.push('Consider using async/await instead of promise chains');
      score -= 10;
    }

    // Check for error handling
    const tryCount = (code.match(/\btry\s*\{/g) || []).length;
    const catchCount = (code.match(/\bcatch\s*\(/g) || []).length;

    if (asyncCount > 0 && tryCount === 0) {
      issues.push('Async code should include try-catch error handling');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      details: {
        varUsage: varCount,
        looseEquality: looseEqualityCount,
        errorHandling: tryCount === catchCount
      }
    };
  }

  /**
   * Calculate overall quality score
   *
   * @private
   * @param {Object} checks - All check results
   * @returns {number} Overall score (0-100)
   */
  _calculateScore(checks) {
    const weights = {
      linting: 0.20,
      complexity: 0.20,
      documentation: 0.25,
      naming: 0.15,
      bestPractices: 0.20
    };

    let totalScore = 0;
    let failedCount = 0;

    for (const [category, check] of Object.entries(checks)) {
      totalScore += check.score * weights[category];
      if (!check.passed) {
        failedCount++;
      }
    }

    // Apply penalty for multiple failing categories
    if (failedCount >= 3) {
      totalScore *= 0.8; // 20% penalty for 3+ failures
    } else if (failedCount === 2) {
      totalScore *= 0.9; // 10% penalty for 2 failures
    }

    return Math.round(totalScore);
  }

  /**
   * Generate recommendations based on checks
   *
   * @private
   * @param {Object} checks - All check results
   * @returns {Array<string>} List of recommendations
   */
  _generateRecommendations(checks) {
    const recommendations = [];

    for (const [category, check] of Object.entries(checks)) {
      if (!check.passed) {
        recommendations.push(`${category}: ${check.issues.join('; ')}`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Code quality is excellent! No major issues found.');
    }

    return recommendations;
  }

  /**
   * Extract functions from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<string>} List of function bodies
   */
  _extractFunctions(code) {
    const functions = [];
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g;
    const arrowFunctionRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\}/g;

    const matches = [
      ...(code.match(functionRegex) || []),
      ...(code.match(arrowFunctionRegex) || [])
    ];

    return matches;
  }

  /**
   * Extract classes from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<string>} List of class bodies
   */
  _extractClasses(code) {
    const classRegex = /class\s+\w+(\s+extends\s+\w+)?\s*\{[\s\S]*?\n\}/g;
    return code.match(classRegex) || [];
  }

  /**
   * Calculate function complexity
   *
   * @private
   * @param {string} functionCode - Function source code
   * @returns {number} Cyclomatic complexity
   */
  _calculateFunctionComplexity(functionCode) {
    let complexity = 1; // Base complexity

    // Count decision points
    complexity += (functionCode.match(/\bif\s*\(/g) || []).length;
    complexity += (functionCode.match(/\bfor\s*\(/g) || []).length;
    complexity += (functionCode.match(/\bwhile\s*\(/g) || []).length;
    complexity += (functionCode.match(/\bcase\s+/g) || []).length;
    complexity += (functionCode.match(/\bcatch\s*\(/g) || []).length;
    complexity += (functionCode.match(/\&\&/g) || []).length;
    complexity += (functionCode.match(/\|\|/g) || []).length;

    return complexity;
  }

  /**
   * Count functions in code
   *
   * @private
   * @param {string} code - Source code
   * @returns {number} Function count
   */
  _countFunctions(code) {
    return this._extractFunctions(code).length;
  }

  /**
   * Count classes in code
   *
   * @private
   * @param {string} code - Source code
   * @returns {number} Class count
   */
  _countClasses(code) {
    return this._extractClasses(code).length;
  }

  /**
   * Count comments in code
   *
   * @private
   * @param {string} code - Source code
   * @returns {number} Comment count
   */
  _countComments(code) {
    const singleLineComments = (code.match(/\/\/.*/g) || []).length;
    const multiLineComments = (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
    return singleLineComments + multiLineComments;
  }

  /**
   * Check if name is camelCase
   *
   * @private
   * @param {string} name - Name to check
   * @returns {boolean} True if camelCase
   */
  _isCamelCase(name) {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Check if name is PascalCase
   *
   * @private
   * @param {string} name - Name to check
   * @returns {boolean} True if PascalCase
   */
  _isPascalCase(name) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }
}

export default QualityControlAgent;
