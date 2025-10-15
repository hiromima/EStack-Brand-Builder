# Markdown Style Guide for EStack-Brand-Builder

バージョン: 1.0
最終更新: 2025-10-14

---

## 1. 基本方針

### 1-1. 原則

1. **シンプル**: 過度な装飾を避け、内容に集中
2. **標準準拠**: GitHub Flavored Markdown (GFM) 準拠
3. **AI フレンドリー**: 現代 AI が自然に理解できる構造
4. **人間可読性**: 人間にも読みやすい
5. **保守性**: メンテナンスしやすい構造

### 1-2. 禁止事項

- ❌ 特殊記号による装飾 (◤◢◤◢ 等)
- ❌ 過度な絵文字使用
- ❌ HTML タグの多用
- ❌ 非標準的な Markdown 拡張

---

## 2. 見出し構造

### 2-1. 階層ルール

```markdown
# H1: ドキュメントタイトル (1つのみ)

## H2: 主要セクション

### H3: サブセクション

#### H4: 詳細項目

##### H5: さらに詳細 (推奨しない)

###### H6: 最小単位 (推奨しない)
```

**推奨**: H1-H4 までを使用。H5-H6 は避ける。

### 2-2. 見出しの書き方

**Good**:
```markdown
## E:Stack Method v6.0

### 3 Layer Structure

#### Foundation Layer
```

**Bad**:
```markdown
◤◢◤◢ E:Stack METHOD v5.1 ◤◢◤◢

【3層構造】

◆ Foundation Layer ◆
```

---

## 3. 強調と引用

### 3-1. 強調

**太字** (重要):
```markdown
**これは重要な情報です**
```

*イタリック* (軽い強調):
```markdown
*補足情報や用語*
```

***太字イタリック*** (最重要):
```markdown
***これは非常に重要です***
```

### 3-2. 引用ブロック

**ステータスメッセージ**:
```markdown
> **Status**: Structure Transfer Complete
```

**重要な注意**:
```markdown
> ⚠️ **Warning**: This feature is experimental
```

**完了メッセージ**:
```markdown
> ✅ **Complete**: All phases finished successfully
```

### 3-3. 旧シンボルからの変換例

| 旧 | 新 |
|----|---|
| `◤◢◤◢ 完了 ◤◢◤◢` | `> ✅ **Complete**` |
| `◤◢◤◢ 注意 ◤◢◤◢` | `> ⚠️ **Warning**` |
| `◤◢◤◢ 開始 ◤◢◤◢` | `### Phase Started` |

---

## 4. リストとタスク

### 4-1. 箇条書き

**順序なしリスト**:
```markdown
- 項目 1
- 項目 2
  - サブ項目 2-1
  - サブ項目 2-2
- 項目 3
```

**順序ありリスト**:
```markdown
1. 最初のステップ
2. 次のステップ
3. 最後のステップ
```

### 4-2. タスクリスト

```markdown
- [ ] 未完了タスク
- [x] 完了済みタスク
- [ ] 進行中タスク
```

---

## 5. コードブロック

### 5-1. インラインコード

```markdown
`変数名` や `関数名` はバッククォートで囲む
```

### 5-2. コードブロック

````markdown
```javascript
// JavaScript コード
const example = 'Hello, World!';
console.log(example);
```

```python
# Python コード
def hello():
    print("Hello, World!")
```

```markdown
# Markdown の例
## 見出し
```
````

### 5-3. ファイル名付きコードブロック

````markdown
**src/example.js**:
```javascript
// ファイル内容
```
````

---

## 6. テーブル

### 6-1. 基本テーブル

```markdown
| 項目 | 説明 | 値 |
|------|------|-----|
| Item 1 | 説明 1 | Value 1 |
| Item 2 | 説明 2 | Value 2 |
```

### 6-2. アライメント

```markdown
| 左寄せ | 中央 | 右寄せ |
|:-------|:-----:|--------:|
| Left   | Center| Right |
```

---

## 7. リンクと画像

### 7-1. リンク

**インラインリンク**:
```markdown
[リンクテキスト](https://example.com)
```

**参照リンク**:
```markdown
詳細は [ドキュメント][doc] を参照してください。

[doc]: https://example.com/doc
```

### 7-2. 内部リンク

```markdown
[別のセクション](#セクション名)
```

### 7-3. 画像

```markdown
![代替テキスト](path/to/image.png)
```

---

## 8. フェーズとプロセスの表現

### 8-1. フェーズ区切り

**旧 (GPT-3 時代)**:
```markdown
◤◢◤◢ STEP 2: Mapping フェーズ開始 ◤◢◤◢
```

**新 (現代 AI)**:
```markdown
## Phase 2: Mapping

### Process Started

**Status**: Mapping phase is now active
```

または:

```markdown
---

## 2. Mapping Phase

**Objective**: Classify and restructure brand elements

**Input**: Framing phase results
**Output**: Structured E:Stack mapping

---
```

### 8-2. プロセスフロー

**フローチャート形式**:
```markdown
### Process Flow

1. **E:Framing** - Purpose discovery
   ↓
2. **E:Mapping** - Structure classification
   ↓
3. **E:Expression** - Creative expression design
   ↓
4. **E:Narrative** - Story integration
   ↓
5. **E:Manifest** - Implementation
```

**矢印の代替**:
```markdown
E:Framing → E:Mapping → E:Expression → E:Narrative → E:Manifest
```

### 8-3. ステータス表現

**完了状態**:
```markdown
> ✅ **Phase Complete**: Mapping finished successfully
>
> **Duration**: 2.5 hours
> **Quality Score**: 92/100
> **Next Step**: Expression phase
```

**進行中**:
```markdown
> ⏳ **In Progress**: Mapping phase (Step 2/5)
```

**待機中**:
```markdown
> ⏸️ **Waiting**: Pending framing phase completion
```

---

## 9. メタデータとフロントマター

### 9-1. ドキュメントヘッダー

```markdown
# Document Title

**Version**: 6.0
**Last Updated**: 2025-10-14
**Status**: Active
**Category**: Core Methods

---

## Contents

1. [Section 1](#section-1)
2. [Section 2](#section-2)

---
```

### 9-2. セクションメタデータ

```markdown
## Section Name

**Objective**: What this section achieves
**Prerequisites**: What you need before starting
**Duration**: Expected time to complete
**Difficulty**: Beginner / Intermediate / Advanced

---
```

---

## 10. 水平線の使用

### 10-1. セクション区切り

```markdown
## Section 1

Content...

---

## Section 2

Content...
```

### 10-2. 使用場面

- 大きなセクション間の区切り
- ドキュメントヘッダーと本文の区切り
- メタデータセクションの区切り

**推奨**: 過度な使用は避ける (H2 見出しで十分)

---

## 11. 絵文字の使用

### 11-1. 許可される絵文字

**ステータス表示**:
- ✅ 完了
- ⏳ 進行中
- ⏸️ 待機中
- ❌ エラー
- ⚠️ 警告
- ℹ️ 情報

**カテゴリ表示**:
- 📊 データ・分析
- 🎨 デザイン
- 📝 ドキュメント
- 🔧 ツール・設定
- 🚀 デプロイ・リリース

**Good**:
```markdown
> ✅ **Complete**: All tests passed
```

**Bad** (過度な使用):
```markdown
🎉🎊✨ Congratulations! 🌟💫🎈
```

---

## 12. 旧シンボルからの完全変換ガイド

### 12-1. 変換マッピング

| 旧パターン | 新パターン | 使用場面 |
|-----------|-----------|---------|
| `◤◢◤◢ タイトル ◤◢◤◢` | `## タイトル` | ドキュメントセクション |
| `◤◢◤◢ STEP X: 名前 ◤◢◤◢` | `## Phase X: 名前` | プロセスフェーズ |
| `◤◢◤◢ 完了 ◤◢◤◢` | `> ✅ **Complete**` | ステータスメッセージ |
| `◤◢◤◢ 準備完了 ◤◢◤◢` | `> **Ready**: [詳細]` | 準備状態 |
| `【A】→【B】` | `A → B` または `A → B` (リスト内) | フロー表現 |

### 12-2. コンテキスト別変換例

#### ケース 1: プロセスフェーズ

**旧**:
```markdown
◤◢◤◢ STEP 2: Mapping フェーズ開始 ◤◢◤◢

Foundationレイヤーからの情報を構造化します。
```

**新**:
```markdown
## Phase 2: Mapping

### Objective
Structure information from the Foundation layer.

### Status
> ⏳ **In Progress**: Mapping phase started
```

#### ケース 2: 転送完了

**旧**:
```markdown
◤◢◤◢ 出力構造確定：Brand Framer GPTへ転送準備完了 ◤◢◤◢
```

**新**:
```markdown
### Output Structure Confirmed

> ✅ **Ready for Transfer**
>
> **Destination**: Brand Framer GPT
> **Payload**: E:Stack structure complete
> **Validation**: All layers verified
```

#### ケース 3: ドキュメントタイトル

**旧**:
```markdown
◤◢◤◢ E:Stack METHOD v5.1 ◤◢◤◢
```

**新**:
```markdown
# E:Stack Method v6.0

**Category**: Core Methods
**Version**: 6.0 (Updated from 5.1)
**Last Updated**: 2025-10-14
```

---

## 13. ベストプラクティス

### 13-1. 構造設計

1. **階層を明確に**: H2 → H3 → H4 の順序を守る
2. **リンク可能に**: 各セクションに ID を持たせる (自動生成される)
3. **目次を付ける**: 長いドキュメントには目次を追加
4. **メタデータを明記**: バージョン、更新日、ステータスを記載

### 13-2. 可読性

1. **短い段落**: 1段落 = 3-5文程度
2. **リストを活用**: 箇条書きで整理
3. **コードは別ブロック**: インラインコードとコードブロックを使い分け
4. **空行を挿入**: セクション間に空行

### 13-3. メンテナンス性

1. **バージョン管理**: メジャー変更時はバージョン更新
2. **変更履歴**: 重要な変更は記録
3. **リンク確認**: 内部リンク・外部リンクの有効性確認
4. **定期レビュー**: 3ヶ月ごとに内容見直し

---

## 14. 検証チェックリスト

ドキュメント作成・更新時のチェックリスト:

- [ ] H1 は1つのみ
- [ ] 見出し階層が正しい (H2 → H3 → H4)
- [ ] 特殊記号 (◤◢◤◢ 等) を使用していない
- [ ] コードブロックに言語指定
- [ ] テーブルのフォーマット正しい
- [ ] リンクが有効
- [ ] 絵文字の過度な使用がない
- [ ] メタデータ (バージョン、日付) が最新
- [ ] 目次がある (長文の場合)
- [ ] GFM 準拠の構文

---

## 15. ツールとリソース

### 15-1. 推奨エディタ

- VS Code (Markdown Preview Enhanced 拡張)
- Typora
- Mark Text

### 15-2. Linter

```bash
# markdownlint で検証
markdownlint '**/*.md' --ignore node_modules
```

### 15-3. プレビュー

```bash
# GitHub 互換プレビュー
grip README.md
```

---

## 16. 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-14 | 初版作成。GPT-3 時代のシンボルシステムから移行 |

---

**このスタイルガイドは EStack-Brand-Builder プロジェクト全体で適用されます**
