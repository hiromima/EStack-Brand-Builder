# EStack-Brand-Builder System Architecture v1.0

---

## 0. システム概要

EStack-Brand-Builder は、**E:Stack Method™** と **Brand Framer Method™** を完全自律型 AI エージェントシステムとして実装したブランド構築プラットフォームです。

### 設計原則

- **構造主義的アプローチ** — 感性を構造化し再現可能に
- **完全自律運用** — AGENTS.md の憲法に基づく自己修復・自己進化
- **GitHub エコシステム統合** — Issue ドリブンの開発・評価・デプロイ
- **多層評価システム** — ToT (Tree of Thoughts) による意思決定

---

## 1. システムアーキテクチャ

### 1-1. レイヤー構成

```
┌─────────────────────────────────────────┐
│  User Interface Layer                   │
│  - Issue/PR Interface                   │
│  - CLI Tools (miyabi)                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Orchestration Layer                    │
│  - CoordinatorAgent                     │
│  - TaskRouter                           │
│  - WorkflowEngine                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Agent Layer (6 Core Agents)            │
│  - StructureAgent                       │
│  - ExpressionAgent                      │
│  - EvaluationAgent                      │
│  - CopyAgent                            │
│  - LogoAgent                            │
│  - VisualAgent                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Protocol Layer                         │
│  - RSI Protocol (構造推論)              │
│  - IAF Engine (ロゴ設計)                │
│  - ToT Protocol (評価・意思決定)        │
│  - STP Protocol (構造転送)              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Knowledge Layer                        │
│  - Brand Principles Atlas               │
│  - E:Stack Method Guide                 │
│  - Strategic Frameworks                 │
│  - Vector Database (過去事例)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Infrastructure Layer                   │
│  - GitHub Actions                       │
│  - Cost Monitoring                      │
│  - Audit Logging                        │
│  - Self-Healing System                  │
└─────────────────────────────────────────┘
```

---

## 2. エージェント定義

### 2-1. コアエージェント (6 Agents)

#### StructureAgent
- **役割**: ブランドの意味・構造分析、E:Stack 三層マッピング
- **入力**: ヒアリング情報、ビジネス要件
- **出力**: E:Stack 構造 (Foundation/Structure/Expression)
- **プロトコル**: RSI Protocol、EStack Method Guide v5.1

#### ExpressionAgent
- **役割**: アウトプット表現案生成、クリエイティブ分岐
- **入力**: E:Stack 構造、ブランドコンテキスト
- **出力**: 複数の表現案（コピー、ビジュアルコンセプト）
- **プロトコル**: Expression Model、White Space Design

#### EvaluationAgent
- **役割**: ToT による評価・意思決定、多層評価軸
- **入力**: 複数の候補案
- **出力**: 評価スコア、最適案の選定
- **プロトコル**: ToT Evaluation Templates、Auto-ToT System

#### CopyAgent
- **役割**: コピー・トーン設計、ボイス整合
- **入力**: E:Stack 構造、トーン要件
- **出力**: コアメッセージ、タグライン、ボイスガイド
- **プロトコル**: Voice & Tone Principles

#### LogoAgent
- **役割**: ロゴ・象徴設計、シンボル分析
- **入力**: E:Stack 構造、ブランド意味
- **出力**: ロゴコンセプト、シンボル設計
- **プロトコル**: IAF Engine、Logo Design Principles v2

#### VisualAgent
- **役割**: ビジュアル提案、VI 展開補助
- **入力**: ブランド構造、ロゴコンセプト
- **出力**: ビジュアルシステム、VI ガイドライン
- **プロトコル**: Identity System Meta Principles

### 2-2. サポートエージェント

#### CoordinatorAgent
- タスク割り振り、エージェント間調整

#### QualityControlAgent
- 品質チェック、一貫性検証

#### CostMonitoringAgent
- コスト監視、経済的サーキットブレーカー

#### IncidentCommanderAgent
- 自動インシデント対応、セルフヒーリング

---

## 3. プロトコル・エンジン

### 3-1. RSI Protocol (Reverse Structure Integration)
- **目的**: 構造情報不足時の仮構造推論
- **適用**: StructureAgent での初期分析

### 3-2. IAF Engine (Identity Architecture Framework)
- **目的**: ブランド意味からロゴ設計への変換
- **適用**: LogoAgent でのシンボル設計

### 3-3. ToT Protocol (Tree of Thoughts)
- **目的**: 複数案の並列評価と最適解選定
- **適用**: EvaluationAgent での意思決定

### 3-4. STP Protocol (Structural Transfer Protocol)
- **目的**: エージェント間の構造化データ転送
- **適用**: 全エージェント間通信

---

## 4. ワークフロー

### 4-1. 標準ブランド構築フロー

```
Issue 作成
  ↓
1. E:Framing (目的・違和感の発掘)
   → StructureAgent
  ↓
2. E:Mapping (構造分類と再編集)
   → StructureAgent + ExpressionAgent
  ↓
3. E:Expression (言葉・ビジュアルの表現設計)
   → CopyAgent + LogoAgent + VisualAgent (並列実行)
  ↓
4. E:Evaluation (ToT による評価)
   → EvaluationAgent (複数案を評価)
  ↓
5. E:Narrative (層をまたぐ語りの統合)
   → CoordinatorAgent
  ↓
6. E:Manifest (VI・タグラインなどへの具現化)
   → 全エージェント連携
  ↓
PR 作成 → 自動品質チェック → マージ
```

### 4-2. 自律運用サイクル

```
GitHub Issue 起票
  ↓
CoordinatorAgent がタスク分析
  ↓
適切なエージェントに割り振り (並列実行可能)
  ↓
各エージェントが成果物生成
  ↓
QualityControlAgent が検証
  ↓
問題なし → PR 作成
問題あり → 改善サイクル (最大 3 回)
  ↓
3 回失敗 → human-intervention-required ラベル付与
```

---

## 5. データ構造

### 5-1. E:Stack 構造

```typescript
interface EStack {
  foundation: {
    purpose: string;           // パーパス
    values: string[];          // 価値観
    notAxis: string[];         // NOT 軸（絶対NG）
  };
  structure: {
    persona: Persona;          // ターゲットペルソナ
    tone: ToneProfile;         // トーン・ボイス
    positioning: string;       // ポジショニング
  };
  expression: {
    coreMessage: string;       // コアメッセージ
    tagline: string;           // タグライン
    visualIdentity: VisualID;  // ビジュアルアイデンティティ
  };
}
```

### 5-2. エージェント通信フォーマット

```typescript
interface AgentMessage {
  type: 'request' | 'response' | 'notification';
  from: AgentType;
  to: AgentType;
  payload: any;
  metadata: {
    timestamp: string;
    traceId: string;
    version: string;
  };
}
```

---

## 6. 品質保証

### 6-1. 評価軸

- **構造一貫性**: E:Stack 三層の論理整合性
- **表現品質**: コピー・ビジュアルの完成度
- **ブランド適合**: ブランド原則との整合性
- **実装可能性**: 技術的実現可能性

### 6-2. ToT 評価テンプレート

各アウトプットに対して以下のテンプレートで評価:

- Purpose Evaluation (10 項目)
- Core Message Evaluation (10 項目)
- Tagline Evaluation (10 項目)
- Logo Concept Evaluation (10 項目)
- Values Evaluation (10 項目)
- Stance Evaluation (10 項目)

**総合スコア 90 点以上で自動承認**

---

## 7. インフラ・運用

### 7-1. GitHub Actions ワークフロー

- **agent-onboarding.yml** — 新エージェント自動登録
- **incident-response.yml** — 自動インシデント対応
- **economic-circuit-breaker.yml** — コスト監視・緊急停止
- **quality-gate.yml** — PR 品質チェック

### 7-2. コスト管理

- **月間予算**: CLOUD_BUDGET_MONTHLY (環境変数)
- **監視頻度**: 1 時間ごと
- **閾値**: 予算の 150% 超過予測で緊急停止

### 7-3. ログ・監査

- 全エージェント実行ログを `.ai/logs/` に保存
- GitHub Issue にトレーサビリティ確保
- 外部 Secrets Manager (HashiCorp Vault) 統合

---

## 8. 拡張性

### 8-1. 新エージェント追加

1. `src/agents/` に新エージェントコード追加
2. SystemRegistryAgent が自動検知
3. コンプライアンステスト実行
4. 合格 → CoordinatorAgent のタスク割り当て対象に追加

### 8-2. 新プロトコル追加

1. `src/protocols/` にプロトコル実装
2. 対応エージェントに統合
3. ドキュメント更新

---

## 9. セキュリティ

- **Secrets 管理**: HashiCorp Vault で一元管理
- **短期トークン**: 15 分有効期限の動的トークン
- **監査ログ**: 全 API コール記録
- **AuditAgent**: 異常検知・アラート

---

## 10. 災害復旧

- **Genesis Configuration**: Terraform で全設定を IaC 化
- **Bootstrap**: `terraform apply` で全システム再構築可能
- **バックアップ**: ナレッジリポジトリの定期バックアップ

---

> **本アーキテクチャは AGENTS.md Version 5.0 に準拠した完全自律型システムです**
