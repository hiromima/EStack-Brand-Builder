/**
 * EvaluationAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EvaluationAgent, EvaluationCategory } from '../../src/agents/core/EvaluationAgent.js';
import { AgentType } from '../../src/agents/base/BaseAgent.js';

// テストデータ生成ヘルパー
function createTestCandidate(content, id = 1) {
  return {
    id,
    content,
    message: content
  };
}

function createTestContext() {
  return {
    estack: {
      foundation: {
        purpose: 'Test purpose',
        values: ['value1', 'value2']
      },
      structure: {
        persona: 'Test persona',
        tone: 'Professional'
      }
    }
  };
}

describe('EvaluationAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new EvaluationAgent({
      logger: mockLogger,
      threshold: 90
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.EVALUATION);
    assert.strictEqual(agent.name, 'EvaluationAgent');
    assert.strictEqual(agent.threshold, 90);
  });

  it('should initialize with custom threshold', () => {
    const customAgent = new EvaluationAgent({
      logger: mockLogger,
      threshold: 85
    });
    assert.strictEqual(customAgent.threshold, 85);
  });

  it('should initialize with default threshold', () => {
    const defaultAgent = new EvaluationAgent({
      logger: mockLogger
    });
    assert.strictEqual(defaultAgent.threshold, 90);
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    assert(agent.evaluationCriteria);
  });

  it('should load evaluation criteria', () => {
    const criteria = agent.evaluationCriteria;

    assert(criteria[EvaluationCategory.PURPOSE]);
    assert(criteria[EvaluationCategory.CORE_MESSAGE]);
    assert(criteria[EvaluationCategory.TAGLINE]);
    assert(criteria[EvaluationCategory.LOGO_CONCEPT]);
    assert(criteria[EvaluationCategory.VALUES]);
    assert(criteria[EvaluationCategory.STANCE]);
  });

  it('should have correct weights for PURPOSE category', () => {
    const purposeCriteria = agent.evaluationCriteria[EvaluationCategory.PURPOSE];

    assert.strictEqual(purposeCriteria.clarity, 2.0);
    assert.strictEqual(purposeCriteria.authenticity, 2.0);
    assert.strictEqual(purposeCriteria.consistency, 1.5);
  });

  it('should have correct weights for TAGLINE category', () => {
    const taglineCriteria = agent.evaluationCriteria[EvaluationCategory.TAGLINE];

    assert.strictEqual(taglineCriteria.memorability, 3.0);
    assert.strictEqual(taglineCriteria.clarity, 2.0);
    assert.strictEqual(taglineCriteria.emotional_resonance, 2.0);
  });

  it('should score clarity based on length', () => {
    const short = createTestCandidate('短い');
    const medium = createTestCandidate('これは中程度の長さのテキストです');
    const long = createTestCandidate('これは非常に長いテキストです。長いテキストは読みにくく、メッセージが不明瞭になる可能性があります。明瞭性を保つためには簡潔さが重要です。');

    // 長さに応じてスコアが異なることを確認
    const shortScore = agent._scoreClarity(short);
    const mediumScore = agent._scoreClarity(medium);
    const longScore = agent._scoreClarity(long);

    assert(shortScore >= mediumScore);
    assert(mediumScore >= longScore);
    assert(longScore >= 4);
  });

  it('should score consistency with context', () => {
    const candidate = createTestCandidate('Test message');
    const context = createTestContext();

    const score = agent._scoreConsistency(candidate, context);
    assert(score >= 0 && score <= 10);
  });

  it('should score consistency without context', () => {
    const candidate = createTestCandidate('Test message');
    const score = agent._scoreConsistency(candidate, null);
    assert.strictEqual(score, 7);
  });

  it('should score memorability based on rhythm and length', () => {
    const rhythmicShort = createTestCandidate('心に響く言葉を届ける');
    const plainShort = createTestCandidate('Test message');
    const long = createTestCandidate('This is a very long message that is not memorable');

    const score1 = agent._scoreMemorability(rhythmicShort);
    const score2 = agent._scoreMemorability(plainShort);
    const score3 = agent._scoreMemorability(long);

    assert(score1 >= score2);
    assert(score2 >= score3);
  });

  it('should identify strengths correctly', () => {
    const scores = {
      clarity: { score: 9, weight: 2.0 },
      consistency: { score: 8, weight: 1.5 },
      memorability: { score: 5, weight: 1.5 }
    };

    const strengths = agent._identifyStrengths(scores);

    assert(Array.isArray(strengths));
    assert(strengths.includes('clarity'));
    assert(strengths.includes('consistency'));
    assert(!strengths.includes('memorability'));
  });

  it('should identify weaknesses correctly', () => {
    const scores = {
      clarity: { score: 9, weight: 2.0 },
      consistency: { score: 5, weight: 1.5 },
      memorability: { score: 4, weight: 1.5 }
    };

    const weaknesses = agent._identifyWeaknesses(scores);

    assert(Array.isArray(weaknesses));
    assert(weaknesses.includes('consistency'));
    assert(weaknesses.includes('memorability'));
    assert(!weaknesses.includes('clarity'));
  });

  it('should generate recommendations for passing score', () => {
    const scores = {
      clarity: { score: 9, weight: 2.0 },
      consistency: { score: 9, weight: 1.5 }
    };

    const recommendations = agent._generateRecommendations(scores, 92);

    assert(Array.isArray(recommendations));
    assert(recommendations.some(r => r.includes('自動承認')));
  });

  it('should generate recommendations for medium score', () => {
    const scores = {
      clarity: { score: 8, weight: 2.0 },
      consistency: { score: 7, weight: 1.5 }
    };

    const recommendations = agent._generateRecommendations(scores, 85);

    assert(recommendations.some(r => r.includes('改善推奨')));
  });

  it('should generate recommendations for failing score', () => {
    const scores = {
      clarity: { score: 5, weight: 2.0 },
      consistency: { score: 4, weight: 1.5 }
    };

    const recommendations = agent._generateRecommendations(scores, 65);

    assert(recommendations.some(r => r.includes('改善必須')));
    assert(recommendations.some(r => r.includes('clarity')));
    assert(recommendations.some(r => r.includes('consistency')));
  });

  it('should select best candidate', () => {
    const evaluations = [
      { candidate: { id: 1 }, finalScore: 85 },
      { candidate: { id: 2 }, finalScore: 92 },
      { candidate: { id: 3 }, finalScore: 78 }
    ];

    const best = agent._selectBestCandidate(evaluations);

    assert.strictEqual(best.finalScore, 92);
    assert.strictEqual(best.candidate.id, 2);
  });

  it('should generate summary correctly', () => {
    const evaluations = [
      { finalScore: 85, passed: false },
      { finalScore: 92, passed: true },
      { finalScore: 78, passed: false }
    ];

    const bestCandidate = { finalScore: 92, passed: true };
    const summary = agent._generateSummary(evaluations, bestCandidate);

    assert.strictEqual(summary.totalEvaluated, 3);
    assert.strictEqual(summary.passedCount, 1);
    assert.strictEqual(summary.highestScore, 92);
    assert(summary.averageScore > 0);
    assert(summary.recommendation.includes('approved'));
  });

  it('should generate summary for all failing candidates', () => {
    const evaluations = [
      { finalScore: 75, passed: false },
      { finalScore: 80, passed: false },
      { finalScore: 85, passed: false }
    ];

    const bestCandidate = { finalScore: 85, passed: false };
    const summary = agent._generateSummary(evaluations, bestCandidate);

    assert.strictEqual(summary.passedCount, 0);
    assert(summary.recommendation.includes('refinement'));
  });

  it('should evaluate candidate correctly', async () => {
    const candidate = createTestCandidate('心に響く短い言葉');
    const category = EvaluationCategory.TAGLINE;
    const context = createTestContext();

    const result = await agent._evaluateCandidate(candidate, category, context);

    assert(result.candidate);
    assert(result.scores);
    assert(typeof result.finalScore === 'number');
    assert(typeof result.passed === 'boolean');
    assert(Array.isArray(result.strengths));
    assert(Array.isArray(result.weaknesses));
    assert(Array.isArray(result.recommendations));
  });

  it('should throw error for undefined category', async () => {
    const candidate = createTestCandidate('Test');

    await assert.rejects(
      async () => {
        await agent._evaluateCandidate(candidate, 'undefined_category', {});
      },
      {
        message: /未定義の評価カテゴリ/
      }
    );
  });

  it('should calculate weighted scores correctly', async () => {
    const candidate = createTestCandidate('Test message');
    const category = EvaluationCategory.PURPOSE;
    const context = createTestContext();

    const result = await agent._evaluateCandidate(candidate, category, context);

    // すべての評価軸にスコアと重みがあることを確認
    Object.values(result.scores).forEach(scoreData => {
      assert(scoreData.score >= 0 && scoreData.score <= 10);
      assert(scoreData.weight > 0);
      assert(typeof scoreData.weightedScore === 'number');
    });

    // 最終スコアが 0-100 の範囲にあることを確認
    assert(result.finalScore >= 0 && result.finalScore <= 100);
  });

  it('should process multiple candidates', async () => {
    const input = {
      candidates: [
        createTestCandidate('候補1', 1),
        createTestCandidate('候補2', 2),
        createTestCandidate('候補3', 3)
      ],
      category: EvaluationCategory.TAGLINE,
      context: createTestContext()
    };

    const result = await agent.process(input);

    assert(result.evaluations);
    assert.strictEqual(result.evaluations.length, 3);
    assert(result.bestCandidate);
    assert(result.summary);
    assert(result.metadata);
    assert.strictEqual(result.metadata.totalCandidates, 3);
    assert.strictEqual(result.metadata.category, EvaluationCategory.TAGLINE);
  });

  it('should throw error when no candidates provided', async () => {
    const input = {
      candidates: [],
      category: EvaluationCategory.PURPOSE,
      context: {}
    };

    await assert.rejects(
      async () => {
        await agent.process(input);
      },
      {
        message: /評価対象の候補がありません/
      }
    );
  });

  it('should throw error when category not provided', async () => {
    const input = {
      candidates: [createTestCandidate('Test')],
      context: {}
    };

    await assert.rejects(
      async () => {
        await agent.process(input);
      },
      {
        message: /評価カテゴリが指定されていません/
      }
    );
  });

  it('should include metadata in process result', async () => {
    const input = {
      candidates: [createTestCandidate('Test')],
      category: EvaluationCategory.PURPOSE,
      context: createTestContext()
    };

    const result = await agent.process(input);

    assert.strictEqual(result.metadata.threshold, 90);
    assert.strictEqual(result.metadata.agent, 'EvaluationAgent');
    assert(result.metadata.timestamp);
  });

  it('should return default scores for unsupported criteria', async () => {
    // _scoreCriterion のデフォルト動作をテスト
    const candidate = createTestCandidate('Test');
    const score = await agent._scoreCriterion(candidate, 'unsupported_criterion', {});

    assert.strictEqual(score, 7);
  });

  it('should score all criterion types', async () => {
    const candidate = createTestCandidate('Test');
    const context = createTestContext();

    const criteria = [
      'clarity',
      'consistency',
      'memorability',
      'differentiation',
      'authenticity',
      'emotional_resonance',
      'scalability',
      'cultural_fit',
      'tone_alignment',
      'visual_impact'
    ];

    for (const criterion of criteria) {
      const score = await agent._scoreCriterion(candidate, criterion, context);
      assert(score >= 0 && score <= 10, `${criterion} score out of range: ${score}`);
    }
  });
});
