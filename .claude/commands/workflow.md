---
description: GitHub Issue ベースのワークフローを実行します
---

# Workflow Automation

GitHub Issue に基づいて、完全自律的なワークフローを実行します。

## 使用方法

```
/workflow <issue-number>
```

## ワークフローステップ

### Step 1: Issue 分析
- Issue の内容を解析
- 必要なエージェントを特定
- タスクの依存関係を分析

### Step 2: 実行計画
- Wave 構造を設計
- 並列実行可能なタスクを判定
- リソース配分を最適化

### Step 3: エージェント実行
- Wave 単位で並列実行
- リアルタイム進捗更新
- API コスト監視

### Step 4: 品質管理
- 各成果物を評価
- 品質基準未達成時は再実行
- 統合テスト

### Step 5: PR 作成
- ブランチ作成
- 変更をコミット
- PR を自動作成
- レビュー依頼

### Step 6: ドキュメント更新
- README 更新
- ナレッジベース記録
- 実行ログ保存

## 使用例

```
/workflow 42
/workflow 15 --dry-run
/workflow 7 --no-pr
```

## オプション

- `--dry-run` - 実際の変更なしでシミュレーション
- `--no-pr` - PR を作成せずにローカルのみ
- `--force` - 品質チェックをスキップ（非推奨）

## GitHub 統合

以下のラベルが自動的に付与されます:
- `miyabi-agent` - Miyabi システムが実行
- `autonomous` - 自律実行
- `quality-verified` - 品質検証済み

## 注意事項

- GitHub トークンが必要です（環境変数 GITHUB_TOKEN）
- 予算超過時は自動停止します
- 全ての変更は追跡可能です
