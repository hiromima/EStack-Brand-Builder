# EStack-Brand-Builder - サブ Issue 実行計画

**作成日時**: 2025-10-15
**対象**: Issue #102 (動的知識ベース) & Issue #103 (自動評価システム)

---

## 📋 概要

Issue #102 と #103 を実行可能な最小単位のサブ Issue に分解し、各タスクにラベル・優先度・担当エージェント・実行時間をアサインします。

---

## 🎯 Issue #102: 動的知識ベース基盤構築

**親 Issue**: #102
**優先度**: P0-critical
**総見積時間**: 2-3 weeks

### サブ Issue 一覧

#### #102-1: Vector Database セットアップ
**ラベル**: `enhancement`, `P1-high`, `knowledge-system`, `infrastructure`
**見積時間**: 2 days
**担当エージェント**: SystemRegistryAgent + CostMonitoringAgent
**依存関係**: なし

**タスク詳細**:
- [ ] Chroma DB 初期化スクリプト作成
- [ ] データベーススキーマ設計
- [ ] 接続プール設定
- [ ] ヘルスチェック実装
- [ ] エラーハンドリング

**成果物**:
- `src/knowledge/VectorDB.js`
- `scripts/init_chroma_db.js`
- `tests/unit/VectorDB.test.js`

**成功基準**:
- ✅ Chroma DB 接続成功
- ✅ ベクトル検索応答時間 < 100ms
- ✅ 単体テスト 100% パス

---

#### #102-2: KnowledgeEntry データモデル実装
**ラベル**: `enhancement`, `P0-critical`, `knowledge-system`, `core`
**見積時間**: 1 day
**担当エージェント**: CoordinatorAgent
**依存関係**: なし

**タスク詳細**:
- [ ] KnowledgeEntry クラス設計
- [ ] JSON Schema 定義
- [ ] バリデーションロジック実装
- [ ] シリアライズ/デシリアライズ
- [ ] タイムスタンプ管理

**成果物**:
- `src/models/KnowledgeEntry.js`
- `src/models/schemas/KnowledgeEntrySchema.json`
- `tests/unit/KnowledgeEntry.test.js`

**成功基準**:
- ✅ JSON Schema バリデーション 100%
- ✅ 全フィールドのゲッター/セッター実装
- ✅ 単体テスト 100% パス

---

#### #102-3: Vector Embeddings 統合
**ラベル**: `enhancement`, `P1-high`, `knowledge-system`, `ai-integration`
**見積時間**: 2 days
**担当エージェント**: CoordinatorAgent + CostMonitoringAgent
**依存関係**: #102-1, #102-2

**タスク詳細**:
- [ ] OpenAI Embeddings API 統合
- [ ] Gemini Embeddings API 統合 (フォールバック)
- [ ] バッチ処理実装 (コスト削減)
- [ ] キャッシング戦略実装
- [ ] エラーリトライロジック

**成果物**:
- `src/knowledge/EmbeddingService.js`
- `tests/unit/EmbeddingService.test.js`

**成功基準**:
- ✅ Embedding 生成成功率 99% 以上
- ✅ キャッシュヒット率 70% 以上
- ✅ バッチ処理でコスト 50% 削減

---

#### #102-4: セマンティック検索エンジン実装
**ラベル**: `enhancement`, `P1-high`, `knowledge-system`, `search`
**見積時間**: 3 days
**担当エージェント**: CoordinatorAgent
**依存関係**: #102-1, #102-3

**タスク詳細**:
- [ ] ハイブリッド検索実装 (キーワード + ベクトル)
- [ ] 関連性スコアリング
- [ ] フィルタリング機能 (日付、信頼性等)
- [ ] ページネーション実装
- [ ] 検索結果ランキング

**成果物**:
- `src/knowledge/SemanticSearchEngine.js`
- `tests/unit/SemanticSearch.test.js`
- `tests/integration/SearchPerformance.test.js`

**成功基準**:
- ✅ 検索応答時間 < 500ms
- ✅ 関連性精度 85% 以上
- ✅ 統合テスト 90% パス

---

#### #102-5: 引用グラフ構築システム
**ラベル**: `enhancement`, `P2-medium`, `knowledge-system`, `graph`
**見積時間**: 3 days
**担当エージェント**: CoordinatorAgent
**依存関係**: #102-2

**タスク詳細**:
- [ ] グラフデータ構造設計
- [ ] 引用関係抽出ロジック
- [ ] グラフ構築アルゴリズム
- [ ] グラフトラバーサル実装
- [ ] 可視化データ生成

**成果物**:
- `src/knowledge/CitationGraph.js`
- `src/knowledge/GraphTraversal.js`
- `tests/unit/CitationGraph.test.js`

**成功基準**:
- ✅ グラフ構築成功率 100%
- ✅ トラバーサル応答時間 < 200ms
- ✅ 循環参照検出実装

---

#### #102-6: 時系列バージョニングシステム
**ラベル**: `enhancement`, `P2-medium`, `knowledge-system`, `versioning`
**見積時間**: 2 days
**担当エージェント**: AuditAgent
**依存関係**: #102-2

**タスク詳細**:
- [ ] バージョン管理データ構造設計
- [ ] 差分検出アルゴリズム
- [ ] ロールバック機能実装
- [ ] バージョン履歴追跡
- [ ] 変更ログ生成

**成果物**:
- `src/knowledge/TemporalVersioning.js`
- `src/knowledge/ChangeDetector.js`
- `tests/unit/Versioning.test.js`

**成功基準**:
- ✅ 全変更の追跡 100%
- ✅ ロールバック成功率 100%
- ✅ 変更ログ自動生成

---

#### #102-7: KnowledgeLoader v2.0 統合
**ラベル**: `enhancement`, `P0-critical`, `knowledge-system`, `core`
**見積時間**: 3 days
**担当エージェント**: CoordinatorAgent + SystemRegistryAgent
**依存関係**: #102-1, #102-2, #102-3, #102-4, #102-5, #102-6

**タスク詳細**:
- [ ] KnowledgeLoader v1.0 からマイグレーション
- [ ] 全機能統合テスト
- [ ] パフォーマンス最適化
- [ ] API ドキュメント作成
- [ ] 後方互換性確保

**成果物**:
- `src/knowledge/KnowledgeLoaderV2.js`
- `tests/integration/KnowledgeLoaderV2.test.js`
- `docs/KNOWLEDGE_LOADER_V2_API.md`

**成功基準**:
- ✅ 全統合テスト 100% パス
- ✅ v1.0 比 5x 高速化
- ✅ 後方互換性 100%

---

## 🎯 Issue #103: 自動評価システム基盤構築

**親 Issue**: #103
**優先度**: P0-critical
**総見積時間**: 2-3 weeks

### サブ Issue 一覧

#### #103-1: 評価基準 JSON Schema 設計
**ラベル**: `enhancement`, `P0-critical`, `evaluation`, `schema`
**見積時間**: 2 days
**担当エージェント**: CoordinatorAgent
**依存関係**: なし

**タスク詳細**:
- [ ] ブランド一貫性評価スキーマ
- [ ] クリエイティブ革新性評価スキーマ
- [ ] 市場適合性評価スキーマ
- [ ] 実行可能性評価スキーマ
- [ ] 総合評価スキーマ

**成果物**:
- `src/evaluation/schemas/BrandConsistency.schema.json`
- `src/evaluation/schemas/CreativeInnovation.schema.json`
- `src/evaluation/schemas/MarketAlignment.schema.json`
- `src/evaluation/schemas/Feasibility.schema.json`
- `src/evaluation/schemas/OverallEvaluation.schema.json`

**成功基準**:
- ✅ 全スキーマが JSON Schema Draft 7 準拠
- ✅ 評価項目の網羅性 100%
- ✅ バリデーション成功率 100%

---

#### #103-2: 多モデル評価エンジン実装
**ラベル**: `enhancement`, `P0-critical`, `evaluation`, `ai-integration`
**見積時間**: 3 days
**担当エージェント**: CoordinatorAgent + CostMonitoringAgent
**依存関係**: #103-1

**タスク詳細**:
- [ ] Claude Sonnet 4.5 評価器実装
- [ ] GPT-5 評価器実装
- [ ] Gemini 2.5 Pro 評価器実装
- [ ] 並列評価実行エンジン
- [ ] スコア統合アルゴリズム

**成果物**:
- `src/evaluation/MultiModelEvaluator.js`
- `src/evaluation/evaluators/ClaudeEvaluator.js`
- `src/evaluation/evaluators/GPTEvaluator.js`
- `src/evaluation/evaluators/GeminiEvaluator.js`
- `tests/unit/MultiModelEvaluator.test.js`

**成功基準**:
- ✅ 3 モデル並列実行成功
- ✅ 評価完了時間 < 30 秒
- ✅ スコア統合アルゴリズム実装

---

#### #103-3: 自動改善ループ実装
**ラベル**: `enhancement`, `P1-high`, `evaluation`, `self-improvement`
**見積時間**: 4 days
**担当エージェント**: CoordinatorAgent
**依存関係**: #103-2

**タスク詳細**:
- [ ] 評価結果分析ロジック
- [ ] 改善案生成アルゴリズム
- [ ] 自動リファクタリング実装
- [ ] 改善効果検証
- [ ] 最大リトライ回数管理 (3 回)

**成果物**:
- `src/evaluation/ImprovementEngine.js`
- `src/evaluation/WeaknessAnalyzer.js`
- `src/evaluation/ImprovementGenerator.js`
- `tests/unit/ImprovementEngine.test.js`

**成功基準**:
- ✅ 90 点未満の提案を自動改善
- ✅ 改善成功率 80% 以上
- ✅ 最大 3 回で目標達成

---

#### #103-4: 評価履歴トラッキングシステム
**ラベル**: `enhancement`, `P2-medium`, `evaluation`, `tracking`
**見積時間**: 2 days
**担当エージェント**: AuditAgent
**依存関係**: #103-2

**タスク詳細**:
- [ ] 評価履歴データモデル設計
- [ ] 履歴記録ロジック実装
- [ ] トレンド分析アルゴリズム
- [ ] ダッシュボードデータ生成
- [ ] 長期保存とローテーション

**成果物**:
- `src/evaluation/EvaluationHistory.js`
- `src/evaluation/TrendAnalyzer.js`
- `tests/unit/EvaluationHistory.test.js`

**成功基準**:
- ✅ 全評価の 100% 記録
- ✅ トレンド分析精度 85% 以上
- ✅ 365 日間のデータ保持

---

#### #103-5: 評価ダッシュボード UI 実装
**ラベル**: `enhancement`, `P2-medium`, `evaluation`, `ui`
**見積時間**: 3 days
**担当エージェント**: CoordinatorAgent
**依存関係**: #103-4

**タスク詳細**:
- [ ] CLI ベースダッシュボード実装
- [ ] スコア可視化 (グラフ・チャート)
- [ ] 履歴トレンド表示
- [ ] 詳細レポート生成
- [ ] エクスポート機能 (JSON/CSV)

**成果物**:
- `src/cli/evaluation-dashboard.js` (拡張)
- `src/evaluation/DashboardRenderer.js`
- `tests/integration/Dashboard.test.js`

**成功基準**:
- ✅ リアルタイムスコア表示
- ✅ 履歴トレンドグラフ生成
- ✅ レポートエクスポート機能

---

#### #103-6: Zero-Human Approval Protocol 実装
**ラベル**: `enhancement`, `P0-critical`, `evaluation`, `automation`
**見積時間**: 2 days
**担当エージェント**: CoordinatorAgent + IncidentCommanderAgent
**依存関係**: #103-2

**タスク詳細**:
- [ ] 自動承認ロジック実装 (≥90 点)
- [ ] 警告フロー実装 (70-89 点)
- [ ] 却下フロー実装 (<70 点)
- [ ] GitHub ラベル自動付与
- [ ] 通知システム統合

**成果物**:
- `src/evaluation/ZeroHumanApproval.js`
- `.github/workflows/quality-gate.yml` (拡張)
- `tests/unit/ZeroHumanApproval.test.js`

**成功基準**:
- ✅ 90 点以上で自動承認
- ✅ GitHub Actions 統合成功
- ✅ 通知システム 100% 動作

---

#### #103-7: 評価システム統合テスト
**ラベル**: `enhancement`, `P1-high`, `evaluation`, `testing`
**見積時間**: 2 days
**担当エージェント**: CoordinatorAgent + SystemRegistryAgent
**依存関係**: #103-1, #103-2, #103-3, #103-4, #103-5, #103-6

**タスク詳細**:
- [ ] End-to-End 評価フロー テスト
- [ ] パフォーマンステスト
- [ ] 負荷テスト (並列評価)
- [ ] エッジケーステスト
- [ ] ドキュメント作成

**成果物**:
- `tests/e2e/EvaluationWorkflow.test.js`
- `tests/performance/EvaluationLoad.test.js`
- `docs/EVALUATION_SYSTEM_API.md`

**成功基準**:
- ✅ 全 E2E テスト 100% パス
- ✅ パフォーマンステスト合格
- ✅ ドキュメント完備

---

## 📊 実行タイムライン

### Week 1: 基盤構築フェーズ
```
並列実行 Wave 1:
├─ #102-1: Vector DB セットアップ (2d) ─────┐
├─ #102-2: KnowledgeEntry モデル (1d) ──────┤
├─ #103-1: 評価スキーマ設計 (2d) ───────────┤
└─ #103-2: 多モデル評価エンジン (3d) ───────┘
→ 合計実行時間: 3 days (並列実行)
```

### Week 2: コア機能実装フェーズ
```
並列実行 Wave 2:
├─ #102-3: Vector Embeddings (2d) ──────────┐
├─ #102-4: セマンティック検索 (3d) ─────────┤
├─ #103-3: 自動改善ループ (4d) ─────────────┤
└─ #103-4: 評価履歴トラッキング (2d) ───────┘
→ 合計実行時間: 4 days (並列実行)
```

### Week 3: 高度機能実装フェーズ
```
並列実行 Wave 3:
├─ #102-5: 引用グラフ (3d) ─────────────────┐
├─ #102-6: 時系列バージョニング (2d) ───────┤
├─ #103-5: 評価ダッシュボード (3d) ─────────┤
└─ #103-6: Zero-Human Approval (2d) ────────┘
→ 合計実行時間: 3 days (並列実行)
```

### Week 4: 統合・テストフェーズ
```
順次実行:
├─ #102-7: KnowledgeLoader v2 統合 (3d)
└─ #103-7: 評価システム統合テスト (2d)
→ 合計実行時間: 5 days (順次実行)
```

**総実行時間**: 15 days (3 weeks)

---

## 🏷️ ラベル定義

### 優先度ラベル
- `P0-critical` - 即座実行必須、システム全体に影響
- `P1-high` - 高優先度、コア機能に必要
- `P2-medium` - 中優先度、重要だが緊急ではない
- `P3-low` - 低優先度、将来的な改善

### カテゴリラベル
- `knowledge-system` - 知識ベース関連
- `evaluation` - 評価システム関連
- `infrastructure` - インフラ・基盤
- `core` - コア機能
- `ai-integration` - AI API 統合
- `search` - 検索機能
- `graph` - グラフデータ構造
- `versioning` - バージョン管理
- `schema` - データモデル・スキーマ
- `self-improvement` - 自己改善機能
- `tracking` - 追跡・ログ
- `ui` - ユーザーインターフェース
- `automation` - 自動化
- `testing` - テスト

### ステータスラベル
- `ready` - 実行準備完了
- `in-progress` - 実行中
- `blocked` - ブロック中 (依存関係待ち)
- `review` - レビュー待ち
- `completed` - 完了

---

## 🤖 エージェントアサインメント

### CoordinatorAgent (主担当)
**担当サブ Issue**: 10 件
- #102-2, #102-4, #102-5, #102-7
- #103-1, #103-2, #103-3, #103-5, #103-6, #103-7

**責務**: タスクルーティング、ワークフロー管理、統合調整

### CostMonitoringAgent (副担当)
**担当サブ Issue**: 2 件
- #102-3 (Embeddings API コスト監視)
- #103-2 (多モデル評価コスト監視)

**責務**: API コスト追跡、予算管理、サーキットブレーカー

### AuditAgent (副担当)
**担当サブ Issue**: 2 件
- #102-6 (時系列バージョニング)
- #103-4 (評価履歴トラッキング)

**責務**: 監査ログ、履歴追跡、データ整合性

### SystemRegistryAgent (副担当)
**担当サブ Issue**: 2 件
- #102-1 (Vector DB セットアップ)
- #102-7, #103-7 (統合テスト)

**責務**: システム登録、コンプライアンステスト、統合検証

### IncidentCommanderAgent (副担当)
**担当サブ Issue**: 1 件
- #103-6 (Zero-Human Approval - 失敗時のエスカレーション)

**責務**: 自動承認失敗時の対応、Handshake Protocol

---

## 📈 成功基準

### Issue #102: 動的知識ベース
- ✅ Vector DB 統合完了
- ✅ セマンティック検索応答時間 < 500ms
- ✅ 引用グラフ構築成功率 100%
- ✅ 全バージョン履歴追跡 100%
- ✅ KnowledgeLoader v2 が v1 比 5x 高速化

### Issue #103: 自動評価システム
- ✅ 3 モデル並列評価 < 30 秒
- ✅ 自動改善成功率 80% 以上
- ✅ 90 点以上で自動承認 100%
- ✅ 評価履歴 365 日保持
- ✅ ダッシュボード完全実装

### 全体
- ✅ 全サブ Issue (14 件) 完了
- ✅ 単体テストカバレッジ 80% 以上
- ✅ 統合テストカバレッジ 70% 以上
- ✅ Lint エラー 0
- ✅ 全ドキュメント完備

---

## 🚀 次のアクション

1. **GitHub Issue 作成** - 全 14 サブ Issue を GitHub に登録
2. **Wave 1 実行開始** - #102-1, #102-2, #103-1, #103-2 を並列実行
3. **Miyabi 自律システム起動** - 各エージェントへのタスクルーティング
4. **進捗モニタリング** - CoordinatorAgent による進捗追跡

---

> **本計画により、Issue #102 と #103 は 3 週間で完全実装されます**
