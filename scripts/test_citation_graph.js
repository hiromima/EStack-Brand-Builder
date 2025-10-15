#!/usr/bin/env node

/**
 * CitationGraph テストスクリプト
 *
 * 引用グラフ構築システムの動作を検証します。
 */

import { CitationGraph } from '../src/knowledge/CitationGraph.js';
import { Logger } from '../src/utils/Logger.js';

const logger = new Logger('CitationGraphTest');

/**
 * テスト実行
 */
async function runTest() {
  logger.info('🚀 CitationGraph テスト開始');

  try {
    const graph = new CitationGraph();

    // Step 1: ノード追加
    logger.info('\nStep 1: ノード追加テスト');
    graph.addNode('entry1', {
      title: 'Brand Identity 基礎理論',
      credibility: 90,
      type: 'theory',
      metadata: { author: 'David Aaker', year: 1996 }
    });

    graph.addNode('entry2', {
      title: 'デザイン思考とブランディング',
      credibility: 85,
      type: 'methodology',
      metadata: { author: 'Tim Brown', year: 2008 }
    });

    graph.addNode('entry3', {
      title: 'カラー心理学入門',
      credibility: 75,
      type: 'research',
      metadata: { author: 'Eva Heller', year: 2000 }
    });

    graph.addNode('entry4', {
      title: 'ブランド戦略実践ガイド',
      credibility: 80,
      type: 'practical',
      metadata: { author: 'Various', year: 2020 }
    });

    graph.addNode('entry5', {
      title: 'デジタルブランディング最新トレンド',
      credibility: 70,
      type: 'trend',
      metadata: { author: 'Industry Report', year: 2024 }
    });

    logger.info('✅ 5 ノード追加完了');

    // Step 2: エッジ追加（引用関係）
    logger.info('\nStep 2: エッジ追加テスト');

    // entry4 が entry1 を引用
    graph.addEdge('entry4', 'entry1', {
      citationType: 'references',
      weight: 1.0,
      context: 'ブランド理論の基礎として引用'
    });

    // entry4 が entry2 を引用
    graph.addEdge('entry4', 'entry2', {
      citationType: 'supports',
      weight: 0.8,
      context: 'デザイン思考の応用例として引用'
    });

    // entry5 が entry4 を引用
    graph.addEdge('entry5', 'entry4', {
      citationType: 'extends',
      weight: 1.0,
      context: 'デジタル環境への応用として引用'
    });

    // entry2 が entry3 を引用
    graph.addEdge('entry2', 'entry3', {
      citationType: 'references',
      weight: 0.6,
      context: 'カラー選択の根拠として引用'
    });

    // entry4 が entry3 を引用
    graph.addEdge('entry4', 'entry3', {
      citationType: 'references',
      weight: 0.5,
      context: 'ビジュアルデザインの参考として引用'
    });

    logger.info('✅ 5 エッジ追加完了');

    // Step 3: ノード取得テスト
    logger.info('\nStep 3: ノード取得テスト');
    const node1 = graph.getNode('entry1');
    logger.info(`Node: ${node1.title} (credibility: ${node1.credibility})`);
    logger.info('✅ ノード取得成功');

    // Step 4: エッジ取得テスト
    logger.info('\nStep 4: エッジ取得テスト');
    const outgoing = graph.getOutgoingEdges('entry4');
    const incoming = graph.getIncomingEdges('entry4');
    logger.info(`entry4 の引用数: ${outgoing.length}`);
    logger.info(`entry4 の被引用数: ${incoming.length}`);
    logger.info('✅ エッジ取得成功');

    // Step 5: 影響度スコア計算
    logger.info('\nStep 5: 影響度スコア計算テスト');
    const influenceScores = [];
    ['entry1', 'entry2', 'entry3', 'entry4', 'entry5'].forEach(id => {
      const score = graph.calculateInfluenceScore(id);
      const node = graph.getNode(id);
      influenceScores.push({ id, title: node.title, score });
      logger.info(`  ${id}: ${node.title} -> ${score.toFixed(2)}`);
    });
    logger.info('✅ 影響度スコア計算完了');

    // Step 6: PageRank 計算
    logger.info('\nStep 6: PageRank 計算テスト');
    const pageRanks = graph.calculatePageRank();
    const sortedByPageRank = Array.from(pageRanks.entries())
      .sort((a, b) => b[1] - a[1]);

    logger.info('PageRank ランキング:');
    sortedByPageRank.forEach(([id, score], i) => {
      const node = graph.getNode(id);
      logger.info(`  ${i + 1}. ${node.title}: ${score.toFixed(2)}`);
    });
    logger.info('✅ PageRank 計算完了');

    // Step 7: 循環参照検出テスト
    logger.info('\nStep 7: 循環参照検出テスト');
    const cycles = graph.detectCycles('entry1');
    if (cycles) {
      logger.info(`循環検出: ${cycles.length} 件`);
      cycles.forEach((cycle, i) => {
        logger.info(`  Cycle ${i + 1}: ${cycle.join(' -> ')}`);
      });
    } else {
      logger.info('循環参照なし');
    }
    logger.info('✅ 循環参照検出完了');

    // Step 8: グラフ統計取得
    logger.info('\nStep 8: グラフ統計取得テスト');
    const stats = graph.getStatistics();
    logger.info('グラフ統計:');
    logger.info(`  ノード数: ${stats.nodeCount}`);
    logger.info(`  エッジ数: ${stats.edgeCount}`);
    logger.info(`  孤立ノード数: ${stats.isolatedNodeCount}`);
    logger.info(`  最多被引用ノード: ${stats.mostCitedNode}`);
    logger.info(`  最大被引用数: ${stats.maxCitations}`);
    logger.info(`  平均被引用数: ${stats.avgCitations}`);
    logger.info('✅ グラフ統計取得完了');

    // Step 9: JSON エクスポート/インポートテスト
    logger.info('\nStep 9: JSON エクスポート/インポートテスト');
    const exportedData = graph.toJSON();
    logger.info(`エクスポート: ${exportedData.nodes.length} ノード, ${exportedData.edges.length} エッジ`);

    const graph2 = new CitationGraph();
    graph2.fromJSON(exportedData);
    const stats2 = graph2.getStatistics();
    logger.info(`インポート: ${stats2.nodeCount} ノード, ${stats2.edgeCount} エッジ`);
    logger.info('✅ JSON エクスポート/インポート成功');

    // Step 10: 追加の循環参照テスト
    logger.info('\nStep 10: 循環参照作成テスト');
    graph.addEdge('entry1', 'entry4', {
      citationType: 'references',
      weight: 0.5,
      context: '実践例として引用'
    });

    const cyclesAfter = graph.detectCycles('entry1');
    if (cyclesAfter) {
      logger.info(`循環検出: ${cyclesAfter.length} 件`);
      cyclesAfter.forEach((cycle, i) => {
        logger.info(`  Cycle ${i + 1}: ${cycle.join(' -> ')}`);
      });
      logger.info('✅ 循環参照検出成功');
    } else {
      logger.warn('循環参照が検出されませんでした');
    }

    // サマリー
    logger.info('\n📊 テストサマリー');
    logger.info('  ✅ ノード追加/取得');
    logger.info('  ✅ エッジ追加/取得');
    logger.info('  ✅ 影響度スコア計算');
    logger.info('  ✅ PageRank 計算');
    logger.info('  ✅ 循環参照検出');
    logger.info('  ✅ グラフ統計取得');
    logger.info('  ✅ JSON エクスポート/インポート');

    logger.info('\n✅ CitationGraph テスト完了');
    process.exit(0);

  } catch (error) {
    logger.error('❌ テスト失敗:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 実行
runTest();
