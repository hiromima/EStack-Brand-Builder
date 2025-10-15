/**
 * @file AutoImprover.js
 * @description Automatic improvement mechanism for brand proposals
 * @version 1.0.0
 */

import Anthropic from '@anthropic-ai/sdk';
import { MultiModelEvaluator } from './MultiModelEvaluator.js';

/**
 * AutoImprover クラス
 * 評価結果に基づいて自動的にブランド提案を改善
 */
export class AutoImprover {
  /**
   * @param {Object} options - 設定オプション
   * @param {number} [options.maxAttempts] - 最大改善試行回数
   * @param {number} [options.targetScore] - 目標スコア
   * @param {string} [options.improvementModel] - 改善に使用する AI モデル
   */
  constructor(options = {}) {
    this.options = {
      maxAttempts: options.maxAttempts || 3,
      targetScore: options.targetScore || 90,
      improvementModel: options.improvementModel || 'claude-sonnet-4-5-20250929',
      ...options
    };

    // Claude client for improvement
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Evaluator for scoring improved proposals
    this.evaluator = new MultiModelEvaluator({
      threshold: this.options.targetScore
    });
  }

  /**
   * ブランド提案を自動的に改善
   * @param {Object} proposal - 元のブランド提案
   * @param {Array<string>} rubricNames - 評価基準名
   * @param {Object} [initialEvaluation] - 初期評価結果（省略可）
   * @returns {Promise<Object>} 改善結果
   */
  async improve(proposal, rubricNames = ['BrandConsistencyRubric'], initialEvaluation = null) {
    const history = [];
    let currentProposal = proposal;
    let currentEvaluation = initialEvaluation;

    // 初期評価を実行（未提供の場合）
    if (!currentEvaluation) {
      console.log('🔍 初期評価中...');
      currentEvaluation = await this.evaluator.evaluate(currentProposal, rubricNames, this.options.targetScore);
      console.log(`   初期スコア: ${currentEvaluation.score.overall}/100\n`);
    }

    history.push({
      attempt: 0,
      proposal: currentProposal,
      evaluation: currentEvaluation
    });

    // 既に目標スコアに達している場合
    if (currentEvaluation.approved) {
      return {
        success: true,
        attempts: 0,
        finalProposal: currentProposal,
        finalEvaluation: currentEvaluation,
        history,
        improvementSummary: '初期提案が既に承認基準を満たしています。'
      };
    }

    // 改善サイクル
    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      console.log(`\n🔧 改善試行 ${attempt}/${this.options.maxAttempts}...`);

      try {
        // 改善提案を生成
        const improvedProposal = await this.generateImprovement(
          currentProposal,
          currentEvaluation,
          rubricNames,
          attempt
        );

        console.log('✅ 改善提案生成完了');

        // 改善後の提案を評価
        console.log('🔍 改善提案を評価中...');
        const improvedEvaluation = await this.evaluator.evaluate(
          improvedProposal,
          rubricNames,
          this.options.targetScore
        );

        console.log(`   改善後スコア: ${improvedEvaluation.score.overall}/100`);
        console.log(`   スコア変化: ${(improvedEvaluation.score.overall - currentEvaluation.score.overall).toFixed(2)}`);

        // 履歴に記録
        history.push({
          attempt,
          proposal: improvedProposal,
          evaluation: improvedEvaluation
        });

        // 目標スコアに達した場合
        if (improvedEvaluation.approved) {
          console.log(`\n✨ 目標スコア ${this.options.targetScore} に到達しました！`);

          return {
            success: true,
            attempts: attempt,
            finalProposal: improvedProposal,
            finalEvaluation: improvedEvaluation,
            history,
            improvementSummary: this.generateImprovementSummary(history)
          };
        }

        // スコアが向上している場合は継続
        if (improvedEvaluation.score.overall > currentEvaluation.score.overall) {
          console.log('📈 スコアが向上しました。次の改善に進みます。');
          currentProposal = improvedProposal;
          currentEvaluation = improvedEvaluation;
        } else {
          console.log('⚠️  スコアが向上しませんでした。前回の提案を維持します。');
        }

      } catch (error) {
        console.error(`❌ 改善試行 ${attempt} でエラー:`, error.message);
        // エラーが発生しても継続を試みる
      }
    }

    // 最大試行回数に達した
    console.log(`\n⏹️  最大試行回数 ${this.options.maxAttempts} に達しました。`);
    console.log(`   最終スコア: ${currentEvaluation.score.overall}/100`);
    console.log(`   目標スコア: ${this.options.targetScore}`);

    return {
      success: false,
      attempts: this.options.maxAttempts,
      finalProposal: currentProposal,
      finalEvaluation: currentEvaluation,
      history,
      improvementSummary: this.generateImprovementSummary(history)
    };
  }

  /**
   * 改善提案を生成
   * @param {Object} currentProposal - 現在の提案
   * @param {Object} evaluation - 評価結果
   * @param {Array<string>} rubricNames - 評価基準名
   * @param {number} attemptNumber - 試行回数
   * @returns {Promise<Object>} 改善された提案
   */
  async generateImprovement(currentProposal, evaluation, rubricNames, attemptNumber) {
    const prompt = this.buildImprovementPrompt(currentProposal, evaluation, rubricNames, attemptNumber);

    const response = await this.claude.messages.create({
      model: this.options.improvementModel,
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse improved proposal JSON');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * 改善プロンプトを構築
   * @param {Object} currentProposal - 現在の提案
   * @param {Object} evaluation - 評価結果
   * @param {Array<string>} rubricNames - 評価基準名
   * @param {number} attemptNumber - 試行回数
   * @returns {string} プロンプト
   */
  buildImprovementPrompt(currentProposal, evaluation, rubricNames, attemptNumber) {
    return `あなたはブランド戦略の専門家です。以下のブランド提案を評価結果に基づいて改善してください。

【現在のブランド提案】
${JSON.stringify(currentProposal, null, 2)}

【評価結果】
総合スコア: ${evaluation.score.overall}/100
目標スコア: ${this.options.targetScore}
承認: ${evaluation.approved ? 'はい' : 'いいえ'}
信頼度: ${evaluation.score.confidence}
モデル間一致度: ${(evaluation.score.agreement * 100).toFixed(1)}%

【各モデルの評価】
${evaluation.evaluations.map(e => `
${e.model}:
  - 総合スコア: ${e.overall}/100
  - サマリー: ${e.summary || 'N/A'}
`).join('\n')}

【改善推奨事項】
${evaluation.recommendations && evaluation.recommendations.length > 0
  ? evaluation.recommendations.map(rec => `
- [${rec.category} - ${rec.criterion}] スコア: ${rec.score}/100
  理由: ${rec.reason}
  ${rec.weaknesses && rec.weaknesses.length > 0 ? `弱点: ${rec.weaknesses.join(', ')}` : ''}
`).join('\n')
  : '特になし（全般的な改善が必要）'}

【改善指示】
1. 上記の評価結果と推奨事項を分析してください
2. 低スコアの項目を重点的に改善してください
3. 各評価者のフィードバックを統合して、バランスの取れた改善を行ってください
4. ブランドの一貫性を保ちながら、独自性と差別化を強化してください
5. 具体性を高め、抽象的な表現を減らしてください
6. これは ${attemptNumber} 回目の改善試行です。前回の改善で不足していた点に特に注意してください

【出力形式】
元の提案と同じ JSON 構造で改善された提案を返してください。
構造を変えず、内容のみを改善してください。

\`\`\`json
{
  "brandName": "...",
  "foundation": {
    "purpose": "...",
    "values": [...],
    "stance": "..."
  },
  "structure": {
    "coreMessage": "...",
    "tagline": "..."
  },
  "expression": {
    "logo": {
      "concept": "...",
      "colors": [...]
    },
    "visualIdentity": {
      "typography": "...",
      "imagery": "..."
    }
  }
}
\`\`\``;
  }

  /**
   * 改善サマリーを生成
   * @param {Array} history - 改善履歴
   * @returns {string} サマリー
   */
  generateImprovementSummary(history) {
    if (history.length <= 1) {
      return '改善は実行されませんでした。';
    }

    const initial = history[0];
    const final = history[history.length - 1];
    const scoreImprovement = final.evaluation.score.overall - initial.evaluation.score.overall;

    let summary = `改善試行回数: ${history.length - 1}\n`;
    summary += `初期スコア: ${initial.evaluation.score.overall}/100\n`;
    summary += `最終スコア: ${final.evaluation.score.overall}/100\n`;
    summary += `スコア向上: ${scoreImprovement > 0 ? '+' : ''}${scoreImprovement.toFixed(2)}点\n\n`;

    summary += '【スコア推移】\n';
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      const label = i === 0 ? '初期' : `試行${i}`;
      summary += `  ${label}: ${item.evaluation.score.overall}/100\n`;
    }

    // 主な改善点を抽出
    if (history.length > 1) {
      summary += '\n【主な改善領域】\n';
      const improvements = this.extractImprovements(history);
      improvements.forEach(imp => {
        summary += `  - ${imp}\n`;
      });
    }

    return summary;
  }

  /**
   * 改善点を抽出
   * @param {Array} history - 改善履歴
   * @returns {Array<string>} 改善点リスト
   */
  extractImprovements(history) {
    const improvements = [];

    // 初期と最終の評価を比較
    const initial = history[0].evaluation;
    const final = history[history.length - 1].evaluation;

    // 信頼度の改善
    const confidenceLevels = { 'low': 1, 'medium': 2, 'high': 3 };
    if (confidenceLevels[final.score.confidence] > confidenceLevels[initial.score.confidence]) {
      improvements.push('評価の信頼度が向上');
    }

    // 一致度の改善
    if (final.score.agreement > initial.score.agreement) {
      const improvementPercent = ((final.score.agreement - initial.score.agreement) * 100).toFixed(1);
      improvements.push(`モデル間一致度が ${improvementPercent}% 向上`);
    }

    // 推奨事項の減少
    const initialRecs = initial.recommendations?.length || 0;
    const finalRecs = final.recommendations?.length || 0;
    if (finalRecs < initialRecs) {
      improvements.push(`改善推奨事項が ${initialRecs - finalRecs} 件減少`);
    }

    // 各モデルのスコア向上を確認
    for (let i = 0; i < initial.evaluations.length; i++) {
      const initialEval = initial.evaluations[i];
      const finalEval = final.evaluations.find(e => e.model === initialEval.model);

      if (finalEval && finalEval.overall > initialEval.overall) {
        const modelName = { claude: 'Claude', gpt: 'GPT', gemini: 'Gemini' }[initialEval.model] || initialEval.model;
        improvements.push(`${modelName} 評価が ${(finalEval.overall - initialEval.overall).toFixed(1)} 点向上`);
      }
    }

    return improvements.length > 0 ? improvements : ['スコアの全般的な向上'];
  }

  /**
   * 改善レポートを生成
   * @param {Object} result - 改善結果
   * @returns {string} レポート
   */
  generateReport(result) {
    let report = '\n' + '='.repeat(60) + '\n';
    report += 'Auto-Improvement Report\n';
    report += '='.repeat(60) + '\n\n';

    report += `結果: ${result.success ? '✅ 成功（目標達成）' : '⚠️  部分的成功（目標未達）'}\n`;
    report += `試行回数: ${result.attempts}/${this.options.maxAttempts}\n`;
    report += `最終スコア: ${result.finalEvaluation.score.overall}/100\n`;
    report += `目標スコア: ${this.options.targetScore}\n\n`;

    report += '改善サマリー:\n';
    report += '-'.repeat(60) + '\n';
    report += result.improvementSummary;
    report += '\n\n';

    if (result.finalEvaluation.recommendations && result.finalEvaluation.recommendations.length > 0) {
      report += '残存する改善推奨事項:\n';
      report += '-'.repeat(60) + '\n';
      for (const rec of result.finalEvaluation.recommendations) {
        report += `\n[${rec.category} - ${rec.criterion}]\n`;
        report += `  スコア: ${rec.score}/100\n`;
        report += `  理由: ${rec.reason}\n`;
      }
      report += '\n';
    }

    report += '='.repeat(60) + '\n';

    return report;
  }
}

/**
 * デフォルトエクスポート
 */
export default AutoImprover;
