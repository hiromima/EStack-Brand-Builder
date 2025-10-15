#!/usr/bin/env node

/**
 * @file test_knowledge_manager.js
 * @description Test KnowledgeManager with sample data
 * @version 1.0.0
 */

import 'dotenv/config';
import { KnowledgeManager } from '../src/knowledge/KnowledgeManager.js';
import { KnowledgeEntry } from '../src/models/KnowledgeEntry.js';

async function testKnowledgeManager() {
  console.log('\n' + '='.repeat(60));
  console.log('Knowledge Manager Test');
  console.log('='.repeat(60) + '\n');

  const manager = new KnowledgeManager();

  try {
    // 1. 接続テスト
    console.log('📋 Step 1: Connection Test\n');
    const connected = await manager.testConnection();

    if (!connected) {
      console.error('❌ Connection test failed. Exiting...');
      process.exit(1);
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // 2. サンプルエントリを作成
    console.log('📋 Step 2: Creating Sample Entries\n');

    const entry1 = new KnowledgeEntry({
      id: 'test-entry-001',
      type: 'academic',
      title: 'ブランディングの基礎理論',
      content: 'ブランディングは企業や製品の価値を明確にし、顧客との長期的な関係を構築するための戦略的プロセスです。',
      summary: 'ブランディングの基本的な概念と戦略的重要性について解説',
      source: {
        type: 'article',
        name: 'マーケティング研究誌',
        url: 'https://example.com/article/branding-basics',
        author: ['山田太郎', '佐藤花子'],
        publishedDate: new Date('2024-01-15'),
        accessedDate: new Date()
      },
      credibility: {
        score: 8.5,
        peerReviewed: true,
        citations: 42,
        sourceRank: 'A'
      },
      relevance: {
        categories: ['branding', 'marketing', 'strategy'],
        keywords: ['ブランド戦略', '価値創造', '顧客関係'],
        relatedEntries: []
      }
    });

    const entry2 = new KnowledgeEntry({
      id: 'test-entry-002',
      type: 'design',
      title: 'ブランドアイデンティティデザイン',
      content: 'ブランドアイデンティティは、ロゴ、カラーパレット、タイポグラフィなどの視覚的要素を統合したものです。',
      summary: 'ブランドアイデンティティの視覚的要素とデザイン原則',
      source: {
        type: 'book',
        name: 'デザイン思考とブランディング',
        url: 'https://example.com/book/brand-identity',
        author: ['田中一郎'],
        publishedDate: new Date('2023-06-20'),
        accessedDate: new Date()
      },
      credibility: {
        score: 9.0,
        peerReviewed: false,
        citations: 128,
        sourceRank: 'A+'
      },
      relevance: {
        categories: ['design', 'branding', 'visual-identity'],
        keywords: ['ロゴデザイン', 'カラーパレット', 'タイポグラフィ'],
        relatedEntries: ['test-entry-001']
      }
    });

    const entry3 = new KnowledgeEntry({
      id: 'test-entry-003',
      type: 'method',
      title: 'ブランド監査の実施方法',
      content: 'ブランド監査は、ブランドの現状を評価し、改善点を特定するための体系的なプロセスです。',
      summary: 'ブランド監査の手順と評価基準',
      source: {
        type: 'report',
        name: 'ブランド管理レポート',
        url: 'https://example.com/report/brand-audit',
        author: ['鈴木次郎'],
        publishedDate: new Date('2024-03-10'),
        accessedDate: new Date()
      },
      credibility: {
        score: 7.8,
        peerReviewed: false,
        citations: 15,
        sourceRank: 'B+'
      },
      relevance: {
        categories: ['method', 'branding', 'audit'],
        keywords: ['ブランド評価', '監査手法', '改善計画'],
        relatedEntries: ['test-entry-001', 'test-entry-002']
      }
    });

    console.log('✅ Created 3 sample entries');

    console.log('\n' + '-'.repeat(60) + '\n');

    // 3. エントリを追加
    console.log('📋 Step 3: Adding Entries to Knowledge Base\n');

    await manager.addEntries([entry1, entry2, entry3]);

    console.log('\n' + '-'.repeat(60) + '\n');

    // 4. セマンティック検索
    console.log('📋 Step 4: Semantic Search\n');

    const searchQuery = 'ブランド戦略とデザイン';
    console.log(`Query: "${searchQuery}"\n`);

    const searchResults = await manager.search(searchQuery, { topK: 5 });

    searchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.id}`);
      console.log(`   Score: ${result.score.toFixed(4)}`);
      console.log(`   Title: ${result.metadata.title}`);
      console.log(`   Type: ${result.metadata.type}`);
      console.log();
    });

    console.log('-'.repeat(60) + '\n');

    // 5. ハイブリッド検索
    console.log('📋 Step 5: Hybrid Search (Semantic + Graph)\n');

    const hybridResults = await manager.hybridSearch(searchQuery, {
      topK: 5,
      expandGraph: true,
      expansionDepth: 1
    });

    console.log(`Semantic Results: ${hybridResults.semanticResults.length}`);
    console.log(`Graph-Related Entries: ${hybridResults.relatedEntryIds.length}`);

    if (hybridResults.graphExpansion) {
      console.log('\nGraph Expansion Info:');
      console.log(`  Depth: ${hybridResults.graphExpansion.depth}`);
      console.log(`  Source IDs: ${hybridResults.graphExpansion.sourceIds.join(', ')}`);
      console.log(`  Related Count: ${hybridResults.graphExpansion.relatedCount}`);
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // 6. カテゴリ検索
    console.log('📋 Step 6: Category Search\n');

    const categoryResults = await manager.searchByCategory('branding', { limit: 10 });
    console.log(`Found ${categoryResults.length} entries in category "branding":`);
    categoryResults.forEach(result => {
      console.log(`  - ${result.id}`);
    });

    console.log('\n' + '-'.repeat(60) + '\n');

    // 7. 関連エントリ取得
    console.log('📋 Step 7: Get Related Entries\n');

    const relatedEntries = await manager.getRelatedEntries('test-entry-001', {
      depth: 2,
      limit: 10
    });

    console.log(`Found ${relatedEntries.length} entries related to "test-entry-001":`);
    relatedEntries.forEach(result => {
      console.log(`  - ${result.id} (distance: ${result.distance})`);
    });

    console.log('\n' + '-'.repeat(60) + '\n');

    // 8. 統計情報
    console.log('📋 Step 8: Statistics\n');

    const stats = await manager.getStats();
    console.log('Vector Store:');
    console.log(`  Total Vectors: ${stats.vectorStore.totalVectors}`);
    console.log(`  Collection: ${stats.vectorStore.collectionName}`);
    console.log('\nKnowledge Graph:');
    console.log(`  Total Entries: ${stats.knowledgeGraph.totalEntries}`);
    console.log(`  Categories: ${stats.knowledgeGraph.totalCategories}`);
    console.log(`  Keywords: ${stats.knowledgeGraph.totalKeywords}`);
    console.log(`  Relationships: ${stats.knowledgeGraph.totalRelationships}`);
    console.log(`\nSynchronized: ${stats.synchronized ? '✅ Yes' : '⚠️ No'}`);

    console.log('\n' + '-'.repeat(60) + '\n');

    // 9. クリーンアップ（テストデータ削除）
    console.log('📋 Step 9: Cleanup (Deleting Test Entries)\n');

    await manager.deleteEntries(['test-entry-001', 'test-entry-002', 'test-entry-003']);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60) + '\n');

    await manager.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    await manager.close();
    process.exit(1);
  }
}

// Run tests
testKnowledgeManager();
