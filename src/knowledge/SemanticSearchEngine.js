import { Logger } from '../utils/Logger.js';
import { VectorDB } from './VectorDB.js';
import { CitationGraph } from './CitationGraph.js';

const logger = new Logger('SemanticSearchEngine');

/**
 * SemanticSearchEngine - セマンティック検索エンジン
 *
 * ベクトル検索、キーワード検索、引用グラフを統合した
 * 高度なセマンティック検索を提供します。
 *
 * @class
 * @example
 * const engine = new SemanticSearchEngine();
 * await engine.initialize();
 * const results = await engine.search('ブランド戦略', { limit: 10 });
 */
export class SemanticSearchEngine {
  /**
   * SemanticSearchEngine コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {VectorDB} [options.vectorDB] - VectorDB インスタンス
   * @param {CitationGraph} [options.citationGraph] - CitationGraph インスタンス
   * @param {number} [options.vectorWeight=0.7] - ベクトル検索の重み
   * @param {number} [options.citationWeight=0.3] - 引用スコアの重み
   * @param {boolean} [options.enableQueryExpansion=true] - クエリ拡張有効化
   * @param {boolean} [options.enableReranking=true] - 再ランキング有効化
   */
  constructor(options = {}) {
    this.config = {
      vectorWeight: options.vectorWeight || 0.7,
      citationWeight: options.citationWeight || 0.3,
      enableQueryExpansion: options.enableQueryExpansion !== false,
      enableReranking: options.enableReranking !== false
    };

    this.vectorDB = options.vectorDB || null;
    this.citationGraph = options.citationGraph || null;
    this.initialized = false;

    // 検索統計
    this.stats = {
      totalSearches: 0,
      avgDuration: 0,
      cacheHitRate: 0
    };
  }

  /**
   * 初期化
   *
   * @async
   * @throws {Error} 初期化エラー
   */
  async initialize() {
    try {
      logger.info('Initializing SemanticSearchEngine...');

      // VectorDB 初期化
      if (!this.vectorDB) {
        this.vectorDB = new VectorDB({ useEmbeddingService: true });
        await this.vectorDB.initialize();
      }

      // CitationGraph 初期化
      if (!this.citationGraph) {
        this.citationGraph = new CitationGraph();
      }

      this.initialized = true;
      logger.info('SemanticSearchEngine initialized successfully');

      return true;
    } catch (error) {
      logger.error('Failed to initialize SemanticSearchEngine:', error);
      throw new Error(`SemanticSearchEngine initialization failed: ${error.message}`);
    }
  }

  /**
   * セマンティック検索
   *
   * @async
   * @param {string} query - 検索クエリ
   * @param {Object} [options={}] - 検索オプション
   * @param {string} [options.collectionName='knowledge_entries'] - コレクション名
   * @param {number} [options.limit=10] - 取得件数
   * @param {Object} [options.filters] - フィルタ条件
   * @param {boolean} [options.includeScore=true] - スコア含める
   * @param {boolean} [options.includeCitations=true] - 引用情報含める
   * @returns {Promise<Object>} 検索結果
   */
  async search(query, options = {}) {
    this._ensureInitialized();

    const startTime = Date.now();
    const collectionName = options.collectionName || 'knowledge_entries';
    const limit = options.limit || 10;

    logger.info(`Searching: "${query}" (limit: ${limit})`);

    try {
      // Step 1: クエリ拡張（オプション）
      let expandedQuery = query;
      if (this.config.enableQueryExpansion) {
        expandedQuery = await this._expandQuery(query);
        logger.debug(`Query expanded: "${query}" -> "${expandedQuery}"`);
      }

      // Step 2: ベクトル検索
      const vectorResults = await this.vectorDB.queryByText(
        collectionName,
        expandedQuery,
        limit * 2, // 再ランキング用に多めに取得
        options.filters
      );

      // Step 3: スコアリング
      const scoredResults = await this._scoreResults(vectorResults, query, options);

      // Step 4: 再ランキング（オプション）
      let finalResults = scoredResults;
      if (this.config.enableReranking) {
        finalResults = await this._rerankResults(scoredResults, query);
      }

      // Step 5: 結果整形
      const formattedResults = this._formatResults(
        finalResults.slice(0, limit),
        options
      );

      const duration = Date.now() - startTime;

      // 統計更新
      this._updateStats(duration);

      logger.info(`Search completed in ${duration}ms (${formattedResults.length} results)`);

      return {
        query: query,
        expandedQuery: expandedQuery !== query ? expandedQuery : undefined,
        results: formattedResults,
        totalFound: vectorResults.ids.length,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * ハイブリッド検索（ベクトル + キーワード）
   *
   * @async
   * @param {string} query - 検索クエリ
   * @param {Object} [options={}] - 検索オプション
   * @returns {Promise<Object>} 検索結果
   */
  async hybridSearch(query, options = {}) {
    this._ensureInitialized();

    const startTime = Date.now();
    logger.info(`Hybrid search: "${query}"`);

    try {
      // ベクトル検索
      const vectorResults = await this.search(query, {
        ...options,
        includeScore: true
      });

      // TODO: キーワード検索実装（将来）
      // const keywordResults = await this._keywordSearch(query, options);

      // TODO: スコア統合
      // const mergedResults = this._mergeResults(vectorResults, keywordResults);

      const duration = Date.now() - startTime;
      logger.info(`Hybrid search completed in ${duration}ms`);

      return vectorResults; // 現在はベクトル検索のみ
    } catch (error) {
      logger.error('Hybrid search failed:', error);
      throw error;
    }
  }

  /**
   * 類似ドキュメント検索
   *
   * @async
   * @param {string} documentId - ドキュメント ID
   * @param {Object} [options={}] - 検索オプション
   * @returns {Promise<Object>} 検索結果
   */
  async findSimilar(documentId, options = {}) {
    this._ensureInitialized();

    logger.info(`Finding similar documents to: ${documentId}`);

    try {
      // TODO: ドキュメント取得とベクトル検索
      // 現在は未実装

      return {
        documentId,
        results: [],
        message: 'findSimilar is not yet implemented'
      };
    } catch (error) {
      logger.error('Find similar failed:', error);
      throw error;
    }
  }

  /**
   * クエリ拡張
   *
   * @private
   * @async
   * @param {string} query - 元クエリ
   * @returns {Promise<string>} 拡張クエリ
   */
  async _expandQuery(query) {
    // シンプルな同義語展開（将来的に AI による拡張を実装）
    const synonyms = {
      'ブランド': 'ブランド ブランディング アイデンティティ',
      '検索': '検索 探索 発見',
      'デザイン': 'デザイン 設計 ビジュアル'
    };

    let expanded = query;
    for (const [word, expansion] of Object.entries(synonyms)) {
      if (query.includes(word)) {
        expanded = expansion;
        break;
      }
    }

    return expanded;
  }

  /**
   * 結果スコアリング
   *
   * @private
   * @async
   * @param {Object} vectorResults - ベクトル検索結果
   * @param {string} query - 検索クエリ
   * @param {Object} options - オプション
   * @returns {Promise<Array<Object>>} スコア付き結果
   */
  async _scoreResults(vectorResults, query, options) {
    const scoredResults = [];

    for (let i = 0; i < vectorResults.ids.length; i++) {
      const id = vectorResults.ids[i];
      const distance = vectorResults.distances[i];
      const document = vectorResults.documents[i];
      const metadata = vectorResults.metadatas[i];

      // ベクトルスコア（距離を類似度に変換: 0-1）
      const vectorScore = Math.max(0, 1 - distance);

      // 引用スコア（CitationGraph から取得）
      let citationScore = 0;
      try {
        const node = this.citationGraph.getNode(id);
        if (node) {
          const influenceScore = this.citationGraph.calculateInfluenceScore(id);
          citationScore = influenceScore / 100; // 0-1 に正規化
        }
      } catch (error) {
        // ノードが存在しない場合はスキップ
        logger.debug(`Node not found in citation graph: ${id}`);
      }

      // 総合スコア計算
      const totalScore = (
        this.config.vectorWeight * vectorScore +
        this.config.citationWeight * citationScore
      );

      scoredResults.push({
        id,
        document,
        metadata,
        scores: {
          vector: vectorScore,
          citation: citationScore,
          total: totalScore
        },
        distance
      });
    }

    // スコアでソート（降順）
    scoredResults.sort((a, b) => b.scores.total - a.scores.total);

    return scoredResults;
  }

  /**
   * 再ランキング
   *
   * @private
   * @async
   * @param {Array<Object>} results - スコア付き結果
   * @param {string} query - 検索クエリ
   * @returns {Promise<Array<Object>>} 再ランキング結果
   */
  async _rerankResults(results, query) {
    // シンプルな再ランキング: 多様性を考慮
    // 将来的に AI による再ランキングを実装

    // 現在は元のスコア順を維持
    return results;
  }

  /**
   * 結果整形
   *
   * @private
   * @param {Array<Object>} results - スコア付き結果
   * @param {Object} options - オプション
   * @returns {Array<Object>} 整形結果
   */
  _formatResults(results, options) {
    return results.map((result, index) => {
      const formatted = {
        rank: index + 1,
        id: result.id,
        document: result.document,
        metadata: result.metadata
      };

      if (options.includeScore !== false) {
        formatted.score = result.scores.total;
        formatted.scoreBreakdown = {
          vector: result.scores.vector.toFixed(4),
          citation: result.scores.citation.toFixed(4)
        };
      }

      if (options.includeCitations !== false) {
        try {
          const incomingEdges = this.citationGraph.getIncomingEdges(result.id);
          formatted.citationCount = incomingEdges.length;
        } catch (error) {
          formatted.citationCount = 0;
        }
      }

      return formatted;
    });
  }

  /**
   * 統計更新
   *
   * @private
   * @param {number} duration - 検索所要時間（ミリ秒）
   */
  _updateStats(duration) {
    this.stats.totalSearches++;
    this.stats.avgDuration = (
      (this.stats.avgDuration * (this.stats.totalSearches - 1) + duration) /
      this.stats.totalSearches
    );

    // キャッシュヒット率取得
    const cacheStats = this.vectorDB.getEmbeddingCacheStats();
    if (cacheStats) {
      this.stats.cacheHitRate = cacheStats.hitRate;
    }
  }

  /**
   * 検索統計取得
   *
   * @returns {Object} 検索統計
   */
  getStatistics() {
    return {
      ...this.stats,
      avgDuration: this.stats.avgDuration.toFixed(2),
      cacheHitRate: this.stats.cacheHitRate.toFixed(1)
    };
  }

  /**
   * 初期化確認
   *
   * @private
   * @throws {Error} 未初期化エラー
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('SemanticSearchEngine not initialized. Call initialize() first.');
    }
  }

  /**
   * サービス終了
   *
   * @async
   */
  async close() {
    if (this.initialized) {
      if (this.vectorDB) {
        await this.vectorDB.close();
      }
      if (this.citationGraph) {
        this.citationGraph.clear();
      }
      this.initialized = false;
      logger.info('SemanticSearchEngine closed');
    }
  }
}

export default SemanticSearchEngine;
