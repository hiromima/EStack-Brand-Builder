/**
 * @file KnowledgeManager.js
 * @description 統合 Knowledge Manager - Vector Store と Knowledge Graph を統合管理
 * @version 1.0.0
 */

import { VectorStore } from './VectorStoreChroma.js';
import { KnowledgeGraph } from './KnowledgeGraph.js';
// import { KnowledgeEntry } from '../models/KnowledgeEntry.js';

/**
 * Knowledge Manager クラス
 * Vector Store と Knowledge Graph を統合して管理
 */
export class KnowledgeManager {
  /**
   * @param {Object} options - 設定オプション
   * @param {Object} [options.vectorStore] - VectorStore オプション
   * @param {Object} [options.knowledgeGraph] - KnowledgeGraph オプション
   */
  constructor(options = {}) {
    this.vectorStore = new VectorStore(options.vectorStore);
    this.knowledgeGraph = new KnowledgeGraph(options.knowledgeGraph);
    this.initialized = false;
  }

  /**
   * 初期化
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.vectorStore.initialize(),
        this.knowledgeGraph.initialize()
      ]);

      this.initialized = true;
      console.log('✅ KnowledgeManager initialized');
    } catch (error) {
      console.error('❌ KnowledgeManager initialization failed:', error.message);
      throw new Error(`Failed to initialize KnowledgeManager: ${error.message}`);
    }
  }

  /**
   * エントリを追加（Vector Store + Knowledge Graph）
   * @param {KnowledgeEntry} entry - 追加するエントリ
   * @returns {Promise<void>}
   */
  async addEntry(entry) {
    await this.initialize();

    try {
      // 並列で両方に追加
      await Promise.all([
        this.vectorStore.addEntry(entry),
        this.knowledgeGraph.addEntry(entry)
      ]);

      console.log(`✅ Entry added to Knowledge Base: ${entry.id}`);
    } catch (error) {
      console.error(`❌ Failed to add entry ${entry.id}:`, error.message);
      throw new Error(`Failed to add entry: ${error.message}`);
    }
  }

  /**
   * 複数エントリを一括追加
   * @param {KnowledgeEntry[]} entries - エントリ配列
   * @returns {Promise<void>}
   */
  async addEntries(entries) {
    await this.initialize();

    try {
      // バッチ処理で追加
      await Promise.all([
        this.vectorStore.addEntries(entries),
        this.knowledgeGraph.addEntries(entries)
      ]);

      console.log(`✅ ${entries.length} entries added to Knowledge Base`);
    } catch (error) {
      console.error('❌ Batch add failed:', error.message);
      throw new Error(`Failed to add entries: ${error.message}`);
    }
  }

  /**
   * エントリを更新
   * @param {KnowledgeEntry} entry - 更新するエントリ
   * @returns {Promise<void>}
   */
  async updateEntry(entry) {
    await this.initialize();

    try {
      // 並列で両方を更新
      await Promise.all([
        this.vectorStore.updateEntry(entry),
        this.knowledgeGraph.updateEntry(entry)
      ]);

      console.log(`✅ Entry updated in Knowledge Base: ${entry.id}`);
    } catch (error) {
      console.error(`❌ Failed to update entry ${entry.id}:`, error.message);
      throw new Error(`Failed to update entry: ${error.message}`);
    }
  }

  /**
   * エントリを削除
   * @param {string} id - 削除するエントリID
   * @returns {Promise<void>}
   */
  async deleteEntry(id) {
    await this.initialize();

    try {
      // 並列で両方から削除
      await Promise.all([
        this.vectorStore.deleteEntry(id),
        this.knowledgeGraph.deleteEntry(id)
      ]);

      console.log(`✅ Entry deleted from Knowledge Base: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to delete entry ${id}:`, error.message);
      throw new Error(`Failed to delete entry: ${error.message}`);
    }
  }

  /**
   * 複数エントリを削除
   * @param {string[]} ids - 削除するエントリIDの配列
   * @returns {Promise<void>}
   */
  async deleteEntries(ids) {
    await this.initialize();

    try {
      // バッチ処理で削除
      await Promise.all([
        this.vectorStore.deleteEntries(ids),
        this.knowledgeGraph.deleteEntries(ids)
      ]);

      console.log(`✅ ${ids.length} entries deleted from Knowledge Base`);
    } catch (error) {
      console.error('❌ Batch delete failed:', error.message);
      throw new Error(`Failed to delete entries: ${error.message}`);
    }
  }

  /**
   * セマンティック検索
   * @param {string} query - 検索クエリ
   * @param {Object} options - 検索オプション
   * @param {number} [options.topK=10] - 取得する結果数
   * @param {Object} [options.filter] - メタデータフィルタ
   * @returns {Promise<Array>} 検索結果
   */
  async search(query, options = {}) {
    await this.initialize();

    try {
      // Vector Store でセマンティック検索
      const results = await this.vectorStore.semanticSearch(query, options);

      console.log(`✅ Search completed: ${results.length} results found`);
      return results;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * ハイブリッド検索（セマンティック + グラフ探索）
   * @param {string} query - 検索クエリ
   * @param {Object} options - 検索オプション
   * @param {number} [options.topK=10] - 初期取得数
   * @param {boolean} [options.expandGraph=true] - グラフ拡張の有効化
   * @param {number} [options.expansionDepth=1] - グラフ探索の深さ
   * @param {Object} [options.filter] - メタデータフィルタ
   * @returns {Promise<Object>} 検索結果とグラフ情報
   */
  async hybridSearch(query, options = {}) {
    await this.initialize();

    const {
      topK = 10,
      expandGraph = true,
      expansionDepth = 1,
      filter = {}
    } = options;

    try {
      // 1. セマンティック検索
      const semanticResults = await this.vectorStore.semanticSearch(query, {
        topK,
        filter
      });

      if (!expandGraph || semanticResults.length === 0) {
        return {
          semanticResults,
          relatedEntries: [],
          graphExpansion: null
        };
      }

      // 2. トップ結果からグラフを展開
      const topResultIds = semanticResults.slice(0, Math.min(3, semanticResults.length))
        .map(r => r.id);

      // 並列でグラフ探索
      const graphResults = await Promise.all(
        topResultIds.map(id =>
          this.knowledgeGraph.findRelated(id, {
            depth: expansionDepth,
            limit: 5
          })
        )
      );

      // 重複を除去してマージ
      const relatedEntryIds = new Set();
      graphResults.forEach(results => {
        results.forEach(result => relatedEntryIds.add(result.id));
      });

      // セマンティック検索結果に既に含まれているものを除外
      const semanticResultIds = new Set(semanticResults.map(r => r.id));
      const newRelatedIds = Array.from(relatedEntryIds)
        .filter(id => !semanticResultIds.has(id));

      console.log(`✅ Hybrid search completed: ${semanticResults.length} semantic + ${newRelatedIds.length} graph-related`);

      return {
        semanticResults,
        relatedEntryIds: newRelatedIds,
        graphExpansion: {
          depth: expansionDepth,
          sourceIds: topResultIds,
          relatedCount: newRelatedIds.length
        }
      };
    } catch (error) {
      console.error('❌ Hybrid search failed:', error.message);
      throw new Error(`Hybrid search failed: ${error.message}`);
    }
  }

  /**
   * カテゴリ別検索
   * @param {string} category - カテゴリ名
   * @param {Object} options - 検索オプション
   * @returns {Promise<Array>} エントリID配列
   */
  async searchByCategory(category, options = {}) {
    await this.initialize();

    try {
      const results = await this.knowledgeGraph.findByCategory(category, options);
      console.log(`✅ Category search completed: ${results.length} entries found`);
      return results;
    } catch (error) {
      console.error('❌ Category search failed:', error.message);
      throw new Error(`Category search failed: ${error.message}`);
    }
  }

  /**
   * キーワード別検索
   * @param {string} keyword - キーワード
   * @param {Object} options - 検索オプション
   * @returns {Promise<Array>} エントリID配列
   */
  async searchByKeyword(keyword, options = {}) {
    await this.initialize();

    try {
      const results = await this.knowledgeGraph.findByKeyword(keyword, options);
      console.log(`✅ Keyword search completed: ${results.length} entries found`);
      return results;
    } catch (error) {
      console.error('❌ Keyword search failed:', error.message);
      throw new Error(`Keyword search failed: ${error.message}`);
    }
  }

  /**
   * 関連エントリを取得
   * @param {string} entryId - エントリID
   * @param {Object} options - 検索オプション
   * @returns {Promise<Array>} 関連エントリID配列
   */
  async getRelatedEntries(entryId, options = {}) {
    await this.initialize();

    try {
      const results = await this.knowledgeGraph.findRelated(entryId, options);
      console.log(`✅ Found ${results.length} related entries for ${entryId}`);
      return results;
    } catch (error) {
      console.error('❌ Failed to get related entries:', error.message);
      throw new Error(`Failed to get related entries: ${error.message}`);
    }
  }

  /**
   * 統計情報を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    await this.initialize();

    try {
      const [vectorStats, graphStats] = await Promise.all([
        this.vectorStore.getStats(),
        this.knowledgeGraph.getStats()
      ]);

      return {
        vectorStore: vectorStats,
        knowledgeGraph: graphStats,
        synchronized: vectorStats.totalVectors === graphStats.totalEntries
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error.message);
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * 接続テスト
   * @returns {Promise<boolean>} 接続成功の可否
   */
  async testConnection() {
    try {
      await this.initialize();

      const [vectorTest, graphTest] = await Promise.all([
        this.vectorStore.testConnection(),
        this.knowledgeGraph.testConnection()
      ]);

      if (vectorTest && graphTest) {
        console.log('✅ KnowledgeManager connection test successful');
        const stats = await this.getStats();
        console.log('   Vector Store:', stats.vectorStore.totalVectors, 'vectors');
        console.log('   Knowledge Graph:', stats.knowledgeGraph.totalEntries, 'entries');
        console.log('   Synchronized:', stats.synchronized ? '✅' : '⚠️');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ KnowledgeManager connection test failed:', error.message);
      return false;
    }
  }

  /**
   * 接続を閉じる
   */
  async close() {
    try {
      await this.knowledgeGraph.close();
      console.log('✅ KnowledgeManager connections closed');
    } catch (error) {
      console.error('❌ Failed to close connections:', error.message);
    }
  }
}

/**
 * デフォルトエクスポート
 */
export default KnowledgeManager;
