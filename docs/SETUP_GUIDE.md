# Setup Guide: Knowledge Base System

**Date**: 2025-10-14
**Version**: 1.0.0

このガイドでは、Dynamic Knowledge Base System (Issue #102) のセットアップ手順を説明します。

---

## 前提条件

### 必要なアカウント

1. **Pinecone** (Vector Database)
   - URL: https://app.pinecone.io
   - プラン: Starter (無料) または Growth

2. **Neo4j Aura** (Graph Database)
   - URL: https://console.neo4j.io
   - プラン: Free tier または Professional

3. **OpenAI** (Embeddings API)
   - URL: https://platform.openai.com
   - APIキー取得済み

4. **Google Gemini** (Optional - Embeddings API)
   - URL: https://aistudio.google.com
   - APIキー取得済み

---

## セットアップ手順

### Step 1: Pinecone インデックス作成

1. **Pinecone Console にログイン**
   - https://app.pinecone.io

2. **新規インデックス作成**
   ```
   Name: brand-knowledge
   Dimensions: 1536
   Metric: cosine
   Pod Type: Starter (または p1.x1)
   ```

3. **インデックス作成コマンド（CLI経由の場合）**
   ```bash
   # Pinecone CLI をインストール
   pip install pinecone-client

   # Python で作成
   python3 << EOF
   from pinecone import Pinecone

   pc = Pinecone(api_key="YOUR_PINECONE_API_KEY")

   pc.create_index(
       name="brand-knowledge",
       dimension=1536,
       metric="cosine",
       spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}
   )

   print("✅ Index 'brand-knowledge' created successfully")
   EOF
   ```

4. **確認**
   ```bash
   node scripts/test_connections.js
   ```
   → `Vector Store (Pinecone): ✅ PASS` と表示されればOK

---

### Step 2: Neo4j Aura 接続確認

1. **Neo4j Aura Console にログイン**
   - https://console.neo4j.io

2. **インスタンス情報確認**
   - Instance ID: `c74787d1`
   - Connection URI: `neo4j+s://18e8c7fd-9011-4701-b5fa-0d270cad0382.databases.neo4j.io`
   - Username: `neo4j`
   - Password: `09lKcZCZGlBKA99fYsD-nOdML7Ucw2pfml0dAAmTOfE`

3. **インスタンスが Running 状態であることを確認**

4. **ブラウザでテスト**
   - Neo4j Browser を開く
   - URI, Username, Password で接続
   - 以下のクエリを実行:
   ```cypher
   RETURN "Connection successful" AS status
   ```

5. **Node.js からテスト**
   ```bash
   node scripts/test_connections.js
   ```
   → `Knowledge Graph (Neo4j): ✅ PASS` と表示されればOK

---

### Step 3: 環境変数の確認

`.env` ファイルが正しく設定されているか確認：

```bash
# .env ファイルの内容確認
cat .env | grep -E "(PINECONE|NEO4J|OPENAI|GOOGLE)"
```

必要な変数：
```bash
PINECONE_API_KEY=pcsk_xxxxx
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
```

---

## トラブルシューティング

### Issue 1: Pinecone 404 Error

**エラー**:
```
A call to https://api.pinecone.io/indexes/brand-knowledge returned HTTP status 404
```

**原因**: インデックス `brand-knowledge` が存在しない

**解決方法**:
1. Pinecone Console でインデックスを作成
2. インデックス名が正確に `brand-knowledge` であることを確認
3. 作成完了まで数分待つ（初期化に時間がかかる場合あり）

---

### Issue 2: Neo4j Connection Error

**エラー**:
```
Could not perform discovery. No routing servers available
```

**原因**:
- Neo4j インスタンスが停止している
- 接続URIが正しくない
- ファイアウォール/ネットワークの問題

**解決方法**:
1. Neo4j Aura Console でインスタンスが **Running** 状態か確認
2. `.env` の `NEO4J_URI` が `neo4j+s://` で始まっているか確認
3. パスワードが正しいか確認（スペース等の混入に注意）
4. ブラウザの Neo4j Browser で接続テスト

---

### Issue 3: OpenAI API Error

**エラー**:
```
Invalid API key
```

**解決方法**:
1. OpenAI Platform で APIキーを確認
2. `.env` の `OPENAI_API_KEY` を更新
3. APIキーの頭が `sk-proj-` または `sk-` で始まっているか確認

---

## 検証コマンド

### 全体接続テスト
```bash
node scripts/test_connections.js
```

### 個別テスト

**Pinecone のみ**:
```javascript
import 'dotenv/config';
import { VectorStore } from './src/knowledge/VectorStore.js';

const store = new VectorStore();
await store.testConnection();
```

**Neo4j のみ**:
```javascript
import 'dotenv/config';
import { KnowledgeGraph } from './src/knowledge/KnowledgeGraph.js';

const graph = new KnowledgeGraph();
await graph.testConnection();
await graph.close();
```

---

## 次のステップ

セットアップが完了したら：

1. **#102-4**: 統合 Knowledge Manager 実装
2. **#102-5**: 既存データの移行
3. **#102-6**: 単体テストと統合テスト

---

## サポートリンク

- **Pinecone Docs**: https://docs.pinecone.io
- **Neo4j Aura Docs**: https://neo4j.com/docs/aura/
- **OpenAI Docs**: https://platform.openai.com/docs
- **Google Gemini Docs**: https://ai.google.dev/docs

---

**更新日**: 2025-10-14
**ステータス**: セットアップ待ち
