---
description: 特定のエージェントを直接実行します（Brand Strategist, Creative Concept, Copywriter）
---

# Agent Direct Execution

特定のエージェントを直接実行して、専門的なタスクを処理します。

## 使用方法

```
/agent <agent-name> <task-description>
```

## 利用可能なエージェント

### brand_strategist
ブランド戦略の専門家

使用例:
```
/agent brand_strategist クリエイター向け電動自転車のペルソナを 5 パターン作成
/agent brand_strategist ブランド哲学を策定してください
```

### creative_concept
クリエイティブコンセプトの専門家

使用例:
```
/agent creative_concept ムードボードのコンセプトを作成
/agent creative_concept ビジュアルモチーフを 10 個提案
```

### copywriter
コピーライティングの専門家

使用例:
```
/agent copywriter ブランドボイスとトーン＆マナーを定義
/agent copywriter スローガンを 20 個作成
```

## 実行プロセス

1. エージェントの専門性を確認
2. タスクに適したモデルを選択
3. 高品質な成果物を生成
4. 品質評価を実行
5. 結果をマークダウン形式で出力

## 注意事項

- 複数エージェントが必要な場合は `/miyabi` を使用してください
- 品質スコア 80 点未満の場合は自動的に再実行されます
