#!/usr/bin/env node

/**
 * @file test_migrated_data.js
 * @description Test migrated knowledge base with real-world queries
 * @version 1.0.0
 */

import 'dotenv/config';
import { KnowledgeManager } from '../src/knowledge/KnowledgeManager.js';

async function testMigratedData() {
  console.log('\n' + '='.repeat(60));
  console.log('Migrated Knowledge Base Test');
  console.log('='.repeat(60) + '\n');

  const manager = new KnowledgeManager();

  try {
    // 接続テスト
    console.log('📋 Step 1: Connection and Statistics\n');
    const connected = await manager.testConnection();

    if (!connected) {
      console.error('❌ Connection test failed. Exiting...');
      process.exit(1);
    }

    const stats = await manager.getStats();
    console.log(`\nTotal Knowledge: ${stats.vectorStore.totalVectors} entries`);
    console.log(`Categories: ${stats.knowledgeGraph.totalCategories}`);
    console.log(`Keywords: ${stats.knowledgeGraph.totalKeywords}`);

    console.log('\n' + '='.repeat(60) + '\n');

    // テストクエリ群
    const testQueries = [
      {
        query: 'ブランドアイデンティティの構築方法',
        description: 'Brand Identity Construction Methods'
      },
      {
        query: 'E-Stack メソッドの使い方',
        description: 'E-Stack Method Usage'
      },
      {
        query: 'ロゴデザインの原則',
        description: 'Logo Design Principles'
      },
      {
        query: 'ブランド戦略フレームワーク',
        description: 'Brand Strategy Frameworks'
      },
      {
        query: 'テンプレートの使い方',
        description: 'Template Usage'
      }
    ];

    // セマンティック検索テスト
    console.log('📋 Step 2: Semantic Search Tests\n');

    for (const test of testQueries) {
      console.log(`Query: "${test.query}" (${test.description})`);
      console.log('-'.repeat(60));

      const results = await manager.search(test.query, { topK: 5 });

      if (results.length === 0) {
        console.log('⚠️  No results found\n');
        continue;
      }

      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.metadata.title}`);
        console.log(`   ID: ${result.id}`);
        console.log(`   Score: ${result.score.toFixed(4)}`);
        console.log(`   Type: ${result.metadata.type}`);
        console.log(`   Categories: ${result.metadata.categories}`);
        console.log();
      });

      console.log();
    }

    console.log('='.repeat(60) + '\n');

    // ハイブリッド検索テスト
    console.log('📋 Step 3: Hybrid Search Test\n');

    const hybridQuery = 'E-Stack メソッドとブランド構築';
    console.log(`Query: "${hybridQuery}"`);
    console.log('-'.repeat(60));

    const hybridResults = await manager.hybridSearch(hybridQuery, {
      topK: 5,
      expandGraph: true,
      expansionDepth: 2
    });

    console.log(`\nSemantic Results: ${hybridResults.semanticResults.length}`);
    hybridResults.semanticResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.metadata.title} (score: ${result.score.toFixed(4)})`);
    });

    console.log(`\nGraph-Related Entries: ${hybridResults.relatedEntryIds.length}`);
    if (hybridResults.relatedEntryIds.length > 0) {
      hybridResults.relatedEntryIds.forEach((id, index) => {
        console.log(`  ${index + 1}. ${id}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // カテゴリ検索テスト
    console.log('📋 Step 4: Category Search Tests\n');

    const categories = [
      'brand-principles',
      'core-methods',
      'templates',
      'system-protocols'
    ];

    for (const category of categories) {
      const results = await manager.searchByCategory(category, { limit: 5 });
      console.log(`Category: "${category}" - ${results.length} entries found`);

      if (results.length > 0) {
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title} (${result.type})`);
        });
      }
      console.log();
    }

    console.log('='.repeat(60) + '\n');

    // キーワード検索テスト
    console.log('📋 Step 5: Keyword Search Tests\n');

    const keywords = ['brand', 'estack', 'framework', 'template', 'design'];

    for (const keyword of keywords) {
      const results = await manager.searchByKeyword(keyword, { limit: 5 });
      console.log(`Keyword: "${keyword}" - ${results.length} entries found`);

      if (results.length > 0) {
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.title}`);
        });
      }
      console.log();
    }

    console.log('='.repeat(60) + '\n');

    // パフォーマンステスト
    console.log('📋 Step 6: Performance Test\n');

    const performanceQuery = 'ブランディング戦略';
    console.log(`Query: "${performanceQuery}"`);
    console.log('Running 10 search iterations...\n');

    const times = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await manager.search(performanceQuery, { topK: 5 });
      const duration = Date.now() - start;
      times.push(duration);
      process.stdout.write(`Iteration ${i + 1}: ${duration}ms\n`);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log();
    console.log(`Average: ${avgTime.toFixed(2)}ms`);
    console.log(`Min: ${minTime}ms`);
    console.log(`Max: ${maxTime}ms`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60) + '\n');

    // 最終統計
    console.log('Final Statistics:');
    const finalStats = await manager.getStats();
    console.log(`  Entries: ${finalStats.vectorStore.totalVectors}`);
    console.log(`  Categories: ${finalStats.knowledgeGraph.totalCategories}`);
    console.log(`  Keywords: ${finalStats.knowledgeGraph.totalKeywords}`);
    console.log(`  Synchronized: ${finalStats.synchronized ? '✅' : '⚠️'}`);
    console.log();

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
testMigratedData();
