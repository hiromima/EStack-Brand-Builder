# Gemini CLI GitHub Actions セットアップガイド

## 概要

EStack-Brand-Builder は **Google Gemini CLI** を使用した完全無料の AI 統合を実装しています。

### 主な利点

- ✅ **完全無料**：1 日 1,000 リクエストまで無料
- ✅ **API 課金なし**：クレジットカード不要
- ✅ **GitHub Actions 統合**：公式アクション対応
- ✅ **対話型レビュー**：`@gemini-cli` コマンドで即座に AI アシスタント

## コスト比較

| プロバイダー | 料金 | 無料枠 |
|------------|------|--------|
| Anthropic Claude Sonnet 4 | $3/$15 per 1M tokens | 限定的 |
| OpenAI GPT-4 | $0.03/$0.06 per 1K tokens | $5 クレジット |
| **Google Gemini** | **完全無料** | **60/min, 1,000/day** |

## セットアップ手順

### 1. Gemini API キーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Google アカウントでログイン
3. "Create API Key" をクリック
4. API キーをコピー（クレジットカード不要）

### 2. GitHub Secrets の設定

```bash
# リポジトリの Settings > Secrets and variables > Actions に移動
# New repository secret をクリック

Name: GEMINI_API_KEY
Secret: <your-gemini-api-key>
```

### 3. ローカル開発環境のセットアップ（オプション）

```bash
# Gemini CLI のインストール
npm install -g @google/generative-ai-cli

# GitHub セットアップ
gemini /setup-github

# 動作確認
gemini "Hello, what can you do?"
```

## 使用方法

### 自動 PR レビュー

PR を作成すると、自動的に Gemini AI がコードレビューを実行します。

```yaml
# .github/workflows/gemini-pr-review.yml が自動実行
on:
  pull_request:
    types: [opened, synchronize]
```

### 対話型 AI アシスタント

PR や Issue のコメントで `@gemini-cli` を使用して、AI に質問できます。

```markdown
# 使用例

@gemini-cli explain this code change

@gemini-cli suggest improvements for performance

@gemini-cli check for security vulnerabilities

@gemini-cli review the architecture of this module

@gemini-cli what are the potential edge cases?
```

### Quality Gate での活用

Quality Gate ワークフローで Gemini が自動的に品質分析を実行します。

```yaml
# .github/workflows/quality-gate.yml
- name: Gemini Quality Analysis
  uses: google-github-actions/run-gemini-cli@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## ワークフロー一覧

### 1. gemini-pr-review.yml
- **トリガー**：PR 作成・更新時、`@gemini-cli` コメント時
- **機能**：
  - 自動コードレビュー
  - BaseAgent コンプライアンスチェック
  - セキュリティ脆弱性検出
  - アーキテクチャ評価
  - 対話型 AI アシスタント

### 2. quality-gate.yml（Gemini 統合版）
- **トリガー**：PR 作成・更新、main ブランチへのプッシュ
- **機能**：
  - Lint チェック
  - テスト実行（TEST_MODE で API 課金なし）
  - 品質スコア計算
  - Gemini による品質分析
  - 自動承認（スコア ≥90）

### 3. quality-check.yml
- **トリガー**：PR 作成時、手動実行
- **機能**：
  - 品質スコアリングテスト
  - TEST_MODE でモック実行
  - Gemini による結果分析

## TEST_MODE による課金防止

すべてのテストは `TEST_MODE=true` で実行され、外部 API 呼び出しをスキップします。

```bash
# 環境変数の設定
TEST_MODE=true node scripts/test_quality_control_agent.js

# GitHub Actions でも自動設定
env:
  TEST_MODE: "true"
```

### TEST_MODE の動作

- ✅ モックデータでテスト実行
- ✅ API 課金ゼロ
- ✅ 高速実行
- ✅ 100% オフライン対応

## 無料枠の管理

### 制限
- **リクエスト数**：60 リクエスト/分、1,000 リクエスト/日
- **トークン制限**：なし（Gemini Flash は無制限）

### 制限超過時の対応

制限に達した場合、GitHub Actions は自動的にスキップし、エラーにはなりません。

```yaml
continue-on-error: true
```

## トラブルシューティング

### API キーが無効

```bash
# GitHub Secrets を確認
gh secret list

# API キーの再生成
# Google AI Studio で新しいキーを生成
```

### ワークフローが実行されない

```bash
# ワークフローファイルの構文チェック
yamllint .github/workflows/gemini-pr-review.yml

# 権限の確認
# Settings > Actions > General > Workflow permissions
# "Read and write permissions" を有効化
```

### Gemini CLI がインストールされない

```bash
# GitHub Actions のログを確認
# run-gemini-cli@v1 は自動的に CLI をインストール

# ローカルで確認する場合
npm list -g @google/generative-ai-cli
```

## ベストプラクティス

### 1. API キーの管理
- ✅ GitHub Secrets に保存
- ✅ `.env` ファイルには書かない
- ✅ コミットしない

### 2. 無料枠の最適化
- ✅ TEST_MODE を活用
- ✅ 必要な時だけ Gemini を呼び出す
- ✅ キャッシュを活用

### 3. セキュリティ
- ✅ プライベートリポジトリでも安全
- ✅ API キーは暗号化保存
- ✅ Workload Identity Federation（推奨）

## 参考リンク

- [Google Gemini CLI 公式ドキュメント](https://github.com/google-github-actions/run-gemini-cli)
- [Google AI Studio](https://makersuite.google.com/)
- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Gemini API 無料枠の詳細](https://ai.google.dev/pricing)

## サポート

問題が発生した場合：

1. GitHub Issues に報告
2. Gemini CLI のログを確認
3. `@gemini-cli help` で使用方法を確認

---

**💡 Tip**: すべての AI 機能が完全無料で利用できます。API 課金の心配なく、積極的に活用してください。
