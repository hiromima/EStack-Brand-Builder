#!/usr/bin/env node

/**
 * @file evaluation-dashboard.js
 * @description CLI-based evaluation dashboard
 * @version 1.0.0
 */

import { EvaluationHistory } from '../evaluation/EvaluationHistory.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ダッシュボードメインクラス
 */
class EvaluationDashboard {
  constructor() {
    this.history = new EvaluationHistory();
  }

  /**
   * ダッシュボードを表示
   */
  async display() {
    await this.history.initialize();

    console.clear();
    this.printHeader();

    // 統計情報を取得
    const stats = await this.history.getStatistics();
    const recentTrends = await this.history.getTrends(7); // 過去7日間
    const recentRecords = await this.history.getHistory({ limit: 5 });

    this.printOverview(stats);
    this.printTrends(recentTrends);
    this.printRecentActivity(recentRecords);

    this.printFooter();
  }

  /**
   * ヘッダーを表示
   */
  printHeader() {
    console.log('\n' + '═'.repeat(70));
    console.log('  📊 EVALUATION DASHBOARD');
    console.log('═'.repeat(70) + '\n');
  }

  /**
   * 概要を表示
   * @param {Object} stats - 統計情報
   */
  printOverview(stats) {
    console.log('┌─ 📈 OVERVIEW ' + '─'.repeat(55));
    console.log('│');
    console.log(`│  総レコード数: ${stats.totalRecords}`);
    console.log(`│    ├─ 単一評価: ${stats.evaluations}`);
    console.log(`│    └─ 改善セッション: ${stats.improvementSessions}`);
    console.log('│');

    console.log('│  スコア統計:');
    console.log(`│    ├─ 平均: ${stats.scoreStatistics.average}/100`);
    console.log(`│    ├─ 最低: ${stats.scoreStatistics.min}/100`);
    console.log(`│    └─ 最高: ${stats.scoreStatistics.max}/100`);
    console.log('│');

    if (stats.improvementSessions > 0) {
      console.log('│  改善パフォーマンス:');
      console.log(`│    ├─ 成功率: ${stats.successRate}%`);
      console.log(`│    ├─ 平均試行回数: ${stats.averageAttempts}`);
      console.log(`│    └─ 平均スコア向上: ${stats.averageImprovement > 0 ? '+' : ''}${stats.averageImprovement}`);
      console.log('│');
    }

    console.log('│  信頼度分布:');
    console.log(`│    ├─ High: ${stats.confidenceDistribution.high}`);
    console.log(`│    ├─ Medium: ${stats.confidenceDistribution.medium}`);
    console.log(`│    └─ Low: ${stats.confidenceDistribution.low}`);
    console.log('│');
    console.log('└' + '─'.repeat(69) + '\n');
  }

  /**
   * トレンドを表示
   * @param {Object} trends - トレンドデータ
   */
  printTrends(trends) {
    console.log('┌─ 📉 TRENDS (過去7日間) ' + '─'.repeat(43));
    console.log('│');

    if (trends.dataPoints === 0) {
      console.log('│  データがありません');
    } else {
      const maxScore = 100;
      const barWidth = 40;

      trends.trend.forEach((data, index) => {
        const date = data.date.split('T')[0];
        const score = data.averageScore;
        const barLength = Math.round((score / maxScore) * barWidth);
        const bar = '█'.repeat(barLength);
        const count = data.count;

        console.log(`│  ${date}: ${bar} ${score.toFixed(1)} (${count}件)`);
      });
    }

    console.log('│');
    console.log('└' + '─'.repeat(69) + '\n');
  }

  /**
   * 最近のアクティビティを表示
   * @param {Array} records - レコード
   */
  printRecentActivity(records) {
    console.log('┌─ 🕐 RECENT ACTIVITY (最新5件) ' + '─'.repeat(36));
    console.log('│');

    if (records.length === 0) {
      console.log('│  レコードがありません');
    } else {
      records.reverse().forEach((record, index) => {
        const timestamp = new Date(record.timestamp).toLocaleString('ja-JP');
        const score = record.finalScore || record.evaluation?.score || 'N/A';
        const type = record.type === 'improvement_session' ? '改善' : '評価';
        const status = record.success !== undefined
          ? (record.success ? '✅' : '⚠️ ')
          : '  ';

        console.log(`│  ${index + 1}. ${status} [${type}] スコア: ${score} | ${timestamp}`);

        if (record.type === 'improvement_session') {
          console.log(`│     └─ 試行: ${record.attempts}, 向上: ${record.scoreImprovement > 0 ? '+' : ''}${record.scoreImprovement?.toFixed(1) || 'N/A'}`);
        }
      });
    }

    console.log('│');
    console.log('└' + '─'.repeat(69) + '\n');
  }

  /**
   * フッターを表示
   */
  printFooter() {
    console.log('═'.repeat(70));
    console.log('  💡 コマンド: npm run eval:dashboard');
    console.log('═'.repeat(70) + '\n');
  }

  /**
   * 詳細レポートを表示
   * @param {Object} [filter] - フィルタ条件
   */
  async displayDetailedReport(filter = {}) {
    await this.history.initialize();

    console.clear();
    console.log('\n' + '═'.repeat(70));
    console.log('  📋 DETAILED EVALUATION REPORT');
    console.log('═'.repeat(70) + '\n');

    const stats = await this.history.getStatistics(filter);
    const records = await this.history.getHistory(filter);

    // 基本統計
    console.log('基本統計:');
    console.log('-'.repeat(70));
    console.log(`総レコード数: ${stats.totalRecords}`);
    console.log(`平均スコア: ${stats.scoreStatistics.average}/100`);
    console.log(`スコア範囲: ${stats.scoreStatistics.min} - ${stats.scoreStatistics.max}`);
    console.log('');

    // 改善セッション詳細
    if (stats.improvementSessions > 0) {
      console.log('改善セッション詳細:');
      console.log('-'.repeat(70));
      console.log(`成功率: ${stats.successRate}%`);
      console.log(`平均試行回数: ${stats.averageAttempts}`);
      console.log(`平均スコア向上: ${stats.averageImprovement > 0 ? '+' : ''}${stats.averageImprovement}`);
      console.log('');

      // 改善セッションの詳細リスト
      const sessions = records.filter(r => r.type === 'improvement_session');
      console.log(`改善セッション一覧 (${sessions.length}件):`);
      console.log('-'.repeat(70));

      sessions.forEach((session, index) => {
        const timestamp = new Date(session.timestamp).toLocaleString('ja-JP');
        const status = session.success ? '✅ 成功' : '⚠️  未達';

        console.log(`\n${index + 1}. ${status} | ${timestamp}`);
        console.log(`   初期スコア: ${session.initialScore}/100`);
        console.log(`   最終スコア: ${session.finalScore}/100`);
        console.log(`   スコア向上: ${session.scoreImprovement > 0 ? '+' : ''}${session.scoreImprovement?.toFixed(2)}`);
        console.log(`   試行回数: ${session.attempts}`);

        // 各試行のスコア推移
        if (session.history && session.history.length > 1) {
          console.log('   スコア推移:');
          session.history.forEach(h => {
            const label = h.attempt === 0 ? '初期' : `試行${h.attempt}`;
            console.log(`     - ${label}: ${h.score}/100 (${h.confidence})`);
          });
        }
      });
    }

    console.log('\n' + '═'.repeat(70) + '\n');
  }

  /**
   * 比較レポートを表示
   * @param {string} id1 - レコード ID 1
   * @param {string} id2 - レコード ID 2
   */
  async displayComparison(id1, id2) {
    await this.history.initialize();

    const records = await this.history.getHistory();
    const record1 = records.find(r => r.id === id1);
    const record2 = records.find(r => r.id === id2);

    if (!record1 || !record2) {
      console.error('❌ レコードが見つかりません');
      return;
    }

    console.clear();
    console.log('\n' + '═'.repeat(70));
    console.log('  🔀 COMPARISON REPORT');
    console.log('═'.repeat(70) + '\n');

    const score1 = record1.finalScore || record1.evaluation?.score || 0;
    const score2 = record2.finalScore || record2.evaluation?.score || 0;
    const diff = score2 - score1;

    console.log('レコード 1:');
    console.log(`  ID: ${record1.id}`);
    console.log(`  タイムスタンプ: ${new Date(record1.timestamp).toLocaleString('ja-JP')}`);
    console.log(`  スコア: ${score1}/100`);
    console.log('');

    console.log('レコード 2:');
    console.log(`  ID: ${record2.id}`);
    console.log(`  タイムスタンプ: ${new Date(record2.timestamp).toLocaleString('ja-JP')}`);
    console.log(`  スコア: ${score2}/100`);
    console.log('');

    console.log('比較:');
    console.log('-'.repeat(70));
    console.log(`  スコア差: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    console.log(`  向上率: ${((diff / score1) * 100).toFixed(2)}%`);

    console.log('\n' + '═'.repeat(70) + '\n');
  }
}

/**
 * CLI エントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'display';

  const dashboard = new EvaluationDashboard();

  try {
    switch (command) {
      case 'display':
        await dashboard.display();
        break;

      case 'detailed':
        await dashboard.displayDetailedReport();
        break;

      case 'compare':
        if (args.length < 3) {
          console.error('❌ 使用方法: npm run eval:dashboard compare <id1> <id2>');
          process.exit(1);
        }
        await dashboard.displayComparison(args[1], args[2]);
        break;

      case 'help':
        console.log(`
Evaluation Dashboard - 使用方法

コマンド:
  display         ダッシュボードを表示（デフォルト）
  detailed        詳細レポートを表示
  compare <id1> <id2>  2つのレコードを比較
  help            このヘルプを表示

例:
  npm run eval:dashboard
  npm run eval:dashboard detailed
  npm run eval:dashboard compare eval_123 eval_456
        `);
        break;

      default:
        console.error(`❌ 不明なコマンド: ${command}`);
        console.error('   "help" コマンドで使用方法を確認してください');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

// CLI として実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default EvaluationDashboard;
