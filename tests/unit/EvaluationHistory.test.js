/**
 * EvaluationHistory ユニットテスト
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { EvaluationHistory } from '../../src/evaluation/EvaluationHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用の一時ディレクトリ
const TEST_STORAGE_DIR = path.join(__dirname, '../fixtures/test_eval_history');

// テストデータ生成ヘルパー
function createTestProposal() {
  return {
    brandName: 'Test Brand',
    foundation: { purpose: 'Test purpose' },
    structure: { architecture: 'Simple' }
  };
}

function createTestEvaluation() {
  return {
    approved: true,
    score: {
      overall: 85,
      confidence: 'high',
      agreement: 0.9,
      breakdown: [
        { model: 'claude', score: 86, weight: 0.4 },
        { model: 'gpt', score: 84, weight: 0.3 },
        { model: 'gemini', score: 85, weight: 0.3 }
      ]
    }
  };
}

function createTestImprovementResult() {
  return {
    success: true,
    attempts: 2,
    history: [
      {
        attempt: 1,
        evaluation: {
          score: { overall: 75, confidence: 'medium', agreement: 0.8 },
          approved: false
        }
      },
      {
        attempt: 2,
        evaluation: {
          score: { overall: 92, confidence: 'high', agreement: 0.95 },
          approved: true
        }
      }
    ],
    finalEvaluation: {
      score: { overall: 92, confidence: 'high', agreement: 0.95 },
      threshold: 90,
      approved: true
    },
    improvementSummary: 'Successfully improved brand proposal'
  };
}

describe('EvaluationHistory', () => {
  let history;

  beforeEach(async () => {
    // テスト用の一時ストレージを使用
    history = new EvaluationHistory({
      storageDir: TEST_STORAGE_DIR,
      autoSave: false // テストでは手動保存
    });
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    try {
      // 少し待ってからクリーンアップ（ファイルハンドルが閉じられるのを待つ）
      await new Promise(resolve => setTimeout(resolve, 10));
      await fs.rm(TEST_STORAGE_DIR, { recursive: true, force: true });
    } catch (error) {
      // ディレクトリが存在しない場合やアクセスできない場合は無視
      if (error.code !== 'ENOENT' && error.code !== 'EBUSY') {
        console.warn('Cleanup warning:', error.message);
      }
    }
  });

  it('should initialize with default options', async () => {
    const defaultHistory = new EvaluationHistory();
    assert(defaultHistory.options.storageDir);
    assert.strictEqual(defaultHistory.options.autoSave, true);
    assert.strictEqual(defaultHistory.initialized, false);
  });

  it('should initialize and create storage directory', async () => {
    await history.initialize();
    assert.strictEqual(history.initialized, true);
    assert(Array.isArray(history.history));

    // ディレクトリが作成されたことを確認
    const stats = await fs.stat(TEST_STORAGE_DIR);
    assert(stats.isDirectory());
  });

  it('should generate unique record IDs', () => {
    const id1 = history.generateRecordId();
    const id2 = history.generateRecordId();

    assert(id1.startsWith('eval_'));
    assert(id2.startsWith('eval_'));
    assert.notStrictEqual(id1, id2);
  });

  it('should add single evaluation record', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    const recordId = await history.addEvaluation(proposal, evaluation, { source: 'test' });

    assert(recordId.startsWith('eval_'));
    assert.strictEqual(history.history.length, 1);

    const record = history.history[0];
    assert.strictEqual(record.type, 'single_evaluation');
    assert.strictEqual(record.proposal.brandName, 'Test Brand');
    assert.strictEqual(record.evaluation.score, 85);
    assert.strictEqual(record.evaluation.approved, true);
  });

  it('should add improvement session record', async () => {
    const improvementResult = createTestImprovementResult();

    const recordId = await history.addImprovementSession(improvementResult);

    assert(recordId.startsWith('eval_'));
    assert.strictEqual(history.history.length, 1);

    const record = history.history[0];
    assert.strictEqual(record.type, 'improvement_session');
    assert.strictEqual(record.success, true);
    assert.strictEqual(record.attempts, 2);
    assert.strictEqual(record.initialScore, 75);
    assert.strictEqual(record.finalScore, 92);
    assert.strictEqual(record.scoreImprovement, 17);
  });

  it('should save and load history', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    await history.addEvaluation(proposal, evaluation);
    await history.save();

    // 新しいインスタンスで読み込み
    const history2 = new EvaluationHistory({
      storageDir: TEST_STORAGE_DIR
    });
    await history2.initialize();

    assert.strictEqual(history2.history.length, 1);
    assert.strictEqual(history2.history[0].proposal.brandName, 'Test Brand');
  });

  it('should filter history by type', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();
    const improvementResult = createTestImprovementResult();

    await history.addEvaluation(proposal, evaluation);
    await history.addImprovementSession(improvementResult);

    const evaluations = await history.getHistory({ type: 'single_evaluation' });
    const sessions = await history.getHistory({ type: 'improvement_session' });

    assert.strictEqual(evaluations.length, 1);
    assert.strictEqual(sessions.length, 1);
  });

  it('should filter history by score range', async () => {
    const proposal = createTestProposal();

    await history.addEvaluation(proposal, { ...createTestEvaluation(), score: { overall: 70 } });
    await history.addEvaluation(proposal, { ...createTestEvaluation(), score: { overall: 85 } });
    await history.addEvaluation(proposal, { ...createTestEvaluation(), score: { overall: 95 } });

    const highScores = await history.getHistory({ minScore: 80 });
    const midScores = await history.getHistory({ minScore: 70, maxScore: 90 });

    assert.strictEqual(highScores.length, 2);
    assert.strictEqual(midScores.length, 2);
  });

  it('should limit history results', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    for (let i = 0; i < 10; i++) {
      await history.addEvaluation(proposal, evaluation);
    }

    const limited = await history.getHistory({ limit: 5 });
    assert.strictEqual(limited.length, 5);
  });

  it('should calculate statistics correctly', async () => {
    const proposal = createTestProposal();
    const improvementResult = createTestImprovementResult();

    await history.addEvaluation(proposal, createTestEvaluation());
    await history.addImprovementSession(improvementResult);
    await history.addImprovementSession({ ...improvementResult, success: false });

    const stats = await history.getStatistics();

    assert.strictEqual(stats.totalRecords, 3);
    assert.strictEqual(stats.evaluations, 1);
    assert.strictEqual(stats.improvementSessions, 2);
    assert.strictEqual(stats.successRate, 50); // 1/2 成功
    assert(stats.scoreStatistics.average > 0);
  });

  it('should return empty statistics for no records', async () => {
    const stats = await history.getStatistics();

    assert.strictEqual(stats.totalRecords, 0);
    assert.strictEqual(stats.averageScore, 0);
    assert.strictEqual(stats.successRate, 0);
  });

  it('should generate report with correct format', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    await history.addEvaluation(proposal, evaluation);

    const report = await history.generateReport();

    assert(report.includes('Evaluation History Report'));
    assert(report.includes('総レコード数: 1'));
    assert(report.includes('単一評価: 1'));
    assert(report.includes('平均スコア:'));
  });

  it('should calculate trends correctly', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    // 複数の評価を追加
    for (let i = 0; i < 5; i++) {
      await history.addEvaluation(proposal, evaluation);
    }

    const trends = await history.getTrends(30);

    assert.strictEqual(trends.period, '30 days');
    assert(trends.dataPoints >= 0);
    assert(Array.isArray(trends.trend));
  });

  it('should clear history', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();

    await history.addEvaluation(proposal, evaluation);
    assert.strictEqual(history.history.length, 1);

    await history.clear();
    assert.strictEqual(history.history.length, 0);
  });

  it('should export and import history', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();
    const exportPath = path.join(TEST_STORAGE_DIR, 'export.json');

    await history.addEvaluation(proposal, evaluation);
    await history.export(exportPath);

    // 新しいインスタンスでインポート
    const history2 = new EvaluationHistory({
      storageDir: TEST_STORAGE_DIR + '_2'
    });
    await history2.import(exportPath);

    assert.strictEqual(history2.history.length, 1);
    assert.strictEqual(history2.history[0].proposal.brandName, 'Test Brand');
  });

  it('should merge imported history', async () => {
    const proposal = createTestProposal();
    const evaluation = createTestEvaluation();
    const exportPath = path.join(TEST_STORAGE_DIR, 'export.json');

    // 最初のデータ
    await history.addEvaluation(proposal, evaluation);
    await history.export(exportPath);

    // 別のデータを追加
    await history.addEvaluation(proposal, evaluation);

    // マージモードでインポート
    await history.import(exportPath, true);

    assert.strictEqual(history.history.length, 3); // 2 + 1 (merged)
  });
});
