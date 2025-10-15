import { ChromaClient } from 'chromadb';
import { Logger } from '../utils/Logger.js';
import { EmbeddingService } from './EmbeddingService.js';

const logger = new Logger('VectorDB');

/**
 * VectorDB - Chroma DB クライアントラッパー
 *
 * Brand Builder Knowledge System のベクトルデータベース管理を提供します。
 *
 * @class
 * @example
 * const vectorDB = new VectorDB();
 * await vectorDB.initialize();
 * await vectorDB.addDocuments('knowledge', documents, embeddings, metadata);
 */
export class VectorDB {
  /**
   * VectorDB コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {string} [options.host='localhost'] - Chroma DB ホスト
   * @param {number} [options.port=8000] - Chroma DB ポート
   * @param {string} [options.path='./chroma_db'] - データベースパス
   */
  constructor(options = {}) {
    this.config = {
      host: options.host || process.env.CHROMA_HOST || 'localhost',
      port: options.port || parseInt(process.env.CHROMA_PORT) || 8000,
      path: options.path || process.env.CHROMA_PATH || './chroma_db',
      useEmbeddingService: options.useEmbeddingService !== false
    };

    this.client = null;
    this.collections = new Map();
    this.embeddingService = null;
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
      logger.info('Initializing VectorDB...');

      // Chroma Client 初期化
      // ローカルファイルベースの場合は引数なしで初期化
      this.client = new ChromaClient();

      // ヘルスチェック
      const heartbeat = await this.client.heartbeat();
      logger.info('Chroma DB heartbeat:', heartbeat);

      // EmbeddingService 初期化
      if (this.config.useEmbeddingService) {
        this.embeddingService = new EmbeddingService();
        await this.embeddingService.initialize();
        logger.info('EmbeddingService integrated');
      }

      this.initialized = true;
      logger.info('VectorDB initialized successfully');

      return true;
    } catch (error) {
      logger.error('Failed to initialize VectorDB:', error);
      throw new Error(`VectorDB initialization failed: ${error.message}`);
    }
  }

  /**
   * コレクション取得または作成
   *
   * @async
   * @param {string} name - コレクション名
   * @param {Object} [metadata] - コレクションメタデータ
   * @returns {Promise<Object>} コレクションオブジェクト
   */
  async getOrCreateCollection(name, metadata = {}) {
    this._ensureInitialized();

    try {
      // キャッシュチェック
      if (this.collections.has(name)) {
        return this.collections.get(name);
      }

      // コレクション取得または作成
      const collection = await this.client.getOrCreateCollection({
        name,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString()
        }
      });

      this.collections.set(name, collection);
      logger.info(`Collection '${name}' ready`);

      return collection;
    } catch (error) {
      logger.error(`Failed to get/create collection '${name}':`, error);
      throw error;
    }
  }

  /**
   * ドキュメント追加
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {Array<string>} ids - ドキュメント ID リスト
   * @param {Array<Array<number>>} embeddings - ベクトル埋め込みリスト
   * @param {Array<Object>} [metadatas] - メタデータリスト
   * @param {Array<string>} [documents] - ドキュメントテキストリスト
   * @returns {Promise<boolean>} 成功フラグ
   */
  async addDocuments(collectionName, ids, embeddings, metadatas = null, documents = null) {
    this._ensureInitialized();

    try {
      const collection = await this.getOrCreateCollection(collectionName);

      await collection.add({
        ids,
        embeddings,
        metadatas,
        documents
      });

      logger.info(`Added ${ids.length} documents to '${collectionName}'`);
      return true;
    } catch (error) {
      logger.error(`Failed to add documents to '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * ベクトル検索
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {Array<number>} queryEmbedding - クエリベクトル
   * @param {number} [nResults=10] - 取得件数
   * @param {Object} [where] - フィルタ条件
   * @returns {Promise<Object>} 検索結果
   */
  async query(collectionName, queryEmbedding, nResults = 10, where = null) {
    this._ensureInitialized();

    const startTime = Date.now();

    try {
      const collection = await this.getOrCreateCollection(collectionName);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where
      });

      const duration = Date.now() - startTime;
      logger.info(`Query completed in ${duration}ms (${nResults} results)`);

      return {
        ids: results.ids[0],
        distances: results.distances[0],
        metadatas: results.metadatas[0],
        documents: results.documents[0],
        duration
      };
    } catch (error) {
      logger.error(`Query failed on '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * ドキュメント更新
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {Array<string>} ids - ドキュメント ID リスト
   * @param {Array<Array<number>>} embeddings - 新しいベクトル埋め込み
   * @param {Array<Object>} [metadatas] - 新しいメタデータ
   * @param {Array<string>} [documents] - 新しいドキュメントテキスト
   * @returns {Promise<boolean>} 成功フラグ
   */
  async updateDocuments(collectionName, ids, embeddings, metadatas = null, documents = null) {
    this._ensureInitialized();

    try {
      const collection = await this.getOrCreateCollection(collectionName);

      await collection.update({
        ids,
        embeddings,
        metadatas,
        documents
      });

      logger.info(`Updated ${ids.length} documents in '${collectionName}'`);
      return true;
    } catch (error) {
      logger.error(`Failed to update documents in '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * ドキュメント削除
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {Array<string>} ids - 削除するドキュメント ID リスト
   * @returns {Promise<boolean>} 成功フラグ
   */
  async deleteDocuments(collectionName, ids) {
    this._ensureInitialized();

    try {
      const collection = await this.getOrCreateCollection(collectionName);

      await collection.delete({
        ids
      });

      logger.info(`Deleted ${ids.length} documents from '${collectionName}'`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete documents from '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * コレクション削除
   *
   * @async
   * @param {string} name - コレクション名
   * @returns {Promise<boolean>} 成功フラグ
   */
  async deleteCollection(name) {
    this._ensureInitialized();

    try {
      await this.client.deleteCollection({ name });
      this.collections.delete(name);

      logger.info(`Collection '${name}' deleted`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete collection '${name}':`, error);
      throw error;
    }
  }

  /**
   * 全コレクション一覧取得
   *
   * @async
   * @returns {Promise<Array<Object>>} コレクションリスト
   */
  async listCollections() {
    this._ensureInitialized();

    try {
      const collections = await this.client.listCollections();
      return collections;
    } catch (error) {
      logger.error('Failed to list collections:', error);
      throw error;
    }
  }

  /**
   * コレクション情報取得
   *
   * @async
   * @param {string} name - コレクション名
   * @returns {Promise<Object>} コレクション情報
   */
  async getCollectionInfo(name) {
    this._ensureInitialized();

    try {
      const collection = await this.getOrCreateCollection(name);
      const count = await collection.count();

      return {
        name,
        count,
        metadata: collection.metadata
      };
    } catch (error) {
      logger.error(`Failed to get info for '${name}':`, error);
      throw error;
    }
  }

  /**
   * ヘルスチェック
   *
   * @async
   * @returns {Promise<Object>} ヘルス状態
   */
  async healthCheck() {
    try {
      const heartbeat = await this.client.heartbeat();
      const collections = await this.listCollections();

      return {
        status: 'healthy',
        heartbeat,
        collectionsCount: collections.length,
        initialized: this.initialized
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        initialized: this.initialized
      };
    }
  }

  /**
   * 初期化確認
   *
   * @private
   * @throws {Error} 未初期化エラー
   */
  _ensureInitialized() {
    if (!this.initialized || !this.client) {
      throw new Error('VectorDB not initialized. Call initialize() first.');
    }
  }

  /**
   * テキストから埋め込みベクトル生成
   *
   * @async
   * @param {string} text - テキスト
   * @param {Object} [options] - オプション
   * @returns {Promise<Array<number>>} 埋め込みベクトル
   */
  async generateEmbedding(text, options = {}) {
    this._ensureInitialized();

    if (!this.embeddingService) {
      throw new Error('EmbeddingService is not enabled. Initialize VectorDB with useEmbeddingService: true');
    }

    return await this.embeddingService.generateEmbedding(text, options);
  }

  /**
   * 複数テキストから埋め込みベクトル生成（バッチ処理）
   *
   * @async
   * @param {Array<string>} texts - テキストリスト
   * @param {Object} [options] - オプション
   * @returns {Promise<Array<Array<number>>>} 埋め込みベクトルリスト
   */
  async generateBatchEmbeddings(texts, options = {}) {
    this._ensureInitialized();

    if (!this.embeddingService) {
      throw new Error('EmbeddingService is not enabled. Initialize VectorDB with useEmbeddingService: true');
    }

    return await this.embeddingService.generateBatchEmbeddings(texts, options);
  }

  /**
   * テキスト付きドキュメント追加（自動埋め込み生成）
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {Array<string>} ids - ドキュメント ID リスト
   * @param {Array<string>} documents - ドキュメントテキストリスト
   * @param {Array<Object>} [metadatas] - メタデータリスト
   * @returns {Promise<boolean>} 成功フラグ
   */
  async addDocumentsWithText(collectionName, ids, documents, metadatas = null) {
    this._ensureInitialized();

    if (!this.embeddingService) {
      throw new Error('EmbeddingService is not enabled. Initialize VectorDB with useEmbeddingService: true');
    }

    try {
      // 埋め込みベクトル自動生成
      logger.info(`Generating embeddings for ${documents.length} documents...`);
      const embeddings = await this.embeddingService.generateBatchEmbeddings(documents, {
        taskType: 'RETRIEVAL_DOCUMENT'
      });

      // ドキュメント追加
      await this.addDocuments(collectionName, ids, embeddings, metadatas, documents);

      // キャッシュ統計ログ
      const cacheStats = this.embeddingService.getCacheStats();
      logger.info(`Cache stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses (${cacheStats.hitRate.toFixed(1)}% hit rate)`);

      return true;
    } catch (error) {
      logger.error(`Failed to add documents with text to '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * テキストクエリによる検索（自動埋め込み生成）
   *
   * @async
   * @param {string} collectionName - コレクション名
   * @param {string} queryText - クエリテキスト
   * @param {number} [nResults=10] - 取得件数
   * @param {Object} [where] - フィルタ条件
   * @returns {Promise<Object>} 検索結果
   */
  async queryByText(collectionName, queryText, nResults = 10, where = null) {
    this._ensureInitialized();

    if (!this.embeddingService) {
      throw new Error('EmbeddingService is not enabled. Initialize VectorDB with useEmbeddingService: true');
    }

    try {
      // クエリ埋め込み生成
      const queryEmbedding = await this.embeddingService.generateEmbedding(queryText, {
        taskType: 'RETRIEVAL_QUERY'
      });

      // ベクトル検索実行
      return await this.query(collectionName, queryEmbedding, nResults, where);
    } catch (error) {
      logger.error(`Query by text failed on '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * EmbeddingService のキャッシュ統計取得
   *
   * @returns {Object|null} キャッシュ統計
   */
  getEmbeddingCacheStats() {
    if (!this.embeddingService) {
      return null;
    }
    return this.embeddingService.getCacheStats();
  }

  /**
   * クライアント終了
   *
   * @async
   */
  async close() {
    if (this.client) {
      this.collections.clear();

      if (this.embeddingService) {
        await this.embeddingService.close();
        this.embeddingService = null;
      }

      this.client = null;
      this.initialized = false;
      logger.info('VectorDB connection closed');
    }
  }
}

export default VectorDB;
