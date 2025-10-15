import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/Logger.js';

const logger = new Logger('EmbeddingService');

/**
 * EmbeddingService - テキストベクトル埋め込み生成サービス
 *
 * OpenAI と Gemini の埋め込みモデルを統合し、
 * バッチ処理、キャッシング、コスト最適化を提供します。
 *
 * @class
 * @example
 * const service = new EmbeddingService();
 * await service.initialize();
 * const embedding = await service.generateEmbedding('Brand Builder Knowledge System');
 */
export class EmbeddingService {
  /**
   * EmbeddingService コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {string} [options.provider='gemini'] - 埋め込みプロバイダー ('gemini' | 'openai')
   * @param {string} [options.model='text-embedding-004'] - Gemini モデル名
   * @param {number} [options.dimension=768] - 埋め込み次元数
   * @param {boolean} [options.enableCache=true] - キャッシュ有効化
   * @param {number} [options.cacheTTL=86400000] - キャッシュ有効期限 (ミリ秒, デフォルト 24 時間)
   * @param {number} [options.batchSize=100] - バッチサイズ
   */
  constructor(options = {}) {
    this.config = {
      provider: options.provider || process.env.EMBEDDING_PROVIDER || 'gemini',
      model: options.model || process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
      dimension: options.dimension || parseInt(process.env.EMBEDDING_DIMENSION) || 768,
      enableCache: options.enableCache !== false,
      cacheTTL: options.cacheTTL || 86400000, // 24 hours
      batchSize: options.batchSize || 100
    };

    this.geminiClient = null;
    this.cache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
    this.initialized = false;
  }

  /**
   * 初期化
   *
   * @async
   * @throws {Error} 初期化エラー
   */
  async initialize() {
    try {
      logger.info('Initializing EmbeddingService...');

      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY environment variable is required');
      }

      // Gemini Client 初期化
      this.geminiClient = new GoogleGenerativeAI(apiKey);

      // 接続テスト
      await this._testConnection();

      this.initialized = true;
      logger.info(`EmbeddingService initialized (provider: ${this.config.provider}, dimension: ${this.config.dimension})`);

      return true;
    } catch (error) {
      logger.error('Failed to initialize EmbeddingService:', error);
      throw new Error(`EmbeddingService initialization failed: ${error.message}`);
    }
  }

  /**
   * 単一テキストの埋め込み生成
   *
   * @async
   * @param {string} text - テキスト
   * @param {Object} [options] - オプション
   * @param {string} [options.taskType='RETRIEVAL_DOCUMENT'] - タスクタイプ
   * @param {string} [options.title] - ドキュメントタイトル（オプション）
   * @returns {Promise<Array<number>>} 埋め込みベクトル
   */
  async generateEmbedding(text, options = {}) {
    this._ensureInitialized();

    const startTime = Date.now();
    this.cacheStats.totalRequests++;

    try {
      // キャッシュチェック
      if (this.config.enableCache) {
        const cached = this._getFromCache(text);
        if (cached) {
          this.cacheStats.hits++;
          logger.debug(`Cache hit (${this._getCacheHitRate().toFixed(1)}% hit rate)`);
          return cached;
        }
        this.cacheStats.misses++;
      }

      // 埋め込み生成
      const embedding = await this._generateEmbeddingInternal(text, options);

      // キャッシュ保存
      if (this.config.enableCache) {
        this._saveToCache(text, embedding);
      }

      const duration = Date.now() - startTime;
      logger.info(`Generated embedding in ${duration}ms (dimension: ${embedding.length})`);

      return embedding;
    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * バッチテキストの埋め込み生成
   *
   * @async
   * @param {Array<string>} texts - テキストリスト
   * @param {Object} [options] - オプション
   * @returns {Promise<Array<Array<number>>>} 埋め込みベクトルリスト
   */
  async generateBatchEmbeddings(texts, options = {}) {
    this._ensureInitialized();

    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('texts must be a non-empty array');
    }

    const startTime = Date.now();
    logger.info(`Generating batch embeddings (${texts.length} texts, batch size: ${this.config.batchSize})`);

    try {
      const embeddings = [];
      const batches = this._splitIntoBatches(texts, this.config.batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        logger.debug(`Processing batch ${i + 1}/${batches.length} (${batch.length} texts)`);

        // バッチ内の各テキストを処理
        const batchEmbeddings = await Promise.all(
          batch.map(text => this.generateEmbedding(text, options))
        );

        embeddings.push(...batchEmbeddings);

        // レート制限対策（最後のバッチ以外は待機）
        if (i < batches.length - 1) {
          await this._sleep(100);
        }
      }

      const duration = Date.now() - startTime;
      const avgTime = (duration / texts.length).toFixed(1);
      logger.info(`Batch embeddings completed in ${duration}ms (${avgTime}ms per text, ${this._getCacheHitRate().toFixed(1)}% cache hit rate)`);

      return embeddings;
    } catch (error) {
      logger.error('Failed to generate batch embeddings:', error);
      throw error;
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache() {
    this.cache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
    logger.info('Cache cleared');
  }

  /**
   * キャッシュ統計取得
   *
   * @returns {Object} キャッシュ統計
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this._getCacheHitRate(),
      cacheSize: this.cache.size
    };
  }

  /**
   * 内部：埋め込み生成
   *
   * @private
   * @async
   * @param {string} text - テキスト
   * @param {Object} options - オプション
   * @returns {Promise<Array<number>>} 埋め込みベクトル
   */
  async _generateEmbeddingInternal(text, options = {}) {
    const taskType = options.taskType || 'RETRIEVAL_DOCUMENT';
    const title = options.title || undefined;

    try {
      // Gemini Embeddings API 呼び出し
      const model = this.geminiClient.getGenerativeModel({
        model: this.config.model
      });

      const result = await model.embedContent({
        content: { parts: [{ text }] },
        taskType,
        title
      });

      const embedding = result.embedding.values;

      // 次元数検証
      if (embedding.length !== this.config.dimension) {
        logger.warn(`Expected dimension ${this.config.dimension}, got ${embedding.length}`);
      }

      return embedding;
    } catch (error) {
      logger.error('Gemini embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * 接続テスト
   *
   * @private
   * @async
   */
  async _testConnection() {
    try {
      const testEmbedding = await this._generateEmbeddingInternal('test connection', {
        taskType: 'RETRIEVAL_DOCUMENT'
      });

      if (!Array.isArray(testEmbedding) || testEmbedding.length === 0) {
        throw new Error('Invalid embedding response');
      }

      logger.info(`Connection test successful (dimension: ${testEmbedding.length})`);
    } catch (error) {
      logger.error('Connection test failed:', error);
      throw error;
    }
  }

  /**
   * キャッシュキー生成
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string} キャッシュキー
   */
  _getCacheKey(text) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${hash}_${text.length}`;
  }

  /**
   * キャッシュから取得
   *
   * @private
   * @param {string} text - テキスト
   * @returns {Array<number>|null} 埋め込みベクトルまたは null
   */
  _getFromCache(text) {
    const key = this._getCacheKey(text);
    const cached = this.cache.get(key);

    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this.config.cacheTTL) {
        return cached.embedding;
      } else {
        // 期限切れ
        this.cache.delete(key);
      }
    }

    return null;
  }

  /**
   * キャッシュに保存
   *
   * @private
   * @param {string} text - テキスト
   * @param {Array<number>} embedding - 埋め込みベクトル
   */
  _saveToCache(text, embedding) {
    const key = this._getCacheKey(text);
    this.cache.set(key, {
      embedding,
      timestamp: Date.now()
    });
  }

  /**
   * キャッシュヒット率計算
   *
   * @private
   * @returns {number} ヒット率 (0-100)
   */
  _getCacheHitRate() {
    if (this.cacheStats.totalRequests === 0) return 0;
    return (this.cacheStats.hits / this.cacheStats.totalRequests) * 100;
  }

  /**
   * バッチ分割
   *
   * @private
   * @param {Array} array - 配列
   * @param {number} batchSize - バッチサイズ
   * @returns {Array<Array>} バッチリスト
   */
  _splitIntoBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * スリープ
   *
   * @private
   * @param {number} ms - ミリ秒
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 初期化確認
   *
   * @private
   * @throws {Error} 未初期化エラー
   */
  _ensureInitialized() {
    if (!this.initialized || !this.geminiClient) {
      throw new Error('EmbeddingService not initialized. Call initialize() first.');
    }
  }

  /**
   * サービス終了
   *
   * @async
   */
  async close() {
    if (this.initialized) {
      this.clearCache();
      this.geminiClient = null;
      this.initialized = false;
      logger.info('EmbeddingService closed');
    }
  }
}

export default EmbeddingService;
