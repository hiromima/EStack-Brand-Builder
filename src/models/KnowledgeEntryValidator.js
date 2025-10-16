/**
 * @file KnowledgeEntryValidator.js
 * @description JSON Schema ベースの Knowledge Entry バリデータ
 * @version 1.0.0
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schema = JSON.parse(readFileSync(join(__dirname, './schemas/knowledge-entry.schema.json'), 'utf-8'));

/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Knowledge Entry バリデータ
 */
export class KnowledgeEntryValidator {
  /**
   * エントリをバリデート
   * @param {Object} entry - バリデート対象のエントリ
   * @returns {{valid: boolean, errors: string[]}} バリデーション結果
   */
  static validate(entry) {
    const errors = [];

    // 必須フィールドチェック
    const requiredFields = schema.required;
    for (const field of requiredFields) {
      if (!(field in entry) || entry[field] === null || entry[field] === undefined) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // typeバリデーション
    if (entry.type && !schema.properties.type.enum.includes(entry.type)) {
      errors.push(
        `Invalid type '${entry.type}'. Must be one of: ${schema.properties.type.enum.join(', ')}`
      );
    }

    // idパターンバリデーション
    if (entry.id && !/^[a-z0-9-]+$/.test(entry.id)) {
      errors.push(`Invalid id '${entry.id}'. Must match pattern: ^[a-z0-9-]+$`);
    }

    // titleバリデーション
    if (entry.title) {
      if (entry.title.length < 1 || entry.title.length > 200) {
        errors.push('Title must be between 1 and 200 characters');
      }
    }

    // summaryバリデーション
    if (entry.summary && entry.summary.length > 500) {
      errors.push('Summary must be 500 characters or less');
    }

    // sourceバリデーション
    if (entry.source) {
      if (!entry.source.type || !entry.source.name || !entry.source.author) {
        errors.push('Source must have type, name, and author fields');
      }

      if (entry.source.type && !['journal', 'book', 'website', 'gallery', 'internal'].includes(entry.source.type)) {
        errors.push(
          `Invalid source type '${entry.source.type}'. Must be one of: journal, book, website, gallery, internal`
        );
      }

      if (entry.source.author && (!Array.isArray(entry.source.author) || entry.source.author.length === 0)) {
        errors.push('Source author must be a non-empty array');
      }

      // URL validation (basic)
      if (entry.source.url && !this.isValidUrl(entry.source.url)) {
        errors.push(`Invalid source URL: ${entry.source.url}`);
      }
    }

    // credibilityバリデーション
    if (entry.credibility) {
      if (typeof entry.credibility.score !== 'number') {
        errors.push('Credibility score must be a number');
      } else if (entry.credibility.score < 0 || entry.credibility.score > 100) {
        errors.push('Credibility score must be between 0 and 100');
      }

      if (typeof entry.credibility.peerReviewed !== 'boolean') {
        errors.push('Credibility peerReviewed must be a boolean');
      }

      if (typeof entry.credibility.citations !== 'number' || entry.credibility.citations < 0) {
        errors.push('Credibility citations must be a non-negative number');
      }

      if (entry.credibility.sourceRank && !['Q1', 'Q2', 'Q3', 'Q4'].includes(entry.credibility.sourceRank)) {
        errors.push(`Invalid sourceRank '${entry.credibility.sourceRank}'. Must be one of: Q1, Q2, Q3, Q4`);
      }
    }

    // relevanceバリデーション
    if (entry.relevance) {
      if (!Array.isArray(entry.relevance.categories) || entry.relevance.categories.length === 0) {
        errors.push('Relevance categories must be a non-empty array');
      }

      if (entry.relevance.keywords && !Array.isArray(entry.relevance.keywords)) {
        errors.push('Relevance keywords must be an array');
      }

      if (entry.relevance.relatedEntries && !Array.isArray(entry.relevance.relatedEntries)) {
        errors.push('Relevance relatedEntries must be an array');
      }

      // Validate related entry IDs
      if (entry.relevance.relatedEntries) {
        for (const relatedId of entry.relevance.relatedEntries) {
          if (!/^[a-z0-9-]+$/.test(relatedId)) {
            errors.push(`Invalid related entry ID '${relatedId}'. Must match pattern: ^[a-z0-9-]+$`);
          }
        }
      }
    }

    // embeddingバリデーション
    if (entry.embedding !== null && entry.embedding !== undefined) {
      if (!Array.isArray(entry.embedding)) {
        errors.push('Embedding must be an array or null');
      } else if (entry.embedding.some(v => typeof v !== 'number')) {
        errors.push('All embedding values must be numbers');
      }
    }

    // metadataバリデーション
    if (entry.metadata) {
      if (entry.metadata.version && (typeof entry.metadata.version !== 'number' || entry.metadata.version < 1)) {
        errors.push('Metadata version must be a number >= 1');
      }

      if (entry.metadata.status && !['active', 'archived', 'pending-review'].includes(entry.metadata.status)) {
        errors.push(
          `Invalid metadata status '${entry.metadata.status}'. Must be one of: active, archived, pending-review`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * バリデートして例外を投げる
   * @param {Object} entry - バリデート対象
   * @throws {ValidationError} バリデーション失敗時
   */
  static validateOrThrow(entry) {
    const result = this.validate(entry);
    if (!result.valid) {
      throw new ValidationError(result.errors);
    }
  }

  /**
   * URL妥当性チェック
   * @param {string} url - チェック対象URL
   * @returns {boolean} 妥当性
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * スキーマを取得
   * @returns {Object} JSON Schema
   */
  static getSchema() {
    return schema;
  }
}

/**
 * デフォルトエクスポート
 */
export default KnowledgeEntryValidator;
