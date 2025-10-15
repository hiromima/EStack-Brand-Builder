#!/bin/bash

# Brand Builder - サブ Issue 一括作成スクリプト
# 作成日: 2025-10-15

set -e

cd "/Users/enhanced/Desktop/program/Brand Builder"

echo "🚀 サブ Issue 作成開始..."
echo ""

# Issue #102-1: Vector Database セットアップ
echo "Creating #102-1..."
gh issue create \
  --title "[#102-1] Vector Database セットアップ" \
  --label "enhancement,P1-high,knowledge-system,infrastructure" \
  --body "$(cat <<'EOF'
## 概要
Chroma DB を初期化し、Brand Builder システムに Vector Database 基盤を構築します。

## タスク詳細
- [ ] Chroma DB 初期化スクリプト作成
- [ ] データベーススキーマ設計
- [ ] 接続プール設定
- [ ] ヘルスチェック実装
- [ ] エラーハンドリング

## 成果物
- `src/knowledge/VectorDB.js`
- `scripts/init_chroma_db.js`
- `tests/unit/VectorDB.test.js`

## 成功基準
- ✅ Chroma DB 接続成功
- ✅ ベクトル検索応答時間 < 100ms
- ✅ 単体テスト 100% パス

## 見積時間
2 days

## 担当エージェント
- SystemRegistryAgent (主担当)
- CostMonitoringAgent (副担当)

## 依存関係
なし (即座実行可能)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-1 created"
echo ""

# Issue #102-2: KnowledgeEntry データモデル実装
echo "Creating #102-2..."
gh issue create \
  --title "[#102-2] KnowledgeEntry データモデル実装" \
  --label "enhancement,P0-critical,knowledge-system,core,schema" \
  --body "$(cat <<'EOF'
## 概要
知識エントリの統一データモデルを設計・実装します。

## タスク詳細
- [ ] KnowledgeEntry クラス設計
- [ ] JSON Schema 定義
- [ ] バリデーションロジック実装
- [ ] シリアライズ/デシリアライズ
- [ ] タイムスタンプ管理

## 成果物
- `src/models/KnowledgeEntry.js`
- `src/models/schemas/KnowledgeEntrySchema.json`
- `tests/unit/KnowledgeEntry.test.js`

## 成功基準
- ✅ JSON Schema バリデーション 100%
- ✅ 全フィールドのゲッター/セッター実装
- ✅ 単体テスト 100% パス

## 見積時間
1 day

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
なし (即座実行可能)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-2 created"
echo ""

# Issue #102-3: Vector Embeddings 統合
echo "Creating #102-3..."
gh issue create \
  --title "[#102-3] Vector Embeddings 統合" \
  --label "enhancement,P1-high,knowledge-system,ai-integration" \
  --body "$(cat <<'EOF'
## 概要
OpenAI / Gemini Embeddings API を統合し、効率的なベクトル生成システムを構築します。

## タスク詳細
- [ ] OpenAI Embeddings API 統合
- [ ] Gemini Embeddings API 統合 (フォールバック)
- [ ] バッチ処理実装 (コスト削減)
- [ ] キャッシング戦略実装
- [ ] エラーリトライロジック

## 成果物
- `src/knowledge/EmbeddingService.js`
- `tests/unit/EmbeddingService.test.js`

## 成功基準
- ✅ Embedding 生成成功率 99% 以上
- ✅ キャッシュヒット率 70% 以上
- ✅ バッチ処理でコスト 50% 削減

## 見積時間
2 days

## 担当エージェント
- CoordinatorAgent (主担当)
- CostMonitoringAgent (副担当 - コスト監視)

## 依存関係
- #102-1 (Vector Database)
- #102-2 (KnowledgeEntry モデル)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-3 created"
echo ""

# Issue #102-4: セマンティック検索エンジン実装
echo "Creating #102-4..."
gh issue create \
  --title "[#102-4] セマンティック検索エンジン実装" \
  --label "enhancement,P1-high,knowledge-system,search" \
  --body "$(cat <<'EOF'
## 概要
ハイブリッド検索エンジンを実装し、高速・高精度な知識検索を実現します。

## タスク詳細
- [ ] ハイブリッド検索実装 (キーワード + ベクトル)
- [ ] 関連性スコアリング
- [ ] フィルタリング機能 (日付、信頼性等)
- [ ] ページネーション実装
- [ ] 検索結果ランキング

## 成果物
- `src/knowledge/SemanticSearchEngine.js`
- `tests/unit/SemanticSearch.test.js`
- `tests/integration/SearchPerformance.test.js`

## 成功基準
- ✅ 検索応答時間 < 500ms
- ✅ 関連性精度 85% 以上
- ✅ 統合テスト 90% パス

## 見積時間
3 days

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
- #102-1 (Vector Database)
- #102-3 (Vector Embeddings)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-4 created"
echo ""

# Issue #102-5: 引用グラフ構築システム
echo "Creating #102-5..."
gh issue create \
  --title "[#102-5] 引用グラフ構築システム" \
  --label "enhancement,P2-medium,knowledge-system,graph" \
  --body "$(cat <<'EOF'
## 概要
知識エントリ間の引用関係をグラフ構造で管理します。

## タスク詳細
- [ ] グラフデータ構造設計
- [ ] 引用関係抽出ロジック
- [ ] グラフ構築アルゴリズム
- [ ] グラフトラバーサル実装
- [ ] 可視化データ生成

## 成果物
- `src/knowledge/CitationGraph.js`
- `src/knowledge/GraphTraversal.js`
- `tests/unit/CitationGraph.test.js`

## 成功基準
- ✅ グラフ構築成功率 100%
- ✅ トラバーサル応答時間 < 200ms
- ✅ 循環参照検出実装

## 見積時間
3 days

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
- #102-2 (KnowledgeEntry モデル)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-5 created"
echo ""

# Issue #102-6: 時系列バージョニングシステム
echo "Creating #102-6..."
gh issue create \
  --title "[#102-6] 時系列バージョニングシステム" \
  --label "enhancement,P2-medium,knowledge-system,versioning" \
  --body "$(cat <<'EOF'
## 概要
知識エントリの変更履歴を追跡し、時系列でバージョン管理します。

## タスク詳細
- [ ] バージョン管理データ構造設計
- [ ] 差分検出アルゴリズム
- [ ] ロールバック機能実装
- [ ] バージョン履歴追跡
- [ ] 変更ログ生成

## 成果物
- `src/knowledge/TemporalVersioning.js`
- `src/knowledge/ChangeDetector.js`
- `tests/unit/Versioning.test.js`

## 成功基準
- ✅ 全変更の追跡 100%
- ✅ ロールバック成功率 100%
- ✅ 変更ログ自動生成

## 見積時間
2 days

## 担当エージェント
- AuditAgent (主担当)

## 依存関係
- #102-2 (KnowledgeEntry モデル)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-6 created"
echo ""

# Issue #102-7: KnowledgeLoader v2.0 統合
echo "Creating #102-7..."
gh issue create \
  --title "[#102-7] KnowledgeLoader v2.0 統合" \
  --label "enhancement,P0-critical,knowledge-system,core" \
  --body "$(cat <<'EOF'
## 概要
全機能を統合した KnowledgeLoader v2.0 を実装します。

## タスク詳細
- [ ] KnowledgeLoader v1.0 からマイグレーション
- [ ] 全機能統合テスト
- [ ] パフォーマンス最適化
- [ ] API ドキュメント作成
- [ ] 後方互換性確保

## 成果物
- `src/knowledge/KnowledgeLoaderV2.js`
- `tests/integration/KnowledgeLoaderV2.test.js`
- `docs/KNOWLEDGE_LOADER_V2_API.md`

## 成功基準
- ✅ 全統合テスト 100% パス
- ✅ v1.0 比 5x 高速化
- ✅ 後方互換性 100%

## 見積時間
3 days

## 担当エージェント
- CoordinatorAgent (主担当)
- SystemRegistryAgent (統合テスト)

## 依存関係
- #102-1, #102-2, #102-3, #102-4, #102-5, #102-6 (全サブタスク)

## 親 Issue
#102 - 動的知識ベース基盤構築
EOF
)"

echo "✅ #102-7 created"
echo ""

# Issue #103-1: 評価基準 JSON Schema 設計
echo "Creating #103-1..."
gh issue create \
  --title "[#103-1] 評価基準 JSON Schema 設計" \
  --label "enhancement,P0-critical,evaluation,schema" \
  --body "$(cat <<'EOF'
## 概要
多角的評価のための JSON Schema を設計・実装します。

## タスク詳細
- [ ] ブランド一貫性評価スキーマ
- [ ] クリエイティブ革新性評価スキーマ
- [ ] 市場適合性評価スキーマ
- [ ] 実行可能性評価スキーマ
- [ ] 総合評価スキーマ

## 成果物
- `src/evaluation/schemas/BrandConsistency.schema.json`
- `src/evaluation/schemas/CreativeInnovation.schema.json`
- `src/evaluation/schemas/MarketAlignment.schema.json`
- `src/evaluation/schemas/Feasibility.schema.json`
- `src/evaluation/schemas/OverallEvaluation.schema.json`

## 成功基準
- ✅ 全スキーマが JSON Schema Draft 7 準拠
- ✅ 評価項目の網羅性 100%
- ✅ バリデーション成功率 100%

## 見積時間
2 days

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
なし (即座実行可能)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-1 created"
echo ""

# Issue #103-2: 多モデル評価エンジン実装
echo "Creating #103-2..."
gh issue create \
  --title "[#103-2] 多モデル評価エンジン実装" \
  --label "enhancement,P0-critical,evaluation,ai-integration" \
  --body "$(cat <<'EOF'
## 概要
Claude, GPT, Gemini を並列実行する評価エンジンを実装します。

## タスク詳細
- [ ] Claude Sonnet 4.5 評価器実装
- [ ] GPT-5 評価器実装
- [ ] Gemini 2.5 Pro 評価器実装
- [ ] 並列評価実行エンジン
- [ ] スコア統合アルゴリズム

## 成果物
- `src/evaluation/MultiModelEvaluator.js`
- `src/evaluation/evaluators/ClaudeEvaluator.js`
- `src/evaluation/evaluators/GPTEvaluator.js`
- `src/evaluation/evaluators/GeminiEvaluator.js`
- `tests/unit/MultiModelEvaluator.test.js`

## 成功基準
- ✅ 3 モデル並列実行成功
- ✅ 評価完了時間 < 30 秒
- ✅ スコア統合アルゴリズム実装

## 見積時間
3 days

## 担当エージェント
- CoordinatorAgent (主担当)
- CostMonitoringAgent (副担当 - コスト監視)

## 依存関係
- #103-1 (評価スキーマ)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-2 created"
echo ""

# Issue #103-3: 自動改善ループ実装
echo "Creating #103-3..."
gh issue create \
  --title "[#103-3] 自動改善ループ実装" \
  --label "enhancement,P1-high,evaluation,self-improvement" \
  --body "$(cat <<'EOF'
## 概要
90 点未満の提案を自動的に改善するループを実装します。

## タスク詳細
- [ ] 評価結果分析ロジック
- [ ] 改善案生成アルゴリズム
- [ ] 自動リファクタリング実装
- [ ] 改善効果検証
- [ ] 最大リトライ回数管理 (3 回)

## 成果物
- `src/evaluation/ImprovementEngine.js`
- `src/evaluation/WeaknessAnalyzer.js`
- `src/evaluation/ImprovementGenerator.js`
- `tests/unit/ImprovementEngine.test.js`

## 成功基準
- ✅ 90 点未満の提案を自動改善
- ✅ 改善成功率 80% 以上
- ✅ 最大 3 回で目標達成

## 見積時間
4 days

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
- #103-2 (多モデル評価エンジン)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-3 created"
echo ""

# Issue #103-4: 評価履歴トラッキングシステム
echo "Creating #103-4..."
gh issue create \
  --title "[#103-4] 評価履歴トラッキングシステム" \
  --label "enhancement,P2-medium,evaluation,tracking" \
  --body "$(cat <<'EOF'
## 概要
評価履歴を記録し、トレンド分析を行うシステムを実装します。

## タスク詳細
- [ ] 評価履歴データモデル設計
- [ ] 履歴記録ロジック実装
- [ ] トレンド分析アルゴリズム
- [ ] ダッシュボードデータ生成
- [ ] 長期保存とローテーション

## 成果物
- `src/evaluation/EvaluationHistory.js`
- `src/evaluation/TrendAnalyzer.js`
- `tests/unit/EvaluationHistory.test.js`

## 成功基準
- ✅ 全評価の 100% 記録
- ✅ トレンド分析精度 85% 以上
- ✅ 365 日間のデータ保持

## 見積時間
2 days

## 担当エージェント
- AuditAgent (主担当)

## 依存関係
- #103-2 (多モデル評価エンジン)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-4 created"
echo ""

# Issue #103-5: 評価ダッシュボード UI 実装
echo "Creating #103-5..."
gh issue create \
  --title "[#103-5] 評価ダッシュボード UI 実装" \
  --label "enhancement,P2-medium,evaluation,ui" \
  --body "$(cat <<'EOF'
## 概要
CLI ベースの評価ダッシュボードを実装します。

## タスク詳細
- [ ] CLI ベースダッシュボード実装
- [ ] スコア可視化 (グラフ・チャート)
- [ ] 履歴トレンド表示
- [ ] 詳細レポート生成
- [ ] エクスポート機能 (JSON/CSV)

## 成果物
- `src/cli/evaluation-dashboard.js` (拡張)
- `src/evaluation/DashboardRenderer.js`
- `tests/integration/Dashboard.test.js`

## 成功基準
- ✅ リアルタイムスコア表示
- ✅ 履歴トレンドグラフ生成
- ✅ レポートエクスポート機能

## 見積時間
3 days

## 担当エージェント
- CoordinatorAgent (主担当)

## 依存関係
- #103-4 (評価履歴トラッキング)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-5 created"
echo ""

# Issue #103-6: Zero-Human Approval Protocol 実装
echo "Creating #103-6..."
gh issue create \
  --title "[#103-6] Zero-Human Approval Protocol 実装" \
  --label "enhancement,P0-critical,evaluation,automation" \
  --body "$(cat <<'EOF'
## 概要
90 点以上で自動承認する Zero-Human Approval Protocol を実装します。

## タスク詳細
- [ ] 自動承認ロジック実装 (≥90 点)
- [ ] 警告フロー実装 (70-89 点)
- [ ] 却下フロー実装 (<70 点)
- [ ] GitHub ラベル自動付与
- [ ] 通知システム統合

## 成果物
- `src/evaluation/ZeroHumanApproval.js`
- `.github/workflows/quality-gate.yml` (拡張)
- `tests/unit/ZeroHumanApproval.test.js`

## 成功基準
- ✅ 90 点以上で自動承認
- ✅ GitHub Actions 統合成功
- ✅ 通知システム 100% 動作

## 見積時間
2 days

## 担当エージェント
- CoordinatorAgent (主担当)
- IncidentCommanderAgent (失敗時のエスカレーション)

## 依存関係
- #103-2 (多モデル評価エンジン)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-6 created"
echo ""

# Issue #103-7: 評価システム統合テスト
echo "Creating #103-7..."
gh issue create \
  --title "[#103-7] 評価システム統合テスト" \
  --label "enhancement,P1-high,evaluation,testing" \
  --body "$(cat <<'EOF'
## 概要
評価システム全体の統合テストとドキュメント作成を行います。

## タスク詳細
- [ ] End-to-End 評価フロー テスト
- [ ] パフォーマンステスト
- [ ] 負荷テスト (並列評価)
- [ ] エッジケーステスト
- [ ] ドキュメント作成

## 成果物
- `tests/e2e/EvaluationWorkflow.test.js`
- `tests/performance/EvaluationLoad.test.js`
- `docs/EVALUATION_SYSTEM_API.md`

## 成功基準
- ✅ 全 E2E テスト 100% パス
- ✅ パフォーマンステスト合格
- ✅ ドキュメント完備

## 見積時間
2 days

## 担当エージェント
- CoordinatorAgent (主担当)
- SystemRegistryAgent (統合テスト)

## 依存関係
- #103-1, #103-2, #103-3, #103-4, #103-5, #103-6 (全サブタスク)

## 親 Issue
#103 - 自動評価システム基盤構築
EOF
)"

echo "✅ #103-7 created"
echo ""

echo "🎉 全 14 件のサブ Issue 作成完了！"
echo ""
echo "次のコマンドで確認できます:"
echo "gh issue list --label knowledge-system,evaluation"
