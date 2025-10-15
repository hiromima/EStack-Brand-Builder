/**
 * @file test_evaluation_system.js
 * @description 評価システム全体の統合テスト
 * @version 1.0.0
 */

import { MultiModelEvaluator } from '../src/evaluation/MultiModelEvaluator.js';
import { AutoImprover } from '../src/evaluation/AutoImprover.js';
import { EvaluationHistory } from '../src/evaluation/EvaluationHistory.js';
import dotenv from 'dotenv';

dotenv.config();

// テスト用のブランド提案（低スコアになるように意図的に簡素化）
const testProposal = {
  brandName: "TestBrand",
  foundation: {
    purpose: "製品を販売する",
    values: ["品質", "サービス"],
    stance: "顧客第一"
  },
  structure: {
    coreMessage: "良い製品を提供します",
    tagline: "TestBrand"
  },
  expression: {
    logo: {
      concept: "シンプルなロゴ",
      colors: ["#000000", "#FFFFFF"]
    },
    visualIdentity: {
      typography: "普通のフォント",
      imagery: "製品写真"
    }
  }
};

async function testMultiModelEvaluator() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: MultiModelEvaluator');
  console.log('='.repeat(60) + '\n');

  try {
    const evaluator = new MultiModelEvaluator({ threshold: 80 });
    console.log('✅ Evaluator 初期化成功');

    console.log('🔍 評価実行中...');
    const result = await evaluator.evaluate(testProposal, ['BrandConsistencyRubric'], 80);

    console.log(`\n📊 評価結果:`);
    console.log(`   総合スコア: ${result.score.overall}/100`);
    console.log(`   承認: ${result.approved ? 'はい' : 'いいえ'}`);
    console.log(`   信頼度: ${result.score.confidence}`);
    console.log(`   一致度: ${(result.score.agreement * 100).toFixed(1)}%`);

    console.log(`\n   各モデルのスコア:`);
    result.score.breakdown.forEach(b => {
      const modelName = { claude: 'Claude', gpt: 'GPT', gemini: 'Gemini' }[b.model] || b.model;
      console.log(`     ${modelName}: ${b.score?.toFixed(2) || 'N/A'}`);
    });

    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`\n   改善推奨事項: ${result.recommendations.length} 件`);
    }

    console.log('\n✅ TEST 1 PASSED\n');
    return result;

  } catch (error) {
    console.error('\n❌ TEST 1 FAILED:', error.message);
    throw error;
  }
}

async function testAutoImprover(initialEvaluation) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: AutoImprover');
  console.log('='.repeat(60) + '\n');

  try {
    const improver = new AutoImprover({
      maxAttempts: 2,  // テストでは2回まで
      targetScore: 80
    });
    console.log('✅ AutoImprover 初期化成功');

    console.log('🔧 自動改善開始...');
    console.log('   (これには時間がかかる場合があります)\n');

    const result = await improver.improve(
      testProposal,
      ['BrandConsistencyRubric'],
      initialEvaluation
    );

    console.log(`\n📊 改善結果:`);
    console.log(`   成功: ${result.success ? 'はい' : 'いいえ'}`);
    console.log(`   試行回数: ${result.attempts}`);
    console.log(`   初期スコア: ${result.history[0].evaluation.score.overall}/100`);
    console.log(`   最終スコア: ${result.finalEvaluation.score.overall}/100`);
    console.log(`   スコア向上: ${(result.finalEvaluation.score.overall - result.history[0].evaluation.score.overall).toFixed(2)}`);

    console.log('\n✅ TEST 2 PASSED\n');
    return result;

  } catch (error) {
    console.error('\n❌ TEST 2 FAILED:', error.message);
    throw error;
  }
}

async function testEvaluationHistory(improvementResult) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: EvaluationHistory');
  console.log('='.repeat(60) + '\n');

  try {
    const history = new EvaluationHistory({
      storageDir: './data/test_evaluation_history'
    });
    console.log('✅ EvaluationHistory 初期化成功');

    // 改善セッションを記録
    console.log('📝 改善セッションを記録中...');
    const sessionId = await history.addImprovementSession(improvementResult);
    console.log(`   セッション ID: ${sessionId}`);

    // 統計情報を取得
    console.log('\n📊 統計情報を取得中...');
    const stats = await history.getStatistics();
    console.log(`   総レコード数: ${stats.totalRecords}`);
    console.log(`   改善セッション数: ${stats.improvementSessions}`);
    console.log(`   平均スコア: ${stats.scoreStatistics.average}/100`);
    console.log(`   成功率: ${stats.successRate}%`);

    // 履歴を取得
    console.log('\n📋 履歴を取得中...');
    const records = await history.getHistory({ limit: 3 });
    console.log(`   取得レコード数: ${records.length}`);

    // トレンドを取得
    console.log('\n📈 トレンドを取得中...');
    const trends = await history.getTrends(7);
    console.log(`   データポイント数: ${trends.dataPoints}`);

    console.log('\n✅ TEST 3 PASSED\n');
    return history;

  } catch (error) {
    console.error('\n❌ TEST 3 FAILED:', error.message);
    throw error;
  }
}

async function testFullWorkflow() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Full Workflow (Evaluator → Improver → History)');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. 初期評価
    console.log('STEP 1: 初期評価');
    const evaluator = new MultiModelEvaluator({ threshold: 85 });
    const evaluation = await evaluator.evaluate(testProposal, ['BrandConsistencyRubric'], 85);
    console.log(`✅ 初期評価完了: ${evaluation.score.overall}/100\n`);

    // 2. 自動改善（承認されるまで、最大1回）
    console.log('STEP 2: 自動改善');
    const improver = new AutoImprover({
      maxAttempts: 1,
      targetScore: 85
    });
    const improvementResult = await improver.improve(
      testProposal,
      ['BrandConsistencyRubric'],
      evaluation
    );
    console.log(`✅ 改善完了: ${improvementResult.finalEvaluation.score.overall}/100\n`);

    // 3. 履歴に記録
    console.log('STEP 3: 履歴に記録');
    const history = new EvaluationHistory({
      storageDir: './data/test_evaluation_history'
    });
    await history.addImprovementSession(improvementResult);
    console.log(`✅ 履歴記録完了\n`);

    // 4. レポート生成
    console.log('STEP 4: レポート生成');
    const report = improver.generateReport(improvementResult);
    console.log(report);

    console.log('✅ TEST 4 PASSED\n');

  } catch (error) {
    console.error('\n❌ TEST 4 FAILED:', error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('  EVALUATION SYSTEM INTEGRATION TEST');
  console.log('█'.repeat(60));

  const startTime = Date.now();
  let passedTests = 0;
  const totalTests = 4;

  try {
    // Test 1: MultiModelEvaluator
    const evaluation = await testMultiModelEvaluator();
    passedTests++;

    // Test 2: AutoImprover
    const improvementResult = await testAutoImprover(evaluation);
    passedTests++;

    // Test 3: EvaluationHistory
    await testEvaluationHistory(improvementResult);
    passedTests++;

    // Test 4: Full Workflow
    await testFullWorkflow();
    passedTests++;

  } catch (error) {
    console.error('\n❌ テスト実行中にエラーが発生しました:', error.message);
    console.error(error.stack);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '█'.repeat(60));
  console.log(`  TEST SUMMARY`);
  console.log('█'.repeat(60));
  console.log(`  合格: ${passedTests}/${totalTests}`);
  console.log(`  実行時間: ${duration}秒`);
  console.log('█'.repeat(60) + '\n');

  if (passedTests === totalTests) {
    console.log('✅ 全てのテストが成功しました！\n');
    process.exit(0);
  } else {
    console.log(`❌ ${totalTests - passedTests} 件のテストが失敗しました。\n`);
    process.exit(1);
  }
}

// 実行
runAllTests();
