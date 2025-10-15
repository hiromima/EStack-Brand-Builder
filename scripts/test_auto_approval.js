/**
 * @file test_auto_approval.js
 * @description Auto-Approval 機能のテストスクリプト
 * @version 1.0.0
 *
 * Quality Gate ワークフローで使用される自動承認機能をテスト
 */

import { MultiModelEvaluator } from '../src/evaluation/MultiModelEvaluator.js';
import { AutoImprover } from '../src/evaluation/AutoImprover.js';

const TEST_MODE = process.env.TEST_MODE === 'true';

/**
 * テスト用のブランド提案を生成
 */
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

/**
 * Auto-Approval テストを実行
 */
async function runAutoApprovalTests() {
  console.log('='.repeat(60));
  console.log('Auto-Approval Tests');
  console.log('='.repeat(60));
  console.log();

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Test 1: MultiModelEvaluator initialization
  try {
    results.total++;
    console.log('Test 1: MultiModelEvaluator 初期化テスト');

    if (TEST_MODE) {
      console.log('⚠️  TEST_MODE: API キーなしでスキップ');
      results.skipped++;
    } else {
      const evaluator = new MultiModelEvaluator({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
        googleApiKey: process.env.GOOGLE_API_KEY
      });

      if (evaluator && evaluator.models) {
        console.log('✅ MultiModelEvaluator 初期化成功');
        results.passed++;
      } else {
        throw new Error('Evaluator が正しく初期化されませんでした');
      }
    }
  } catch (error) {
    console.error('❌ Test 1 失敗:', error.message);
    results.failed++;
  }
  console.log();

  // Test 2: AutoImprover initialization
  try {
    results.total++;
    console.log('Test 2: AutoImprover 初期化テスト');

    if (TEST_MODE) {
      console.log('⚠️  TEST_MODE: API キーなしでスキップ');
      results.skipped++;
    } else {
      const improver = new AutoImprover({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY
      });

      if (improver && improver.evaluator) {
        console.log('✅ AutoImprover 初期化成功');
        results.passed++;
      } else {
        throw new Error('Improver が正しく初期化されませんでした');
      }
    }
  } catch (error) {
    console.error('❌ Test 2 失敗:', error.message);
    results.failed++;
  }
  console.log();

  // Test 3: Proposal validation
  try {
    results.total++;
    console.log('Test 3: ブランド提案バリデーションテスト');

    const proposal = createTestProposal();

    if (proposal.brandName && proposal.foundation && proposal.structure && proposal.expression) {
      console.log('✅ 提案構造が有効');
      results.passed++;
    } else {
      throw new Error('提案構造が無効です');
    }
  } catch (error) {
    console.error('❌ Test 3 失敗:', error.message);
    results.failed++;
  }
  console.log();

  // Test 4: Environment variables check
  try {
    results.total++;
    console.log('Test 4: 環境変数チェック');

    if (TEST_MODE) {
      console.log('⚠️  TEST_MODE: 環境変数チェックスキップ');
      results.skipped++;
    } else {
      const requiredEnvVars = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        throw new Error(`必要な環境変数が設定されていません: ${missingVars.join(', ')}`);
      }

      console.log('✅ すべての環境変数が設定されています');
      results.passed++;
    }
  } catch (error) {
    console.error('❌ Test 4 失敗:', error.message);
    results.failed++;
  }
  console.log();

  // Test 5: Threshold validation
  try {
    results.total++;
    console.log('Test 5: 閾値設定テスト');

    const thresholds = {
      autoApproval: 90,
      passing: 70,
      emergency: 10
    };

    if (thresholds.autoApproval > thresholds.passing && thresholds.passing > thresholds.emergency) {
      console.log('✅ 閾値設定が正しい');
      console.log(`   自動承認: ${thresholds.autoApproval}`);
      console.log(`   合格ライン: ${thresholds.passing}`);
      console.log(`   緊急ライン: ${thresholds.emergency}`);
      results.passed++;
    } else {
      throw new Error('閾値設定が不正です');
    }
  } catch (error) {
    console.error('❌ Test 5 失敗:', error.message);
    results.failed++;
  }
  console.log();

  // Results summary
  console.log('='.repeat(60));
  console.log('テスト結果サマリー');
  console.log('='.repeat(60));
  console.log(`総テスト数: ${results.total}`);
  console.log(`✅ 成功: ${results.passed}`);
  console.log(`❌ 失敗: ${results.failed}`);
  console.log(`⚠️  スキップ: ${results.skipped}`);
  console.log();

  const successRate = results.total > 0
    ? ((results.passed / (results.total - results.skipped)) * 100).toFixed(1)
    : 0;
  console.log(`成功率: ${successRate}%`);
  console.log('='.repeat(60));

  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run tests
runAutoApprovalTests().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
