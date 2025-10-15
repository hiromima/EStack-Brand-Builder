/**
 * @file KnowledgeGraph.js
 * @description Neo4j Graph Database wrapper for knowledge relationships
 * @version 1.0.0
 */

import neo4j from 'neo4j-driver';

/**
 * Knowledge Graph クラス
 */
export class KnowledgeGraph {
  /**
   * @param {Object} options - 設定オプション
   * @param {string} [options.uri] - Neo4j URI
   * @param {string} [options.user] - ユーザー名
   * @param {string} [options.password] - パスワード
   */
  constructor(options = {}) {
    this.options = {
      uri: options.uri || process.env.NEO4J_URI,
      user: options.user || process.env.NEO4J_USER,
      password: options.password || process.env.NEO4J_PASSWORD,
      ...options
    };

    // Neo4j driver 初期化
    this.driver = neo4j.driver(
      this.options.uri,
      neo4j.auth.basic(this.options.user, this.options.password)
    );

    this.initialized = false;
  }

  /**
   * 初期化（接続確認）
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // 接続テスト
      await this.driver.verifyConnectivity();
      this.initialized = true;

      console.log('✅ KnowledgeGraph initialized');
    } catch (error) {
      console.error('❌ KnowledgeGraph initialization failed:', error.message);
      throw new Error(`Failed to initialize KnowledgeGraph: ${error.message}`);
    }
  }

  /**
   * エントリをグラフに追加
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry} entry - 知識エントリ
   * @returns {Promise<void>}
   */
  async addEntry(entry) {
    await this.initialize();

    const session = this.driver.session();

    try {
      // ノード作成
      await session.run(
        `MERGE (e:KnowledgeEntry {id: $id})
         SET e.type = $type,
             e.title = $title,
             e.summary = $summary,
             e.credibilityScore = $credibilityScore,
             e.peerReviewed = $peerReviewed,
             e.status = $status,
             e.addedAt = $addedAt,
             e.updatedAt = $updatedAt`,
        {
          id: entry.id,
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status,
          addedAt: entry.metadata.addedAt.toISOString(),
          updatedAt: entry.metadata.updatedAt.toISOString()
        }
      );

      // カテゴリノード作成とリレーション
      for (const category of entry.relevance.categories) {
        await session.run(
          `MERGE (c:Category {name: $category})
           WITH c
           MATCH (e:KnowledgeEntry {id: $id})
           MERGE (e)-[:BELONGS_TO]->(c)`,
          { id: entry.id, category }
        );
      }

      // キーワードノード作成とリレーション
      for (const keyword of entry.relevance.keywords) {
        await session.run(
          `MERGE (k:Keyword {name: $keyword})
           WITH k
           MATCH (e:KnowledgeEntry {id: $id})
           MERGE (e)-[:TAGGED_WITH]->(k)`,
          { id: entry.id, keyword }
        );
      }

      // 関連エントリへのリレーション
      for (const relatedId of entry.relevance.relatedEntries) {
        await session.run(
          `MATCH (e1:KnowledgeEntry {id: $id1})
           MATCH (e2:KnowledgeEntry {id: $id2})
           MERGE (e1)-[:RELATED_TO]->(e2)`,
          { id1: entry.id, id2: relatedId }
        );
      }

      console.log(`✅ Added entry to KnowledgeGraph: ${entry.id}`);
    } catch (error) {
      console.error(`❌ Failed to add entry ${entry.id}:`, error.message);
      throw new Error(`Failed to add entry to KnowledgeGraph: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * 複数エントリを一括追加
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry[]} entries - エントリ配列
   * @returns {Promise<void>}
   */
  async addEntries(entries) {
    await this.initialize();

    try {
      // 並列処理で追加（Neo4jは同時書き込みをサポート）
      await Promise.all(entries.map(entry => this.addEntry(entry)));
      console.log(`✅ Added ${entries.length} entries to KnowledgeGraph`);
    } catch (error) {
      console.error('❌ Batch add failed:', error.message);
      throw new Error(`Failed to add entries to KnowledgeGraph: ${error.message}`);
    }
  }

  /**
   * エントリを更新
   * @param {import('../models/KnowledgeEntry.js').KnowledgeEntry} entry - 更新するエントリ
   * @returns {Promise<void>}
   */
  async updateEntry(entry) {
    await this.initialize();

    const session = this.driver.session();

    try {
      // 既存のリレーションシップを削除してから再作成
      await session.run(
        `MATCH (e:KnowledgeEntry {id: $id})
         OPTIONAL MATCH (e)-[r]-()
         DELETE r`,
        { id: entry.id }
      );

      // ノード更新
      await session.run(
        `MATCH (e:KnowledgeEntry {id: $id})
         SET e.type = $type,
             e.title = $title,
             e.summary = $summary,
             e.credibilityScore = $credibilityScore,
             e.peerReviewed = $peerReviewed,
             e.status = $status,
             e.updatedAt = $updatedAt`,
        {
          id: entry.id,
          type: entry.type,
          title: entry.title,
          summary: entry.summary,
          credibilityScore: entry.credibility.score,
          peerReviewed: entry.credibility.peerReviewed,
          status: entry.metadata.status,
          updatedAt: entry.metadata.updatedAt.toISOString()
        }
      );

      // カテゴリリレーション再作成
      for (const category of entry.relevance.categories) {
        await session.run(
          `MERGE (c:Category {name: $category})
           WITH c
           MATCH (e:KnowledgeEntry {id: $id})
           MERGE (e)-[:BELONGS_TO]->(c)`,
          { id: entry.id, category }
        );
      }

      // キーワードリレーション再作成
      for (const keyword of entry.relevance.keywords) {
        await session.run(
          `MERGE (k:Keyword {name: $keyword})
           WITH k
           MATCH (e:KnowledgeEntry {id: $id})
           MERGE (e)-[:TAGGED_WITH]->(k)`,
          { id: entry.id, keyword }
        );
      }

      // 関連エントリリレーション再作成
      for (const relatedId of entry.relevance.relatedEntries) {
        await session.run(
          `MATCH (e1:KnowledgeEntry {id: $id1})
           MATCH (e2:KnowledgeEntry {id: $id2})
           MERGE (e1)-[:RELATED_TO]->(e2)`,
          { id1: entry.id, id2: relatedId }
        );
      }

      console.log(`✅ Updated entry in KnowledgeGraph: ${entry.id}`);
    } catch (error) {
      console.error(`❌ Failed to update entry ${entry.id}:`, error.message);
      throw new Error(`Failed to update entry in KnowledgeGraph: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * 関連エントリを検索
   * @param {string} entryId - 基準エントリID
   * @param {Object} options - 検索オプション
   * @param {number} [options.depth=2] - 探索深度
   * @param {number} [options.limit=10] - 結果数制限
   * @returns {Promise<Array>} 関連エントリ
   */
  async findRelated(entryId, options = {}) {
    await this.initialize();

    const { depth = 2, limit = 10 } = options;
    const session = this.driver.session();

    try {
      // Cypherでは変数パス長を直接指定する必要があるため、文字列補間を使用
      const query = `MATCH path = (e:KnowledgeEntry {id: $id})-[:RELATED_TO*1..${depth}]-(related)
         WHERE related.status = 'active'
         RETURN DISTINCT related.id AS id,
                         related.title AS title,
                         related.type AS type,
                         related.credibilityScore AS credibilityScore,
                         length(path) AS distance
         ORDER BY credibilityScore DESC, distance ASC
         LIMIT $limit`;

      const result = await session.run(
        query,
        { id: entryId, limit: neo4j.int(limit) }
      );

      return result.records.map(record => ({
        id: record.get('id'),
        title: record.get('title'),
        type: record.get('type'),
        credibilityScore: record.get('credibilityScore'),
        distance: record.get('distance').toNumber()
      }));
    } catch (error) {
      console.error(`❌ Failed to find related entries for ${entryId}:`, error.message);
      throw new Error(`Failed to find related entries: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * カテゴリ別にエントリを検索
   * @param {string} category - カテゴリ名
   * @param {Object} options - 検索オプション
   * @param {number} [options.limit=20] - 結果数制限
   * @returns {Promise<Array>} エントリリスト
   */
  async findByCategory(category, options = {}) {
    await this.initialize();

    const { limit = 20 } = options;
    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (e:KnowledgeEntry)-[:BELONGS_TO]->(c:Category {name: $category})
         WHERE e.status = 'active'
         RETURN e.id AS id,
                e.title AS title,
                e.type AS type,
                e.credibilityScore AS credibilityScore
         ORDER BY e.credibilityScore DESC
         LIMIT $limit`,
        { category, limit: neo4j.int(limit) }
      );

      return result.records.map(record => ({
        id: record.get('id'),
        title: record.get('title'),
        type: record.get('type'),
        credibilityScore: record.get('credibilityScore')
      }));
    } catch (error) {
      console.error(`❌ Failed to find entries by category ${category}:`, error.message);
      throw new Error(`Failed to find entries by category: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * キーワードで検索
   * @param {string} keyword - キーワード
   * @param {Object} options - 検索オプション
   * @param {number} [options.limit=20] - 結果数制限
   * @returns {Promise<Array>} エントリリスト
   */
  async findByKeyword(keyword, options = {}) {
    await this.initialize();

    const { limit = 20 } = options;
    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (e:KnowledgeEntry)-[:TAGGED_WITH]->(k:Keyword {name: $keyword})
         WHERE e.status = 'active'
         RETURN e.id AS id,
                e.title AS title,
                e.type AS type,
                e.credibilityScore AS credibilityScore
         ORDER BY e.credibilityScore DESC
         LIMIT $limit`,
        { keyword, limit: neo4j.int(limit) }
      );

      return result.records.map(record => ({
        id: record.get('id'),
        title: record.get('title'),
        type: record.get('type'),
        credibilityScore: record.get('credibilityScore')
      }));
    } catch (error) {
      console.error(`❌ Failed to find entries by keyword ${keyword}:`, error.message);
      throw new Error(`Failed to find entries by keyword: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * 複数エントリ間の関係性を取得
   * @param {string[]} entryIds - エントリIDの配列
   * @returns {Promise<Array>} 関係性リスト
   */
  async findConnections(entryIds) {
    await this.initialize();

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (e1:KnowledgeEntry)-[r:RELATED_TO]-(e2:KnowledgeEntry)
         WHERE e1.id IN $ids AND e2.id IN $ids
         RETURN e1.id AS source,
                e2.id AS target,
                type(r) AS relationshipType`,
        { ids: entryIds }
      );

      return result.records.map(record => ({
        source: record.get('source'),
        target: record.get('target'),
        type: record.get('relationshipType')
      }));
    } catch (error) {
      console.error('❌ Failed to find connections:', error.message);
      throw new Error(`Failed to find connections: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * エントリを削除
   * @param {string} id - 削除するエントリID
   * @returns {Promise<void>}
   */
  async deleteEntry(id) {
    await this.initialize();

    const session = this.driver.session();

    try {
      await session.run(
        `MATCH (e:KnowledgeEntry {id: $id})
         DETACH DELETE e`,
        { id }
      );

      console.log(`✅ Deleted entry from KnowledgeGraph: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to delete entry ${id}:`, error.message);
      throw new Error(`Failed to delete entry: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * 複数エントリを削除
   * @param {string[]} ids - 削除するエントリIDの配列
   * @returns {Promise<void>}
   */
  async deleteEntries(ids) {
    await this.initialize();

    const session = this.driver.session();

    try {
      await session.run(
        `MATCH (e:KnowledgeEntry)
         WHERE e.id IN $ids
         DETACH DELETE e`,
        { ids }
      );

      console.log(`✅ Deleted ${ids.length} entries from KnowledgeGraph`);
    } catch (error) {
      console.error('❌ Batch delete failed:', error.message);
      throw new Error(`Failed to delete entries from KnowledgeGraph: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * グラフ統計を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    await this.initialize();

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (e:KnowledgeEntry)
         OPTIONAL MATCH (c:Category)
         OPTIONAL MATCH (k:Keyword)
         OPTIONAL MATCH ()-[r:RELATED_TO]->()
         RETURN count(DISTINCT e) AS entries,
                count(DISTINCT c) AS categories,
                count(DISTINCT k) AS keywords,
                count(DISTINCT r) AS relationships`
      );

      const record = result.records[0];
      return {
        totalEntries: record.get('entries').toNumber(),
        totalCategories: record.get('categories').toNumber(),
        totalKeywords: record.get('keywords').toNumber(),
        totalRelationships: record.get('relationships').toNumber()
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error.message);
      throw new Error(`Failed to get graph stats: ${error.message}`);
    } finally {
      await session.close();
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
      console.log('✅ KnowledgeGraph connection test successful');
      console.log(`   Entries: ${stats.totalEntries}`);
      console.log(`   Categories: ${stats.totalCategories}`);
      console.log(`   Keywords: ${stats.totalKeywords}`);
      console.log(`   Relationships: ${stats.totalRelationships}`);
      return true;
    } catch (error) {
      console.error('❌ KnowledgeGraph connection test failed:', error.message);
      return false;
    }
  }

  /**
   * クリーンアップ（接続終了）
   */
  async close() {
    if (this.driver) {
      await this.driver.close();
      console.log('✅ KnowledgeGraph connection closed');
    }
  }
}

/**
 * デフォルトエクスポート
 */
export default KnowledgeGraph;
