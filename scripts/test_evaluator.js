/**
 * @file test_evaluator.js
 * @description MultiModelEvaluator のテストスクリプト
 * @version 1.0.0
 */

import { MultiModelEvaluator } from '../src/evaluation/MultiModelEvaluator.js';
import dotenv from 'dotenv';

dotenv.config();

// テスト用のブランド提案サンプル
const sampleProposal = {
  brandName: "TechFlow",
  foundation: {
    purpose: "テクノロジーで人々の生活をよりスムーズにする",
    values: ["革新性", "使いやすさ", "信頼性"],
    stance: "ユーザー中心の技術開発"
  },
  structure: {
    coreMessage: "テクノロジーをシンプルに、生活を豊かに",
    tagline: "Flow with Tech"
  },
  expression: {
    logo: {
      concept: "流れるような曲線とテクノロジーを象徴する幾何学形状の融合",
      colors: ["#0066FF", "#00CCFF", "#FFFFFF"]
    },
    visualIdentity: {
      typography: "モダンでクリーンなサンセリフフォント",
      imagery: "流動的で未来的なビジュアル"
    }
  }
};

async function testEvaluator() {
  console.log('\n' + '='.repeat(60));
  console.log('MultiModelEvaluator テスト開始');
  console.log('='.repeat(60) + '\n');

  try {
    // API キーチェック
    console.log('📋 API キーチェック...');
    const apiKeys = {
      'Anthropic (Claude)': process.env.ANTHROPIC_API_KEY ? '✅ 設定済み' : '❌ 未設定',
      'OpenAI (GPT)': process.env.OPENAI_API_KEY ? '✅ 設定済み' : '❌ 未設定',
      'Google (Gemini)': process.env.GOOGLE_API_KEY ? '✅ 設定済み' : '❌ 未設定'
    };

    for (const [service, status] of Object.entries(apiKeys)) {
      console.log(`  ${service}: ${status}`);
    }
    console.log('');

    // Evaluator 初期化
    console.log('🔧 Evaluator 初期化中...');
    const evaluator = new MultiModelEvaluator({
      threshold: 75
    });
    console.log('✅ Evaluator 初期化完了\n');

    // Rubrics 読み込み
    console.log('📚 Rubrics 読み込み中...');
    const rubrics = await evaluator.loadRubrics();
    console.log(`✅ Rubrics 読み込み完了: ${Object.keys(rubrics.rubrics).length} 種類\n`);

    // 評価実行
    console.log('🚀 評価実行中...');
    console.log('   モデル: Claude Sonnet 4.5, GPT-5, Gemini 2.5 Pro');
    console.log('   評価基準: BrandConsistencyRubric\n');

    const startTime = Date.now();
    const result = await evaluator.evaluate(
      sampleProposal,
      ['BrandConsistencyRubric'],
      75
    );
    const duration = Date.now() - startTime;

    // 結果表示
    console.log('\n' + '='.repeat(60));
    console.log('評価結果');
    console.log('='.repeat(60) + '\n');

    console.log(`⏱️  実行時間: ${(duration / 1000).toFixed(2)}秒\n`);

    console.log(`📊 総合スコア: ${result.score.overall}/100`);
    console.log(`🎯 閾値: ${result.threshold}`);
    console.log(`${result.approved ? '✅' : '❌'} 承認: ${result.approved ? 'APPROVED' : 'NEEDS IMPROVEMENT'}`);
    console.log(`🔒 信頼度: ${result.score.confidence}`);
    console.log(`🤝 モデル間一致度: ${(result.score.agreement * 100).toFixed(1)}%\n`);

    console.log('各モデルのスコア:');
    console.log('-'.repeat(60));
    for (const breakdown of result.score.breakdown) {
      const modelName = {
        claude: 'Claude Sonnet 4.5',
        gpt: 'GPT-5',
        gemini: 'Gemini 2.5 Pro'
      }[breakdown.model] || breakdown.model;

      const scoreStr = breakdown.score !== undefined ? breakdown.score.toFixed(2) : 'N/A';
      console.log(`  ${modelName}: ${scoreStr} (重み: ${breakdown.weight})`);
    }
    console.log('');

    // 生の評価結果を出力（デバッグ用）
    console.log('生の評価結果（JSON）:');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(result.evaluations, null, 2));
    console.log('');

    // 詳細評価結果
    console.log('詳細評価:');
    console.log('-'.repeat(60));
    for (const evaluation of result.evaluations) {
      const modelName = {
        claude: 'Claude Sonnet 4.5',
        gpt: 'GPT-5',
        gemini: 'Gemini 2.5 Pro'
      }[evaluation.model] || evaluation.model;

      console.log(`\n[${modelName}]`);
      console.log(`  総合スコア: ${evaluation.overall}/100`);

      if (evaluation.BrandConsistencyRubric) {
        const rubric = evaluation.BrandConsistencyRubric;
        console.log(`  Foundation Alignment: ${rubric.foundationAlignment?.score || 'N/A'}`);
        console.log(`  Structure Coherence: ${rubric.structureCoherence?.score || 'N/A'}`);
        console.log(`  Expression Quality: ${rubric.expressionQuality?.score || 'N/A'}`);
        console.log(`  Overall Consistency: ${rubric.overallConsistency?.score || 'N/A'}`);
      }
    }
    console.log('');

    // 推奨事項
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('改善推奨事項:');
      console.log('-'.repeat(60));
      for (const rec of result.recommendations) {
        console.log(`\n[${rec.category} - ${rec.criterion}]`);
        console.log(`  スコア: ${rec.score}/100`);
        console.log(`  理由: ${rec.reason}`);
        if (rec.weaknesses && rec.weaknesses.length > 0) {
          console.log(`  弱点:`);
          rec.weaknesses.forEach(w => console.log(`    - ${w}`));
        }
      }
      console.log('');
    }

    // レポート生成
    console.log('\n' + '='.repeat(60));
    console.log('レポート生成');
    console.log('='.repeat(60));
    const report = evaluator.generateReport(result);
    console.log(report);

    console.log('\n✅ テスト完了\n');

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message);
    console.error('\nエラー詳細:');
    console.error(error);
    process.exit(1);
  }
}

// 実行
testEvaluator();
