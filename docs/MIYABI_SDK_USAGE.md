# Miyabi Agent SDK - 使用ガイド

**バージョン**: 0.1.0-alpha.1
**インストール済み**: ✅

---

## 📋 概要

miyabi-agent-sdk は GitHub Issue ベースの自律型エージェントシステムを提供する CLI ツールです。

## 🚀 利用可能なコマンド

### 1. analyze - Issue 分析
```bash
npx miyabi-agent-sdk analyze <issue-number>
```

GitHub Issue を IssueAgent で分析します。

**例**:
```bash
npx miyabi-agent-sdk analyze 42 --repo hiromima/EStack-Brand-Builder
```

**機能**:
- Issue の内容を解析
- タスクの抽出
- 優先度の判定
- 実装方針の提案

---

### 2. generate - コード生成
```bash
npx miyabi-agent-sdk generate <issue-number>
```

Issue に基づいてコードを CodeGenAgent で生成します。

**例**:
```bash
npx miyabi-agent-sdk generate 42 --use-anthropic-api --anthropic-key sk-ant-xxx
```

**機能**:
- Issue の要件からコード生成
- 既存コードベースとの整合性確保
- テストコードの生成

---

### 3. review - コードレビュー
```bash
npx miyabi-agent-sdk review <file1> <file2>...
```

指定されたファイルを ReviewAgent でレビューします。

**例**:
```bash
npx miyabi-agent-sdk review src/agents/support/CostMonitoringAgent.js
```

**機能**:
- コード品質チェック
- ベストプラクティス検証
- セキュリティレビュー
- パフォーマンス改善提案

---

### 4. workflow - フルワークフロー実行
```bash
npx miyabi-agent-sdk workflow <issue-number>
```

Issue から PR 作成までの完全自動ワークフローを実行します。

**例**:
```bash
npx miyabi-agent-sdk workflow 42 --repo hiromima/EStack-Brand-Builder
```

**フロー**:
1. Issue 分析 (IssueAgent)
2. コード生成 (CodeGenAgent)
3. コードレビュー (ReviewAgent)
4. Pull Request 作成

---

## ⚙️ オプション

### 実行モード

#### --use-claude-code (デフォルト)
ローカルの Claude Code CLI を使用（無料）

```bash
npx miyabi-agent-sdk analyze 42 --use-claude-code
```

#### --use-anthropic-api
Anthropic API を使用（有料）

```bash
npx miyabi-agent-sdk analyze 42 --use-anthropic-api --anthropic-key sk-ant-xxx
```

### GitHub 設定

#### --repo <owner/repo>
対象リポジトリを指定

```bash
npx miyabi-agent-sdk analyze 42 --repo hiromima/EStack-Brand-Builder
```

デフォルト: git remote から自動検出

#### --github-token <token>
GitHub トークンを指定

```bash
npx miyabi-agent-sdk analyze 42 --github-token ghp_xxxxx
```

デフォルト: `GITHUB_TOKEN` 環境変数

---

## 🔐 環境変数

### GITHUB_TOKEN
GitHub Personal Access Token

**必要な権限**:
- `repo` (リポジトリへのフルアクセス)
- `workflow` (GitHub Actions の管理)

**設定方法**:
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

または `.env` ファイルに追加:
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

### ANTHROPIC_API_KEY
Anthropic API キー（`--use-anthropic-api` 使用時のみ必要）

**設定方法**:
```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

---

## 📚 使用例

### Example 1: Issue の分析
```bash
# Issue #101 を分析
npx miyabi-agent-sdk analyze 101 --repo hiromima/EStack-Brand-Builder

# 出力例:
# ✅ Issue analyzed successfully
# Title: Implement CostMonitoringAgent
# Priority: High
# Estimated effort: 2-3 days
# Recommendations: [...]
```

### Example 2: コード生成と PR 作成
```bash
# Issue #101 から自動的にコード生成して PR 作成
npx miyabi-agent-sdk workflow 101 --repo hiromima/EStack-Brand-Builder

# フロー:
# 1. Issue #101 を分析
# 2. CostMonitoringAgent.js を生成
# 3. コードレビュー実行
# 4. PR #102 を自動作成
```

### Example 3: 既存コードのレビュー
```bash
# Support Agents をまとめてレビュー
npx miyabi-agent-sdk review \
  src/agents/support/CostMonitoringAgent.js \
  src/agents/support/IncidentCommanderAgent.js \
  src/agents/support/SystemRegistryAgent.js

# 出力例:
# ✅ CostMonitoringAgent.js - Quality: 95/100
# ⚠️  IncidentCommanderAgent.js - Quality: 88/100 (3 warnings)
# ✅ SystemRegistryAgent.js - Quality: 92/100
```

---

## 🔄 EStack-Brand-Builder での統合

### 現在の統合状況

EStack-Brand-Builder プロジェクトには miyabi-agent-sdk がすでにインストールされています。

**インストール済みバージョン**: `0.1.0-alpha.1`

### 推奨ワークフロー

#### 1. 新機能開発
```bash
# Step 1: GitHub Issue 作成 (Web UI)
# Step 2: SDK でワークフロー実行
npx miyabi-agent-sdk workflow <issue-number>

# Step 3: 生成された PR をレビュー・マージ
```

#### 2. コード品質チェック
```bash
# Support Agents のレビュー
npx miyabi-agent-sdk review src/agents/support/*.js

# Core Agents のレビュー
npx miyabi-agent-sdk review src/agents/core/*.js
```

#### 3. Issue ベース開発
```bash
# Issue #105: 新しい Agent を追加
npx miyabi-agent-sdk analyze 105
npx miyabi-agent-sdk generate 105
npx miyabi-agent-sdk review <generated-file>
```

---

## 🏛️ Miyabi システムとの連携

### Support Agents との統合

miyabi-agent-sdk は EStack-Brand-Builder の Support Agents と連携します：

1. **SystemRegistryAgent**
   - SDK で生成された Agent を自動検出
   - コンプライアンステスト実行
   - レジストリに自動登録

2. **CoordinatorAgent**
   - SDK のワークフローをタスクとして管理
   - エージェント間の調整

3. **AuditAgent**
   - SDK の操作をすべて監査ログに記録
   - セキュリティチェック

---

## 🎯 ベストプラクティス

### 1. Claude Code CLI を優先使用
```bash
# 無料で使える Claude Code CLI をデフォルトで使用
npx miyabi-agent-sdk analyze 42 --use-claude-code
```

### 2. 環境変数で認証情報管理
```bash
# .env ファイルに設定
GITHUB_TOKEN=ghp_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. リポジトリ指定を明示
```bash
# 確実にするため --repo を明示
npx miyabi-agent-sdk workflow 42 --repo hiromima/EStack-Brand-Builder
```

### 4. レビューを活用
```bash
# 生成コードは必ずレビュー
npx miyabi-agent-sdk generate 42
npx miyabi-agent-sdk review <generated-file>
```

---

## ⚠️ 注意事項

### 1. API 使用制限
- `--use-anthropic-api` は有料
- Claude Code CLI (`--use-claude-code`) は無料だが制限あり

### 2. GitHub トークンの権限
- `repo` スコープが必要
- Public リポジトリでも必須

### 3. 大規模変更
- workflow コマンドは自動的に PR を作成
- レビューしてからマージすること

---

## 📖 参考リンク

- **GitHub リポジトリ**: https://github.com/ShunsukeHayashi/codex-miyabi
- **npm パッケージ**: https://www.npmjs.com/package/miyabi-agent-sdk
- **EStack-Brand-Builder ドキュメント**: [AGENTS.md](./AGENTS.md)

---

## 🆘 トラブルシューティング

### Error: Unknown option
```bash
# ❌ 間違い
npx miyabi-agent-sdk --help

# ✅ 正しい
npx miyabi-agent-sdk help
```

### Error: GitHub token not found
```bash
# .env ファイルに GITHUB_TOKEN を設定
echo "GITHUB_TOKEN=ghp_xxxxx" >> .env

# または環境変数で指定
export GITHUB_TOKEN=ghp_xxxxx
```

### Error: Repository not found
```bash
# --repo オプションで明示的に指定
npx miyabi-agent-sdk analyze 42 --repo hiromima/EStack-Brand-Builder
```

---

**更新日**: 2025-10-14
**ステータス**: ✅ 動作確認済み
