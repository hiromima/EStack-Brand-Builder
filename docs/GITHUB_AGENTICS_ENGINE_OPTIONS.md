# GitHub Agentic Workflows - Engine 設定ガイド

## 概要

GitHub Agentic Workflows では、4種類の AI Engine を選択できます。

## 利用可能な Engine

### 1. GitHub Copilot（デフォルト）

**設定方法**:
```yaml
# .github/workflows/your-workflow.md
---
on:
  issues:
    types: [opened, reopened]
engine: copilot
# または
engine:
  id: copilot
  model: gpt-5
  version: latest
---
```

**必要なシークレット**:
```bash
gh secret set COPILOT_CLI_TOKEN -a actions --body "<your-copilot-cli-token>"
```

**特徴**:
- デフォルト engine（設定省略時に使用）
- GitHub 統合が最も優れている
- 最新の GPT モデルを使用

**コスト**: GitHub Copilot サブスクリプション（月額 $10）

---

### 2. Anthropic Claude Code（推奨）

**設定方法**:
```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: claude
  model: claude-3-5-sonnet-20241022
  max-turns: 5
---
```

**必要なシークレット**:
```bash
gh secret set ANTHROPIC_API_KEY -a actions --body "<your-anthropic-api-key>"
```

**特徴**:
- 高度な推論とコード分析に優れる
- 長いコンテキストウィンドウ
- 詳細な説明が可能

**コスト**:
- Claude 3.5 Sonnet: $3/M input tokens, $15/M output tokens
- 推定: 100-300円/月（軽量使用時）

---

### 3. OpenAI Codex

**設定方法**:
```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: codex
  model: gpt-4
  user-agent: custom-workflow-name
---
```

**必要なシークレット**:
```bash
gh secret set OPENAI_API_KEY -a actions --body "<your-openai-api-key>"
```

**特徴**:
- コード関連タスクに特化
- 幅広いプログラミング言語対応

**コスト**: OpenAI API 従量課金

---

### 4. Custom Engine（高度）

**設定方法**:
```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: custom
  steps:
    - name: Setup Environment
      run: |
        npm install -g some-tool
    - name: Run Custom Logic
      run: |
        node scripts/custom-logic.js
---
```

**特徴**:
- AI による自動解釈なし
- 完全なカスタマイズが可能
- 通常の GitHub Actions steps として実行

**使用例**:
- 決定論的ワークフロー
- 既存スクリプトの実行
- 外部 API の直接呼び出し

---

## Gemini API の統合方法

### ⚠️ 重要な制約

GitHub Agentic Workflows は **Gemini API をネイティブサポートしていません**。

### 統合オプション

#### オプション 1: Custom Engine + Gemini CLI（推奨）

```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: custom
  steps:
    - name: Setup Gemini CLI
      env:
        GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      run: |
        # Gemini CLI/SDK をインストール
        pip install google-generativeai

    - name: Run Gemini Analysis
      env:
        GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      run: |
        python scripts/gemini_issue_analysis.py \
          --issue-number ${{ github.event.issue.number }} \
          --repo ${{ github.repository }}
---
```

**必要な準備**:
1. `scripts/gemini_issue_analysis.py` を作成
2. Gemini API Key をシークレットに追加:
   ```bash
   gh secret set GEMINI_API_KEY -a actions --body "<your-gemini-api-key>"
   ```

**制約**:
- AI による自動プロンプト解釈が**使えない**
- すべてのロジックを自分でスクリプト化する必要がある
- GitHub Agentic Workflows の "Agentic" な機能を利用できない

#### オプション 2: Claude Engine を使用（実用的）

Gemini の代わりに Claude を使用することを推奨します：

```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: claude
  model: claude-3-5-sonnet-20241022
permissions: read-all
safe-outputs:
  add-labels:
    max: 5
  add-comment:
---

# Issue Triage

あなたは Issue トリアージアシスタントです...
（自然言語でタスクを記述）
```

**メリット**:
- 自然言語でワークフローを記述できる
- GitHub Agentic Workflows のすべての機能を使用可能
- コスト効率が良い（100-300円/月）
- Gemini と同等以上の性能

---

## コスト比較

| Engine | 初期費用 | 月額費用（推定） | 備考 |
|--------|---------|----------------|------|
| Copilot | $10/月 | $10 | サブスクリプション |
| Claude | 無料 | 100-300円 | 従量課金 |
| OpenAI | 無料 | 300-500円 | 従量課金 |
| Gemini (Custom) | 無料 | 200-300円 | 手動実装が必要 |

---

## 推奨事項

### EStack-Brand-Builder プロジェクトには **Claude Engine** を推奨

**理由**:
1. **コスト効率**: 200-300円/月（Gemini と同等）
2. **自然言語ワークフロー**: AI が自動解釈してくれる
3. **簡単な設定**: ANTHROPIC_API_KEY のみで動作
4. **高品質**: Claude 3.5 Sonnet は最新の高性能モデル

### 設定手順

#### 1. Anthropic API Key を取得

https://console.anthropic.com/ にアクセス:
1. アカウント作成
2. API Keys セクションで新しいキーを作成
3. キーをコピー

#### 2. GitHub リポジトリにシークレットを追加

```bash
gh secret set ANTHROPIC_API_KEY -a actions --body "sk-ant-..."
```

または、GitHub UI で：
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `ANTHROPIC_API_KEY`
4. Secret: `sk-ant-...`

#### 3. ワークフローを更新

```yaml
---
on:
  issues:
    types: [opened, reopened]
engine:
  id: claude
  model: claude-3-5-sonnet-20241022
permissions: read-all
safe-outputs:
  add-labels:
    max: 5
  add-comment:
---
```

#### 4. コンパイルして適用

```bash
gh aw compile
git add .github/workflows/
git commit -m "Switch to Claude engine for Agentic Workflows"
git push
```

---

## まとめ

- **Gemini API ネイティブサポート**: ❌ なし
- **Gemini を使う方法**: Custom Engine で手動実装（非推奨）
- **推奨代替案**: Claude Engine（同等コスト、より簡単）
- **次のアクション**: Claude Engine に切り替えて Phase 1 を完了

---

## 参考リンク

- [GitHub Agentic Workflows - Engines](https://githubnext.github.io/gh-aw/reference/engines/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Pricing](https://www.anthropic.com/api)
