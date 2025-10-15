#!/usr/bin/env node

/**
 * CoordinatorAgent - 依存関係分析と実行計画生成
 *
 * 全 14 サブ Issue の依存関係を分析し、最適な実行順序を決定します。
 */

import { CoordinatorAgent } from '../src/agents/support/CoordinatorAgent.js';
import { Logger } from '../src/utils/Logger.js';

const logger = new Logger('DependencyAnalysis');

// 全サブ Issue 定義
const subIssues = [
  // Issue #102: 動的知識ベース
  {
    id: '102-1',
    title: 'Vector Database セットアップ',
    priority: 'P1-high',
    estimatedDays: 2,
    dependencies: [],
    agents: ['SystemRegistryAgent', 'CostMonitoringAgent'],
    tags: ['infrastructure', 'knowledge-system']
  },
  {
    id: '102-2',
    title: 'KnowledgeEntry データモデル実装',
    priority: 'P0-critical',
    estimatedDays: 1,
    dependencies: [],
    agents: ['CoordinatorAgent'],
    tags: ['core', 'schema', 'knowledge-system']
  },
  {
    id: '102-3',
    title: 'Vector Embeddings 統合',
    priority: 'P1-high',
    estimatedDays: 2,
    dependencies: ['102-1', '102-2'],
    agents: ['CoordinatorAgent', 'CostMonitoringAgent'],
    tags: ['ai-integration', 'knowledge-system']
  },
  {
    id: '102-4',
    title: 'セマンティック検索エンジン実装',
    priority: 'P1-high',
    estimatedDays: 3,
    dependencies: ['102-1', '102-3'],
    agents: ['CoordinatorAgent'],
    tags: ['search', 'knowledge-system']
  },
  {
    id: '102-5',
    title: '引用グラフ構築システム',
    priority: 'P2-medium',
    estimatedDays: 3,
    dependencies: ['102-2'],
    agents: ['CoordinatorAgent'],
    tags: ['graph', 'knowledge-system']
  },
  {
    id: '102-6',
    title: '時系列バージョニングシステム',
    priority: 'P2-medium',
    estimatedDays: 2,
    dependencies: ['102-2'],
    agents: ['AuditAgent'],
    tags: ['versioning', 'knowledge-system']
  },
  {
    id: '102-7',
    title: 'KnowledgeLoader v2.0 統合',
    priority: 'P0-critical',
    estimatedDays: 3,
    dependencies: ['102-1', '102-2', '102-3', '102-4', '102-5', '102-6'],
    agents: ['CoordinatorAgent', 'SystemRegistryAgent'],
    tags: ['core', 'knowledge-system']
  },

  // Issue #103: 自動評価システム
  {
    id: '103-1',
    title: '評価基準 JSON Schema 設計',
    priority: 'P0-critical',
    estimatedDays: 2,
    dependencies: [],
    agents: ['CoordinatorAgent'],
    tags: ['schema', 'evaluation']
  },
  {
    id: '103-2',
    title: '多モデル評価エンジン実装',
    priority: 'P0-critical',
    estimatedDays: 3,
    dependencies: ['103-1'],
    agents: ['CoordinatorAgent', 'CostMonitoringAgent'],
    tags: ['ai-integration', 'evaluation']
  },
  {
    id: '103-3',
    title: '自動改善ループ実装',
    priority: 'P1-high',
    estimatedDays: 4,
    dependencies: ['103-2'],
    agents: ['CoordinatorAgent'],
    tags: ['self-improvement', 'evaluation']
  },
  {
    id: '103-4',
    title: '評価履歴トラッキングシステム',
    priority: 'P2-medium',
    estimatedDays: 2,
    dependencies: ['103-2'],
    agents: ['AuditAgent'],
    tags: ['tracking', 'evaluation']
  },
  {
    id: '103-5',
    title: '評価ダッシュボード UI 実装',
    priority: 'P2-medium',
    estimatedDays: 3,
    dependencies: ['103-4'],
    agents: ['CoordinatorAgent'],
    tags: ['ui', 'evaluation']
  },
  {
    id: '103-6',
    title: 'Zero-Human Approval Protocol 実装',
    priority: 'P0-critical',
    estimatedDays: 2,
    dependencies: ['103-2'],
    agents: ['CoordinatorAgent', 'IncidentCommanderAgent'],
    tags: ['automation', 'evaluation']
  },
  {
    id: '103-7',
    title: '評価システム統合テスト',
    priority: 'P1-high',
    estimatedDays: 2,
    dependencies: ['103-1', '103-2', '103-3', '103-4', '103-5', '103-6'],
    agents: ['CoordinatorAgent', 'SystemRegistryAgent'],
    tags: ['testing', 'evaluation']
  }
];

/**
 * トポロジカルソートによる実行順序決定
 */
function topologicalSort(issues) {
  const sorted = [];
  const visited = new Set();
  const temp = new Set();

  function visit(issueId) {
    if (temp.has(issueId)) {
      throw new Error(`Circular dependency detected: ${issueId}`);
    }
    if (visited.has(issueId)) {
      return;
    }

    temp.add(issueId);

    const issue = issues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    // 依存関係を先に処理
    for (const dep of issue.dependencies) {
      visit(dep);
    }

    temp.delete(issueId);
    visited.add(issueId);
    sorted.push(issue);
  }

  // 依存関係のないタスクから開始
  for (const issue of issues) {
    if (!visited.has(issue.id)) {
      visit(issue.id);
    }
  }

  return sorted;
}

/**
 * Wave 単位でグルーピング
 * 同じ Wave のタスクは並列実行可能
 */
function groupIntoWaves(sortedIssues) {
  const waves = [];
  const completed = new Set();

  while (completed.size < sortedIssues.length) {
    const currentWave = [];

    for (const issue of sortedIssues) {
      if (completed.has(issue.id)) continue;

      // 全ての依存関係が完了しているかチェック
      const allDepsCompleted = issue.dependencies.every(dep => completed.has(dep));

      if (allDepsCompleted) {
        currentWave.push(issue);
        completed.add(issue.id);
      }
    }

    if (currentWave.length === 0) {
      throw new Error('Unable to resolve dependencies - possible circular dependency');
    }

    waves.push(currentWave);
  }

  return waves;
}

/**
 * クリティカルパス分析
 */
function analyzeCriticalPath(waves) {
  let totalDays = 0;
  const criticalPath = [];

  for (const wave of waves) {
    // Wave 内の最長タスクが実行時間を決定
    const maxDays = Math.max(...wave.map(issue => issue.estimatedDays));
    totalDays += maxDays;

    const longestTask = wave.find(issue => issue.estimatedDays === maxDays);
    criticalPath.push(longestTask);
  }

  return { totalDays, criticalPath };
}

/**
 * エージェント負荷分析
 */
function analyzeAgentLoad(issues) {
  const agentLoad = {};

  for (const issue of issues) {
    for (const agent of issue.agents) {
      if (!agentLoad[agent]) {
        agentLoad[agent] = {
          taskCount: 0,
          totalDays: 0,
          tasks: []
        };
      }
      agentLoad[agent].taskCount++;
      agentLoad[agent].totalDays += issue.estimatedDays;
      agentLoad[agent].tasks.push(issue.id);
    }
  }

  return agentLoad;
}

/**
 * 実行計画生成
 */
async function generateExecutionPlan() {
  logger.info('🚀 CoordinatorAgent - 依存関係分析開始');

  try {
    // 1. トポロジカルソート
    logger.info('\n📋 Step 1: トポロジカルソート実行');
    const sortedIssues = topologicalSort(subIssues);
    logger.info(`✅ ソート完了: ${sortedIssues.length} タスク`);

    // 2. Wave グルーピング
    logger.info('\n📊 Step 2: Wave グルーピング');
    const waves = groupIntoWaves(sortedIssues);
    logger.info(`✅ ${waves.length} Wave に分割`);

    // 3. クリティカルパス分析
    logger.info('\n🎯 Step 3: クリティカルパス分析');
    const { totalDays, criticalPath } = analyzeCriticalPath(waves);
    logger.info(`✅ 総実行時間: ${totalDays} days`);

    // 4. エージェント負荷分析
    logger.info('\n🤖 Step 4: エージェント負荷分析');
    const agentLoad = analyzeAgentLoad(subIssues);

    // 5. 結果出力
    logger.info('\n' + '='.repeat(80));
    logger.info('📈 実行計画サマリ');
    logger.info('='.repeat(80));

    console.log('\n## Wave 別実行計画\n');

    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      const maxDays = Math.max(...wave.map(issue => issue.estimatedDays));

      console.log(`### Wave ${i + 1} (${maxDays} days - 並列実行)`);
      console.log('');
      console.log('```');

      for (const issue of wave) {
        const depStr = issue.dependencies.length > 0
          ? ` (depends: ${issue.dependencies.join(', ')})`
          : ' (no dependencies)';
        console.log(`[${issue.priority}] #${issue.id}: ${issue.title}`);
        console.log(`  ├─ 見積: ${issue.estimatedDays}d`);
        console.log(`  ├─ 担当: ${issue.agents.join(', ')}`);
        console.log(`  └─ 依存:${depStr}`);
      }

      console.log('```');
      console.log('');
    }

    console.log('\n## クリティカルパス\n');
    console.log('```');
    for (let i = 0; i < criticalPath.length; i++) {
      const task = criticalPath[i];
      console.log(`Wave ${i + 1}: #${task.id} - ${task.title} (${task.estimatedDays}d)`);
    }
    console.log(`\n総実行時間: ${totalDays} days`);
    console.log('```');

    console.log('\n## エージェント負荷分析\n');
    console.log('| エージェント | タスク数 | 総日数 | 担当タスク |');
    console.log('|-------------|---------|--------|-----------|');

    const sortedAgents = Object.entries(agentLoad)
      .sort((a, b) => b[1].taskCount - a[1].taskCount);

    for (const [agent, load] of sortedAgents) {
      console.log(`| ${agent} | ${load.taskCount} | ${load.totalDays}d | ${load.tasks.join(', ')} |`);
    }

    console.log('\n## 並列実行による効率化\n');

    const sequentialDays = subIssues.reduce((sum, issue) => sum + issue.estimatedDays, 0);
    const parallelDays = totalDays;
    const efficiency = ((sequentialDays - parallelDays) / sequentialDays * 100).toFixed(1);

    console.log('```');
    console.log(`順次実行: ${sequentialDays} days`);
    console.log(`並列実行: ${parallelDays} days`);
    console.log(`削減率: ${efficiency}%`);
    console.log('```');

    logger.info('\n✅ 依存関係分析完了');

    return {
      waves,
      totalDays,
      criticalPath,
      agentLoad,
      efficiency: parseFloat(efficiency)
    };

  } catch (error) {
    logger.error('❌ 依存関係分析エラー:', error);
    throw error;
  }
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  generateExecutionPlan()
    .then(() => {
      logger.info('\n🎉 分析完了');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('分析失敗:', error);
      process.exit(1);
    });
}

export { generateExecutionPlan, topologicalSort, groupIntoWaves };
