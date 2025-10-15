# GitHubリポジトリ名変更ガイド

**現在**: `hiromima/Brand-Builder`
**変更先**: `hiromima/EStack-Brand-Builder`

---

## 🔧 変更手順

### 1. GitHub Web UI でリポジトリ名変更

1. ブラウザで https://github.com/hiromima/Brand-Builder にアクセス
2. **Settings** タブをクリック
3. 「General」セクションの一番上にある **Repository name** を探す
4. 現在の名前 `Brand-Builder` を `EStack-Brand-Builder` に変更
5. **Rename** ボタンをクリック
6. パスワード確認を求められたら入力

### 2. ローカルリポジトリのリモートURL更新

```bash
cd /Users/enhanced/Desktop/program/EStack-Brand-Builder

# 現在のリモートURL確認
git remote -v

# リモートURLを新しいリポジトリ名に更新
git remote set-url origin https://github.com/hiromima/EStack-Brand-Builder.git

# 確認
git remote -v

# テスト（fetch実行）
git fetch origin
```

### 3. .env ファイル更新

すでに更新済みですが、念のため確認：

```bash
# .env の GITHUB_REPO を確認
grep GITHUB_REPO .env
# 出力: GITHUB_REPO=hiromima/EStack-Brand-Builder
```

### 4. 作成済みIssuesの確認

リポジトリ名変更後、Issues は自動的に新しいURLに移行されます：

```bash
# 新しいリポジトリ名でIssue確認
gh issue list --repo hiromima/EStack-Brand-Builder
```

---

## ⚠️ 重要な注意事項

### GitHubの自動リダイレクト

- 古いURL (`hiromima/Brand-Builder`) は自動的に新しいURL (`hiromima/EStack-Brand-Builder`) にリダイレクトされます
- ただし、**新しいリポジトリ名で統一することを強く推奨**

### 影響を受ける箇所

変更後、以下が自動的に新URLに移行：
- ✅ Issues (#1-17)
- ✅ Pull Requests
- ✅ GitHub Actions Workflows
- ✅ Wiki（もしあれば）
- ✅ GitHub Pages（もしあれば）

### ローカル更新必要箇所

- ✅ git remote URL（上記手順2）
- ✅ .env ファイル（すでに更新済み）
- ✅ ドキュメント内のURL参照（すでに更新済み）

---

## ✅ 変更完了チェックリスト

### GitHub Web側
- [ ] リポジトリ名を `EStack-Brand-Builder` に変更
- [ ] 新しいURLでアクセス可能を確認: https://github.com/hiromima/EStack-Brand-Builder

### ローカル側
- [ ] git remote URL を更新
- [ ] git fetch 成功を確認
- [ ] gh issue list で Issues が見えることを確認

### 動作確認
- [ ] Issue #1 が新URLで開けることを確認
- [ ] GitHub Actions が正常動作することを確認

---

## 🔄 変更後の実行コマンド例

すべて新しいリポジトリ名を使用：

```bash
# Issues確認
gh issue list --repo hiromima/EStack-Brand-Builder

# PR作成
gh pr create --repo hiromima/EStack-Brand-Builder

# Miyabi実行
miyabi workflow 2 --repo hiromima/EStack-Brand-Builder

# Actions確認
gh run list --repo hiromima/EStack-Brand-Builder
```

---

## 📝 変更後のドキュメント更新

以下のドキュメントはすでに更新済み：
- ✅ README.md
- ✅ docs/MASTER_ISSUE.md
- ✅ docs/*.md (全18ファイル)
- ✅ package.json
- ✅ .miyabi.yml
- ✅ .env

---

**次のステップ**: 上記手順1でGitHub Web UIからリポジトリ名を変更してください。
