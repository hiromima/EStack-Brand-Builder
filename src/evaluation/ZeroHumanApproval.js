import { Logger } from '../utils/Logger.js';
import { MultiModelEvaluator } from './MultiModelEvaluator.js';
import { EvaluationHistory } from './EvaluationHistory.js';

const logger = new Logger('ZeroHumanApproval');

/**
 * ZeroHumanApproval - Zero-Human Approval Protocol
 *
 * 多モデル評価による自動承認プロトコル。
 * 90 点以上のスコアとモデル間高合意で自動承認を実現します。
 *
 * @class
 * @example
 * const protocol = new ZeroHumanApproval();
 * await protocol.initialize();
 * const result = await protocol.evaluate(proposal);
 */
export class ZeroHumanApproval {
  /**
   * ZeroHumanApproval コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {number} [options.approvalThreshold=90] - 自動承認スコア閾値
   * @param {number} [options.consensusThreshold=0.7] - 合意度閾値
   * @param {boolean} [options.enableHistory=true] - 履歴記録有効化
   * @param {Array<string>} [options.rubrics] - 評価基準リスト
   */
  constructor(options = {}) {
    this.config = {
      approvalThreshold: options.approvalThreshold || 90,
      consensusThreshold: options.consensusThreshold || 0.7,
      enableHistory: options.enableHistory !== false,
      rubrics: options.rubrics || ['BrandConsistencyRubric']
    };

    this.evaluator = null;
    this.history = null;
    this.initialized = false;

    // 統計
    this.stats = {
      totalEvaluations: 0,
      autoApprovals: 0,
      rejections: 0,
      avgEvaluationTime: 0
    };
  }

  /**
   * 初期化
   *
   * @async
   * @throws {Error} 初期化エラー
   */
  async initialize() {
    try {
      logger.info('Initializing Zero-Human Approval Protocol...');

      // MultiModelEvaluator 初期化
      this.evaluator = new MultiModelEvaluator({
        threshold: this.config.approvalThreshold,
        weights: {
          'claude-sonnet-4.5': 0.35,
          'gpt-5': 0.35,
          'gemini-2.5-pro': 0.30
        },
        consensusThreshold: this.config.consensusThreshold
      });

      await this.evaluator.loadRubrics();

      // EvaluationHistory 初期化
      if (this.config.enableHistory) {
        this.history = new EvaluationHistory({
          autoSave: true
        });
        await this.history.initialize();
      }

      this.initialized = true;
      logger.info('Zero-Human Approval Protocol initialized successfully');
      logger.info(`  Approval Threshold: ${this.config.approvalThreshold}`);
      logger.info(`  Consensus Threshold: ${this.config.consensusThreshold}`);

      return true;
    } catch (error) {
      logger.error('Failed to initialize Zero-Human Approval Protocol:', error);
      throw new Error(`Zero-Human Approval Protocol initialization failed: ${error.message}`);
    }
  }

  /**
   * ブランド提案評価（自動承認判定）
   *
   * @async
   * @param {Object} proposal - ブランド提案
   * @param {Object} [options={}] - 評価オプション
   * @returns {Promise<Object>} 評価結果
   */
  async evaluate(proposal, options = {}) {
    this._ensureInitialized();

    const startTime = Date.now();
    const rubrics = options.rubrics || this.config.rubrics;

    logger.info(`Evaluating proposal: ${proposal.brandName || 'Unnamed'}`);

    try {
      // 多モデル評価実行
      const evaluation = await this.evaluator.evaluate(
        proposal,
        rubrics,
        this.config.approvalThreshold
      );

      const duration = Date.now() - startTime;

      // 自動承認判定
      const approvalDecision = this._makeApprovalDecision(evaluation);

      // 結果構築
      const result = {
        proposalId: options.proposalId || this._generateProposalId(),
        brandName: proposal.brandName,
        evaluation,
        approvalDecision,
        protocol: {
          approvalThreshold: this.config.approvalThreshold,
          consensusThreshold: this.config.consensusThreshold,
          evaluationDuration: duration
        },
        timestamp: new Date().toISOString()
      };

      // 統計更新
      this._updateStats(result, duration);

      // 履歴記録
      if (this.history) {
        await this.history.addEvaluation(proposal, evaluation, {
          autoApproved: approvalDecision.autoApproved,
          approvalStatus: approvalDecision.status
        });
      }

      logger.info(`Evaluation completed in ${duration}ms`);
      logger.info(`  Score: ${evaluation.score.overall}/100`);
      logger.info(`  Auto-Approved: ${approvalDecision.autoApproved ? 'YES' : 'NO'}`);
      logger.info(`  Status: ${approvalDecision.status}`);

      return result;
    } catch (error) {
      logger.error('Evaluation failed:', error);
      throw error;
    }
  }

  /**
   * バッチ評価（複数提案）
   *
   * @async
   * @param {Array<Object>} proposals - ブランド提案リスト
   * @param {Object} [options={}] - 評価オプション
   * @returns {Promise<Array<Object>>} 評価結果リスト
   */
  async evaluateBatch(proposals, options = {}) {
    this._ensureInitialized();

    logger.info(`Batch evaluation: ${proposals.length} proposals`);

    const results = [];

    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      logger.info(`\nEvaluating proposal ${i + 1}/${proposals.length}...`);

      try {
        const result = await this.evaluate(proposal, {
          ...options,
          proposalId: options.proposalIdPrefix
            ? `${options.proposalIdPrefix}_${i + 1}`
            : undefined
        });

        results.push(result);
      } catch (error) {
        logger.error(`Failed to evaluate proposal ${i + 1}:`, error);
        results.push({
          proposalId: `error_${i + 1}`,
          brandName: proposal.brandName,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // レート制限対策
      if (i < proposals.length - 1) {
        await this._sleep(1000);
      }
    }

    logger.info(`\nBatch evaluation completed: ${results.length} results`);

    return results;
  }

  /**
   * 自動承認判定
   *
   * @private
   * @param {Object} evaluation - 評価結果
   * @returns {Object} 承認判定
   */
  _makeApprovalDecision(evaluation) {
    const score = evaluation.score.overall;
    const consensus = evaluation.score.agreement;
    const confidence = evaluation.score.confidence;

    // 自動承認条件
    const meetsScoreThreshold = score >= this.config.approvalThreshold;
    const meetsConsensusThreshold = consensus >= this.config.consensusThreshold;
    const highConfidence = confidence === 'high';

    const autoApproved = meetsScoreThreshold && meetsConsensusThreshold;

    // ステータス決定
    let status;
    let reasoning;

    if (autoApproved) {
      status = 'AUTO_APPROVED';
      reasoning = `スコア ${score.toFixed(1)} が承認閾値 ${this.config.approvalThreshold} を超え、モデル間合意度 ${(consensus * 100).toFixed(1)}% が閾値 ${(this.config.consensusThreshold * 100).toFixed(1)}% を超えたため、自動承認されました。`;
    } else if (meetsScoreThreshold && !meetsConsensusThreshold) {
      status = 'CONDITIONAL_APPROVAL';
      reasoning = `スコア ${score.toFixed(1)} は承認閾値を超えていますが、モデル間合意度 ${(consensus * 100).toFixed(1)}% が不十分です。人間によるレビューを推奨します。`;
    } else if (score >= this.config.approvalThreshold * 0.8) {
      status = 'NEEDS_IMPROVEMENT';
      reasoning = `スコア ${score.toFixed(1)} は承認閾値に近いですが、改善が必要です。AutoImprover を使用した自動改善を推奨します。`;
    } else {
      status = 'REJECTED';
      reasoning = `スコア ${score.toFixed(1)} が承認閾値 ${this.config.approvalThreshold} を大きく下回っています。大幅な改善が必要です。`;
    }

    return {
      autoApproved,
      status,
      reasoning,
      criteria: {
        scoreThreshold: {
          required: this.config.approvalThreshold,
          actual: score,
          met: meetsScoreThreshold
        },
        consensusThreshold: {
          required: this.config.consensusThreshold,
          actual: consensus,
          met: meetsConsensusThreshold
        },
        confidence: {
          level: confidence,
          isHigh: highConfidence
        }
      }
    };
  }

  /**
   * レポート生成
   *
   * @param {Object} result - 評価結果
   * @returns {string} レポート
   */
  generateReport(result) {
    let report = `\n${  '='.repeat(60)  }\n`;
    report += 'Zero-Human Approval Protocol Report\n';
    report += `${'='.repeat(60)  }\n\n`;

    report += `提案ID: ${result.proposalId}\n`;
    report += `ブランド名: ${result.brandName}\n`;
    report += `評価日時: ${result.timestamp}\n\n`;

    report += '評価結果:\n';
    report += `${'-'.repeat(60)  }\n`;
    report += `  総合スコア: ${result.evaluation.score.overall}/100\n`;
    report += `  信頼度: ${result.evaluation.score.confidence}\n`;
    report += `  モデル間合意度: ${(result.evaluation.score.agreement * 100).toFixed(1)}%\n`;
    report += `  評価時間: ${result.protocol.evaluationDuration}ms\n\n`;

    report += '承認判定:\n';
    report += `${'-'.repeat(60)  }\n`;
    report += `  ステータス: ${result.approvalDecision.status}\n`;
    report += `  自動承認: ${result.approvalDecision.autoApproved ? 'YES ✅' : 'NO ❌'}\n`;
    report += `  判定理由: ${result.approvalDecision.reasoning}\n\n`;

    report += '判定基準:\n';
    report += `${'-'.repeat(60)  }\n`;
    const criteria = result.approvalDecision.criteria;
    report += `  スコア閾値: ${criteria.scoreThreshold.actual.toFixed(1)}/${criteria.scoreThreshold.required} ${criteria.scoreThreshold.met ? '✅' : '❌'}\n`;
    report += `  合意度閾値: ${(criteria.consensusThreshold.actual * 100).toFixed(1)}%/${(criteria.consensusThreshold.required * 100).toFixed(1)}% ${criteria.consensusThreshold.met ? '✅' : '❌'}\n`;
    report += `  信頼度: ${criteria.confidence.level} ${criteria.confidence.isHigh ? '✅' : '⚠️'}\n\n`;

    if (result.evaluation.recommendations && result.evaluation.recommendations.length > 0) {
      report += '改善推奨事項:\n';
      report += `${'-'.repeat(60)  }\n`;
      for (const rec of result.evaluation.recommendations) {
        report += `\n[${rec.category} - ${rec.criterion}]\n`;
        report += `  スコア: ${rec.score}/100\n`;
        report += `  理由: ${rec.reason}\n`;
      }
      report += '\n';
    }

    report += `${'='.repeat(60)  }\n`;

    return report;
  }

  /**
   * プロトコル統計取得
   *
   * @returns {Object} 統計情報
   */
  getStatistics() {
    const autoApprovalRate = this.stats.totalEvaluations > 0
      ? (this.stats.autoApprovals / this.stats.totalEvaluations) * 100
      : 0;

    const rejectionRate = this.stats.totalEvaluations > 0
      ? (this.stats.rejections / this.stats.totalEvaluations) * 100
      : 0;

    return {
      ...this.stats,
      autoApprovalRate: autoApprovalRate.toFixed(2),
      rejectionRate: rejectionRate.toFixed(2),
      avgEvaluationTime: this.stats.avgEvaluationTime.toFixed(0)
    };
  }

  /**
   * 統計更新
   *
   * @private
   * @param {Object} result - 評価結果
   * @param {number} duration - 評価所要時間
   */
  _updateStats(result, duration) {
    this.stats.totalEvaluations++;

    if (result.approvalDecision.autoApproved) {
      this.stats.autoApprovals++;
    }

    if (result.approvalDecision.status === 'REJECTED') {
      this.stats.rejections++;
    }

    this.stats.avgEvaluationTime = (
      (this.stats.avgEvaluationTime * (this.stats.totalEvaluations - 1) + duration) /
      this.stats.totalEvaluations
    );
  }

  /**
   * 提案 ID 生成
   *
   * @private
   * @returns {string} 提案 ID
   */
  _generateProposalId() {
    return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * スリープ
   *
   * @private
   * @param {number} ms - ミリ秒
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 初期化確認
   *
   * @private
   * @throws {Error} 未初期化エラー
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Zero-Human Approval Protocol not initialized. Call initialize() first.');
    }
  }

  /**
   * プロトコル終了
   *
   * @async
   */
  async close() {
    if (this.initialized) {
      this.evaluator = null;
      this.history = null;
      this.initialized = false;
      logger.info('Zero-Human Approval Protocol closed');
    }
  }
}

export default ZeroHumanApproval;
