/**
 * @file EvaluationHistory.js
 * @description Evaluation history tracker and analytics
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * EvaluationHistory クラス
 * 評価履歴の記録・管理・分析
 */
export class EvaluationHistory {
  /**
   * @param {Object} options - 設定オプション
   * @param {string} [options.storageDir] - 履歴保存ディレクトリ
   * @param {boolean} [options.autoSave] - 自動保存の有効化
   */
  constructor(options = {}) {
    this.options = {
      storageDir: options.storageDir || path.join(__dirname, '../../data/evaluation_history'),
      autoSave: options.autoSave !== undefined ? options.autoSave : true,
      ...options
    };

    this.history = [];
    this.initialized = false;
  }

  /**
   * 履歴システムを初期化
   */
  async initialize() {
    if (this.initialized) return;

    // ストレージディレクトリを作成
    await fs.mkdir(this.options.storageDir, { recursive: true });

    // 既存の履歴を読み込み
    try {
      const historyFile = path.join(this.options.storageDir, 'history.json');
      const content = await fs.readFile(historyFile, 'utf-8');
      this.history = JSON.parse(content);
      console.log(`✅ 履歴読み込み完了: ${this.history.length} 件`);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
      if (error.code === 'ENOENT') {
        this.history = [];
        console.log('📝 新規履歴ファイルを作成します');
      } else {
        throw error;
      }
    }

    this.initialized = true;
  }

  /**
   * 評価記録を追加
   * @param {Object} record - 評価記録
   * @returns {Promise<string>} レコード ID
   */
  async addRecord(record) {
    await this.initialize();

    const recordWithMetadata = {
      id: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      ...record
    };

    this.history.push(recordWithMetadata);

    if (this.options.autoSave) {
      await this.save();
    }

    return recordWithMetadata.id;
  }

  /**
   * 改善プロセス全体を記録
   * @param {Object} improvementResult - AutoImprover の結果
   * @returns {Promise<string>} レコード ID
   */
  async addImprovementSession(improvementResult) {
    await this.initialize();

    const session = {
      id: this.generateRecordId(),
      type: 'improvement_session',
      timestamp: new Date().toISOString(),
      success: improvementResult.success,
      attempts: improvementResult.attempts,
      initialScore: improvementResult.history[0].evaluation.score.overall,
      finalScore: improvementResult.finalEvaluation.score.overall,
      scoreImprovement: improvementResult.finalEvaluation.score.overall - improvementResult.history[0].evaluation.score.overall,
      targetScore: improvementResult.finalEvaluation.threshold,
      history: improvementResult.history.map(h => ({
        attempt: h.attempt,
        score: h.evaluation.score.overall,
        approved: h.evaluation.approved,
        confidence: h.evaluation.score.confidence,
        agreement: h.evaluation.score.agreement
      })),
      improvementSummary: improvementResult.improvementSummary
    };

    this.history.push(session);

    if (this.options.autoSave) {
      await this.save();
    }

    return session.id;
  }

  /**
   * 単一評価を記録
   * @param {Object} proposal - ブランド提案
   * @param {Object} evaluation - 評価結果
   * @param {Object} [metadata] - 追加メタデータ
   * @returns {Promise<string>} レコード ID
   */
  async addEvaluation(proposal, evaluation, metadata = {}) {
    return await this.addRecord({
      type: 'single_evaluation',
      proposal: {
        brandName: proposal.brandName,
        foundation: proposal.foundation,
        structure: proposal.structure
      },
      evaluation: {
        score: evaluation.score.overall,
        approved: evaluation.approved,
        confidence: evaluation.score.confidence,
        agreement: evaluation.score.agreement,
        breakdown: evaluation.score.breakdown
      },
      metadata
    });
  }

  /**
   * レコード ID を生成
   * @returns {string} レコード ID
   */
  generateRecordId() {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 履歴を保存
   */
  async save() {
    await this.initialize();

    const historyFile = path.join(this.options.storageDir, 'history.json');
    await fs.writeFile(historyFile, JSON.stringify(this.history, null, 2), 'utf-8');
  }

  /**
   * 履歴を取得
   * @param {Object} [filter] - フィルタ条件
   * @returns {Promise<Array>} 履歴レコード
   */
  async getHistory(filter = {}) {
    await this.initialize();

    let filtered = this.history;

    // タイプでフィルタ
    if (filter.type) {
      filtered = filtered.filter(r => r.type === filter.type);
    }

    // 日付範囲でフィルタ
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      filtered = filtered.filter(r => new Date(r.timestamp) >= startDate);
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      filtered = filtered.filter(r => new Date(r.timestamp) <= endDate);
    }

    // 成功/失敗でフィルタ
    if (filter.success !== undefined) {
      filtered = filtered.filter(r => r.success === filter.success);
    }

    // スコア範囲でフィルタ
    if (filter.minScore !== undefined) {
      filtered = filtered.filter(r => {
        const score = r.finalScore || r.evaluation?.score || 0;
        return score >= filter.minScore;
      });
    }

    if (filter.maxScore !== undefined) {
      filtered = filtered.filter(r => {
        const score = r.finalScore || r.evaluation?.score || 0;
        return score <= filter.maxScore;
      });
    }

    // 件数制限
    if (filter.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * 統計情報を取得
   * @param {Object} [filter] - フィルタ条件
   * @returns {Promise<Object>} 統計情報
   */
  async getStatistics(filter = {}) {
    const records = await this.getHistory(filter);

    if (records.length === 0) {
      return {
        totalRecords: 0,
        averageScore: 0,
        successRate: 0,
        averageAttempts: 0
      };
    }

    // スコアの統計
    const scores = records.map(r => r.finalScore || r.evaluation?.score || 0);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // 成功率
    const improvementSessions = records.filter(r => r.type === 'improvement_session');
    const successCount = improvementSessions.filter(r => r.success).length;
    const successRate = improvementSessions.length > 0
      ? (successCount / improvementSessions.length) * 100
      : 0;

    // 平均試行回数
    const attempts = improvementSessions.map(r => r.attempts);
    const averageAttempts = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a, 0) / attempts.length
      : 0;

    // 平均スコア向上
    const improvements = improvementSessions.map(r => r.scoreImprovement || 0);
    const averageImprovement = improvements.length > 0
      ? improvements.reduce((sum, i) => sum + i, 0) / improvements.length
      : 0;

    // 信頼度分布
    const confidenceDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    records.forEach(r => {
      const confidence = r.evaluation?.confidence || r.history?.[r.history.length - 1]?.confidence;
      if (confidence) {
        confidenceDistribution[confidence]++;
      }
    });

    return {
      totalRecords: records.length,
      evaluations: records.filter(r => r.type === 'single_evaluation').length,
      improvementSessions: improvementSessions.length,
      scoreStatistics: {
        average: Math.round(averageScore * 100) / 100,
        min: Math.round(minScore * 100) / 100,
        max: Math.round(maxScore * 100) / 100
      },
      successRate: Math.round(successRate * 100) / 100,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
      averageImprovement: Math.round(averageImprovement * 100) / 100,
      confidenceDistribution
    };
  }

  /**
   * トレンド分析
   * @param {number} [days] - 分析期間（日数）
   * @returns {Promise<Object>} トレンドデータ
   */
  async getTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.getHistory({
      startDate: startDate.toISOString()
    });

    // 日別のスコア推移
    const dailyScores = {};
    records.forEach(r => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      const score = r.finalScore || r.evaluation?.score || 0;

      if (!dailyScores[date]) {
        dailyScores[date] = [];
      }
      dailyScores[date].push(score);
    });

    const trendData = Object.entries(dailyScores).map(([date, scores]) => ({
      date,
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      count: scores.length
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: `${days} days`,
      dataPoints: trendData.length,
      trend: trendData
    };
  }

  /**
   * レポートを生成
   * @param {Object} [filter] - フィルタ条件
   * @returns {Promise<string>} レポート
   */
  async generateReport(filter = {}) {
    await this.initialize();

    const stats = await getStatistics(filter);

    let report = '\n' + '='.repeat(60) + '\n';
    report += 'Evaluation History Report\n';
    report += '='.repeat(60) + '\n\n';

    report += `総レコード数: ${stats.totalRecords}\n`;
    report += `  - 単一評価: ${stats.evaluations}\n`;
    report += `  - 改善セッション: ${stats.improvementSessions}\n\n`;

    report += 'スコア統計:\n';
    report += '-'.repeat(60) + '\n';
    report += `  平均スコア: ${stats.scoreStatistics.average}/100\n`;
    report += `  最低スコア: ${stats.scoreStatistics.min}/100\n`;
    report += `  最高スコア: ${stats.scoreStatistics.max}/100\n\n`;

    if (stats.improvementSessions > 0) {
      report += '改善セッション統計:\n';
      report += '-'.repeat(60) + '\n';
      report += `  成功率: ${stats.successRate}%\n`;
      report += `  平均試行回数: ${stats.averageAttempts}\n`;
      report += `  平均スコア向上: ${stats.averageImprovement > 0 ? '+' : ''}${stats.averageImprovement}\n\n`;
    }

    report += '信頼度分布:\n';
    report += '-'.repeat(60) + '\n';
    report += `  High: ${stats.confidenceDistribution.high}\n`;
    report += `  Medium: ${stats.confidenceDistribution.medium}\n`;
    report += `  Low: ${stats.confidenceDistribution.low}\n\n`;

    report += '='.repeat(60) + '\n';

    return report;
  }

  /**
   * 履歴をクリア
   */
  async clear() {
    await this.initialize();
    this.history = [];
    await this.save();
    console.log('✅ 履歴をクリアしました');
  }

  /**
   * 履歴をエクスポート
   * @param {string} filePath - エクスポート先ファイルパス
   * @param {Object} [filter] - フィルタ条件
   */
  async export(filePath, filter = {}) {
    const records = await this.getHistory(filter);
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
    console.log(`✅ ${records.length} 件のレコードを ${filePath} にエクスポートしました`);
  }

  /**
   * 履歴をインポート
   * @param {string} filePath - インポート元ファイルパス
   * @param {boolean} [merge] - 既存履歴とマージするか
   */
  async import(filePath, merge = false) {
    await this.initialize();

    const content = await fs.readFile(filePath, 'utf-8');
    const imported = JSON.parse(content);

    if (merge) {
      this.history.push(...imported);
    } else {
      this.history = imported;
    }

    await this.save();
    console.log(`✅ ${imported.length} 件のレコードを ${merge ? 'マージ' : 'インポート'}しました`);
  }
}

/**
 * デフォルトエクスポート
 */
export default EvaluationHistory;
