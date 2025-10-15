/**
 * @file DocumentationAgent.js
 * @description Automated documentation generation and maintenance agent
 * @responsibilities
 * - Generate comprehensive code documentation
 * - Maintain API documentation consistency
 * - Create usage examples and guides
 * - Update documentation automatically on code changes
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * DocumentationAgent クラス
 *
 * コードから自動的にドキュメントを生成・更新するエージェント。
 * JSDoc、README、API リファレンスの作成と保守を担当します。
 *
 * @extends BaseAgent
 */
export class DocumentationAgent extends BaseAgent {
  /**
   * @param {Object} options - Agent configuration options
   * @param {Object} [options.logger] - Logger instance
   * @param {string} [options.format='markdown'] - Output format (markdown, html, json)
   * @param {Object} [options.templates] - Custom documentation templates
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.DOCUMENTATION,
      name: 'DocumentationAgent',
      logger: options.logger || console
    });

    this.options = options;
    this.format = options.format || 'markdown';
    this.templates = options.templates || this._getDefaultTemplates();
  }

  /**
   * Agent initialization
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[DocumentationAgent] Initializing...');

    // Validate configuration
    const validFormats = ['markdown', 'html', 'json'];
    if (!validFormats.includes(this.format)) {
      throw new Error(`Invalid format: ${this.format}. Must be one of: ${validFormats.join(', ')}`);
    }

    this.logger?.info('[DocumentationAgent] Initialized successfully', {
      format: this.format,
      templatesCount: Object.keys(this.templates).length
    });
  }

  /**
   * Main processing method - generates documentation
   *
   * @param {Object} input - Input data for documentation generation
   * @param {string} [input.code] - Source code to document
   * @param {string} [input.filePath] - File path for context
   * @param {string} [input.type] - Documentation type (api, readme, guide)
   * @param {Object} [input.metadata] - Additional metadata
   * @returns {Promise<Object>} Documentation generation result
   */
  async process(input) {
    this.logger?.info('[DocumentationAgent] Processing documentation generation...', {
      hasCode: !!input?.code,
      type: input?.type,
      filePath: input?.filePath
    });

    try {
      // Validate input
      this._validateInput(input);

      // Generate documentation (placeholder for core functionality)
      const documentation = {
        content: '# Documentation\n\nGenerated documentation content...',
        type: input.type || 'api',
        format: this.format
      };

      return {
        success: true,
        result: documentation,
        metadata: {
          agent: this.name,
          format: this.format,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger?.error('[DocumentationAgent] Processing failed:', error);

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
   * Get default documentation templates
   *
   * @private
   * @returns {Object} Default templates
   */
  _getDefaultTemplates() {
    return {
      api: {
        header: '# API Documentation',
        sections: ['Overview', 'Methods', 'Parameters', 'Returns', 'Examples']
      },
      readme: {
        header: '# README',
        sections: ['Installation', 'Usage', 'API', 'Contributing', 'License']
      },
      guide: {
        header: '# User Guide',
        sections: ['Getting Started', 'Basic Usage', 'Advanced Topics', 'Troubleshooting']
      }
    };
  }
}

export default DocumentationAgent;
