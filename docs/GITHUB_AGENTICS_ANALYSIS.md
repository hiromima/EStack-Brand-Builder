# The Agentics: 実用的 Agentic Workflows サンプル集 - 詳細分析

**分析日**: 2025-10-16
**対象**: GitHub Next - The Agentics
**リポジトリ**: https://github.com/githubnext/agentics
**種別**: 研究デモンストレーター - サンプルワークフロー集

---

## 📋 エグゼクティブサマリー

**The Agentics** は GitHub Agentic Workflows の**実用的なサンプル集**です。GitHub Next が提供する再利用可能なワークフローファミリーで、実際のユースケースを即座に導入できます。

### 重要な位置づけ

- **位置づけ**: Agentic Workflows フレームワークの**ベストプラクティス実装集**
- **目的**: すぐに使える**テンプレート集**と実用的な**ユースケースの提示**
- **ライセンス**: オープンソース（研究デモンストレーター）

### GitHub Agentic Workflows との関係

```
┌──────────────────────────────────────────────┐
│         GitHub Agentic Workflows             │
│         (フレームワーク)                      │
│  - gh-aw CLI                                 │
│  - コンパイラ                                │
│  - Safe Outputs                               │
│  - セキュリティ機能                           │
└─────────────┬────────────────────────────────┘
              │
              │ 活用
              │
┌─────────────▼────────────────────────────────┐
│         The Agentics                         │
│         (実装サンプル集)                      │
│  - Issue Triage                              │
│  - CI Doctor                                 │
│  - Daily Test Improver                       │
│  - その他 10+ ワークフロー                    │
└──────────────────────────────────────────────┘
```

---

## 📂 利用可能なワークフロー（13種類）

### 深度分析とトリアージ系（4種類）

#### 1. 🏷️ Issue Triage

**機能**: Issue と PR を自動トリアージ
**トリガー**: `issues` (opened, reopened)
**タイムアウト**: 10分
**実験期間**: デフォルトで 30 日間

**主な機能**:
- Issue の分類（bug, feature, question）
- 適切なラベルの自動付与
- トリアージコメントの投稿
- 重複 Issue の検出（OPEN issue のみ）
- 関連情報の Web 検索

**特徴**:
- ローカル設定でカスタマイズ可能（`.github/workflows/agentics/issue-triage.config.md`）
- 最大 5 つのラベル付与
- スパム・Bot 生成 Issue を自動スキップ

**使用例**:
```bash
gh aw add githubnext/agentics/issue-triage --pr
```

**出力例**:
- コメント: 🎯 Agentic Issue Triage
- デバッグ戦略、リソースリンク、サブタスクチェックリスト
- 折りたたみセクションで整理

**権限**:
- `permissions: read-all`
- `safe-outputs: add-labels (max: 5), add-comment`

---

#### 2. 🏥 CI Doctor

**機能**: CI ワークフローの失敗を自動調査
**トリガー**: `workflow_run` (failure)
**タイムアウト**: デフォルト
**実験期間**: デフォルトで 30 日間

**監視対象** (デフォルト):
- Daily Perf Improver
- Daily Test Improver

**主な機能**:
- 失敗したワークフローの深度分析
- ワークフローログの詳細解析
- ルートコーズの特定
- 修正提案の生成
- 調査レポート Issue の作成
- パターンマッチングで再発防止

**特徴**:
- コミット、PR、履歴 Issue の分析
- エラーメッセージの Web 検索
- Cache を使用してパターン認識
- 関連 PR にコメント追加

**権限**:
- `permissions: read-all`
- `safe-outputs: create-issue, add-comment (PR)`

---

#### 3. 🔍 Repo Ask

**機能**: リポジトリの知的リサーチアシスタント
**トリガー**: `/repo-ask` コマンド
**タイムアウト**: デフォルト

**主な機能**:
- リポジトリに関する質問に回答
- コード構造の説明
- 機能の実装方法の解説
- ベストプラクティスの提案
- トラブルシューティング支援

**使用例**:
```
/repo-ask How does the authentication system work in this project?
/repo-ask What are the testing requirements for this type of change?
/repo-ask Are there similar implementations I should look at for reference?
/repo-ask Has anyone reported similar issues in the past?
/repo-ask What's the best way to test this feature locally?
```

**特徴**:
- Bash コマンド実行可能（リポジトリ分析）
- Web 検索で外部情報も収集
- Issue/PR のコンテキストを理解
- テスト実行、ビルド実行可能

**ユースケース**:
- ドキュメント調査
- コード分析
- トラブルシューティング
- ベストプラクティス取得
- 機能調査
- 依存関係分析

**権限**:
- `permissions: read-all` (+ bash 実行)
- `safe-outputs: add-comment`

---

#### 4. 🔍 Daily Accessibility Review

**機能**: アプリケーションのアクセシビリティを自動レビュー
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト

**主な機能**:
- アプリケーションを実行して使用
- WCAG 準拠のチェック
- アクセシビリティ問題の検出
- 改善提案の生成
- Q&A Discussion の作成

**特徴**:
- 実際にアプリを操作してテスト
- スクリーンリーダー対応の確認
- キーボードナビゲーションのテスト

---

### リサーチ・ステータス・計画系（3種類）

#### 5. 📚 Weekly Research

**機能**: 週次リサーチレポートの自動生成
**トリガー**: `schedule` (weekly, Monday)
**タイムアウト**: デフォルト

**主な機能**:
- リポジトリの最新動向調査
- 業界トレンドの収集
- 技術ニュースの要約
- Ideas Discussion の作成

**特徴**:
- Web 検索で外部情報収集
- GitHub API で内部動向分析
- 毎週月曜日に自動実行

**権限**:
- `permissions: read-all`
- `safe-outputs: create-discussion (ideas)`

---

#### 6. 👥 Daily Team Status

**機能**: デイリーステータスレポートの自動生成
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト

**主な機能**:
- リポジトリアクティビティの評価
- チーム活動のサマリー作成
- 進捗状況の可視化
- Announcement Discussion の作成

**特徴**:
- コミット、PR、Issue の分析
- チームメンバーの活動追跡
- デイリースタンドアップの自動化

**権限**:
- `permissions: read-all`
- `safe-outputs: create-discussion (announcements)`

---

#### 7. 📋 Daily Plan

**機能**: デイリープランの自動更新
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト

**主な機能**:
- 計画 Issue の更新
- タスクの進捗確認
- 次のアクションの提案
- チームコーディネーションの支援

**特徴**:
- Announcement Discussion で共有
- 未処理タスクの自動検出
- プロアクティブなリマインダー

**権限**:
- `permissions: read-all`
- `safe-outputs: create-discussion (announcements)`

---

### コーディング・開発系（7種類）

⚠️ **重要**: これらのワークフローは**実験的**であり、慎重な使用が必要です。

#### 8. ⚡ Daily Progress

**機能**: ロードマップに基づく自動開発
**トリガー**: `schedule` (daily, weekdays 2AM UTC)
**タイムアウト**: 30分
**実験期間**: デフォルトで 48 時間

**ワークフロー**:
1. **初回実行**: ロードマップ Research Discussion を作成
   - リポジトリの深度リサーチ
   - 既存ドキュメント、Issue、PR の分析
   - プロジェクト目標の理解
   - 機能ロードマップの作成
   - Discussion 作成後、ワークフロー終了

2. **以降の実行**:
   - Discussion から目標を選択
   - 新しいブランチで実装
   - テスト・リント実行
   - 自動コードフォーマット適用
   - Draft PR 作成
   - Discussion に進捗報告

**特徴**:
- Bash コマンド実行可能（`:*` - 全コマンド）
- 生成ファイルの除外チェック
- ビルドステップは `.github/actions/daily-progress/build-steps/action.yml` から実行

**セキュリティ注意事項**:
- ⚠️ ネットワークアクセスあり
- ⚠️ PR は慎重にレビュー必須
- ⚠️ 生成されたコードは盲目的に信頼しない

**権限**:
- `permissions: read-all` (+ bash 実行)
- `safe-outputs: create-discussion (ideas), add-comment, create-pull-request (draft)`

---

#### 9. 📦 Daily Dependency Updater

**機能**: 依存関係の自動更新
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト
**実験期間**: デフォルト

**主な機能**:
- 依存関係のチェック
- 更新の検出
- PR の自動作成
- 変更ログの追加

**特徴**:
- package.json, requirements.txt など対応
- セマンティックバージョニング考慮
- Breaking changes の警告

**権限**:
- `permissions: read-all`
- `safe-outputs: create-pull-request, create-discussion (announcements)`

---

#### 10. 📖 Regular Documentation Update

**機能**: ドキュメントの自動更新
**トリガー**: `schedule` (regular intervals)
**タイムアウト**: デフォルト

**主な機能**:
- コード変更の検出
- ドキュメントの更新
- PR の自動作成
- 不整合の修正

**特徴**:
- README, API docs など対応
- コードとドキュメントの同期維持
- 陳腐化の防止

**権限**:
- `permissions: read-all` (+ edit tool)
- `safe-outputs: create-pull-request`

---

#### 11. 🏥 PR Fix

**機能**: 失敗した CI チェックの自動修正
**トリガー**: PR の CI 失敗時
**タイムアウト**: デフォルト

**主な機能**:
- 失敗した CI チェックの分析
- 修正の実装
- コミットのプッシュ
- PR コメントで報告

**特徴**:
- テスト失敗の自動修正
- リントエラーの自動修正
- ビルドエラーの解決

**権限**:
- `permissions: read-all` (+ bash 実行)
- `safe-outputs: create-pull-request, add-comment`

---

#### 12. 🔎 Daily Adhoc QA

**機能**: アドホックな品質保証タスクの実行
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト

**主な機能**:
- 探索的テストの実行
- 品質問題の検出
- 改善提案の生成
- Q&A Discussion の作成

**特徴**:
- 自動化されていない領域のテスト
- ユーザー視点での品質チェック
- 予期しない問題の発見

**権限**:
- `permissions: read-all`
- `safe-outputs: create-discussion (q-a)`

---

#### 13. 🧪 Daily Test Coverage Improver

**機能**: テストカバレッジの自動改善
**トリガー**: `schedule` (daily, weekdays 2AM UTC)
**タイムアウト**: 30分
**実験期間**: デフォルトで 48 時間

**ワークフロー**:
1. **初回実行**:
   - テスト戦略の研究
   - Research and Plan Discussion の作成
   - カバレッジステップの推論
   - `.github/actions/daily-test-improver/coverage-steps/action.yml` の作成
   - PR 作成（設定ファイル）
   - ステップの手動実行と検証
   - ワークフロー終了

2. **以降の実行**:
   - カバレッジステップの実行
   - カバレッジレポートの読み取り
   - 低カバレッジ領域の特定
   - 新しいテストの実装
   - ビルド・実行・検証
   - カバレッジの再測定
   - 改善を確認
   - コードフォーマット・リント適用
   - Draft PR 作成

**特徴**:
- Bash コマンド実行可能（`:*` - 全コマンド）
- カバレッジツール自動検出
- エッジケースの考慮
- 意味のあるテストのみ追加
- カバレッジファイルを PR から除外

**PR の内容**:
- カバレッジ改善の Before/After（正確な数値）
- 追加したテストの説明
- 将来の改善提案
- 実行したコマンドの記録（Bash、Web 検索、Web フェッチ）
- カバレッジ測定の再現手順

**セキュリティ注意事項**:
- ⚠️ ネットワークアクセスあり
- ⚠️ PR は慎重にレビュー必須
- ⚠️ 生成されたテストコードは盲目的に信頼しない

**権限**:
- `permissions: read-all` (+ bash 実行)
- `safe-outputs: create-discussion (ideas), add-comment, create-pull-request (draft)`

---

#### 14. ⚡ Daily Performance Improver

**機能**: パフォーマンスの自動改善
**トリガー**: `schedule` (daily)
**タイムアウト**: デフォルト
**実験期間**: デフォルトで 48 時間

**主な機能**:
- ベンチマークの実行
- パフォーマンスボトルネックの分析
- 最適化の実装
- Draft PR の作成

**特徴**:
- 自動ベンチマーク
- Before/After 比較
- パフォーマンス回帰の検出

**権限**:
- `permissions: read-all` (+ bash 実行)
- `safe-outputs: create-discussion (ideas), create-pull-request (draft)`

---

## 🔧 統合のための必須設定

### 1. GitHub Discussions の有効化

**必要なカテゴリ** (`TODO.md` に記載):

| カテゴリ | Slug | 使用ワークフロー |
|---------|------|-----------------|
| **Announcements** | `announcements` | daily-plan, daily-team-status, daily-dependency-updates |
| **Ideas** | `ideas` | weekly-research, daily-test-improver, daily-progress, daily-perf-improver, daily-backlog-burner |
| **Q&A** | `q-a` | daily-qa, daily-accessibility-review |

**設定手順**:
1. Repository Settings → Features → Discussions を有効化
2. Discussions → Categories で上記 3 つのカテゴリを作成
3. **Slug は正確に一致**させる（例: `q-a` であって `qa` ではない）

---

### 2. AI Engine の設定

各ワークフローに AI エンジンの API キーが必要：

```bash
# Claude の場合
gh secret set ANTHROPIC_API_KEY

# OpenAI の場合
gh secret set OPENAI_API_KEY

# Copilot の場合（デフォルト）
# GitHub Copilot サブスクリプションが必要
```

---

### 3. GitHub Actions の権限設定

Repository Settings → Actions → General で以下を有効化：

- ✅ **Allow GitHub Actions to create and approve pull requests**
- ✅ **Always suggest updating pull request branches**（推奨）

⚠️ **重要**: GitHub Actions が作成した PR では CI が自動実行されません。PR を開いて "Update branch" をクリックするか、PR を一度閉じて再度開く必要があります。

---

## 🎯 実用的な導入順序

### Phase 1: 分析系（リスク: Low）

| ワークフロー | 導入時間 | 効果発現 | ROI |
|-------------|---------|---------|-----|
| Issue Triage | 10分 | 即座 | 高 |
| Repo Ask | 5分 | 即座 | 高 |
| CI Doctor | 15分 | 次回失敗時 | 高 |

**推奨アクション**:
```bash
# Day 1
gh aw add githubnext/agentics/issue-triage --pr
# Review PR and merge

# Day 2
gh aw add githubnext/agentics/repo-ask --pr
# Review PR and merge

# Day 3
gh aw add githubnext/agentics/ci-doctor --pr
# Review PR and merge
```

**期待効果**:
- Issue 処理時間 50% 削減
- CI 失敗のデバッグ時間 70% 削減

---

### Phase 2: レポート系（リスク: Low）

| ワークフロー | 導入時間 | 効果発現 | ROI |
|-------------|---------|---------|-----|
| Weekly Research | 20分 | 1週間後 | 中 |
| Daily Team Status | 15分 | 翌日 | 中 |
| Documentation Update | 30分 | 次回コミット時 | 中 |

**推奨アクション**:
```bash
# Week 2 - Day 1
gh aw add githubnext/agentics/weekly-research --pr

# Week 2 - Day 2
gh aw add githubnext/agentics/daily-team-status --pr

# Week 2 - Day 3
gh aw add githubnext/agentics/update-docs --pr
```

**期待効果**:
- ドキュメント陳腐化ゼロ
- 情報収集時間 80% 削減

---

### Phase 3: 開発支援系（リスク: Medium、慎重に）

| ワークフロー | 導入時間 | 効果発現 | ROI |
|-------------|---------|---------|-----|
| Daily Test Improver | 60分 | 1日後 | 中 |
| PR Fix | 20分 | 次回 CI 失敗時 | 中 |
| Daily Dependency Updater | 15分 | 翌日 | 中 |

**推奨アクション**:
```bash
# Week 3-4 - Day 1
gh aw add githubnext/agentics/daily-test-improver --pr

# 実験期間を短く設定（48h → 24h など）
# Draft PR のレビュー
# 生成されたテストの品質確認
# カバレッジの変化を測定

# Week 4 - Day 3
gh aw add githubnext/agentics/pr-fix --pr

# リントエラーなど軽微なもののみ推奨
```

**期待効果**:
- テストカバレッジ 95%+ 達成
- リントエラーゼロ維持

---

### Phase 4: 高度な開発系（リスク: High、非推奨）

| ワークフロー | 導入時間 | 効果発現 | ROI |
|-------------|---------|---------|-----|
| Daily Progress | 120分 | 1日後 | 低（リスクあり） |
| Daily Performance Improver | 90分 | 1日後 | 中（リスクあり） |

⚠️ **警告**: 必ず実験期間を 24-48 時間に制限し、Private リポジトリで最初にテスト

---

## ⚠️ セキュリティ考慮事項（コーディング系）

### リスクの高いワークフロー

- `daily-progress`
- `daily-test-improver`
- `daily-perf-improver`
- `pr-fix`

### 具体的なリスク

1. **ネットワークアクセス**
   - AI が外部コンテンツにアクセス可能
   - 悪意のある入力による外部攻撃の可能性

2. **Bash コマンド実行**
   - `bash: [ ":*" ]` で全コマンド実行可能
   - Issue/Comment の内容が攻撃ベクトルになりうる

3. **PR の自動作成**
   - 生成されたコードの盲目的な信頼は危険
   - 必ず人間がレビュー

### 推奨対策

- ✅ 実験期間を短く設定（デフォルト 48 時間 → 24 時間）
- ✅ Private リポジトリで最初にテスト
- ✅ Draft PR のみ作成（マージは人間が判断）
- ✅ CI で生成コードの品質チェック
- ✅ 定期的なログレビュー（`gh aw logs --start-date -1w`）
- ✅ `stop-after: +24h` などで実験期間を明示的に制限

---

## 📊 EStack-Brand-Builder への適用

### 即座に導入可能（優先度: High）

#### 1. Issue Triage
- **現在の課題**: CoordinatorAgent (TypeScript) の保守負担
- **メリット**: 自然言語で柔軟なトリアージロジック、保守が容易
- **期待効果**: Issue 処理時間 50% 削減

#### 2. Repo Ask
- **現在の課題**: チームメンバーがコードベースの質問をする場所がない
- **メリット**: `/ask-agent` コマンドで即座に回答、ナレッジベースとして機能
- **期待効果**: オンボーディング時間 70% 削減

#### 3. CI Doctor
- **現在の課題**: Quality Gate 失敗時に手動で原因調査が必要
- **メリット**: シリアライゼーションエラーなどの詳細分析が自動化
- **期待効果**: デバッグ時間 70% 削減

---

### 検討の価値あり（優先度: Medium）

#### 4. Weekly Research
- **活用方法**: ブランド構築のトレンド調査、競合分析の自動化
- **期待効果**: 情報収集時間 80% 削減

#### 5. Documentation Updater
- **活用方法**: Brand Principles Atlas の自動更新、`docs/` ディレクトリの同期維持
- **期待効果**: ドキュメント陳腐化ゼロ

#### 6. Daily Test Improver
- **活用方法**: 現在 94.4% のカバレッジを向上、Support Agent テストの自動追加
- **期待効果**: カバレッジ 95%+ 達成

---

### 慎重に検討（優先度: Low）

#### 7. Daily Progress
- **活用方法**: Phase 実装の自動化
- ⚠️ **高リスク** - 実験期間を 24 時間に設定

#### 8. PR Fix
- **活用方法**: CI 失敗の自動修正
- ⚠️ **リントエラーなど軽微なもののみ推奨**

---

## 🎯 完全な統合アプローチ

### Hybrid Architecture（改訂版）

```
┌───────────────────────────────────────────────────────┐
│          EStack-Brand-Builder                         │
│          Full Hybrid Architecture                     │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Core Business Logic (TypeScript)               │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Brand Construction Agents               │  │ │
│  │  │  - CopyAgent                             │  │ │
│  │  │  - VisualAgent                           │  │ │
│  │  │  - StructureAgent                        │  │ │
│  │  │  - LogoAgent                             │  │ │
│  │  │  - ExpressionAgent                       │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Support & Infrastructure (TypeScript)   │  │ │
│  │  │  - CostMonitoringAgent                   │  │ │
│  │  │  - IncidentCommanderAgent                │  │ │
│  │  │  - EvaluationAgent                       │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │  GitHub Automation (Agentic Workflows)          │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Triage & Analysis (from Agentics)       │  │ │
│  │  │  - Issue Triage Bot                      │  │ │
│  │  │  - CI Doctor                             │  │ │
│  │  │  - Repo Ask (/ask-agent)                 │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Development Support (from Agentics)     │  │ │
│  │  │  - Documentation Updater                 │  │ │
│  │  │  - Daily Test Improver                   │  │ │
│  │  │  - PR Fix                                │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Reporting & Research (from Agentics)    │  │ │
│  │  │  - Weekly Research                       │  │ │
│  │  │  - Daily Team Status                     │  │ │
│  │  │  - Daily Plan                            │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## 💡 導入コスト見積もり

### Time to Value（導入から効果まで）

| ワークフロー | 導入時間 | 効果発現 | ROI |
|-------------|---------|---------|-----|
| Issue Triage | 10分 | 即座 | 高 |
| Repo Ask | 5分 | 即座 | 高 |
| CI Doctor | 15分 | 次回失敗時 | 高 |
| Weekly Research | 20分 | 1週間後 | 中 |
| Documentation Update | 30分 | 次回コミット時 | 中 |
| Daily Test Improver | 60分 | 1日後 | 中 |
| Daily Progress | 120分 | 1日後 | 低（リスクあり） |

### コスト要素

1. **AI API コスト**
   - Claude Sonnet 4.5: $3/$15 per 1M tokens (input/output)
   - Copilot: GitHub Copilot サブスクリプション（月額 $10）
   - OpenAI GPT-5: $5/$15 per 1M tokens

2. **GitHub Actions コスト**
   - Public リポジトリ: 無料
   - Private リポジトリ: 無料枠 2,000 分/月（個人）、3,000 分/月（チーム）

3. **保守コスト**
   - ワークフローのカスタマイズ: 初回のみ
   - ログの監視: 週 30 分程度
   - PR のレビュー: 1 PR あたり 15 分程度

---

## 📈 実験計画の提案

### Week 1: 分析系ワークフロー

```bash
# Day 1
gh aw add githubnext/agentics/issue-triage --pr
# Review PR and merge

# Day 2
gh aw add githubnext/agentics/repo-ask --pr
# Review PR and merge

# Day 3
gh aw add githubnext/agentics/ci-doctor --pr
# Review PR and merge

# Day 4-5
# 実際に Issue を作成して動作確認
# /repo-ask コマンドをテスト

# Day 6-7
# ログレビュー
gh aw logs --start-date -1w
# 効果測定
```

### Week 2: レポート系ワークフロー

```bash
# Day 1
gh aw add githubnext/agentics/weekly-research --pr

# Day 2
gh aw add githubnext/agentics/daily-team-status --pr

# Week end
# Discussion のレビュー
# レポートの品質評価
```

### Week 3-4: 開発支援系（慎重に）

```bash
# Day 1
gh aw add githubnext/agentics/daily-test-improver --pr

# Day 2-7
# Draft PR のレビュー
# 生成されたテストの品質確認
# カバレッジの変化を測定

# 必要に応じて stop-after を調整
```

---

## 📊 モニタリングとメトリクス

### 測定すべき指標

1. **効率性**
   - Issue トリアージ時間の削減率
   - PR レビュー時間の削減率
   - ドキュメント更新の頻度

2. **品質**
   - 生成されたコードの品質スコア
   - PR のマージ率
   - Issue の重複検出率

3. **コスト**
   - AI API 使用量（トークン数）
   - GitHub Actions 実行時間
   - 人間の介入時間

### ダッシュボード例

```bash
# 週次レポートの生成
gh aw logs --start-date -1w --format json | jq '
{
  total_runs: length,
  by_workflow: group_by(.workflow) | map({
    name: .[0].workflow,
    count: length,
    avg_duration: (map(.duration) | add / length)
  }),
  total_tokens: map(.tokens) | add,
  estimated_cost: map(.cost) | add
}
'
```

---

## 📝 結論

### The Agentics の評価

**評価**: **High（高）**

**理由**:
1. ✅ **即導入可能** - インストールが簡単（`gh aw add`）
2. ✅ **実証済み** - GitHub Next による実装とベストプラクティス
3. ✅ **低リスク** - 分析系・レポート系は安全
4. ✅ **高 ROI** - 少ない工数で大きな効果
5. ⚠️ **コーディング系は慎重に** - 実験期間を短く、Draft PR のみ

### 最終推奨

**優先アクション**:
1. **今すぐ**: Issue Triage と Repo Ask を導入
2. **1週間後**: CI Doctor を追加
3. **2週間後**: Weekly Research と Documentation Updater
4. **1ヶ月後**: Daily Test Improver（慎重に、実験期間 24h）

### Phase 別導入計画（改訂版）

#### Phase 1: 分析・トリアージ（1-2週間）
- ✅ Issue Triage: CoordinatorAgent の補完
- ✅ Repo Ask: `/ask-agent` コマンド実装
- ✅ CI Doctor: Quality Gate 強化

**期待効果**:
- Issue 処理時間 50% 削減
- CI 失敗のデバッグ時間 70% 削減

#### Phase 2: レポート・情報収集（2-3週間）
- ✅ Weekly Research: ブランド構築トレンド調査
- ✅ Daily Team Status: 進捗可視化
- ✅ Documentation Updater: Brand Principles Atlas 自動更新

**期待効果**:
- ドキュメント陳腐化ゼロ
- 情報収集時間 80% 削減

#### Phase 3: 開発支援（4-6週間、慎重に）
- ⚠️ Daily Test Improver: カバレッジ向上（実験期間 24h）
- ⚠️ PR Fix: 軽微な修正の自動化（リントエラーのみ）

**期待効果**:
- テストカバレッジ 95%+ 達成
- リントエラーゼロ維持

---

## 🔗 関連リソース

- **The Agentics Repository**: https://github.com/githubnext/agentics
- **GitHub Agentic Workflows**: https://github.com/githubnext/gh-aw
- **Documentation**: https://githubnext.github.io/gh-aw/
- **GitHub Next Discord**: https://gh.io/next-discord (`#continuous-ai` channel)

---

**分析者**: Claude Code (Anthropic)
**レポート作成日**: 2025-10-16
**関連レポート**: [GITHUB_AGENTIC_WORKFLOWS_ANALYSIS.md](./GITHUB_AGENTIC_WORKFLOWS_ANALYSIS.md)
**次回レビュー推奨**: 2026-01-16（3ヶ月後）

May the Force be with you. 🚀
