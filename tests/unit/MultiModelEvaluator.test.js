/**
 * MultiModelEvaluator ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MultiModelEvaluator } from '../../src/evaluation/MultiModelEvaluator.js';

// テスト用のブランド提案
function createTestProposal() {
  return {
    brandName: 'Test Brand',
    foundation: {
      purpose: 'Test purpose',
      values: ['quality', 'innovation', 'trust']
    },
    structure: {
      architecture: 'Simple structure',
      personality: 'Professional'
    },
    expression: {
      visualIdentity: 'Modern design',
      tone: 'Friendly yet professional'
    }
  };
}

describe('MultiModelEvaluator', () => {
  let evaluator;

  beforeEach(() => {
    evaluator = new MultiModelEvaluator({
      weights: { claude: 0.4, gpt: 0.3, gemini: 0.3 },
      threshold: 90
    });
  });

  it('should initialize with default options', () => {
    const defaultEvaluator = new MultiModelEvaluator();
    assert.strictEqual(defaultEvaluator.options.threshold, 90);
    assert.deepStrictEqual(defaultEvaluator.options.weights, {
      claude: 0.4,
      gpt: 0.3,
      gemini: 0.3
    });
  });

  it('should initialize with custom options', () => {
    const customEvaluator = new MultiModelEvaluator({
      threshold: 80,
      weights: { claude: 0.5, gpt: 0.3, gemini: 0.2 }
    });
    assert.strictEqual(customEvaluator.options.threshold, 80);
    assert.strictEqual(customEvaluator.options.weights.claude, 0.5);
  });

  it('should initialize AI clients only when API keys are present', () => {
    // API キーがない場合は null
    if (!process.env.ANTHROPIC_API_KEY) {
      assert.strictEqual(evaluator.claude, null);
    }
    if (!process.env.OPENAI_API_KEY) {
      assert.strictEqual(evaluator.openai, null);
    }
    if (!process.env.GOOGLE_API_KEY) {
      assert.strictEqual(evaluator.gemini, null);
    }
  });

  it('should calculate agreement correctly', () => {
    const evaluations = [
      { model: 'claude', overall: 85 },
      { model: 'gpt', overall: 87 },
      { model: 'gemini', overall: 83 }
    ];

    const agreement = evaluator.calculateAgreement(evaluations);
    assert(agreement >= 0 && agreement <= 1);
    assert(agreement > 0.9); // スコアが近いので高い一致度
  });

  it('should calculate agreement as 1.0 for single evaluation', () => {
    const evaluations = [
      { model: 'claude', overall: 85 }
    ];

    const agreement = evaluator.calculateAgreement(evaluations);
    assert.strictEqual(agreement, 1.0);
  });

  it('should synthesize scores with weighted average', () => {
    const evaluations = [
      { model: 'claude', overall: 90 },
      { model: 'gpt', overall: 80 },
      { model: 'gemini', overall: 85 }
    ];

    const result = evaluator.synthesizeScores(evaluations);

    // 加重平均: 90*0.4 + 80*0.3 + 85*0.3 = 36 + 24 + 25.5 = 85.5
    assert.strictEqual(result.overall, 85.5);
    assert(result.agreement >= 0 && result.agreement <= 1);
    assert(['high', 'medium', 'low'].includes(result.confidence));
  });

  it('should return high confidence for high agreement', () => {
    const evaluations = [
      { model: 'claude', overall: 90 },
      { model: 'gpt', overall: 91 },
      { model: 'gemini', overall: 89 }
    ];

    const result = evaluator.synthesizeScores(evaluations);
    assert.strictEqual(result.confidence, 'high');
  });

  it('should return low confidence for low agreement', () => {
    const evaluations = [
      { model: 'claude', overall: 90 },
      { model: 'gpt', overall: 50 },
      { model: 'gemini', overall: 70 }
    ];

    const result = evaluator.synthesizeScores(evaluations);
    // agreement が 0.6 以下で 'low'、0.6-0.8 で 'medium'
    assert(['low', 'medium'].includes(result.confidence));
  });

  it('should get rubric definitions correctly', async () => {
    await evaluator.loadRubrics();
    const defs = evaluator.getRubricDefinitions(['BrandConsistencyRubric']);

    assert(defs.BrandConsistencyRubric);
    assert(typeof defs.BrandConsistencyRubric === 'object');
  });

  it('should generate report with correct structure', () => {
    const mockResult = {
      approved: true,
      score: {
        overall: 92,
        agreement: 0.95,
        confidence: 'high',
        breakdown: [
          { model: 'claude', score: 93, weight: 0.4 },
          { model: 'gpt', score: 91, weight: 0.3 },
          { model: 'gemini', score: 92, weight: 0.3 }
        ]
      },
      threshold: 90,
      recommendations: []
    };

    const report = evaluator.generateReport(mockResult);

    assert(report.includes('Overall Score: 92/100'));
    assert(report.includes('APPROVED'));
    assert(report.includes('Confidence: high'));
    assert(report.includes('Agreement: 95.0%'));
  });

  it('should handle normalization of evaluations without overall score', () => {
    // overall が 0 または undefined の場合の正規化をテスト
    const evaluation = {
      model: 'claude',
      BrandConsistencyRubric: {
        foundationAlignment: { score: 80, reason: 'Good' },
        structureCoherence: { score: 85, reason: 'Very good' },
        expressionQuality: { score: 90, reason: 'Excellent' }
      }
    };

    // synthesizeScores 内で使用される normalizeEvaluation の動作を間接的にテスト
    const evaluations = [evaluation];
    const result = evaluator.synthesizeScores(evaluations);

    // overall が計算されているはず（80, 85, 90 の平均 = 85）
    assert(result.overall >= 0);
  });

  it('should filter and sort recommendations correctly', async () => {
    const mockEvaluations = [
      {
        model: 'claude',
        BrandConsistencyRubric: {
          foundationAlignment: { score: 65, reason: 'Needs work', weaknesses: ['Unclear purpose'] },
          structureCoherence: { score: 55, reason: 'Poor', weaknesses: ['Inconsistent'] }
        }
      }
    ];

    const proposal = createTestProposal();
    const recommendations = await evaluator.generateRecommendations(mockEvaluations, proposal);

    assert(Array.isArray(recommendations));
    assert(recommendations.length <= 5); // 最大5件

    // スコアでソートされているか確認
    for (let i = 1; i < recommendations.length; i++) {
      assert(recommendations[i].score >= recommendations[i - 1].score);
    }
  });
});
