/**
 * @file VectorStoreChroma.js
 * @description ChromaDB Vector Store wrapper for semantic search (Free, Local)
 * @version 1.0.0
 */

import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';

/**
 * Vector Store クラス (Chroma版)
 */
export class VectorStore {
  /**
   * @param {Object} options - 設定オプション
   * @param {string} [options.collectionName='brand-knowledge'] - Collection名
   * @param {string} [options.embeddingModel='text-embedding-3-small'] - Embedding モデル
   * @param {string} [options.chromaUrl='http://localhost:8000'] - Chroma サーバーURL
   */
  constructor(options = {}) {
    this.options = {
      collectionName: options.collectionName || 'brand-knowledge',
      embeddingModel: options.embeddingModel || 'text-embedding-3-small',
      chromaUrl: options.chromaUrl || 'http://localhost:8000',
      ...options
    };

    // Chroma クライアント初期化
    this.client = new ChromaClient({
      path: this.options.chromaUrl
    });

    // OpenAI 初期化
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.collection = null;
    this.initialized = false;
  }

  /**
   * 初期化（コレクション取得または作成）
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // コレクション取得または作成
      // embeddingFunction を null にして、手動でEmbeddingを提供
      this.collection = await this.client.getOrCreateCollection({
        name: this.options.collectionName,
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: { generate: async () => [] } // ダミー関数（実際には使わない）
      });

      this.initialized = true;
      console.log(`✅ VectorStore (Chroma) initialized: ${this.options.collectionName}`);
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

      // Chroma に保存
      await this.collection.add({
        ids: [entry.id],
        embeddings: [embedding],
        metadatas: [{
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          categories: JSON.stringify(entry.relevance.categories),
          keywords: JSON.stringify(entry.relevance.keywords),
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status,
          addedAt: entry.metadata.addedAt.toISOString(),
          updatedAt: entry.metadata.updatedAt.toISOString()
        }],
        documents: [entry.summary] // 検索用テキスト
      });

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
      const ids = [];
      const embeddings = [];
      const metadatas = [];
      const documents = [];

      for (const entry of entries) {
        // Embedding 生成
        let embedding = entry.embedding;
        if (!embedding) {
          const searchText = entry.toSearchText();
          embedding = await this.generateEmbedding(searchText);
        }

        ids.push(entry.id);
        embeddings.push(embedding);
        metadatas.push({
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          categories: JSON.stringify(entry.relevance.categories),
          keywords: JSON.stringify(entry.relevance.keywords),
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status
        });
        documents.push(entry.summary);
      }

      // バッチ追加
      await this.collection.add({
        ids,
        embeddings,
        metadatas,
        documents
      });

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
   * @returns {Promise<Array>} 検索結果
   */
  async semanticSearch(query, options = {}) {
    await this.initialize();

    const { topK = 10, filter = {} } = options;

    try {
      // クエリの Embedding 生成
      const queryEmbedding = await this.generateEmbedding(query);

      // Chroma 検索
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where: Object.keys(filter).length > 0 ? filter : undefined
      });

      // 結果を整形
      return results.ids[0].map((id, index) => ({
        id,
        score: 1 - results.distances[0][index], // Chromaはdistanceを返すので、1-distanceでscoreに変換
        metadata: results.metadatas[0][index]
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
      const results = await this.collection.get({
        ids: [id],
        include: ['metadatas']
      });

      if (!results.ids || results.ids.length === 0) {
        return null;
      }

      return {
        id: results.ids[0],
        metadata: results.metadatas[0]
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
    await this.initialize();

    try {
      // Embedding 生成
      const searchText = entry.toSearchText();
      const embedding = await this.generateEmbedding(searchText);

      // Chroma で更新
      await this.collection.update({
        ids: [entry.id],
        embeddings: [embedding],
        metadatas: [{
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          categories: JSON.stringify(entry.relevance.categories),
          keywords: JSON.stringify(entry.relevance.keywords),
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status,
          updatedAt: entry.metadata.updatedAt.toISOString()
        }],
        documents: [entry.summary]
      });

      console.log(`✅ Updated entry in VectorStore: ${entry.id}`);
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
      await this.collection.delete({
        ids: [id]
      });

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
      await this.collection.delete({
        ids
      });

      console.log(`✅ Deleted ${ids.length} entries from VectorStore`);
    } catch (error) {
      console.error('❌ Batch delete failed:', error.message);
      throw new Error(`Failed to delete entries: ${error.message}`);
    }
  }

  /**
   * コレクション統計を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    await this.initialize();

    try {
      const count = await this.collection.count();

      return {
        totalVectors: count,
        collectionName: this.options.collectionName
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error.message);
      throw new Error(`Failed to get collection stats: ${error.message}`);
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
      console.log('✅ VectorStore (Chroma) connection test successful');
      console.log(`   Collection: ${stats.collectionName}`);
      console.log(`   Total vectors: ${stats.totalVectors}`);
      return true;
    } catch (error) {
      console.error('❌ VectorStore (Chroma) connection test failed:', error.message);
      return false;
    }
  }
}

/**
 * デフォルトエクスポート
 */
export default VectorStore;
