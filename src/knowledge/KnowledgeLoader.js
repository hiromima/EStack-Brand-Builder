/**
 * KnowledgeLoader - ナレッジベース管理システム
 *
 * atlas-knowledge-base の動的ロードと参照機能
 * AGENTS.md v5.0 の知識永続化レイヤーに対応
 *
 * @module KnowledgeLoader
 * @version 1.0.0
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

/**
 * ナレッジカテゴリ
 * @enum {string}
 */
export const KnowledgeCategory = {
  BRAND_PRINCIPLES: 'Brand_Principles',
  CORE_METHODS: 'Core_Methods',
  SYSTEM_PROTOCOLS: 'System_Protocols',
  STRATEGIC_FRAMEWORKS: 'Strategic_Frameworks',
  TEMPLATES: 'Templates',
  EXTERNAL_REFERENCES: 'External_References',
  CASES: 'Cases'
};

/**
 * KnowledgeLoader クラス
 *
 * ナレッジベースの読み込みとキャッシュ管理
 */
export class KnowledgeLoader {
  /**
   * @param {Object} config - 設定
   * @param {string} config.knowledgeBasePath - ナレッジベースのパス
   * @param {Object} config.logger - ロガー
   * @param {boolean} [config.enableCache] - キャッシュ有効化
   */
  constructor(config) {
    this.knowledgeBasePath = config.knowledgeBasePath || join(process.cwd(), 'atlas-knowledge-base');
    this.logger = config.logger;
    this.enableCache = config.enableCache !== false;
    this.cache = new Map();
    this.metadata = {
      loadedAt: null,
      fileCount: 0,
      categories: {}
    };
  }

  /**
   * ナレッジベース初期化
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger.info('ナレッジベース初期化開始', {
      path: this.knowledgeBasePath
    });

    if (!existsSync(this.knowledgeBasePath)) {
      throw new Error(`ナレッジベースが見つかりません: ${this.knowledgeBasePath}`);
    }

    // コアナレッジの読み込み
    await this._loadCoreKnowledge();

    this.metadata.loadedAt = new Date().toISOString();

    this.logger.info('ナレッジベース初期化完了', {
      fileCount: this.metadata.fileCount,
      categories: Object.keys(this.metadata.categories)
    });
  }

  /**
   * コアナレッジ読み込み
   *
   * @private
   */
  async _loadCoreKnowledge() {
    const categories = Object.values(KnowledgeCategory);

    for (const category of categories) {
      const categoryPath = join(this.knowledgeBasePath, category);

      if (existsSync(categoryPath)) {
        const files = await this._loadCategory(category, categoryPath);
        this.metadata.categories[category] = files.length;
        this.metadata.fileCount += files.length;
      }
    }
  }

  /**
   * カテゴリ読み込み
   *
   * @private
   * @param {string} category - カテゴリ名
   * @param {string} categoryPath - カテゴリパス
   * @returns {Promise<string[]>} 読み込んだファイル名の配列
   */
  async _loadCategory(category, categoryPath) {
    const files = await readdir(categoryPath);
    const mdFiles = files.filter(file => extname(file) === '.md');

    const loadedFiles = [];

    for (const file of mdFiles) {
      const filePath = join(categoryPath, file);
      const stats = await stat(filePath);

      if (stats.isFile()) {
        const content = await readFile(filePath, 'utf-8');
        const key = `${category}/${basename(file, '.md')}`;

        if (this.enableCache) {
          this.cache.set(key, {
            content,
            category,
            filename: file,
            loadedAt: new Date().toISOString(),
            size: stats.size
          });
        }

        loadedFiles.push(file);
        this.logger.debug(`ナレッジ読み込み: ${key}`);
      }
    }

    return loadedFiles;
  }

  /**
   * ナレッジ取得
   *
   * @param {string} key - ナレッジキー (例: "Core_Methods/EStack_Method_Guide_v5.1")
   * @returns {Promise<Object|null>} ナレッジデータ
   */
  async get(key) {
    // キャッシュチェック
    if (this.enableCache && this.cache.has(key)) {
      this.logger.debug(`キャッシュヒット: ${key}`);
      return this.cache.get(key);
    }

    // ファイルから直接読み込み
    const [category, filename] = key.split('/');
    const filePath = join(this.knowledgeBasePath, category, `${filename}.md`);

    if (!existsSync(filePath)) {
      this.logger.warn(`ナレッジが見つかりません: ${key}`);
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    const stats = await stat(filePath);

    const data = {
      content,
      category,
      filename: `${filename}.md`,
      loadedAt: new Date().toISOString(),
      size: stats.size
    };

    if (this.enableCache) {
      this.cache.set(key, data);
    }

    return data;
  }

  /**
   * カテゴリ内のナレッジ一覧取得
   *
   * @param {KnowledgeCategory} category - カテゴリ
   * @returns {Promise<string[]>} ナレッジキーの配列
   */
  async listByCategory(category) {
    const keys = [];

    for (const [key, data] of this.cache.entries()) {
      if (data.category === category) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * E:Stack Method Guide 取得
   *
   * @returns {Promise<Object>} E:Stack Method Guide
   */
  async getEStackMethodGuide() {
    return await this.get('Core_Methods/EStack_Method_Guide_v5.1');
  }

  /**
   * Brand Principles Atlas 取得
   *
   * @returns {Promise<Object>} Brand Principles Atlas
   */
  async getBrandPrinciplesAtlas() {
    return await this.get('Brand_Principles/Brand_Principles_Atlas_v1.1');
  }

  /**
   * RSI Protocol 取得
   *
   * @returns {Promise<Object>} RSI Protocol
   */
  async getRSIProtocol() {
    return await this.get('System_Protocols/RSI_Protocol_v1.1');
  }

  /**
   * IAF Engine 取得
   *
   * @returns {Promise<Object>} IAF Engine
   */
  async getIAFEngine() {
    return await this.get('System_Protocols/IAF_Engine_Full');
  }

  /**
   * キャッシュクリア
   */
  clearCache() {
    this.cache.clear();
    this.logger.info('ナレッジキャッシュをクリアしました');
  }

  /**
   * ナレッジ再読み込み
   *
   * @returns {Promise<void>}
   */
  async reload() {
    this.clearCache();
    this.metadata = {
      loadedAt: null,
      fileCount: 0,
      categories: {}
    };
    await this.initialize();
  }

  /**
   * メタデータ取得
   *
   * @returns {Object} メタデータ
   */
  getMetadata() {
    return {
      ...this.metadata,
      cacheSize: this.cache.size,
      cacheEnabled: this.enableCache
    };
  }

  /**
   * 検索 (簡易版)
   *
   * @param {string} query - 検索クエリ
   * @returns {Promise<Object[]>} 検索結果
   */
  async search(query) {
    const results = [];

    for (const [key, data] of this.cache.entries()) {
      if (data.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          key,
          category: data.category,
          filename: data.filename,
          excerpt: this._extractExcerpt(data.content, query)
        });
      }
    }

    this.logger.info(`検索完了: "${query}" - ${results.length} 件ヒット`);

    return results;
  }

  /**
   * 抜粋抽出
   *
   * @private
   * @param {string} content - コンテンツ
   * @param {string} query - クエリ
   * @returns {string} 抜粋
   */
  _extractExcerpt(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 100);

    return `...${  content.substring(start, end)  }...`;
  }
}

export default KnowledgeLoader;
