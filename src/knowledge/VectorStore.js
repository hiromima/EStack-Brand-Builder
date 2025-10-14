/**
 * @file VectorStore.js
 * @description Pinecone Vector Database wrapper for semantic search
 * @version 1.0.0
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

/**
 * Vector Store クラス
 */
export class VectorStore {
  /**
   * @param {Object} options - 設定オプション
   * @param {string} [options.indexName='brand-knowledge'] - Pinecone インデックス名
   * @param {string} [options.embeddingModel='text-embedding-3-small'] - Embedding モデル
   * @param {number} [options.dimension=1536] - ベクトル次元数
   */
  constructor(options = {}) {
    this.options = {
      indexName: options.indexName || 'brand-knowledge',
      embeddingModel: options.embeddingModel || 'text-embedding-3-small',
      dimension: options.dimension || 1536,
      ...options
    };

    // Pinecone 初期化
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // OpenAI 初期化
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.index = null;
    this.initialized = false;
  }

  /**
   * 初期化（インデックス取得）
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // インデックス取得
      this.index = this.pinecone.Index(this.options.indexName);
      this.initialized = true;

      console.log(`✅ VectorStore initialized: ${this.options.indexName}`);
    } catch (error) {
      console.error('❌ VectorStore initialization failed:', error.message);
      throw new Error(`Failed to initialize VectorStore: ${error.message}`);
    }
  }

  /**
   * テキストから Embedding を生成
   * @param {string} text - 変換するテキスト
   * @returns {Promise<number[]>} Embedding ベクトル
   */
  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.options.embeddingModel,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Embedding generation failed:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * エントリを Vector Store に追加
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry} entry - 知識エントリ
   * @returns {Promise<void>}
   */
  async addEntry(entry) {
    await this.initialize();

    try {
      // Embedding 生成（まだない場合）
      let embedding = entry.embedding;
      if (!embedding) {
        const searchText = entry.toSearchText();
        embedding = await this.generateEmbedding(searchText);
      }

      // Pinecone に保存
      await this.index.upsert([{
        id: entry.id,
        values: embedding,
        metadata: {
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          categories: entry.relevance.categories,
          keywords: entry.relevance.keywords,
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status,
          addedAt: entry.metadata.addedAt.toISOString(),
          updatedAt: entry.metadata.updatedAt.toISOString()
        }
      }]);

      console.log(`✅ Added entry to VectorStore: ${entry.id}`);
    } catch (error) {
      console.error(`❌ Failed to add entry ${entry.id}:`, error.message);
      throw new Error(`Failed to add entry to VectorStore: ${error.message}`);
    }
  }

  /**
   * 複数のエントリを一括追加
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry[]} entries - エントリ配列
   * @returns {Promise<void>}
   */
  async addEntries(entries) {
    await this.initialize();

    try {
      const vectors = [];

      for (const entry of entries) {
        // Embedding 生成
        let embedding = entry.embedding;
        if (!embedding) {
          const searchText = entry.toSearchText();
          embedding = await this.generateEmbedding(searchText);
        }

        vectors.push({
          id: entry.id,
          values: embedding,
          metadata: entry.toMetadata()
        });
      }

      // バッチアップサート
      await this.index.upsert(vectors);

      console.log(`✅ Added ${entries.length} entries to VectorStore`);
    } catch (error) {
      console.error('❌ Batch add failed:', error.message);
      throw new Error(`Failed to add entries to VectorStore: ${error.message}`);
    }
  }

  /**
   * セマンティック検索
   * @param {string} query - 検索クエリ
   * @param {Object} options - 検索オプション
   * @param {number} [options.topK=10] - 取得する結果数
   * @param {Object} [options.filter] - メタデータフィルタ
   * @param {boolean} [options.includeMetadata=true] - メタデータを含めるか
   * @returns {Promise<Array>} 検索結果
   */
  async semanticSearch(query, options = {}) {
    await this.initialize();

    const {
      topK = 10,
      filter = {},
      includeMetadata = true
    } = options;

    try {
      // クエリの Embedding 生成
      const queryEmbedding = await this.generateEmbedding(query);

      // Pinecone 検索
      const results = await this.index.query({
        vector: queryEmbedding,
        topK,
        filter,
        includeMetadata
      });

      return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      }));
    } catch (error) {
      console.error('❌ Semantic search failed:', error.message);
      throw new Error(`Semantic search failed: ${error.message}`);
    }
  }

  /**
   * IDでエントリを取得
   * @param {string} id - エントリID
   * @returns {Promise<Object|null>} エントリメタデータ
   */
  async getEntry(id) {
    await this.initialize();

    try {
      const result = await this.index.fetch([id]);

      if (!result.records || !result.records[id]) {
        return null;
      }

      return {
        id,
        metadata: result.records[id].metadata
      };
    } catch (error) {
      console.error(`❌ Failed to get entry ${id}:`, error.message);
      throw new Error(`Failed to get entry: ${error.message}`);
    }
  }

  /**
   * エントリを更新
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry} entry - 更新するエントリ
   * @returns {Promise<void>}
   */
  async updateEntry(entry) {
    // Pinecone では upsert が更新も兼ねる
    await this.addEntry(entry);
  }

  /**
   * エントリを削除
   * @param {string} id - 削除するエントリID
   * @returns {Promise<void>}
   */
  async deleteEntry(id) {
    await this.initialize();

    try {
      await this.index.deleteOne(id);
      console.log(`✅ Deleted entry from VectorStore: ${id}`);
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
      await this.index.deleteMany(ids);
      console.log(`✅ Deleted ${ids.length} entries from VectorStore`);
    } catch (error) {
      console.error('❌ Batch delete failed:', error.message);
      throw new Error(`Failed to delete entries: ${error.message}`);
    }
  }

  /**
   * インデックス統計を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    await this.initialize();

    try {
      const stats = await this.index.describeIndexStats();
      return {
        totalVectors: stats.totalRecordCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error.message);
      throw new Error(`Failed to get index stats: ${error.message}`);
    }
  }

  /**
   * 接続テスト
   * @returns {Promise<boolean>} 接続成功の可否
   */
  async testConnection() {
    try {
      await this.initialize();
      const stats = await this.getStats();
      console.log('✅ VectorStore connection test successful');
      console.log(`   Total vectors: ${stats.totalVectors}`);
      console.log(`   Dimension: ${stats.dimension}`);
      return true;
    } catch (error) {
      console.error('❌ VectorStore connection test failed:', error.message);
      return false;
    }
  }
}

/**
 * デフォルトエクスポート
 */
export default VectorStore;
