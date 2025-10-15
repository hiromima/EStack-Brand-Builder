# EStack-Brand-Builder デプロイメントガイド

## 概要

本ドキュメントは、EStack-Brand-Builder を本番環境にデプロイするための完全ガイドです。

## 前提条件

### システム要件
- **Node.js**: ≥18.0.0
- **npm**: ≥9.0.0
- **Docker**: ≥24.0.0（Docker デプロイ時）
- **Git**: ≥2.30.0

### 必要なサービス
- **GitHub リポジトリ**（プライベート推奨）
- **Google Gemini API キー**（完全無料）
- **ChromaDB**（Vector Database）
- **Redis**（オプション：キャッシュ用）

## デプロイメント方法

### 方法 1: Docker Compose（推奨）

#### 1. リポジトリのクローン

```bash
git clone https://github.com/hiromima/EStack-Brand-Builder.git
cd EStack-Brand-Builder
```

#### 2. 環境変数の設定

```bash
# .env ファイルを作成
cp .env.example .env

# 必須の環境変数を設定
nano .env
```

**必須設定項目**

```bash
# Node 環境
NODE_ENV=production
PORT=3000

# Google Gemini API（完全無料）
GOOGLE_API_KEY=your_gemini_api_key_here

# データベース（Docker Compose で自動起動）
CHROMA_DB_URL=http://chromadb:8000
REDIS_URL=redis://redis:6379

# セキュリティ
SECRET_KEY=your_secret_key_here
```

#### 3. Docker Compose でデプロイ

```bash
# ビルドと起動
docker-compose up -d

# ログ確認
docker-compose logs -f app

# ヘルスチェック
curl http://localhost:3000/health
```

#### 4. サービスの確認

```bash
# アプリケーション
curl http://localhost:3000/health

# ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Redis
docker exec estack-redis redis-cli ping
```

### 方法 2: PM2（サーバー直接デプロイ）

#### 1. 依存関係のインストール

```bash
npm ci --only=production
```

#### 2. PM2 のインストール

```bash
npm install -g pm2
```

#### 3. PM2 でアプリケーションを起動

```bash
# 本番環境で起動
pm2 start ecosystem.config.js --env production

# ステータス確認
pm2 status

# ログ確認
pm2 logs estack-brand-builder

# モニタリング
pm2 monit
```

#### 4. PM2 の自動起動設定

```bash
# システム起動時に PM2 を自動起動
pm2 startup

# 現在の PM2 プロセスを保存
pm2 save
```

### 方法 3: GitHub Actions デプロイ

#### 1. GitHub Secrets の設定

```bash
# 必須 Secrets
GEMINI_API_KEY         # Google Gemini API キー（無料）
DEPLOY_SSH_KEY         # デプロイサーバーの SSH 鍵
DEPLOY_HOST            # デプロイサーバーのホスト
DEPLOY_USER            # デプロイユーザー
```

#### 2. ecosystem.config.js の deploy 設定を更新

```javascript
module.exports = {
  deploy: {
    production: {
      user: 'your-user',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/hiromima/EStack-Brand-Builder.git',
      path: '/var/www/estack-brand-builder',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

#### 3. デプロイ実行

```bash
# 初回セットアップ
pm2 deploy ecosystem.config.js production setup

# デプロイ
pm2 deploy ecosystem.config.js production
```

## Gemini API セットアップ（完全無料）

### 1. API キーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Google アカウントでログイン
3. "Create API Key" をクリック
4. API キーをコピー

### 2. GitHub Secrets に追加

```bash
# リポジトリの Settings > Secrets and variables > Actions
Name: GEMINI_API_KEY
Secret: <your-gemini-api-key>
```

### 3. 無料枠の確認

- **リクエスト制限**: 60/分、1,000/日
- **トークン制限**: なし
- **クレジットカード**: 不要

詳細は [GEMINI_SETUP.md](GEMINI_SETUP.md) を参照

## 本番環境チェックリスト

### デプロイ前

- [ ] `.env` ファイルが正しく設定されている
- [ ] Gemini API キーが取得済み
- [ ] GitHub Secrets が設定済み
- [ ] production_check.js が全てパス

```bash
# 本番環境チェック
node scripts/production_check.js
```

### デプロイ後

- [ ] アプリケーションが起動している
- [ ] ヘルスチェックが成功
- [ ] エージェントが正常動作
- [ ] ログに ERROR がない
- [ ] Gemini AI レビューが動作

```bash
# ヘルスチェック
curl http://localhost:3000/health

# E2E テスト
npm run test:e2e

# エージェントテスト
npm run test:agents
```

### セキュリティ

- [ ] `.env` が `.gitignore` に含まれている
- [ ] API キーがコミットされていない
- [ ] HTTPS が有効（本番環境）
- [ ] ファイアウォールが設定済み
- [ ] 非 root ユーザーで実行

## モニタリング

### PM2 モニタリング

```bash
# リアルタイムモニター
pm2 monit

# ステータス確認
pm2 status

# ログ確認
pm2 logs

# メモリ使用量確認
pm2 show estack-brand-builder
```

### Docker モニタリング

```bash
# コンテナ状態
docker-compose ps

# リソース使用量
docker stats

# ログ確認
docker-compose logs -f app
```

### GitHub Actions モニタリング

- **Gemini PR Review**: PR 作成時に自動実行
- **Quality Gate**: PR・Push 時に自動実行
- **Economic Circuit Breaker**: 毎時実行（コスト監視）

## トラブルシューティング

### アプリケーションが起動しない

```bash
# ログ確認
pm2 logs estack-brand-builder --err

# 環境変数確認
pm2 env 0

# ポート競合確認
lsof -i :3000
```

### ChromaDB 接続エラー

```bash
# ChromaDB の状態確認
docker-compose ps chromadb

# ChromaDB のログ確認
docker-compose logs chromadb

# ChromaDB の再起動
docker-compose restart chromadb
```

### Gemini API エラー

```bash
# API キーの確認
gh secret list

# 無料枠の確認
# → Google AI Studio でクォータを確認

# TEST_MODE で実行
TEST_MODE=true node scripts/test_quality_control_agent.js
```

### メモリ不足

```bash
# PM2 でメモリ制限を設定
pm2 start ecosystem.config.js --env production --max-memory-restart 1G

# Docker でメモリ制限
# docker-compose.yml に追加
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

## スケーリング

### 水平スケーリング（PM2 Cluster Mode）

```bash
# ecosystem.config.js で設定済み
instances: 'max',  # CPU コア数に応じて自動
exec_mode: 'cluster'
```

### 垂直スケーリング（リソース増強）

```bash
# メモリ増強
max_memory_restart: '2G'  # 1G → 2G

# Worker 追加
# ecosystem.config.js の instances を増やす
```

## バックアップ

### データベース

```bash
# ChromaDB バックアップ
docker-compose exec chromadb tar -czf /backup/chroma-$(date +%Y%m%d).tar.gz /chroma/chroma

# Redis バックアップ
docker-compose exec redis redis-cli SAVE
```

### 設定ファイル

```bash
# 重要ファイルのバックアップ
tar -czf backup-$(date +%Y%m%d).tar.gz \
  .env \
  ecosystem.config.js \
  docker-compose.yml \
  Dockerfile
```

## ロールバック

### PM2 でロールバック

```bash
# 以前のバージョンに戻す
pm2 deploy ecosystem.config.js production revert 1
```

### Git でロールバック

```bash
# コミットを戻す
git revert <commit-hash>
git push origin main

# PM2 でリロード
pm2 reload estack-brand-builder
```

## パフォーマンス最適化

### Node.js 最適化

```bash
# メモリ設定
NODE_OPTIONS="--max-old-space-size=2048"

# GC 最適化
NODE_OPTIONS="--expose-gc --gc-interval=100"
```

### データベース最適化

```javascript
// ChromaDB コネクションプール
{
  maxConnections: 10,
  timeout: 5000
}

// Redis キャッシュ設定
{
  ttl: 3600,  // 1時間
  max: 1000   // 最大エントリ数
}
```

## コスト管理

### Gemini API（完全無料）

- **無料枠**: 60 リクエスト/分、1,000 リクエスト/日
- **超過時**: 自動的にスキップ（エラーなし）
- **課金**: 一切なし

### GitHub Actions（無料枠）

- **プライベートリポジトリ**: 月 2,000 分（GitHub Free）
- **超過時**: $0.008/分（Linux）
- **推定使用量**: 月 100-200 分

### サーバーコスト

- **VPS**: $5-10/月（推奨: DigitalOcean, Linode）
- **CPU**: 1-2 コア
- **RAM**: 2-4 GB
- **Storage**: 20 GB

## サポート

### ドキュメント
- [GEMINI_SETUP.md](GEMINI_SETUP.md) — Gemini AI 統合ガイド
- [ARCHITECTURE.md](ARCHITECTURE.md) — システムアーキテクチャ
- [MIYABI_SDK_USAGE.md](MIYABI_SDK_USAGE.md) — Miyabi SDK ガイド

### コミュニティ
- GitHub Issues: バグ報告・機能要望
- GitHub Discussions: 質問・議論

### 緊急時
1. GitHub Issues に報告
2. ログファイルを添付
3. `@gemini-cli help` で AI アシスタントに相談

---

**💡 Tip**: すべての AI 機能が完全無料で利用できます。課金の心配なく、フル機能をご活用ください。
