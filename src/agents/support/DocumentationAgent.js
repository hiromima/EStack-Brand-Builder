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

      const code = input.code;
      const docType = input.type || 'api';

      // Extract documentation from code
      const extracted = this._extractDocumentation(code);

      // Generate documentation based on type
      let content;
      switch (docType) {
        case 'api':
          content = await this._generateAPIDocumentation(extracted, input);
          break;
        case 'readme':
          content = await this._generateREADME(extracted, input);
          break;
        case 'guide':
          content = await this._generateGuide(extracted, input);
          break;
        default:
          content = await this._generateAPIDocumentation(extracted, input);
      }

      // Format output
      const formatted = this._formatOutput(content, this.format);

      return {
        success: true,
        result: {
          content: formatted,
          type: docType,
          format: this.format,
          extracted: {
            functions: extracted.functions.length,
            classes: extracted.classes.length,
            exports: extracted.exports.length
          }
        },
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
   * Extract documentation elements from code
   *
   * @private
   * @param {string} code - Source code
   * @returns {Object} Extracted documentation elements
   */
  _extractDocumentation(code) {
    return {
      fileDoc: this._extractFileDoc(code),
      functions: this._extractFunctions(code),
      classes: this._extractClasses(code),
      exports: this._extractExports(code),
      imports: this._extractImports(code)
    };
  }

  /**
   * Extract file-level JSDoc
   *
   * @private
   * @param {string} code - Source code
   * @returns {Object|null} File documentation
   */
  _extractFileDoc(code) {
    const fileDocRegex = /\/\*\*\s*\n([^*]|\*(?!\/))*@file\s+([^\n]+)/;
    const match = code.match(fileDocRegex);

    if (!match) return null;

    const fullDoc = code.match(/\/\*\*[\s\S]*?\*\//)?.[0] || '';

    return {
      raw: fullDoc,
      file: this._extractTag(fullDoc, '@file'),
      description: this._extractTag(fullDoc, '@description'),
      version: this._extractTag(fullDoc, '@version'),
      author: this._extractTag(fullDoc, '@author')
    };
  }

  /**
   * Extract functions with their JSDoc
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted functions
   */
  _extractFunctions(code) {
    const functions = [];

    // Match function declarations with optional export and JSDoc
    const funcRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      const [fullMatch, jsdoc, name, params] = match;
      const isAsync = /async\s+function/.test(fullMatch);

      functions.push({
        name,
        params: params.split(',').map(p => p.trim()).filter(Boolean),
        isAsync,
        jsdoc: jsdoc || null,
        description: jsdoc ? this._extractTag(jsdoc, '@description') || this._extractDescription(jsdoc) : null,
        returns: jsdoc ? this._extractTag(jsdoc, '@returns') : null,
        paramDocs: jsdoc ? this._extractParams(jsdoc) : []
      });
    }

    // Match arrow functions and method definitions with optional export
    const arrowRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;

    while ((match = arrowRegex.exec(code)) !== null) {
      const [fullMatch, jsdoc, name, params] = match;
      const isAsync = /async\s*\(/.test(fullMatch);

      functions.push({
        name,
        params: params.split(',').map(p => p.trim()).filter(Boolean),
        isAsync,
        jsdoc: jsdoc || null,
        description: jsdoc ? this._extractTag(jsdoc, '@description') || this._extractDescription(jsdoc) : null,
        returns: jsdoc ? this._extractTag(jsdoc, '@returns') : null,
        paramDocs: jsdoc ? this._extractParams(jsdoc) : []
      });
    }

    return functions;
  }

  /**
   * Extract classes with their JSDoc
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted classes
   */
  _extractClasses(code) {
    const classes = [];
    const classRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      const [, jsdoc, name, extendsClass] = match;

      classes.push({
        name,
        extends: extendsClass || null,
        jsdoc: jsdoc || null,
        description: jsdoc ? this._extractTag(jsdoc, '@description') || this._extractDescription(jsdoc) : null,
        methods: this._extractClassMethods(code, name)
      });
    }

    return classes;
  }

  /**
   * Extract methods from a class
   *
   * @private
   * @param {string} code - Source code
   * @param {string} className - Class name
   * @returns {Array<Object>} Extracted methods
   */
  _extractClassMethods(code, className) {
    const methods = [];
    const classMatch = code.match(new RegExp(`class\\s+${className}[\\s\\S]*?\\{([\\s\\S]*?)\\n\\}`));

    if (!classMatch) return methods;

    const classBody = classMatch[1];
    const methodRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(async\s+)?(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = methodRegex.exec(classBody)) !== null) {
      const [, jsdoc, isAsync, name, params] = match;

      methods.push({
        name,
        params: params.split(',').map(p => p.trim()).filter(Boolean),
        isAsync: !!isAsync,
        jsdoc: jsdoc || null,
        description: jsdoc ? this._extractTag(jsdoc, '@description') || this._extractDescription(jsdoc) : null,
        returns: jsdoc ? this._extractTag(jsdoc, '@returns') : null
      });
    }

    return methods;
  }

  /**
   * Extract exports
   *
   * @private
   * @param {string} code - Source code
   * @returns {Array<Object>} Extracted exports
   */
  _extractExports(code) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*(\w+)/g;
    let match;

    while ((match = exportRegex.exec(code)) !== null) {
      exports.push({
        name: match[1],
        isDefault: /export\s+default/.test(match[0])
      });
    }

    return exports;
  }

  /**
   * Extract imports
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
   * Extract JSDoc tag value
   *
   * @private
   * @param {string} jsdoc - JSDoc comment
   * @param {string} tag - Tag name (e.g., '@description')
   * @returns {string|null} Tag value
   */
  _extractTag(jsdoc, tag) {
    const regex = new RegExp(`${tag}\\s+([^@\\n]+)`);
    const match = jsdoc.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract description from JSDoc
   *
   * @private
   * @param {string} jsdoc - JSDoc comment
   * @returns {string|null} Description
   */
  _extractDescription(jsdoc) {
    const lines = jsdoc.split('\n');
    const descLines = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].replace(/^\s*\*\s?/, '').trim();
      if (line.startsWith('@')) break;
      if (line) descLines.push(line);
    }

    return descLines.length > 0 ? descLines.join(' ') : null;
  }

  /**
   * Extract parameter documentation
   *
   * @private
   * @param {string} jsdoc - JSDoc comment
   * @returns {Array<Object>} Parameter documentation
   */
  _extractParams(jsdoc) {
    const params = [];
    const paramRegex = /@param\s+\{([^}]+)\}\s+(?:\[)?(\w+)(?:\])?(?:\s+-\s+(.+))?/g;
    let match;

    while ((match = paramRegex.exec(jsdoc)) !== null) {
      params.push({
        type: match[1],
        name: match[2],
        description: match[3] || null
      });
    }

    return params;
  }

  /**
   * Generate API documentation
   *
   * @private
   * @param {Object} extracted - Extracted documentation
   * @param {Object} input - Original input
   * @returns {Promise<string>} Generated documentation
   */
  async _generateAPIDocumentation(extracted, input) {
    const template = this.templates.api;
    let doc = `${template.header}\n\n`;

    // File overview
    if (extracted.fileDoc) {
      doc += `## Overview\n\n`;
      if (extracted.fileDoc.description) {
        doc += `${extracted.fileDoc.description}\n\n`;
      }
      if (extracted.fileDoc.version) {
        doc += `**Version:** ${extracted.fileDoc.version}\n\n`;
      }
    }

    // Classes
    if (extracted.classes.length > 0) {
      doc += `## Classes\n\n`;
      for (const cls of extracted.classes) {
        doc += `### ${cls.name}\n\n`;
        if (cls.extends) {
          doc += `**Extends:** \`${cls.extends}\`\n\n`;
        }
        if (cls.description) {
          doc += `${cls.description}\n\n`;
        }

        if (cls.methods.length > 0) {
          doc += `#### Methods\n\n`;
          for (const method of cls.methods) {
            doc += `##### ${method.name}(${method.params.join(', ')})\n\n`;
            if (method.description) {
              doc += `${method.description}\n\n`;
            }
            if (method.isAsync) {
              doc += `**Async:** Yes\n\n`;
            }
            if (method.returns) {
              doc += `**Returns:** ${method.returns}\n\n`;
            }
          }
        }
      }
    }

    // Functions
    if (extracted.functions.length > 0) {
      doc += `## Functions\n\n`;
      for (const func of extracted.functions) {
        doc += `### ${func.name}(${func.params.join(', ')})\n\n`;
        if (func.description) {
          doc += `${func.description}\n\n`;
        }
        if (func.isAsync) {
          doc += `**Async:** Yes\n\n`;
        }

        if (func.paramDocs.length > 0) {
          doc += `**Parameters:**\n\n`;
          for (const param of func.paramDocs) {
            doc += `- \`${param.name}\` (${param.type})`;
            if (param.description) {
              doc += `: ${param.description}`;
            }
            doc += `\n`;
          }
          doc += `\n`;
        }

        if (func.returns) {
          doc += `**Returns:** ${func.returns}\n\n`;
        }
      }
    }

    // Exports
    if (extracted.exports.length > 0) {
      doc += `## Exports\n\n`;
      for (const exp of extracted.exports) {
        doc += `- \`${exp.name}\``;
        if (exp.isDefault) {
          doc += ` (default)`;
        }
        doc += `\n`;
      }
      doc += `\n`;
    }

    return doc;
  }

  /**
   * Generate README documentation
   *
   * @private
   * @param {Object} extracted - Extracted documentation
   * @param {Object} input - Original input
   * @returns {Promise<string>} Generated documentation
   */
  async _generateREADME(extracted, input) {
    const template = this.templates.readme;
    let doc = `${template.header}\n\n`;

    if (extracted.fileDoc?.description) {
      doc += `${extracted.fileDoc.description}\n\n`;
    }

    // Installation
    doc += `## Installation\n\n`;
    doc += `\`\`\`bash\nnpm install\n\`\`\`\n\n`;

    // Usage
    doc += `## Usage\n\n`;
    if (extracted.classes.length > 0) {
      const mainClass = extracted.classes[0];
      doc += `\`\`\`javascript\nimport { ${mainClass.name} } from './${input.filePath || 'index.js'}';\n\n`;
      doc += `const instance = new ${mainClass.name}();\n`;
      if (mainClass.methods.length > 0) {
        const firstMethod = mainClass.methods[0];
        doc += `await instance.${firstMethod.name}(${firstMethod.params.map(() => '...').join(', ')});\n`;
      }
      doc += `\`\`\`\n\n`;
    }

    // API
    doc += `## API\n\n`;
    doc += `See [API Documentation](#api-documentation) for detailed API reference.\n\n`;

    // Contributing
    doc += `## Contributing\n\n`;
    doc += `Contributions are welcome! Please read the contributing guidelines before submitting PRs.\n\n`;

    // License
    doc += `## License\n\n`;
    doc += `MIT License\n\n`;

    return doc;
  }

  /**
   * Generate user guide documentation
   *
   * @private
   * @param {Object} extracted - Extracted documentation
   * @param {Object} input - Original input
   * @returns {Promise<string>} Generated documentation
   */
  async _generateGuide(extracted, input) {
    const template = this.templates.guide;
    let doc = `${template.header}\n\n`;

    // Getting Started
    doc += `## Getting Started\n\n`;
    if (extracted.fileDoc?.description) {
      doc += `${extracted.fileDoc.description}\n\n`;
    }
    doc += `This guide will help you get started with using this module.\n\n`;

    // Basic Usage
    doc += `## Basic Usage\n\n`;
    if (extracted.classes.length > 0) {
      const mainClass = extracted.classes[0];
      doc += `### Creating an Instance\n\n`;
      doc += `\`\`\`javascript\nconst instance = new ${mainClass.name}();\n\`\`\`\n\n`;

      if (mainClass.methods.length > 0) {
        doc += `### Basic Operations\n\n`;
        for (const method of mainClass.methods.slice(0, 3)) {
          doc += `#### ${method.name}\n\n`;
          if (method.description) {
            doc += `${method.description}\n\n`;
          }
          doc += `\`\`\`javascript\n${method.isAsync ? 'await ' : ''}instance.${method.name}(${method.params.map(() => '...').join(', ')});\n\`\`\`\n\n`;
        }
      }
    }

    // Advanced Topics
    doc += `## Advanced Topics\n\n`;
    doc += `For advanced usage and customization options, refer to the API documentation.\n\n`;

    // Troubleshooting
    doc += `## Troubleshooting\n\n`;
    doc += `### Common Issues\n\n`;
    doc += `- **Issue 1**: Check the error message and logs\n`;
    doc += `- **Issue 2**: Verify configuration settings\n\n`;

    return doc;
  }

  /**
   * Format output based on format type
   *
   * @private
   * @param {string} content - Content to format
   * @param {string} format - Output format
   * @returns {string} Formatted content
   */
  _formatOutput(content, format) {
    switch (format) {
      case 'html':
        return this._convertMarkdownToHTML(content);
      case 'json':
        return JSON.stringify({ documentation: content }, null, 2);
      case 'markdown':
      default:
        return content;
    }
  }

  /**
   * Convert markdown to HTML
   *
   * @private
   * @param {string} markdown - Markdown content
   * @returns {string} HTML content
   */
  _convertMarkdownToHTML(markdown) {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    return `<div class="documentation">\n<p>${html}</p>\n</div>`;
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
