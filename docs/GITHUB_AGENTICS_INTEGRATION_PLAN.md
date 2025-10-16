# GitHub Agentics 導入計画 - EStack-Brand-Builder との並行開発戦略

**計画作成日**: 2025-10-16
**対象プロジェクト**: EStack-Brand-Builder
**導入対象**: GitHub Next - The Agentics
**戦略**: Hybrid Parallel Development（ハイブリッド並行開発）

---

## 📋 エグゼクティブサマリー

### 計画の目的

**EStack-Brand-Builder の完成を進めながら、GitHub Agentics を段階的に導入し、開発効率を 50%+ 向上させる**

### 並行開発の理由

1. **開発効率の即座向上**: Issue Triage、CI Doctor で開発作業を支援
2. **ドキュメント同期**: Documentation Updater で陳腐化を防止
3. **品質向上**: Daily Test Improver でカバレッジ向上
4. **リスク分散**: Core Agents 実装中に自動化ワークフローを確立

### 期待される効果

- **Issue 処理時間**: 50% 削減
- **CI デバッグ時間**: 70% 削減
- **ドキュメント陳腐化**: ゼロ化
- **テストカバレッジ**: 84.5% → 95%+
- **開発速度**: 全体で 50% 向上

---

## 🎯 全体戦略: Two-Track Development

```
┌────────────────────────────────────────────────────────────┐
│                Two-Track Development Strategy              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Track 1: EStack Core Development                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Week 1-2  │ CopyAgent, VisualAgent 実装            │  │
│  │ Week 3-4  │ StructureAgent, LogoAgent 実装         │  │
│  │ Week 5-6  │ ExpressionAgent, EvaluationAgent       │  │
│  │ Week 7    │ DocumentationAgent, E2E テスト         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Track 2: GitHub Agentics Integration                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Week 1    │ Phase 1: 分析系（Triage, Ask, Doctor）│  │
│  │ Week 2    │ Phase 2: レポート系（Research, Status）│  │
│  │ Week 3-4  │ Phase 3: 開発支援系（Docs, Tests）    │  │
│  │ Week 5-7  │ Phase 4: 最適化とモニタリング         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Synergy Effects:                                          │
│  - Track 2 が Track 1 を加速                               │
│  - ドキュメント自動更新で Track 1 の保守負担軽減           │
│  - CI Doctor が Track 1 のデバッグを支援                   │
│  - Issue Triage が Track 1 のタスク管理を自動化            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 📅 詳細タイムライン: 7週間計画

### Week 1: Kickoff & Phase 1（分析系導入）

#### Day 1: 月曜日 - 準備とキックオフ

**午前**:
```bash
# 1. GitHub Discussions の有効化（15分）
# Repository Settings → Features → Discussions

# 2. Discussion カテゴリの作成（10分）
# - Announcements (slug: announcements)
# - Ideas (slug: ideas)
# - Q&A (slug: q-a)

# 3. gh-aw CLI のインストール（5分）
gh extension install githubnext/gh-aw
gh aw --version
```

**午後**:
```bash
# 4. Issue Triage Bot 導入（30分）
gh aw add githubnext/agentics/issue-triage --pr
# PR レビュー、マージ

# 5. テスト Issue 作成（15分）
gh issue create --title "Test: Agentic Issue Triage" \
  --body "This is a test issue to verify the Issue Triage Bot."
```

**並行作業（Track 1）**:
- CopyAgent 設計開始
- C0-C6 チェーンアーキテクチャ設計

---

#### Day 2: 火曜日 - Repo Ask 導入

**午前**:
```bash
# 1. Repo Ask 導入（20分）
gh aw add githubnext/agentics/repo-ask --pr
# PR レビュー、マージ

# 2. Repo Ask テスト（15分）
# Issue や PR のコメントで：
# /repo-ask How does the CopyAgent chain work?
# /repo-ask What is the Brand Principles Atlas?
```

**午後**:
- CopyAgent 実装開始（InfoGatheringAgent 統合）

---

#### Day 3: 水曜日 - CI Doctor 導入

**午前**:
```bash
# 1. CI Doctor 導入（30分）
gh aw add githubnext/agentics/ci-doctor --pr
# PR レビュー、マージ

# 2. CI Doctor 設定（15分）
# .github/workflows/ci-doctor.lock.yml を編集
# 監視対象に quality-gate.yml を追加
```

**午後**:
- CopyAgent 実装継続

---

#### Day 4-5: 木・金曜日 - 効果測定と調整

**タスク**:
1. **ログレビュー**（30分）
   ```bash
   gh aw logs --start-date -1w
   ```

2. **効果測定**（30分）
   - Issue Triage の精度確認
   - Repo Ask の回答品質確認
   - CI Doctor の分析レポート確認

3. **調整**（1時間）
   - `.github/workflows/agentics/issue-triage.config.md` でカスタマイズ
   - ラベリングロジックの調整

**並行作業（Track 1）**:
- CopyAgent 実装継続
- StructuringAgent (C1) 統合

---

### Week 2: Phase 2（レポート系導入）

#### Day 1: 月曜日 - Weekly Research

**午前**:
```bash
# 1. Weekly Research 導入（30分）
gh aw add githubnext/agentics/weekly-research --pr
# PR レビュー、マージ

# 2. 初回実行をトリガー（schedule 待たずに手動実行）
gh workflow run "Weekly Research"
```

**午後**:
- VisualAgent 設計開始

---

#### Day 2: 火曜日 - Daily Team Status

**午前**:
```bash
# 1. Daily Team Status 導入（20分）
gh aw add githubnext/agentics/daily-team-status --pr
# PR レビュー、マージ
```

**午後**:
- VisualAgent 実装開始

---

#### Day 3: 水曜日 - Documentation Updater

**午前**:
```bash
# 1. Documentation Updater 導入（45分）
gh aw add githubnext/agentics/update-docs --pr
# PR レビュー、マージ

# 2. 設定のカスタマイズ（30分）
# .github/workflows/agentics/update-docs.config.md
# ターゲットディレクトリを docs/ に設定
# Brand Principles Atlas の自動更新を含める
```

**午後**:
- VisualAgent 実装継続

---

#### Day 4-5: 木・金曜日 - レポート品質評価

**タスク**:
1. **Discussion のレビュー**（1時間）
   - Weekly Research の内容確認
   - Daily Team Status の精度確認

2. **ドキュメント更新の検証**（30分）
   - Documentation Updater が作成した PR のレビュー
   - 更新内容の品質確認

**並行作業（Track 1）**:
- VisualAgent 実装継続
- StructureAgent 設計開始

---

### Week 3-4: Phase 3（開発支援系導入、慎重に）

#### Week 3 Day 1: 月曜日 - Daily Test Improver 準備

**午前**:
```bash
# 1. Daily Test Improver 導入（1時間）
gh aw add githubnext/agentics/daily-test-improver --pr
# PR レビュー、マージ

# 2. 実験期間の調整（15分）
# .github/workflows/daily-test-improver.lock.yml
# stop-after: +48h → +24h に変更
```

**午後**:
- StructureAgent 実装開始

---

#### Week 3 Day 2-5: 火-金曜日 - Test Improver 監視

**タスク**:
1. **初回実行の監視**（毎日 30分）
   - Coverage steps の生成を確認
   - 生成された action.yml のレビュー
   - PR の作成を待つ

2. **Draft PR のレビュー**（生成されたら 1時間）
   - 生成されたテストコードの品質確認
   - カバレッジ向上の確認
   - 必要に応じて手動調整

**並行作業（Track 1）**:
- StructureAgent 実装継続
- LogoAgent 設計開始

---

#### Week 4: Daily Test Improver 評価とチューニング

**タスク**:
1. **効果測定**（2時間）
   - カバレッジの変化を測定（84.5% → ?%）
   - 生成されたテストの品質評価
   - コスト分析（AI API 使用量）

2. **チューニング**（1時間）
   - `.github/workflows/agentics/daily-test-improver.config.md` でカスタマイズ
   - 優先度の高いテスト領域を指定
   - カバレッジ目標を 95% に設定

3. **継続判断**（30分）
   - 効果が高い → 実験期間を延長（+1 week）
   - 効果が低い → 一時停止、手動調整

**並行作業（Track 1）**:
- LogoAgent 実装開始
- ExpressionAgent 設計開始

---

### Week 5-6: Phase 4（最適化とモニタリング）

#### Week 5: PR Fix 導入（オプション）

**条件**: Daily Test Improver が成功した場合のみ

**午前**:
```bash
# 1. PR Fix 導入（30分）
gh aw add githubnext/agentics/pr-fix --pr
# PR レビュー、マージ

# 2. 設定のカスタマイズ（15分）
# リントエラーのみ自動修正
# テスト失敗は手動修正
```

**並行作業（Track 1）**:
- ExpressionAgent 実装開始
- EvaluationAgent 設計開始

---

#### Week 5-6: モニタリングダッシュボード構築

**タスク**:
1. **メトリクス収集スクリプト作成**（3時間）
   ```bash
   # scripts/agentics_metrics.sh
   gh aw logs --start-date -1w --format json > /tmp/aw_logs.json

   # 以下を計算：
   # - 週次実行回数
   # - AI API トークン使用量
   # - 生成された Issue/PR/Comment 数
   # - 平均実行時間
   ```

2. **週次レポート自動生成**（2時間）
   ```javascript
   // scripts/generate_agentics_report.js
   // 週次で以下をレポート：
   // - 効率化効果（時間削減）
   // - コスト分析
   // - 品質メトリクス
   // - 推奨アクション
   ```

**並行作業（Track 1）**:
- EvaluationAgent 実装開始
- DocumentationAgent 設計開始

---

### Week 7: 統合と最終評価

#### Day 1-3: 月-水曜日 - 完全統合テスト

**タスク**:
1. **全ワークフローの統合確認**（1日）
   - 全 Agentic Workflows が正常動作
   - 相互干渉がないことを確認
   - コスト合計が予算内

2. **E2E シナリオテスト**（1日）
   - Issue 作成 → Triage → Agent 実装 → PR 作成 → Review → マージ
   - Documentation Updater が自動更新
   - Test Improver がカバレッジ向上

3. **最終レポート作成**（半日）
   - 導入前後の比較
   - ROI 計算
   - 次のステップ提案

**並行作業（Track 1）**:
- DocumentationAgent 実装継続
- E2E テスト準備

---

#### Day 4-5: 木-金曜日 - 最適化と文書化

**タスク**:
1. **パフォーマンス最適化**（1日）
   - 不要なワークフローの停止
   - トリガー頻度の調整
   - timeout_minutes の最適化

2. **運用ドキュメント作成**（半日）
   - `docs/AGENTICS_OPERATIONS.md`
   - 日常運用手順
   - トラブルシューティング
   - モニタリング方法

**並行作業（Track 1）**:
- DocumentationAgent 実装完了
- 全 Core Agents の統合テスト

---

## 💰 コスト管理計画

### 月額予算配分

**EStack-Brand-Builder 全体予算**: $100/月

| 項目 | 予算 | 備考 |
|------|------|------|
| **既存 Core Agents** | $60/月 | CopyAgent, VisualAgent など |
| **GitHub Agentics** | $30/月 | Issue Triage, CI Doctor, Test Improver など |
| **予備費** | $10/月 | 予期しない使用量増加 |

### GitHub Agentics 内訳

| ワークフロー | 実行頻度 | 推定コスト/月 |
|------------|---------|-------------|
| Issue Triage | Issue 作成時（~20回/月） | $5 |
| Repo Ask | 手動実行（~30回/月） | $3 |
| CI Doctor | CI 失敗時（~10回/月） | $2 |
| Weekly Research | 週次（4回/月） | $8 |
| Daily Team Status | 日次（30回/月） | $5 |
| Documentation Updater | コミット時（~20回/月） | $4 |
| Daily Test Improver | 日次（実験期間のみ） | $3 |
| **合計** | | **$30/月** |

### コスト監視

**既存の CostMonitoringAgent との統合**:

```javascript
// src/agents/support/CostMonitoringAgent.js に追加

async recordAgenticUsage() {
  // gh aw logs から使用量を取得
  const logs = await this.fetchAgenticLogs();

  // トークン使用量を推定
  const estimatedCost = logs.reduce((sum, log) => {
    return sum + this.estimateAgenticCost(log);
  }, 0);

  // 既存のコストログに追加
  await this.recordUsage({
    service: 'github-agentics',
    tokens: { input: logs.totalInputTokens, output: logs.totalOutputTokens },
    estimated_cost: estimatedCost,
    metadata: { workflow_count: logs.length }
  });
}
```

**アラート設定**:
- GitHub Agentics が月額 $30 を超えたら警告
- 週次で使用量レポート
- 予算の 90% に達したら一部ワークフローを停止

---

## 📊 効果測定計画

### KPI（Key Performance Indicators）

#### 1. 効率性メトリクス

**Before（Week 0）**:
- Issue トリアージ時間: 平均 15分/Issue
- CI デバッグ時間: 平均 30分/失敗
- ドキュメント更新頻度: 月 2回（手動）
- テストカバレッジ: 84.5%

**Target（Week 7）**:
- Issue トリアージ時間: 平均 7分/Issue（50% 削減）
- CI デバッグ時間: 平均 9分/失敗（70% 削減）
- ドキュメント更新頻度: 週 3回（自動）
- テストカバレッジ: 95%+

#### 2. 品質メトリクス

| メトリクス | Before | Target | 測定方法 |
|----------|--------|--------|---------|
| Issue の重複率 | 15% | 5% | Issue Triage の検出率 |
| PR のマージ率 | 85% | 90% | GitHub API |
| ドキュメントの陳腐化 | 月 30% | 0% | 最終更新日の追跡 |
| Quality Gate Score | 96/100 | 98/100 | quality-gate.yml |

#### 3. コストメトリクス

| メトリクス | Target | 測定方法 |
|----------|--------|---------|
| AI API コスト | $30/月以下 | CostMonitoringAgent |
| GitHub Actions 実行時間 | 500分/月以下 | GitHub Actions 使用量 |
| ROI（投資対効果） | 3x以上 | (節約時間 × 時給) / コスト |

---

### 測定スケジュール

**Week 1**:
- ベースライン測定（Before データ収集）
- 初期効果の確認

**Week 2-4**:
- 週次測定
- トレンド分析
- 中間調整

**Week 5-7**:
- 週次測定
- 最終評価準備
- ROI 計算

**Week 7 End**:
- 最終レポート作成
- Before/After 比較
- 継続判断

---

## 🚨 リスク管理計画

### 高リスク項目

#### Risk 1: コスト暴走

**リスク**: Daily Test Improver が過剰にトークンを消費

**対策**:
- ✅ 実験期間を 24 時間に制限
- ✅ `timeout_minutes: 30` で実行時間制限
- ✅ `max-turns: 5` でループ制限
- ✅ CostMonitoringAgent で毎時監視

**緊急対応**:
```bash
# 即座にワークフローを停止
gh workflow disable "Daily Test Coverage Improver"

# ログを確認
gh aw logs daily-test-improver --start-date -1d

# 設定を調整して再開
```

---

#### Risk 2: 生成コードの品質問題

**リスク**: Daily Test Improver が低品質なテストを生成

**対策**:
- ✅ Draft PR のみ作成（自動マージしない）
- ✅ 人間が必ずレビュー
- ✅ Quality Gate で自動品質チェック
- ✅ コードレビューガイドライン明確化

**緊急対応**:
```bash
# PR をクローズ
gh pr close <PR番号>

# ワークフローを一時停止
gh workflow disable "Daily Test Coverage Improver"

# Discussion にフィードバック
# → AI が次回改善
```

---

#### Risk 3: セキュリティ問題

**リスク**: Bash コマンド実行系ワークフローで脆弱性

**対策**:
- ✅ Private リポジトリで最初に実験
- ✅ `network: defaults` で外部アクセス制限
- ✅ AuditAgent で定期的なセキュリティスキャン
- ✅ GitHub Advanced Security 有効化

**緊急対応**:
```bash
# 全ワークフローを即座に停止
gh workflow disable --all

# ログを確認
gh aw logs --start-date -1w

# セキュリティレビュー実施後に再開
```

---

#### Risk 4: Track 1 と Track 2 の競合

**リスク**: Core Agents 実装と Agentics 導入が相互に干渉

**対策**:
- ✅ 明確な優先順位: Track 1 > Track 2
- ✅ Track 2 は Track 1 を支援する位置づけ
- ✅ 週次同期ミーティング（15分）
- ✅ 競合時は Track 2 を一時停止

**判断基準**:
```
IF Track 1 の進捗が遅れている THEN
  Track 2 の新規ワークフロー導入を延期
  既存ワークフローのみ継続
ELSE
  計画通り進行
END IF
```

---

## 📚 運用ドキュメント

### 日常運用タスク

#### 毎日（5分）

```bash
# 1. ログの確認
gh aw logs --start-date -1d

# 2. 異常の検知
# - エラー率が 20% 以上
# - 実行時間が平均の 2 倍以上
# - コストが予算の 10% 以上/日

# 3. Draft PR のレビュー
gh pr list --label "agentic-workflow" --state open
```

---

#### 週次（30分）

```bash
# 1. 効果測定レポート生成
npm run agentics:report

# 2. コスト分析
npm run agentics:cost

# 3. Discussion のレビュー
# - Weekly Research の内容確認
# - Daily Plan の精度確認

# 4. 調整判断
# - トリガー頻度の調整
# - timeout の調整
# - 実験期間の延長/短縮
```

---

#### 月次（2時間）

```bash
# 1. 月次レポート作成
# - Before/After 比較
# - ROI 計算
# - 改善提案

# 2. ワークフローの最適化
# - 不要なワークフローの停止
# - 新規ワークフローの追加検討

# 3. コスト精算
# - 実際のコスト確認
# - 予算との比較
# - 次月の予算調整
```

---

### トラブルシューティング

#### Issue 1: ワークフローが実行されない

**症状**: Issue 作成しても Issue Triage が動作しない

**確認事項**:
1. ワークフローが有効か？
   ```bash
   gh workflow list
   ```
2. トリガー条件を満たしているか？
   - `stop-after` が過ぎていないか
   - `on:` の条件に合致しているか

**解決方法**:
```bash
# 手動実行
gh workflow run "Issue Triage"

# ログ確認
gh run list --workflow="Issue Triage"
gh run view <RUN_ID>
```

---

#### Issue 2: AI が期待通りの動作をしない

**症状**: Issue Triage のラベリングが不正確

**解決方法**:
1. **ローカル設定でカスタマイズ**
   ```bash
   # .github/workflows/agentics/issue-triage.config.md を編集
   # ラベリングロジックを明確化
   # 例を追加
   ```

2. **Discussion でフィードバック**
   - ワークフローが作成した Discussion にコメント
   - AI が次回実行時に改善

3. **再コンパイル**
   ```bash
   gh aw compile issue-triage
   git add .github/workflows/
   git commit -m "Update Issue Triage configuration"
   git push
   ```

---

#### Issue 3: コストが予算を超過

**症状**: CostMonitoringAgent が警告を発生

**即座の対応**:
```bash
# 1. 高コストワークフローを特定
gh aw logs --start-date -1w --format json | \
  jq '.[] | {workflow: .workflow, cost: .estimated_cost}' | \
  sort -k2 -rn | head -5

# 2. 高コストワークフローを停止
gh workflow disable "<WORKFLOW_NAME>"

# 3. 原因分析
# - max-turns が高すぎるか？
# - timeout が長すぎるか？
# - トリガー頻度が高すぎるか？

# 4. 設定調整後に再開
```

---

## 🎯 成功基準

### Week 7 終了時点での判断基準

#### 継続（Continue）条件

以下を**全て**満たす場合、本番運用に移行：

- ✅ Issue トリアージ時間 40% 以上削減
- ✅ CI デバッグ時間 60% 以上削減
- ✅ ドキュメント陳腐化ゼロ化
- ✅ テストカバレッジ 90% 以上
- ✅ コスト予算内（$30/月以下）
- ✅ Quality Gate Score 維持（90+）
- ✅ セキュリティインシデントゼロ

---

#### 調整（Adjust）条件

以下を**いずれか**満たす場合、設定調整して継続：

- ⚠️ Issue トリアージ時間 20-40% 削減
- ⚠️ CI デバッグ時間 30-60% 削減
- ⚠️ コスト $30-40/月
- ⚠️ 品質問題が散発的に発生

**調整内容**:
- トリガー頻度の最適化
- timeout の調整
- ローカル設定のカスタマイズ
- 低効果ワークフローの停止

---

#### 中止（Stop）条件

以下を**いずれか**満たす場合、導入を中止：

- ❌ 効率化効果 20% 未満
- ❌ コスト $50/月以上
- ❌ 重大なセキュリティインシデント発生
- ❌ Quality Gate Score が 80 未満に低下
- ❌ Core Agents 実装が 2 週間以上遅延

**中止時の対応**:
1. 全 Agentic Workflows を停止
2. 原因分析レポート作成
3. 代替案の検討
4. Core Agents 実装に注力

---

## 📋 チェックリスト

### Week 1 開始前

- [ ] GitHub Discussions 有効化
- [ ] Discussion カテゴリ作成（3つ）
- [ ] gh-aw CLI インストール
- [ ] API キー設定（Claude または Copilot）
- [ ] CostMonitoringAgent の予算設定更新（$30 追加）
- [ ] ベースライン測定の準備

### Week 1 終了時

- [ ] Issue Triage Bot 動作確認
- [ ] Repo Ask 動作確認
- [ ] CI Doctor 動作確認
- [ ] 初期効果の測定完了
- [ ] Week 2 の準備完了

### Week 2 終了時

- [ ] Weekly Research 動作確認
- [ ] Daily Team Status 動作確認
- [ ] Documentation Updater 動作確認
- [ ] レポート品質評価完了
- [ ] Week 3-4 の準備完了（Daily Test Improver）

### Week 4 終了時

- [ ] Daily Test Improver 効果測定完了
- [ ] カバレッジ向上確認（目標 90%+）
- [ ] コスト分析完了（目標 $30/月以下）
- [ ] 継続判断完了

### Week 7 終了時

- [ ] 全ワークフロー統合確認
- [ ] E2E シナリオテスト完了
- [ ] 最終レポート作成完了
- [ ] 運用ドキュメント完成
- [ ] 成功基準による最終判断完了

---

## 📝 結論

### ハイブリッド並行開発の利点

1. **即座の効率化**: Week 1 から開発作業を支援
2. **リスク分散**: Core Agents 実装に集中しながら自動化も確立
3. **継続的改善**: ワークフローが Core Agents の品質を向上
4. **知見の蓄積**: GitHub Agentics の経験を Core Agents 設計に活用

### 推奨アクション

**今すぐ開始**:
1. GitHub Discussions の有効化
2. gh-aw CLI のインストール
3. Week 1 Day 1 のタスクを開始

**並行して継続**:
- Track 1: Core Agents 実装（メイン）
- Track 2: GitHub Agentics 導入（支援）

### 期待される最終成果

**7週間後**:
- ✅ EStack-Brand-Builder: Core Agents 実装完了
- ✅ GitHub Agentics: 6-8 ワークフロー稼働
- ✅ 開発効率: 50% 向上
- ✅ テストカバレッジ: 95%+
- ✅ ドキュメント: 完全同期
- ✅ 運用: 完全自動化

---

**計画作成者**: Claude Code (Anthropic)
**計画作成日**: 2025-10-16
**想定期間**: 7 週間
**総予算**: $30/月（GitHub Agentics）

**関連ドキュメント**:
- [GITHUB_AGENTICS_ANALYSIS.md](./GITHUB_AGENTICS_ANALYSIS.md)
- [GITHUB_AGENTIC_WORKFLOWS_ANALYSIS.md](./GITHUB_AGENTIC_WORKFLOWS_ANALYSIS.md)

**次のステップ**: Week 1 Day 1 の実行を開始

May the Force be with you. 🚀
