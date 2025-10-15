#!/usr/bin/env node

/**
 * Chroma DB 初期化スクリプト
 *
 * Vector Database の初期セットアップを行います。
 */

import { VectorDB } from '../src/knowledge/VectorDB.js';
import { Logger } from '../src/utils/Logger.js';

const logger = new Logger('ChromaDBInit');

/**
 * 初期化実行
 */
async function initializeChromaDB() {
  logger.info('🚀 Chroma DB 初期化開始');

  try {
    // VectorDB インスタンス作成
    const vectorDB = new VectorDB();

    // 初期化
    await vectorDB.initialize();

    // ヘルスチェック
    const health = await vectorDB.healthCheck();
    logger.info('Health Check:', health);

    // デフォルトコレクション作成
    const collections = [
      {
        name: 'knowledge_entries',
        metadata: {
          description: 'Knowledge Entry ベクトル埋め込み',
          dimension: 1536
        }
      },
      {
        name: 'brand_proposals',
        metadata: {
          description: 'Brand Proposal ベクトル埋め込み',
          dimension: 1536
        }
      },
      {
        name: 'design_references',
        metadata: {
          description: 'Design Reference ベクトル埋め込み',
          dimension: 1536
        }
      }
    ];

    for (const { name, metadata } of collections) {
      await vectorDB.getOrCreateCollection(name, metadata);
      const info = await vectorDB.getCollectionInfo(name);
      logger.info(`Collection '${name}':`, info);
    }

    // 全コレクション一覧
    const allCollections = await vectorDB.listCollections();
    logger.info(`Total collections: ${allCollections.length}`);

    allCollections.forEach(col => {
      logger.info(`- ${col.name}`);
    });

    logger.info('✅ Chroma DB 初期化完了');

    await vectorDB.close();
    process.exit(0);

  } catch (error) {
    logger.error('❌ 初期化失敗:', error);
    process.exit(1);
  }
}

// 実行
initializeChromaDB();
