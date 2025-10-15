#!/usr/bin/env node

/**
 * @file migrate_knowledge_base.js
 * @description Migrate markdown files from atlas-knowledge-base to Knowledge Base
 * @version 1.0.0
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { KnowledgeManager } from '../src/knowledge/KnowledgeManager.js';
import { KnowledgeEntry } from '../src/models/KnowledgeEntry.js';
import crypto from 'crypto';

/**
 * マークダウンファイルからメタデータを抽出
 */
function extractMetadata(content, filePath) {
  const lines = content.split('\n');

  // タイトルを抽出（最初の # 見出し）
  let title = path.basename(filePath, '.md');
  const titleMatch = content.match(/^#\s+(.+?)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // バージョン情報を抽出
  const versionMatch = content.match(/v(\d+\.\d+(?:\.\d+)?)/i);
  const version = versionMatch ? versionMatch[0] : 'v1.0';

  // ファイルパスからカテゴリを推定
  const categories = [];
  const relativePath = filePath.replace(/.*atlas-knowledge-base\//, '');
  const pathParts = relativePath.split('/');

  // ディレクトリ名をカテゴリとして使用
  if (pathParts.length > 1) {
    const category = pathParts[0].toLowerCase().replace(/_/g, '-');
    if (!category.includes('archive')) {
      categories.push(category);
    }
  }

  // ファイル名からタイプを推定
  let type = 'standard';
  if (relativePath.includes('Brand_Principles') || relativePath.includes('MetaPrinciples')) {
    type = 'standard';
    categories.push('brand-principles');
  } else if (relativePath.includes('Core_Methods') || relativePath.includes('EStack')) {
    type = 'method';
    categories.push('core-methods');
  } else if (relativePath.includes('Strategic_Frameworks')) {
    type = 'method';
    categories.push('strategic-frameworks');
  } else if (relativePath.includes('System_Protocols')) {
    type = 'method';
    categories.push('system-protocols');
  } else if (relativePath.includes('Templates')) {
    type = 'template';
    categories.push('templates');
  } else if (relativePath.includes('External_References')) {
    type = 'academic';
    categories.push('external-references');
  } else if (relativePath.includes('Cases')) {
    type = 'method';
    categories.push('case-studies');
  }

  // キーワードを抽出（シンプルな実装）
  const keywords = new Set();

  // タイトルから重要なキーワードを抽出
  const titleWords = title
    .replace(/[_\-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  titleWords.forEach(word => keywords.add(word.toLowerCase()));

  // ブランド関連の専門用語を検出
  const brandTerms = [
    'brand', 'branding', 'identity', 'logo', 'estack',
    'purpose', 'values', 'stance', 'tagline', 'strategy',
    'framework', 'protocol', 'design', 'principles'
  ];

  const lowerContent = content.toLowerCase();
  brandTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      keywords.add(term);
    }
  });

  return {
    title,
    version,
    categories: Array.from(new Set(categories)),
    keywords: Array.from(keywords).slice(0, 10), // 最大10個
    type
  };
}

/**
 * マークダウンコンテンツからサマリーを生成
 */
function generateSummary(content, maxLength = 200) {
  // 最初の段落を抽出
  const lines = content.split('\n').filter(line => line.trim().length > 0);

  // # で始まるタイトル行をスキップ
  const contentLines = lines.filter(line => !line.trim().startsWith('#'));

  if (contentLines.length === 0) {
    return 'No summary available';
  }

  // 最初の数行を結合
  let summary = contentLines.slice(0, 3).join(' ').trim();

  // 記号を削除
  summary = summary.replace(/[*_`]/g, '');

  // 長すぎる場合は切り詰め
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }

  return summary || 'No summary available';
}

/**
 * ファイルパスからエントリIDを生成
 */
function generateEntryId(filePath) {
  const relativePath = filePath.replace(/.*atlas-knowledge-base\//, '');
  const normalized = relativePath.replace(/\//g, '_').replace(/\.md$/, '');
  const hash = crypto.createHash('md5').update(relativePath).digest('hex').substring(0, 8);
  return `atlas-${hash}-${normalized}`.substring(0, 100); // 最大100文字
}

/**
 * マークダウンファイルを KnowledgeEntry に変換
 */
async function markdownToEntry(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const metadata = extractMetadata(content, filePath);
    const summary = generateSummary(content);
    const stats = await fs.stat(filePath);

    const entry = new KnowledgeEntry({
      id: generateEntryId(filePath),
      type: metadata.type,
      title: metadata.title,
      content: content.substring(0, 10000), // 最大10000文字
      summary,
      source: {
        type: 'document',
        name: path.basename(filePath),
        url: `file://${filePath}`,
        author: ['Enhanced/Hiromi'],
        publishedDate: stats.birthtime,
        accessedDate: new Date()
      },
      credibility: {
        score: 9.0, // 内部ドキュメントなので高信頼度
        peerReviewed: false,
        citations: 0,
        sourceRank: 'Internal'
      },
      relevance: {
        categories: metadata.categories.length > 0 ? metadata.categories : ['general'],
        keywords: metadata.keywords.length > 0 ? metadata.keywords : ['brand', 'framework'],
        relatedEntries: []
      }
    });

    return entry;
  } catch (error) {
    console.error(`❌ Failed to convert ${filePath}:`, error.message);
    return null;
  }
}

/**
 * メインマイグレーション処理
 */
async function migrateKnowledgeBase() {
  console.log('\n' + '='.repeat(60));
  console.log('Knowledge Base Migration');
  console.log('='.repeat(60) + '\n');

  const manager = new KnowledgeManager();

  try {
    // 接続テスト
    console.log('📋 Step 1: Testing Connections\n');
    const connected = await manager.testConnection();

    if (!connected) {
      console.error('❌ Connection test failed. Exiting...');
      process.exit(1);
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // マークダウンファイルを検索（Archiveを除外）
    console.log('📋 Step 2: Scanning Markdown Files\n');

    const knowledgeBasePath = path.join(process.cwd(), 'atlas-knowledge-base');
    const pattern = path.join(knowledgeBasePath, '**/*.md');

    let files = await glob(pattern, {
      ignore: [
        '**/Archive/**',
        '**/node_modules/**',
        '**/README.md',
        '**/CHANGELOG.md',
        '**/UPDATE_LOG.md'
      ]
    });

    console.log(`✅ Found ${files.length} markdown files to migrate\n`);

    if (files.length === 0) {
      console.log('⚠️  No files found to migrate');
      await manager.close();
      process.exit(0);
    }

    console.log('-'.repeat(60) + '\n');

    // ファイルを変換
    console.log('📋 Step 3: Converting Files to Knowledge Entries\n');

    const entries = [];
    let converted = 0;
    let failed = 0;

    for (const filePath of files) {
      const relativePath = filePath.replace(knowledgeBasePath + '/', '');
      process.stdout.write(`Converting: ${relativePath}...`);

      const entry = await markdownToEntry(filePath);

      if (entry) {
        entries.push(entry);
        converted++;
        console.log(' ✅');
      } else {
        failed++;
        console.log(' ❌');
      }
    }

    console.log();
    console.log(`Converted: ${converted} files`);
    console.log(`Failed: ${failed} files`);

    console.log('\n' + '-'.repeat(60) + '\n');

    // エントリを追加
    console.log('📋 Step 4: Adding Entries to Knowledge Base\n');

    // バッチサイズを設定（一度に処理する数）
    const batchSize = 10;
    let processed = 0;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, Math.min(i + batchSize, entries.length));

      try {
        await manager.addEntries(batch);
        processed += batch.length;
        console.log(`Progress: ${processed}/${entries.length} entries added`);
      } catch (error) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error.message);
      }
    }

    console.log();
    console.log(`✅ Added ${processed} entries to Knowledge Base`);

    console.log('\n' + '-'.repeat(60) + '\n');

    // 最終統計
    console.log('📋 Step 5: Final Statistics\n');

    const stats = await manager.getStats();
    console.log('Vector Store:');
    console.log(`  Total Vectors: ${stats.vectorStore.totalVectors}`);
    console.log('\nKnowledge Graph:');
    console.log(`  Total Entries: ${stats.knowledgeGraph.totalEntries}`);
    console.log(`  Categories: ${stats.knowledgeGraph.totalCategories}`);
    console.log(`  Keywords: ${stats.knowledgeGraph.totalKeywords}`);
    console.log(`  Relationships: ${stats.knowledgeGraph.totalRelationships}`);
    console.log(`\nSynchronized: ${stats.synchronized ? '✅ Yes' : '⚠️ No'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60) + '\n');

    await manager.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    await manager.close();
    process.exit(1);
  }
}

// Run migration
migrateKnowledgeBase();
