/**
 * @file MultiModelEvaluator.js
 * @description Multi-model parallel evaluation engine
 * @version 1.0.0
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Multi-Model Evaluator クラス
 * 複数の AI モデルを並列実行して評価を行う
 */
export class MultiModelEvaluator {
  /**
   * @param {Object} options - 設定オプション
   * @param {Object} [options.weights] - モデルごとの重み
   * @param {number} [options.threshold] - 自動承認閾値
   */
  constructor(options = {}) {
    this.options = {
      weights: options.weights || {
        claude: 0.4,  // Claude Sonnet 4.5 - 2025年9月29日リリース最新
        gpt: 0.3,     // GPT-5 - 2025年8月7日リリース最新
        gemini: 0.3   // Gemini 2.5 Pro - 2025年リリース最新（adaptive thinking搭載）
      },
      threshold: options.threshold || 90,
      ...options
    };

    // AI モデルクライアント初期化（API キーがある場合のみ）
    this.claude = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;

    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    this.gemini = process.env.GOOGLE_API_KEY
      ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
      : null;

    // Rubrics 読み込み
    this.rubrics = null;
  }

  /**
   * Rubrics を読み込み
   */
  async loadRubrics() {
    if (this.rubrics) return this.rubrics;

    const rubricsPath = path.join(__dirname, 'schemas', 'rubrics.json');
    const content = await fs.readFile(rubricsPath, 'utf-8');
    this.rubrics = JSON.parse(content);
    return this.rubrics;
  }

  /**
   * ブランド提案を評価
   * @param {Object} proposal - 評価対象のブランド提案
   * @param {string[]} rubricNames - 使用する Rubric 名の配列
   * @param {number} [threshold] - 閾値（オプション）
   * @returns {Promise<Object>} 評価結果
   */
  async evaluate(proposal, rubricNames = ['BrandConsistencyRubric'], threshold = null) {
    const actualThreshold = threshold !== null ? threshold : this.options.threshold;

    await this.loadRubrics();

    try {
      // 利用可能なモデルで並列評価
      const evaluationPromises = [];

      if (this.claude) {
        evaluationPromises.push(this.evaluateWithClaude(proposal, rubricNames));
      }
      if (this.openai) {
        evaluationPromises.push(this.evaluateWithGPT(proposal, rubricNames));
      }
      if (this.gemini) {
        evaluationPromises.push(this.evaluateWithGemini(proposal, rubricNames));
      }

      if (evaluationPromises.length === 0) {
        throw new Error('No AI models available. Please configure API keys.');
      }

      const evaluationResults = await Promise.all(evaluationPromises);

      // overall が欠けている場合、または 0 の場合は各項目の平均を計算
      const normalizeEvaluation = (evaluation) => {
        if (evaluation.overall !== undefined && evaluation.overall > 0) return evaluation;

        // Rubric 内の全スコアを収集
        const scores = [];
        for (const [key, value] of Object.entries(evaluation)) {
          if (key === 'model' || key === 'summary' || key === 'overall') continue;

          // Rubric オブジェクトの場合（Claudeスタイル）
          if (typeof value === 'object' && value !== null && !value.score) {
            for (const [_criterion, data] of Object.entries(value)) {
              if (data && typeof data === 'object' && data.score !== undefined) {
                scores.push(data.score);
              }
            }
          }
          // 直接スコアの場合（GPTスタイル: foundationAlignment: {score, reason}）
          else if (value && typeof value === 'object' && value.score !== undefined) {
            scores.push(value.score);
          }
        }

        // 平均を計算
        const overall = scores.length > 0
          ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100
          : 0;

        return { ...evaluation, overall };
      };

      // モデル名を適切に設定
      const modelNames = [];
      if (this.claude) modelNames.push('claude');
      if (this.openai) modelNames.push('gpt');
      if (this.gemini) modelNames.push('gemini');

      const evaluations = evaluationResults.map((result, index) =>
        normalizeEvaluation({ model: modelNames[index], ...result })
      );

      // スコア統合
      const finalScore = this.synthesizeScores(evaluations);

      // 閾値チェック
      const approved = finalScore.overall >= actualThreshold;

      return {
        approved,
        score: finalScore,
        evaluations,
        threshold: actualThreshold,
        recommendations: approved ? [] : await this.generateRecommendations(evaluations, proposal)
      };
    } catch (error) {
      console.error('❌ Evaluation failed:', error.message);
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }

  /**
   * Claude による評価
   */
  async evaluateWithClaude(proposal, rubricNames) {
    const rubricDefs = this.getRubricDefinitions(rubricNames);

    const prompt = `あなたはブランド評価の専門家です。以下のブランド提案を評価してください。

【評価対象ブランド提案】
${JSON.stringify(proposal, null, 2)}

【評価基準（Rubrics）】
${JSON.stringify(rubricDefs, null, 2)}

各評価項目について、0-100 のスコアと理由を提供してください。
JSON 形式で返してください。

レスポンス形式:
{
  "BrandConsistencyRubric": {
    "foundationAlignment": {
      "score": 85,
      "reason": "...",
      "strengths": ["...", "..."],
      "weaknesses": ["..."]
    },
    ...
  },
  "overall": 82,
  "summary": "..."
}`;

    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Claude response is not valid JSON');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * GPT-5 による評価（2025年8月7日リリース最新）
   */
  async evaluateWithGPT(proposal, rubricNames) {
    const rubricDefs = this.getRubricDefinitions(rubricNames);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-5',  // 2025年8月7日リリース最新モデル
      messages: [{
        role: 'system',
        content: 'あなたはブランド評価の専門家です。提供されたブランド提案を評価基準に基づいて評価してください。'
      }, {
        role: 'user',
        content: `【評価対象ブランド提案】\n${JSON.stringify(proposal, null, 2)}\n\n【評価基準】\n${JSON.stringify(rubricDefs, null, 2)}\n\n各項目を 0-100 でスコアリングし、JSON 形式で返してください。`
      }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Gemini 2.5 Pro による評価（2025年リリース最新・adaptive thinking搭載）
   */
  async evaluateWithGemini(proposal, rubricNames) {
    const rubricDefs = this.getRubricDefinitions(rubricNames);

    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.5-pro',  // 2025年リリース最新モデル（adaptive thinking搭載）
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `あなたはブランド評価の専門家です。以下のブランド提案を評価してください。

【評価対象ブランド提案】
${JSON.stringify(proposal, null, 2)}

【評価基準】
${JSON.stringify(rubricDefs, null, 2)}

各項目を 0-100 でスコアリングし、以下の JSON 形式で返してください:
{
  "BrandConsistencyRubric": { ... },
  "overall": number,
  "summary": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  }

  /**
   * Rubric 定義を取得
   */
  getRubricDefinitions(rubricNames) {
    const defs = {};
    for (const name of rubricNames) {
      if (this.rubrics.rubrics[name]) {
        defs[name] = this.rubrics.rubrics[name];
      }
    }
    return defs;
  }

  /**
   * スコアを統合
   * @param {Array} evaluations - 各モデルの評価結果
   * @returns {Object} 統合スコア
   */
  synthesizeScores(evaluations) {
    const weights = this.options.weights;

    // 加重平均
    let overallSum = 0;
    let totalWeight = 0;

    for (const evaluation of evaluations) {
      const weight = weights[evaluation.model] || 0;
      const score = evaluation.overall || 0;
      overallSum += score * weight;
      totalWeight += weight;
    }

    const overall = totalWeight > 0 ? overallSum / totalWeight : 0;

    // モデル間の一致度を計算
    const agreement = this.calculateAgreement(evaluations);

    return {
      overall: Math.round(overall * 100) / 100,
      breakdown: evaluations.map(e => ({
        model: e.model,
        score: e.overall,
        weight: weights[e.model]
      })),
      agreement,
      confidence: agreement > 0.8 ? 'high' : agreement > 0.6 ? 'medium' : 'low'
    };
  }

  /**
   * モデル間の一致度を計算
   * @param {Array} evaluations - 評価結果配列
   * @returns {number} 一致度 (0-1)
   */
  calculateAgreement(evaluations) {
    if (evaluations.length < 2) return 1.0;

    const scores = evaluations.map(e => e.overall || 0);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // 標準偏差を計算
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // 一致度 = 1 - (標準偏差 / 平均) の正規化
    const agreement = Math.max(0, 1 - (stdDev / (avg || 1)));

    return Math.round(agreement * 100) / 100;
  }

  /**
   * 改善推奨事項を生成
   * @param {Array} evaluations - 評価結果
   * @param {Object} proposal - ブランド提案
   * @returns {Promise<Array>} 推奨事項
   */
  async generateRecommendations(evaluations, _proposal) {
    const recommendations = [];

    for (const evaluation of evaluations) {
      // 各 Rubric から低スコアの項目を抽出
      for (const [rubricName, rubricScores] of Object.entries(evaluation)) {
        if (rubricName === 'overall' || rubricName === 'summary' || rubricName === 'model') continue;

        for (const [criterion, data] of Object.entries(rubricScores)) {
          if (data.score < 70) {
            recommendations.push({
              model: evaluation.model,
              category: rubricName,
              criterion,
              score: data.score,
              reason: data.reason,
              weaknesses: data.weaknesses || []
            });
          }
        }
      }
    }

    // 重複を削除し、スコアでソート
    const unique = recommendations.filter((rec, index, self) =>
      index === self.findIndex((r) => r.criterion === rec.criterion)
    );

    return unique.sort((a, b) => a.score - b.score).slice(0, 5);
  }

  /**
   * 評価レポートを生成
   * @param {Object} evaluationResult - 評価結果
   * @returns {string} レポート
   */
  generateReport(evaluationResult) {
    const { approved, score, threshold, recommendations } = evaluationResult;

    let report = '\n' + '='.repeat(60) + '\n';
    report += 'Evaluation Report\n';
    report += '='.repeat(60) + '\n\n';

    report += `Overall Score: ${score.overall}/100\n`;
    report += `Threshold: ${threshold}\n`;
    report += `Status: ${approved ? '✅ APPROVED' : '❌ NEEDS IMPROVEMENT'}\n`;
    report += `Confidence: ${score.confidence}\n`;
    report += `Agreement: ${(score.agreement * 100).toFixed(1)}%\n\n`;

    report += 'Model Breakdown:\n';
    report += '-'.repeat(60) + '\n';
    for (const breakdown of score.breakdown) {
      const scoreStr = breakdown.score !== undefined ? breakdown.score.toFixed(2) : 'N/A';
      report += `  ${breakdown.model}: ${scoreStr} (weight: ${breakdown.weight})\n`;
    }

    if (recommendations && recommendations.length > 0) {
      report += '\n' + '='.repeat(60) + '\n';
      report += 'Recommendations:\n';
      report += '='.repeat(60) + '\n';

      for (const rec of recommendations) {
        report += `\n[${rec.category} - ${rec.criterion}]\n`;
        report += `  Score: ${rec.score}/100\n`;
        report += `  Reason: ${rec.reason}\n`;
        if (rec.weaknesses.length > 0) {
          report += '  Weaknesses:\n';
          rec.weaknesses.forEach(w => report += `    - ${w}\n`);
        }
      }
    }

    report += '\n' + '='.repeat(60) + '\n';

    return report;
  }
}

/**
 * デフォルトエクスポート
 */
export default MultiModelEvaluator;
