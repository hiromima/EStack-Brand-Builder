#!/usr/bin/env node

/**
 * 簡易版依存関係分析
 */

// 全サブ Issue 定義
const subIssues = [
  // Issue #102: 動的知識ベース
  { id: '102-1', title: 'Vector Database セットアップ', days: 2, deps: [], priority: 'P1', agents: ['SystemRegistry', 'CostMonitoring'] },
  { id: '102-2', title: 'KnowledgeEntry データモデル', days: 1, deps: [], priority: 'P0', agents: ['Coordinator'] },
  { id: '102-3', title: 'Vector Embeddings 統合', days: 2, deps: ['102-1', '102-2'], priority: 'P1', agents: ['Coordinator', 'CostMonitoring'] },
  { id: '102-4', title: 'セマンティック検索エンジン', days: 3, deps: ['102-1', '102-3'], priority: 'P1', agents: ['Coordinator'] },
  { id: '102-5', title: '引用グラフ構築', days: 3, deps: ['102-2'], priority: 'P2', agents: ['Coordinator'] },
  { id: '102-6', title: '時系列バージョニング', days: 2, deps: ['102-2'], priority: 'P2', agents: ['Audit'] },
  { id: '102-7', title: 'KnowledgeLoader v2 統合', days: 3, deps: ['102-1', '102-2', '102-3', '102-4', '102-5', '102-6'], priority: 'P0', agents: ['Coordinator', 'SystemRegistry'] },

  // Issue #103: 自動評価システム
  { id: '103-1', title: '評価基準 JSON Schema', days: 2, deps: [], priority: 'P0', agents: ['Coordinator'] },
  { id: '103-2', title: '多モデル評価エンジン', days: 3, deps: ['103-1'], priority: 'P0', agents: ['Coordinator', 'CostMonitoring'] },
  { id: '103-3', title: '自動改善ループ', days: 4, deps: ['103-2'], priority: 'P1', agents: ['Coordinator'] },
  { id: '103-4', title: '評価履歴トラッキング', days: 2, deps: ['103-2'], priority: 'P2', agents: ['Audit'] },
  { id: '103-5', title: '評価ダッシュボード UI', days: 3, deps: ['103-4'], priority: 'P2', agents: ['Coordinator'] },
  { id: '103-6', title: 'Zero-Human Approval', days: 2, deps: ['103-2'], priority: 'P0', agents: ['Coordinator', 'IncidentCommander'] },
  { id: '103-7', title: '評価システム統合テスト', days: 2, deps: ['103-1', '103-2', '103-3', '103-4', '103-5', '103-6'], priority: 'P1', agents: ['Coordinator', 'SystemRegistry'] }
];

// Wave グルーピング（修正版）
function groupIntoWaves(issues) {
  const waves = [];
  const completed = new Set();
  const issueMap = new Map(issues.map(i => [i.id, i]));

  while (completed.size < issues.length) {
    const currentWave = [];

    for (const issue of issues) {
      if (completed.has(issue.id)) continue;

      // 全ての依存関係が完了しているかチェック
      const allDepsCompleted = issue.deps.every(dep => completed.has(dep));

      if (allDepsCompleted) {
        currentWave.push(issue);
      }
    }

    if (currentWave.length === 0) {
      console.error('ERROR: 循環依存または解決不可能な依存関係を検出');
      break;
    }

    // このWaveのタスクを完了済みにマーク
    currentWave.forEach(issue => completed.add(issue.id));
    waves.push(currentWave);
  }

  return waves;
}

// 実行
console.log('🚀 CoordinatorAgent - 依存関係分析\n');
console.log('='.repeat(80));

const waves = groupIntoWaves(subIssues);

console.log('\n## Wave 別実行計画\n');

let totalMaxDays = 0;

for (let i = 0; i < waves.length; i++) {
  const wave = waves[i];
  const maxDays = Math.max(...wave.map(issue => issue.days));
  totalMaxDays += maxDays;

  console.log(`### Wave ${i + 1} (${maxDays} days - 並列実行可能)`);
  console.log('');

  for (const issue of wave) {
    const depStr = issue.deps.length > 0 ? ` ← [${issue.deps.join(', ')}]` : ' (依存なし)';
    console.log(`  [${issue.priority}] #${issue.id}: ${issue.title}`);
    console.log(`      見積: ${issue.days}d | 担当: ${issue.agents.join(', ')}${depStr}`);
  }

  console.log('');
}

console.log('\n## クリティカルパス分析\n');

const criticalPath = [];
for (const wave of waves) {
  const longest = wave.reduce((max, issue) => issue.days > max.days ? issue : max);
  criticalPath.push(longest);
}

console.log('```');
for (let i = 0; i < criticalPath.length; i++) {
  const task = criticalPath[i];
  console.log(`Wave ${i + 1}: #${task.id} - ${task.title} (${task.days}d)`);
}
console.log(`\n総実行時間: ${totalMaxDays} days (約 ${Math.ceil(totalMaxDays / 5)} weeks)`);
console.log('```');

console.log('\n## エージェント負荷分析\n');

const agentLoad = {};
for (const issue of subIssues) {
  for (const agent of issue.agents) {
    if (!agentLoad[agent]) {
      agentLoad[agent] = { count: 0, days: 0, tasks: [] };
    }
    agentLoad[agent].count++;
    agentLoad[agent].days += issue.days;
    agentLoad[agent].tasks.push(issue.id);
  }
}

console.log('| エージェント | タスク数 | 総日数 | 担当タスク |');
console.log('|-------------|---------|--------|-----------|');

Object.entries(agentLoad)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([agent, load]) => {
    console.log(`| ${agent} | ${load.count} | ${load.days}d | ${load.tasks.join(', ')} |`);
  });

console.log('\n## 効率化分析\n');

const sequentialDays = subIssues.reduce((sum, issue) => sum + issue.days, 0);
const efficiency = ((sequentialDays - totalMaxDays) / sequentialDays * 100).toFixed(1);

console.log('```');
console.log(`順次実行: ${sequentialDays} days`);
console.log(`並列実行: ${totalMaxDays} days`);
console.log(`削減率: ${efficiency}%`);
console.log(`短縮: ${sequentialDays - totalMaxDays} days`);
console.log('```');

console.log('\n✅ 依存関係分析完了\n');
