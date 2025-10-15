# EStack-Brand-Builder - プロジェクト構造

**最終更新**: 2025-10-15
**バージョン**: 1.0 (リファクタリング後)

## 📁 ディレクトリ構造

```
EStack-Brand-Builder/
├── .github/               # GitHub統合
│   ├── workflows/        # GitHub Actions (4 ワークフロー)
│   └── ISSUE_TEMPLATE/   # Issue テンプレート
├── .miyabi/              # Miyabi設定・ログ
│   ├── BUDGET.yml        # 経済制約設定
│   ├── config.yml        # システム設定
│   └── logs/             # システムログ
├── .claude/              # Claude Code設定
│   ├── knowledge/        # ナレッジベース
│   ├── commands/         # スラッシュコマンド
│   └── logs/             # 実行ログ
├── archive/              # アーカイブ（完了済みファイル）
│   └── 2025-10-15-refactoring/
│       ├── docs/         # 古いドキュメント
│       ├── scripts/      # 完了済みスクリプト
│       └── backups/      # バックアップ
├── atlas-knowledge-base/ # ブランド構築ナレッジ
│   ├── Core_Methods/     # E:Stack Method™ ガイド
│   ├── Strategic_Frameworks/
│   ├── System_Protocols/ # RSI, IAF, ToT プロトコル
│   ├── External_References/
│   ├── Cases/            # 事例
│   └── Archive/          # 旧バージョン
├── docs/                 # プロジェクトドキュメント
│   ├── MASTER_ISSUE.md   # 🎯 プロジェクト中核
│   ├── AGENTS.md         # システム憲法
│   ├── ARCHITECTURE.md   # システムアーキテクチャ
│   ├── MIYABI_COMPLETE.md # Miyabi実装完了報告
│   ├── PHASE0_COMPLETE.md # Phase 0完了報告
│   ├── DRY_RUN_VERIFICATION_REPORT.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── MIYABI_SDK_USAGE.md
│   ├── VECTOR_EMBEDDINGS_GUIDE.md
│   ├── SETUP_GUIDE.md
│   ├── PROGRESS.md
│   └── standards/        # コーディング規約
├── scripts/              # 実行スクリプト
│   ├── test_evaluation_system.js
│   ├── test_evaluator.js
│   ├── test_knowledge_manager.js
│   ├── test_vector_embeddings.js
│   ├── test_citation_graph.js
│   ├── analyze_dependencies.js
│   ├── simple_dependency_analysis.js
│   ├── init_chroma_db.js
│   └── start_chroma*.py  # ChromaDB起動スクリプト
├── src/                  # ソースコード
│   ├── agents/           # エージェント実装
│   │   ├── base/         # BaseAgent
│   │   ├── core/         # 7 コアエージェント
│   │   └── support/      # 5 サポートエージェント
│   ├── evaluation/       # 評価システム
│   │   ├── MultiModelEvaluator.js
│   │   ├── AutoImprover.js
│   │   ├── EvaluationHistory.js
│   │   └── schemas/      # 評価基準
│   ├── knowledge/        # ナレッジ管理
│   │   ├── KnowledgeManager.js
│   │   ├── VectorStoreChroma.js
│   │   ├── KnowledgeGraph.js
│   │   ├── CitationGraph.js
│   │   ├── EmbeddingService.js
│   │   ├── SemanticSearchEngine.js
│   │   └── TemporalVersioning.js
│   ├── models/           # データモデル
│   │   ├── KnowledgeEntry.js
│   │   └── schemas/      # JSON Schema
│   ├── cli/              # CLIツール
│   │   └── evaluation-dashboard.js
│   └── utils/            # ユーティリティ
│       └── SymbolConverter.js
├── tests/                # テストコード
│   ├── unit/             # 単体テスト
│   ├── integration/      # 統合テスト
│   ├── e2e/              # E2Eテスト
│   └── fixtures/         # テストデータ
├── .miyabi.yml           # Miyabi設定ファイル
├── package.json          # npm設定
├── .gitignore           # Git除外設定
├── .env                 # 環境変数（gitignore済み）
└── README.md            # プロジェクト概要

```

## 🎯 重要ファイル

### プロジェクト管理
- **MASTER_ISSUE.md** — プロジェクトの全体像とステータス
- **README.md** — プロジェクト概要とクイックスタート
- **PROGRESS.md** — 進捗管理

### システム設計
- **AGENTS.md** — 自律型システムの憲法と運用原則
- **ARCHITECTURE.md** — システムアーキテクチャ詳細
- **.miyabi.yml** — Miyabi設定

### 実装ガイド
- **MIYABI_SDK_USAGE.md** — Miyabi SDK使用方法
- **VECTOR_EMBEDDINGS_GUIDE.md** — ベクター埋め込み実装ガイド
- **SETUP_GUIDE.md** — セットアップ手順

### 完了報告
- **MIYABI_COMPLETE.md** — Miyabi実装完了
- **PHASE0_COMPLETE.md** — Phase 0完了
- **DRY_RUN_VERIFICATION_REPORT.md** — 検証レポート

## 🚀 アクティブスクリプト

### テスト・評価
- `test_evaluation_system.js` — 評価システム統合テスト
- `test_evaluator.js` — エバリュエーター単体テスト
- `test_knowledge_manager.js` — ナレッジマネージャーテスト
- `test_vector_embeddings.js` — ベクター埋め込みテスト
- `test_citation_graph.js` — 引用グラフテスト

### 分析
- `analyze_dependencies.js` — 依存関係分析（詳細）
- `simple_dependency_analysis.js` — 依存関係分析（簡易）

### データベース
- `init_chroma_db.js` — ChromaDB初期化
- `start_chroma_server.py` — ChromaDBサーバー起動
- `start_chroma_simple.py` — シンプル起動スクリプト

## 📦 npm スクリプト

```bash
# 評価システム
npm run test:evaluation        # 評価システムテスト
npm run eval:dashboard         # 評価ダッシュボード
npm run eval:dashboard:detailed # 詳細ダッシュボード

# Miyabi システム
npm run test:miyabi            # Miyabiシステムテスト（アーカイブ済み）
npm run test:packages          # パッケージテスト（アーカイブ済み）

# 検証
npm run verify                 # システム検証（アーカイブ済み）
npm run verify:dry             # ドライラン検証（アーカイブ済み）
npm run verify:miyabi          # Miyabi検証（アーカイブ済み）

# 開発
npm run dev                    # 開発モード
npm run test                   # テスト実行
npm run lint                   # コード品質チェック
npm run format                 # コード整形
npm run docs                   # ドキュメント生成

# シンボル変換（完了済み）
npm run convert:symbols        # シンボル変換（アーカイブ済み）
npm run convert:symbols:dry    # ドライラン（アーカイブ済み）
```

## 🗄️ アーカイブ

完了済みのファイルは `archive/2025-10-15-refactoring/` に整理：
- 実行計画・レポート類
- 完了済み検証スクリプト
- バックアップファイル
- 一時的な分析結果

詳細は `archive/2025-10-15-refactoring/README.md` を参照。

## 🔒 gitignore 対象

以下は Git 管理対象外：
- `node_modules/` — npm依存関係
- `.env` — 環境変数（機密情報）
- `chroma_db/` — ChromaDBデータ
- `.ai/logs/` — AIログ
- `.miyabi/logs/` — Miyabiログ
- `backup-*/` — バックアップディレクトリ

---

**管理**: Miyabi Autonomous System
**プロジェクト**: EStack-Brand-Builder
