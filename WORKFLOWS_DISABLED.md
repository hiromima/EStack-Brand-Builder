# GitHub Actions ワークフロー無効化について

## 状況

**日時**: 2025-10-15
**理由**: GitHub Actions の課金制限エラー

## エラー内容

```
The job was not started because recent account payments have failed
or your spending limit needs to be increased.
```

## 対応

すべてのワークフローを一時的に無効化しました。

### 無効化したワークフロー

- `agent-onboarding.yml` - エージェント自動登録
- `economic-circuit-breaker.yml` - コスト監視
- `gemini-pr-review.yml` - Gemini AI レビュー
- `incident-response.yml` - インシデント対応
- `quality-check.yml` - 品質チェック
- `quality-gate.yml` - 品質ゲート

### 場所

ワークフローは以下に移動されました：
```
.github/workflows-disabled/
```

## 再有効化方法

GitHub Actions の課金設定を確認・修正後：

```bash
# ワークフローを再有効化
mv .github/workflows-disabled/*.yml .github/workflows/

# コミット＆プッシュ
git add .github/workflows/
git commit -m "Re-enable GitHub Actions workflows"
git push origin main
```

## 課金設定確認

1. GitHub リポジトリ Settings
2. Billing & plans
3. Spending limits の確認
4. Payment method の確認

## 代替テスト方法

GitHub Actions なしでもすべての機能はローカルでテスト可能です：

```bash
# Gemini API テスト
GEMINI_API_KEY=your_key node scripts/test_gemini_api.js

# エージェントテスト（TEST_MODE）
TEST_MODE=true node scripts/test_quality_control_agent.js
TEST_MODE=true node scripts/test_documentation_agent.js
TEST_MODE=true node scripts/test_technical_agent.js

# E2E テスト
TEST_MODE=true node scripts/e2e_workflow_test.js

# 本番環境チェック
node scripts/production_check.js
```

## 注意事項

- **ローカルテストは完全無料**: すべてのテストは TEST_MODE で実行可能
- **Gemini API は無料**: ローカルからの直接呼び出しは無料枠内
- **GitHub Actions は不要**: 開発・テストには影響なし

## 影響範囲

### 影響あり
- ❌ PR 作成時の自動レビュー
- ❌ Issue コメントへの自動応答
- ❌ 自動品質チェック
- ❌ 自動コスト監視

### 影響なし
- ✅ ローカル開発
- ✅ 手動テスト実行
- ✅ Gemini API（ローカル）
- ✅ すべてのエージェント機能
- ✅ 本番デプロイメント

## まとめ

GitHub Actions は便利機能ですが、必須ではありません。すべての機能はローカルで完全にテスト・実行可能です。

課金設定を修正するまで、ローカルテストで開発を継続できます。
