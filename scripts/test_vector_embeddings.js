#!/usr/bin/env node

/**
 * Vector Embeddings 統合テスト
 *
 * EmbeddingService と VectorDB の統合動作を検証します。
 */

import { VectorDB } from '../src/knowledge/VectorDB.js';
import { Logger } from '../src/utils/Logger.js';

const logger = new Logger('VectorEmbeddingsTest');

/**
 * テスト実行
 */
async function runTest() {
  logger.info('🚀 Vector Embeddings 統合テスト開始');

  try {
    // VectorDB インスタンス作成（EmbeddingService 有効）
    const vectorDB = new VectorDB({ useEmbeddingService: true });

    // 初期化
    logger.info('Step 1: VectorDB + EmbeddingService 初期化');
    await vectorDB.initialize();
    logger.info('✅ 初期化完了');

    // ヘルスチェック
    logger.info('\nStep 2: ヘルスチェック');
    const health = await vectorDB.healthCheck();
    logger.info('Health:', health);

    // テストコレクション作成
    logger.info('\nStep 3: テストコレクション作成');
    const collectionName = 'embedding_test';
    await vectorDB.getOrCreateCollection(collectionName, {
      description: 'EmbeddingService 統合テスト',
      dimension: 768
    });
    logger.info(`✅ コレクション '${collectionName}' 作成完了`);

    // 単一テキストの埋め込み生成テスト
    logger.info('\nStep 4: 単一埋め込み生成テスト');
    const testText = 'Brand Builder Knowledge System は動的知識ベースを提供します。';
    const embedding = await vectorDB.generateEmbedding(testText);
    logger.info(`✅ 埋め込み生成完了 (次元: ${embedding.length})`);

    // バッチ埋め込み生成テスト
    logger.info('\nStep 5: バッチ埋め込み生成テスト');
    const documents = [
      'Brand Builder は AI 駆動のブランド構築システムです。',
      'Vector Database で高速なセマンティック検索を実現します。',
      '評価システムは多モデル評価で品質を保証します。',
      'Knowledge Entry は統一データモデルを採用しています。',
      'Chroma DB と Gemini Embeddings を統合しています。'
    ];

    const embeddings = await vectorDB.generateBatchEmbeddings(documents);
    logger.info(`✅ バッチ埋め込み生成完了 (${embeddings.length} 件)`);

    // キャッシュ統計確認
    const cacheStats1 = vectorDB.getEmbeddingCacheStats();
    logger.info(`Cache Stats: ${cacheStats1.hits} hits, ${cacheStats1.misses} misses (${cacheStats1.hitRate.toFixed(1)}% hit rate)`);

    // ドキュメント追加テスト（自動埋め込み）
    logger.info('\nStep 6: ドキュメント追加テスト（自動埋め込み）');
    const ids = documents.map((_, i) => `doc_${i + 1}`);
    const metadatas = documents.map((_, i) => ({
      source: 'test',
      index: i + 1,
      timestamp: new Date().toISOString()
    }));

    await vectorDB.addDocumentsWithText(collectionName, ids, documents, metadatas);
    logger.info('✅ ドキュメント追加完了');

    // キャッシュヒット率確認（再度埋め込み生成で確認）
    logger.info('\nStep 7: キャッシュヒット率確認');
    const cachedEmbedding = await vectorDB.generateEmbedding(testText);
    const cacheStats2 = vectorDB.getEmbeddingCacheStats();
    logger.info(`Cache Stats: ${cacheStats2.hits} hits, ${cacheStats2.misses} misses (${cacheStats2.hitRate.toFixed(1)}% hit rate)`);

    if (cacheStats2.hits > cacheStats1.hits) {
      logger.info('✅ キャッシュヒット確認（期待通り）');
    }

    // テキストクエリによる検索テスト
    logger.info('\nStep 8: テキストクエリ検索テスト');
    const queryText = 'ベクトル検索とセマンティック検索について教えてください';
    const results = await vectorDB.queryByText(collectionName, queryText, 3);

    logger.info(`✅ 検索完了 (${results.ids.length} 件取得, ${results.duration}ms)`);
    logger.info('\n検索結果:');
    results.ids.forEach((id, i) => {
      logger.info(`  ${i + 1}. ID: ${id}`);
      logger.info(`     Distance: ${results.distances[i].toFixed(4)}`);
      logger.info(`     Text: ${results.documents[i]}`);
    });

    // コレクション情報確認
    logger.info('\nStep 9: コレクション情報確認');
    const collectionInfo = await vectorDB.getCollectionInfo(collectionName);
    logger.info(`Collection: ${collectionInfo.name}`);
    logger.info(`Documents: ${collectionInfo.count}`);
    logger.info(`Metadata:`, collectionInfo.metadata);

    // 最終キャッシュ統計
    logger.info('\nStep 10: 最終統計');
    const finalCacheStats = vectorDB.getEmbeddingCacheStats();
    logger.info('Final Cache Stats:');
    logger.info(`  Total Requests: ${finalCacheStats.totalRequests}`);
    logger.info(`  Cache Hits: ${finalCacheStats.hits}`);
    logger.info(`  Cache Misses: ${finalCacheStats.misses}`);
    logger.info(`  Hit Rate: ${finalCacheStats.hitRate.toFixed(1)}%`);
    logger.info(`  Cache Size: ${finalCacheStats.cacheSize} entries`);

    // テストコレクション削除
    logger.info('\nStep 11: テストコレクション削除');
    await vectorDB.deleteCollection(collectionName);
    logger.info('✅ テストコレクション削除完了');

    // クローズ
    await vectorDB.close();
    logger.info('\n✅ Vector Embeddings 統合テスト完了');

    // サマリー
    logger.info('\n📊 テストサマリー');
    logger.info('  ✅ EmbeddingService 初期化');
    logger.info('  ✅ 単一埋め込み生成');
    logger.info(`  ✅ バッチ埋め込み生成 (${embeddings.length} 件)`);
    logger.info('  ✅ ドキュメント追加（自動埋め込み）');
    logger.info('  ✅ テキストクエリ検索');
    logger.info(`  ✅ キャッシュ機能動作確認 (${finalCacheStats.hitRate.toFixed(1)}% hit rate)`);

    process.exit(0);

  } catch (error) {
    logger.error('❌ テスト失敗:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 実行
runTest();
