/**
 * AutoImprover ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AutoImprover } from '../../src/evaluation/AutoImprover.js';

// テストデータ生成ヘルパー
function createTestProposal() {
  return {
    brandName: 'Test Brand',
    foundation: {
      purpose: 'Test purpose',
      values: ['quality', 'innovation'],
      stance: 'Professional'
    },
    structure: {
      coreMessage: 'Test message',
      tagline: 'Test tagline'
    },
    expression: {
      logo: {
        concept: 'Modern',
        colors: ['blue', 'white']
      },
      visualIdentity: {
        typography: 'Sans-serif',
        imagery: 'Minimal'
      }
    }
  };
}

function createTestEvaluation(score = 75, approved = false) {
  return {
    approved,
    score: {
      overall: score,
      confidence: score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low',
      agreement: score >= 85 ? 0.9 : score >= 70 ? 0.75 : 0.6,
      breakdown: [
        { model: 'claude', score: score + 2, weight: 0.4 },
        { model: 'gpt', score: score - 2, weight: 0.3 },
        { model: 'gemini', score: score, weight: 0.3 }
      ]
    },
    evaluations: [
      {
        model: 'claude',
        overall: score + 2,
        summary: 'Test summary'
      },
      {
        model: 'gpt',
        overall: score - 2,
        summary: 'Test summary'
      },
      {
        model: 'gemini',
        overall: score,
        summary: 'Test summary'
      }
    ],
    recommendations: score < 90 ? [
      {
        category: 'BrandConsistencyRubric',
        criterion: 'foundationAlignment',
        score: 65,
        reason: 'Needs improvement',
        weaknesses: ['Unclear purpose']
      }
    ] : []
  };
}

describe('AutoImprover', () => {
  let improver;

  beforeEach(() => {
    // API キーがないため、インスタンス作成のみテスト
    if (process.env.ANTHROPIC_API_KEY) {
      improver = new AutoImprover({
        maxAttempts: 3,
        targetScore: 90
      });
    }
  });

  it('should initialize with default options', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping AutoImprover initialization (no API key)');
      return;
    }

    assert.strictEqual(improver.options.maxAttempts, 3);
    assert.strictEqual(improver.options.targetScore, 90);
    assert.strictEqual(improver.options.improvementModel, 'claude-sonnet-4-5-20250929');
  });

  it('should initialize with custom options', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping custom options test (no API key)');
      return;
    }

    const customImprover = new AutoImprover({
      maxAttempts: 5,
      targetScore: 85,
      improvementModel: 'claude-3-5-sonnet-20241022'
    });

    assert.strictEqual(customImprover.options.maxAttempts, 5);
    assert.strictEqual(customImprover.options.targetScore, 85);
    assert.strictEqual(customImprover.options.improvementModel, 'claude-3-5-sonnet-20241022');
  });

  it('should build improvement prompt correctly', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping prompt building test (no API key)');
      return;
    }

    const proposal = createTestProposal();
    const evaluation = createTestEvaluation(75);

    const prompt = improver.buildImprovementPrompt(proposal, evaluation, ['BrandConsistencyRubric'], 1);

    assert(prompt.includes('Test Brand'));
    assert(prompt.includes('75/100'));
    assert(prompt.includes('目標スコア: 90'));
    assert(prompt.includes('foundationAlignment'));
    assert(prompt.includes('1 回目の改善試行'));
  });

  it('should generate improvement summary for no improvement', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping summary generation test (no API key)');
      return;
    }

    const history = [
      {
        attempt: 0,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(75)
      }
    ];

    const summary = improver.generateImprovementSummary(history);
    assert(summary.includes('改善は実行されませんでした'));
  });

  it('should generate improvement summary with progress', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping progress summary test (no API key)');
      return;
    }

    const history = [
      {
        attempt: 0,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(75)
      },
      {
        attempt: 1,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(82)
      },
      {
        attempt: 2,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(91, true)
      }
    ];

    const summary = improver.generateImprovementSummary(history);

    assert(summary.includes('改善試行回数: 2'));
    assert(summary.includes('初期スコア: 75/100'));
    assert(summary.includes('最終スコア: 91/100'));
    assert(summary.includes('スコア向上: +16.00点'));
    assert(summary.includes('初期: 75/100'));
    assert(summary.includes('試行1: 82/100'));
    assert(summary.includes('試行2: 91/100'));
  });

  it('should extract improvements correctly', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping extract improvements test (no API key)');
      return;
    }

    const history = [
      {
        attempt: 0,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(75) // confidence: medium, agreement: 0.75
      },
      {
        attempt: 1,
        proposal: createTestProposal(),
        evaluation: createTestEvaluation(91, true) // confidence: high, agreement: 0.9
      }
    ];

    const improvements = improver.extractImprovements(history);

    assert(Array.isArray(improvements));
    assert(improvements.length > 0);
    // 信頼度が medium → high に向上
    assert(improvements.some(imp => imp.includes('信頼度が向上')));
    // 一致度が 0.75 → 0.9 に向上
    assert(improvements.some(imp => imp.includes('一致度')));
  });

  it('should generate report with success result', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping success report test (no API key)');
      return;
    }

    const result = {
      success: true,
      attempts: 2,
      finalProposal: createTestProposal(),
      finalEvaluation: createTestEvaluation(92, true),
      history: [
        {
          attempt: 0,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(75)
        },
        {
          attempt: 1,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(85)
        },
        {
          attempt: 2,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(92, true)
        }
      ],
      improvementSummary: 'Test summary'
    };

    const report = improver.generateReport(result);

    assert(report.includes('Auto-Improvement Report'));
    assert(report.includes('✅ 成功（目標達成）'));
    assert(report.includes('試行回数: 2/3'));
    assert(report.includes('最終スコア: 92/100'));
    assert(report.includes('目標スコア: 90'));
  });

  it('should generate report with partial success result', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping partial success report test (no API key)');
      return;
    }

    const result = {
      success: false,
      attempts: 3,
      finalProposal: createTestProposal(),
      finalEvaluation: createTestEvaluation(85),
      history: [
        {
          attempt: 0,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(75)
        },
        {
          attempt: 1,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(80)
        },
        {
          attempt: 2,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(82)
        },
        {
          attempt: 3,
          proposal: createTestProposal(),
          evaluation: createTestEvaluation(85)
        }
      ],
      improvementSummary: 'Test summary'
    };

    const report = improver.generateReport(result);

    assert(report.includes('⚠️  部分的成功（目標未達）'));
    assert(report.includes('試行回数: 3/3'));
    assert(report.includes('最終スコア: 85/100'));
    assert(report.includes('残存する改善推奨事項'));
  });

  it('should detect confidence level improvements', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping confidence detection test (no API key)');
      return;
    }

    const history = [
      {
        attempt: 0,
        evaluation: {
          score: { confidence: 'low', agreement: 0.5 },
          recommendations: [{ category: 'test' }]
        }
      },
      {
        attempt: 1,
        evaluation: {
          score: { confidence: 'high', agreement: 0.9 },
          recommendations: []
        }
      }
    ];

    const improvements = improver.extractImprovements(history);

    // 信頼度が low → high に向上していることを確認
    assert(improvements.some(imp => imp.includes('信頼度')));
    // 一致度の向上も検出
    assert(improvements.some(imp => imp.includes('一致度')));
    // 推奨事項の減少も検出
    assert(improvements.some(imp => imp.includes('推奨事項')));
  });

  it('should handle history with no improvements gracefully', () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  TEST_MODE: Skipping no improvements test (no API key)');
      return;
    }

    const history = [
      {
        attempt: 0,
        evaluation: createTestEvaluation(75)
      },
      {
        attempt: 1,
        evaluation: createTestEvaluation(74) // スコアが下がった
      }
    ];

    const improvements = improver.extractImprovements(history);

    assert(Array.isArray(improvements));
    // 改善がない場合でもデフォルトメッセージを返す
    assert(improvements.length > 0);
    assert(improvements.includes('スコアの全般的な向上'));
  });
});
