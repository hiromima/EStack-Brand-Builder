# EStack-Brand-Builder

完全自律型 AI エージェントシステムによるブランド構築プラットフォーム

## 概要

EStack-Brand-Builder は、miyabi-agent-sdk を活用した自律型エージェントシステムで、GitHub Issue ベースの完全自動化ワークフローを実現します。

## 特徴

- **完全自律運用** — AGENTS.md の憲法に基づく自律的なガバナンス
- **GitHub エコシステム統合** — Issue、PR、Actions による完全自動化
- **自己修復機能** — インシデント自動検知と復旧
- **経済的自律性** — コスト監視とサーキットブレーカー
- **🆓 完全無料 AI 統合** — Google Gemini CLI による課金ゼロの AI レビュー

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env を編集して必要な認証情報を設定

# システム検証（ドライラン - API キー不要）
npm run verify:dry

# システム検証（完全版 - API キー必要）
npm run verify
```

## 利用可能なコマンド

### Miyabi SDK
```bash
npx miyabi-agent-sdk analyze <issue>    # Issue 分析
npx miyabi-agent-sdk generate <issue>   # コード生成
npx miyabi-agent-sdk review <files>     # コードレビュー
npx miyabi-agent-sdk workflow <issue>   # フルワークフロー
npx miyabi-agent-sdk help               # ヘルプ表示
```

### テスト・評価
```bash
npm run test:evaluation          # 評価システムテスト
npm run eval:dashboard           # 評価ダッシュボード
npm run eval:dashboard:detailed  # 詳細ダッシュボード
npm run test          # 全テスト実行
npm run lint          # コード品質チェック
```

### 開発
```bash
npm run dev           # 開発モード（ホットリロード）
npm run format        # コード整形
npm run docs          # ドキュメント生成
```

## 依存関係

### 必須パッケージ
- **@anthropic-ai/sdk** (^0.65.0) — Claude API SDK
- **@google/generative-ai** (^0.24.1) — Gemini API SDK
- **openai** (^6.3.0) — OpenAI API SDK
- **miyabi-agent-sdk** (^0.1.0-alpha.1) — 自律型エージェント SDK
- **chromadb** (^3.0.17) — Vector Database
- **neo4j-driver** (^6.0.0) — Graph Database
- **js-yaml** (^4.1.0) — YAML パーサー
- **glob** (^11.0.3) — ファイルパターンマッチング

## システムアーキテクチャ

### Miyabi 自律システム
完全自律型 AI エージェントシステム - **The Three Laws of Autonomy**

1. **Law of Objectivity** — データ駆動の意思決定
2. **Law of Self-Sufficiency** — 人間介入の最小化
3. **Law of Traceability** — GitHub への全記録

#### Support Agents (5 agents)
- `CostMonitoringAgent` — 経済的サーキットブレーカー
- `IncidentCommanderAgent` — 自己修復と Handshake Protocol
- `SystemRegistryAgent` — エージェント自動登録
- `AuditAgent` — セキュリティ監査
- `CoordinatorAgent` — タスクルーティング

#### GitHub Actions Workflows (5 workflows)
- `gemini-pr-review.yml` — 🆓 Gemini AI 自動レビュー（完全無料）
- `quality-gate.yml` — 品質ゲート with Gemini（自動承認 ≥90点）
- `economic-circuit-breaker.yml` — コスト監視（毎時実行）
- `agent-onboarding.yml` — エージェント登録
- `incident-response.yml` — インシデント対応

### 🤖 Gemini AI 統合（完全無料）

**コスト比較**

| プロバイダー | 料金 | 無料枠 |
|------------|------|--------|
| Anthropic Claude | $3-15/1M tokens | 限定的 |
| OpenAI GPT-4 | $0.03-0.06/1K tokens | $5 |
| **Google Gemini** | **$0.00** | **60/min, 1,000/day** |

**使い方**

```bash
# PR に自動レビューコメント
# → Gemini が自動的にコードレビュー

# 対話型 AI アシスタント
@gemini-cli explain this code change
@gemini-cli suggest improvements
@gemini-cli check for security issues
```

詳細は [GEMINI_SETUP.md](docs/GEMINI_SETUP.md) を参照

## ドキュメント

### プロジェクト管理
- [MASTER_ISSUE.md](docs/MASTER_ISSUE.md) — プロジェクト全体像とステータス
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — プロジェクト構造詳細
- [PROGRESS.md](docs/PROGRESS.md) — 進捗管理

### システム設計
- [AGENTS.md](docs/AGENTS.md) — 自律型システムの憲法と運用原則
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — システムアーキテクチャ

### 実装ガイド
- [GEMINI_SETUP.md](docs/GEMINI_SETUP.md) — 🆓 Gemini AI 統合ガイド（完全無料）
- [MIYABI_SDK_USAGE.md](docs/MIYABI_SDK_USAGE.md) — Miyabi SDK 使用ガイド
- [VECTOR_EMBEDDINGS_GUIDE.md](docs/VECTOR_EMBEDDINGS_GUIDE.md) — ベクター埋め込みガイド
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) — セットアップ手順

### 完了報告
- [MIYABI_COMPLETE.md](docs/MIYABI_COMPLETE.md) — Miyabi システム完成報告
- [PHASE0_COMPLETE.md](docs/PHASE0_COMPLETE.md) — Phase 0 完成報告
- [DRY_RUN_VERIFICATION_REPORT.md](docs/DRY_RUN_VERIFICATION_REPORT.md) — 検証レポート

## ライセンス

ISC
