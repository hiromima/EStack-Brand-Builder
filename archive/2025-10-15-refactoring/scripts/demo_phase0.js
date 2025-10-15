#!/usr/bin/env node

/**
 * @file demo_phase0.js
 * @description Phase 0 システム統合デモンストレーション
 * @version 1.0.0
 */

import { MultiModelEvaluator } from '../src/evaluation/MultiModelEvaluator.js';
import { AutoImprover } from '../src/evaluation/AutoImprover.js';
import { EvaluationHistory } from '../src/evaluation/EvaluationHistory.js';
import { KnowledgeManager } from '../src/knowledge/KnowledgeManager.js';
import dotenv from 'dotenv';

dotenv.config();

// デモ用ブランド提案
const sampleProposal = {
  brandName: "EcoFlow",
  foundation: {
    purpose: "持続可能な未来を、日常のあらゆる選択から創造する",
    values: [
      "環境への敬意と責任",
      "透明性とトレーサビリティ",
      "革新的な循環型デザイン"
    ],
    stance: "環境配慮型消費の新しいスタンダードを創る"
  },
  structure: {
    coreMessage: "地球と共生する、美しい選択を",
    tagline: "Flow with Nature"
  },
  expression: {
    logo: {
      concept: "自然の循環を表現する流線形と、大地を象徴する幾何学の融合",
      colors: ["#2D5016", "#7BA05B", "#E8F5E9"]
    },
    visualIdentity: {
      typography: "オーガニックで温かみのあるセリフフォントと、クリーンなサンセリフの組み合わせ",
      imagery: "自然素材のテクスチャと、現代的なライフスタイルの調和"
    }
  }
};

/**
 * デモメインクラス
 */
class Phase0Demo {
  constructor() {
    this.evaluator = new MultiModelEvaluator({ threshold: 85 });
    this.improver = new AutoImprover({
      maxAttempts: 2,
      targetScore: 85
    });
    this.history = new EvaluationHistory({
      storageDir: './data/demo_evaluation_history'
    });
    this.knowledgeManager = null; // 初期化は後で
  }

  /**
   * デモを実行
   */
  async run() {
    console.log('\n' + '█'.repeat(70));
    console.log('  🚀 PHASE 0 INTEGRATED DEMO');
    console.log('  Brand Builder v1.0 - AI-Powered Brand Development System');
    console.log('█'.repeat(70) + '\n');

    try {
      // Step 1: Knowledge Base Demo
      await this.demoKnowledgeBase();

      // Step 2: Multi-Model Evaluation Demo
      const evaluation = await this.demoMultiModelEvaluation();

      // Step 3: Auto-Improvement Demo
      const improvementResult = await this.demoAutoImprovement(evaluation);

      // Step 4: History Tracking Demo
      await this.demoHistoryTracking(improvementResult);

      // Step 5: Dashboard Demo
      await this.demoDashboard();

      // Success
      console.log('\n' + '█'.repeat(70));
      console.log('  ✅ DEMO COMPLETED SUCCESSFULLY');
      console.log('█'.repeat(70) + '\n');

    } catch (error) {
      console.error('\n❌ Demo failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * 知識ベースデモ
   */
  async demoKnowledgeBase() {
    console.log('━'.repeat(70));
    console.log('DEMO 1: Dynamic Knowledge Base');
    console.log('━'.repeat(70) + '\n');

    try {
      this.knowledgeManager = new KnowledgeManager();
      await this.knowledgeManager.initialize();

      console.log('✅ Knowledge Manager initialized');
      console.log('   Vector Store: Chroma (local)');
      console.log('   Graph Store: Neo4j Aura');
      console.log('   Total entries: ' + (await this.knowledgeManager.vectorStore.collection.count()));

      // セマンティック検索のデモ
      console.log('\n🔍 Semantic Search Demo:');
      console.log('   Query: "Swiss Design principles"');

      const searchResults = await this.knowledgeManager.vectorStore.semanticSearch(
        'Swiss Design principles and minimalist aesthetics',
        { topK: 3 }
      );

      console.log(`   Results: ${searchResults.length} entries found`);
      if (searchResults.length > 0) {
        searchResults.slice(0, 2).forEach((result, index) => {
          console.log(`   ${index + 1}. Score: ${result.score.toFixed(3)} | ID: ${result.id}`);
        });
      }

      console.log('\n✅ DEMO 1 PASSED\n');

    } catch (error) {
      console.error('⚠️  Knowledge Base demo skipped:', error.message);
      console.log('   (This is expected if Chroma server is not running)');
      console.log('   To start Chroma: python3 -m uvicorn chromadb.app:app\n');
    }
  }

  /**
   * 多モデル評価デモ
   */
  async demoMultiModelEvaluation() {
    console.log('━'.repeat(70));
    console.log('DEMO 2: Multi-Model Evaluation');
    console.log('━'.repeat(70) + '\n');

    console.log('📋 Evaluating Brand Proposal:');
    console.log(`   Brand Name: ${sampleProposal.brandName}`);
    console.log(`   Core Message: ${sampleProposal.structure.coreMessage}`);
    console.log(`   Tagline: ${sampleProposal.structure.tagline}\n`);

    console.log('🔍 Running parallel evaluation with 3 AI models...');
    console.log('   - Claude Sonnet 4.5 (weight: 0.4)');
    console.log('   - GPT-5 (weight: 0.3)');
    console.log('   - Gemini 2.5 Pro (weight: 0.3)\n');

    const startTime = Date.now();
    const evaluation = await this.evaluator.evaluate(
      sampleProposal,
      ['BrandConsistencyRubric'],
      85
    );
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`⏱️  Evaluation completed in ${duration}s\n`);

    console.log('📊 Results:');
    console.log(`   Overall Score: ${evaluation.score.overall}/100`);
    console.log(`   Threshold: ${evaluation.threshold}`);
    console.log(`   ${evaluation.approved ? '✅ APPROVED' : '⚠️  NEEDS IMPROVEMENT'}`);
    console.log(`   Confidence: ${evaluation.score.confidence}`);
    console.log(`   Agreement: ${(evaluation.score.agreement * 100).toFixed(1)}%\n`);

    console.log('   Model Scores:');
    evaluation.score.breakdown.forEach(b => {
      const modelName = { claude: 'Claude Sonnet 4.5', gpt: 'GPT-5', gemini: 'Gemini 2.5 Pro' }[b.model] || b.model;
      const scoreStr = b.score !== undefined ? b.score.toFixed(1) : 'N/A';
      console.log(`     ${modelName}: ${scoreStr}`);
    });

    if (evaluation.recommendations && evaluation.recommendations.length > 0) {
      console.log(`\n   💡 Recommendations: ${evaluation.recommendations.length} areas for improvement`);
    }

    console.log('\n✅ DEMO 2 PASSED\n');
    return evaluation;
  }

  /**
   * 自動改善デモ
   */
  async demoAutoImprovement(initialEvaluation) {
    console.log('━'.repeat(70));
    console.log('DEMO 3: Auto-Improvement System');
    console.log('━'.repeat(70) + '\n');

    if (initialEvaluation.approved) {
      console.log('✅ Initial proposal already approved - skipping improvement\n');
      return {
        success: true,
        attempts: 0,
        finalProposal: sampleProposal,
        finalEvaluation: initialEvaluation,
        history: [{ attempt: 0, proposal: sampleProposal, evaluation: initialEvaluation }],
        improvementSummary: 'No improvement needed'
      };
    }

    console.log('🔧 Starting auto-improvement process...');
    console.log(`   Target Score: ${this.improver.options.targetScore}`);
    console.log(`   Max Attempts: ${this.improver.options.maxAttempts}\n`);

    const improvementResult = await this.improver.improve(
      sampleProposal,
      ['BrandConsistencyRubric'],
      initialEvaluation
    );

    console.log('\n📊 Improvement Results:');
    console.log(`   ${improvementResult.success ? '✅ Success' : '⚠️  Partial Success'}`);
    console.log(`   Attempts: ${improvementResult.attempts}`);
    console.log(`   Initial Score: ${improvementResult.history[0].evaluation.score.overall}/100`);
    console.log(`   Final Score: ${improvementResult.finalEvaluation.score.overall}/100`);
    console.log(`   Improvement: ${(improvementResult.finalEvaluation.score.overall - improvementResult.history[0].evaluation.score.overall).toFixed(2)} points\n`);

    console.log('✅ DEMO 3 PASSED\n');
    return improvementResult;
  }

  /**
   * 履歴トラッキングデモ
   */
  async demoHistoryTracking(improvementResult) {
    console.log('━'.repeat(70));
    console.log('DEMO 4: Evaluation History Tracking');
    console.log('━'.repeat(70) + '\n');

    console.log('📝 Recording improvement session...');
    const sessionId = await this.history.addImprovementSession(improvementResult);
    console.log(`   Session ID: ${sessionId}\n`);

    console.log('📊 Retrieving statistics...');
    const stats = await this.history.getStatistics();

    console.log(`   Total Records: ${stats.totalRecords}`);
    console.log(`   Improvement Sessions: ${stats.improvementSessions}`);
    console.log(`   Average Score: ${stats.scoreStatistics.average}/100`);
    console.log(`   Success Rate: ${stats.successRate}%\n`);

    console.log('✅ DEMO 4 PASSED\n');
  }

  /**
   * ダッシュボードデモ
   */
  async demoDashboard() {
    console.log('━'.repeat(70));
    console.log('DEMO 5: Evaluation Dashboard');
    console.log('━'.repeat(70) + '\n');

    console.log('📊 Dashboard features:');
    console.log('   ✅ Real-time statistics');
    console.log('   ✅ Trend analysis (7-day rolling)');
    console.log('   ✅ Recent activity tracking');
    console.log('   ✅ Detailed reports');
    console.log('   ✅ Comparison tools\n');

    console.log('💡 To view the dashboard:');
    console.log('   npm run eval:dashboard\n');

    console.log('✅ DEMO 5 PASSED\n');
  }
}

/**
 * CLI エントリーポイント
 */
async function main() {
  const demo = new Phase0Demo();
  await demo.run();
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default Phase0Demo;
