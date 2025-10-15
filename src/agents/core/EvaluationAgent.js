/**
 * @file EvaluationAgent.js
 * @description 品質評価エージェント - ToT 評価・意思決定エージェント
 * @responsibilities
 * - ブランド成果物の品質評価
 * - Tree of Thoughts による複数案の並列評価
 * - 90点以上で自動承認
 * - 多層評価と最適案選定
 *
 * @module EvaluationAgent
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * 評価カテゴリ
 * @enum {string}
 */
export const EvaluationCategory = {
  PURPOSE: 'purpose',
  CORE_MESSAGE: 'coreMessage',
  TAGLINE: 'tagline',
  LOGO_CONCEPT: 'logoConcept',
  VALUES: 'values',
  STANCE: 'stance'
};

/**
 * EvaluationAgent クラス
 *
 * ToT プロトコルによる多層評価と最適案選定を担当
 *
 * @extends BaseAgent
 */
export class EvaluationAgent extends BaseAgent {
  /**
   * @param {Object} options - エージェント設定
   * @param {Object} [options.logger] - ロガー
   * @param {Object} [options.knowledge] - ナレッジベース
   * @param {number} [options.threshold=90] - 評価閾値
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.EVALUATION,
      name: 'EvaluationAgent'
    });

    this.options = options;
    this.threshold = this.options.threshold || 90; // 90点閾値
    this.evaluationCriteria = this._loadEvaluationCriteria();
  }

  /**
   * エージェント初期化
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[EvaluationAgent] Initializing...');
    this.logger?.info('[EvaluationAgent] Evaluation criteria loaded');
    this.logger?.info(`[EvaluationAgent] Threshold set to ${this.threshold} points`);
    this.logger?.info('[EvaluationAgent] Initialized successfully');
  }

  /**
   * メイン処理: ToT 評価実行
   *
   * @param {Object} input - 入力データ
   * @param {Array} input.candidates - 評価対象候補
   * @param {EvaluationCategory} input.category - 評価カテゴリ
   * @param {Object} input.context - コンテキスト (E:Stack等)
   * @returns {Promise<Object>} 評価結果と最適案
   */
  async process(input) {
    this.logger.info('[EvaluationAgent] ToT 評価開始', { input });

    const { candidates, category, context } = input;

    if (!candidates || candidates.length === 0) {
      throw new Error('評価対象の候補がありません');
    }

    if (!category) {
      throw new Error('評価カテゴリが指定されていません');
    }

    // 各候補をToT評価
    const evaluations = await Promise.all(
      candidates.map(candidate => this._evaluateCandidate(candidate, category, context))
    );

    // 最適案選定
    const bestCandidate = this._selectBestCandidate(evaluations);

    // 総合評価
    const summary = this._generateSummary(evaluations, bestCandidate);

    return {
      evaluations,
      bestCandidate,
      summary,
      metadata: {
        threshold: this.threshold,
        category,
        totalCandidates: candidates.length,
        timestamp: new Date().toISOString(),
        agent: this.name
      }
    };
  }

  /**
   * 候補評価
   *
   * @private
   * @param {Object} candidate - 候補
   * @param {EvaluationCategory} category - カテゴリ
   * @param {Object} context - コンテキスト
   * @returns {Promise<Object>} 評価結果
   */
  async _evaluateCandidate(candidate, category, context) {
    const criteria = this.evaluationCriteria[category];

    if (!criteria) {
      throw new Error(`未定義の評価カテゴリ: ${category}`);
    }

    // 各評価軸でスコアリング
    const scores = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [criterion, weight] of Object.entries(criteria)) {
      const score = await this._scoreCriterion(
        candidate,
        criterion,
        context
      );

      scores[criterion] = {
        score,
        weight,
        weightedScore: score * weight
      };

      totalScore += score * weight;
      maxScore += 10 * weight; // 各軸は10点満点
    }

    const finalScore = Math.round((totalScore / maxScore) * 100);

    return {
      candidate,
      scores,
      finalScore,
      passed: finalScore >= this.threshold,
      strengths: this._identifyStrengths(scores),
      weaknesses: this._identifyWeaknesses(scores),
      recommendations: this._generateRecommendations(scores, finalScore)
    };
  }

  /**
   * 評価軸スコアリング
   *
   * @private
   * @param {Object} candidate - 候補
   * @param {string} criterion - 評価軸
   * @param {Object} context - コンテキスト
   * @returns {Promise<number>} スコア (0-10)
   */
  async _scoreCriterion(candidate, criterion, context) {
    // 評価ロジック (簡易実装)
    switch (criterion) {
      case 'clarity':
        return this._scoreClarity(candidate);
      case 'consistency':
        return this._scoreConsistency(candidate, context);
      case 'memorability':
        return this._scoreMemorability(candidate);
      case 'differentiation':
        return this._scoreDifferentiation(candidate);
      case 'authenticity':
        return this._scoreAuthenticity(candidate, context);
      case 'emotional_resonance':
        return this._scoreEmotionalResonance(candidate);
      case 'scalability':
        return this._scoreScalability(candidate);
      case 'cultural_fit':
        return this._scoreCulturalFit(candidate, context);
      case 'tone_alignment':
        return this._scoreToneAlignment(candidate, context);
      case 'visual_impact':
        return this._scoreVisualImpact(candidate);
      default:
        return 7; // デフォルトスコア
    }
  }

  /**
   * 評価基準読み込み
   *
   * @private
   * @returns {Object} 評価基準
   */
  _loadEvaluationCriteria() {
    return {
      [EvaluationCategory.PURPOSE]: {
        clarity: 2.0,
        authenticity: 2.0,
        consistency: 1.5,
        emotional_resonance: 1.5,
        differentiation: 1.5,
        scalability: 1.5
      },
      [EvaluationCategory.CORE_MESSAGE]: {
        clarity: 2.5,
        consistency: 2.0,
        memorability: 1.5,
        emotional_resonance: 2.0,
        tone_alignment: 2.0
      },
      [EvaluationCategory.TAGLINE]: {
        memorability: 3.0,
        clarity: 2.0,
        emotional_resonance: 2.0,
        consistency: 1.5,
        differentiation: 1.5
      },
      [EvaluationCategory.LOGO_CONCEPT]: {
        visual_impact: 2.5,
        consistency: 2.0,
        memorability: 2.0,
        scalability: 1.5,
        differentiation: 2.0
      },
      [EvaluationCategory.VALUES]: {
        authenticity: 3.0,
        clarity: 2.0,
        consistency: 2.0,
        cultural_fit: 2.0,
        differentiation: 1.0
      },
      [EvaluationCategory.STANCE]: {
        clarity: 2.0,
        consistency: 2.5,
        authenticity: 2.5,
        differentiation: 2.0,
        emotional_resonance: 1.0
      }
    };
  }

  /**
   * スコアリング: 明瞭性
   */
  _scoreClarity(candidate) {
    const content = candidate.content || candidate.message || '';
    const length = content.length;

    if (length < 20) return 10;
    if (length < 50) return 8;
    if (length < 100) return 6;
    return 4;
  }

  /**
   * スコアリング: 一貫性
   */
  _scoreConsistency(candidate, context) {
    // E:Stack との整合性をチェック
    if (!context?.estack) return 7;
    return 8; // 簡易実装
  }

  /**
   * スコアリング: 記憶性
   */
  _scoreMemorability(candidate) {
    const content = candidate.content || '';
    const hasRhythm = /[、へをに]/.test(content);
    const isShort = content.length < 30;

    if (hasRhythm && isShort) return 10;
    if (isShort) return 7;
    return 5;
  }

  /**
   * スコアリング: 差別化
   */
  _scoreDifferentiation(candidate) {
    return 7; // 簡易実装
  }

  /**
   * スコアリング: 真正性
   */
  _scoreAuthenticity(candidate, context) {
    return 8; // 簡易実装
  }

  /**
   * スコアリング: 感情的共鳴
   */
  _scoreEmotionalResonance(candidate) {
    return 7; // 簡易実装
  }

  /**
   * スコアリング: 拡張性
   */
  _scoreScalability(candidate) {
    return 8; // 簡易実装
  }

  /**
   * スコアリング: 文化適合
   */
  _scoreCulturalFit(candidate, context) {
    return 8; // 簡易実装
  }

  /**
   * スコアリング: トーン整合
   */
  _scoreToneAlignment(candidate, context) {
    return 8; // 簡易実装
  }

  /**
   * スコアリング: 視覚的インパクト
   */
  _scoreVisualImpact(candidate) {
    return 7; // 簡易実装
  }

  /**
   * 最適案選定
   *
   * @private
   * @param {Array} evaluations - 評価結果配列
   * @returns {Object} 最適案
   */
  _selectBestCandidate(evaluations) {
    return evaluations.reduce((best, current) =>
      current.finalScore > best.finalScore ? current : best
    );
  }

  /**
   * 強み特定
   *
   * @private
   * @param {Object} scores - スコア
   * @returns {string[]}
   */
  _identifyStrengths(scores) {
    return Object.entries(scores)
      .filter(([, data]) => data.score >= 8)
      .map(([criterion]) => criterion);
  }

  /**
   * 弱み特定
   *
   * @private
   * @param {Object} scores - スコア
   * @returns {string[]}
   */
  _identifyWeaknesses(scores) {
    return Object.entries(scores)
      .filter(([, data]) => data.score < 6)
      .map(([criterion]) => criterion);
  }

  /**
   * 推奨事項生成
   *
   * @private
   * @param {Object} scores - スコア
   * @param {number} finalScore - 最終スコア
   * @returns {string[]}
   */
  _generateRecommendations(scores, finalScore) {
    const recommendations = [];

    if (finalScore >= 90) {
      recommendations.push('✅ 自動承認基準を満たしています');
    } else if (finalScore >= 80) {
      recommendations.push('⚠️ 改善推奨: 90点を目指して調整してください');
    } else {
      recommendations.push('❌ 改善必須: 以下の項目を強化してください');
    }

    const weaknesses = this._identifyWeaknesses(scores);
    weaknesses.forEach(weakness => {
      recommendations.push(`- ${weakness} の改善が必要です`);
    });

    return recommendations;
  }

  /**
   * サマリー生成
   *
   * @private
   * @param {Array} evaluations - 評価結果
   * @param {Object} bestCandidate - 最適案
   * @returns {Object}
   */
  _generateSummary(evaluations, bestCandidate) {
    const scores = evaluations.map(e => e.finalScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      totalEvaluated: evaluations.length,
      passedCount: evaluations.filter(e => e.passed).length,
      averageScore: Math.round(avgScore),
      highestScore: bestCandidate.finalScore,
      recommendation: bestCandidate.passed
        ? 'Best candidate approved for implementation'
        : 'Further refinement recommended'
    };
  }
}

export default EvaluationAgent;
