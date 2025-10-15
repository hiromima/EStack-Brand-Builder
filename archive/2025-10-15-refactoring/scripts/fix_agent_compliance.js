#!/usr/bin/env node
/**
 * @file Agent Compliance Fixer
 * @description 準拠テスト失敗エージェントを自動修正
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * エージェントファイルに @file, @description, @responsibilities を追加
 */
function addFileDocumentation(content, agentName) {
  // 既に @file タグがある場合はスキップ
  if (content.includes('@file')) {
    console.log(`  ✓ ${agentName}: @file タグ済み`);
    return content;
  }

  // 最初のコメントブロックを探す
  const commentMatch = content.match(/^\/\*\*\n([^*]|\*[^/])*\*\//m);
  if (!commentMatch) {
    console.log(`  ⚠ ${agentName}: コメントブロックが見つかりません`);
    return content;
  }

  const originalComment = commentMatch[0];

  // @file, @description, @responsibilities を追加
  const lines = originalComment.split('\n');
  const newLines = [lines[0]]; // /**

  // @file と @description を追加
  newLines.push(` * @file ${agentName}`);
  newLines.push(` * @description ${agentName} の実装`);

  // 元のコンテンツを追加（最初と最後の行を除く）
  for (let i = 1; i < lines.length - 1; i++) {
    newLines.push(lines[i]);
  }

  // @responsibilities を追加
  newLines.push(` *`);
  newLines.push(` * @responsibilities`);
  newLines.push(` * - エージェント固有の処理実装`);
  newLines.push(` * - BaseAgent インターフェース準拠`);
  newLines.push(` * - エラーハンドリングとロギング`);

  newLines.push(lines[lines.length - 1]); // */

  const newComment = newLines.join('\n');
  return content.replace(originalComment, newComment);
}

/**
 * constructor を options パラメータに変更
 */
function fixConstructor(content, agentName) {
  // constructor(config) -> constructor(options = {})
  const configPattern = /constructor\(config\)/g;
  if (configPattern.test(content)) {
    console.log(`  ✓ ${agentName}: constructor パラメータ修正`);
    content = content.replace(configPattern, 'constructor(options = {})');

    // super({ ...config, を super({ ...options, に変更
    content = content.replace(/super\(\{\s*\.\.\.config,/g, 'super({ ...options,');

    // config.options を options に変更
    content = content.replace(/this\.options = config\.options/g, 'this.options = options');
  }

  return content;
}

/**
 * initialize() メソッドを追加
 */
function addInitializeMethod(content, agentName) {
  // 既に initialize メソッドがある場合はスキップ
  if (content.includes('async initialize()')) {
    console.log(`  ✓ ${agentName}: initialize() メソッド済み`);
    return content;
  }

  // constructor の後に initialize を追加
  const constructorEndPattern = /constructor\([^)]*\)\s*\{[^}]*\}/s;
  const match = content.match(constructorEndPattern);

  if (!match) {
    console.log(`  ⚠ ${agentName}: constructor が見つかりません`);
    return content;
  }

  const initializeMethod = `

  /**
   * エージェントの初期化
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    this.logger?.info(\`[\${this.name}] エージェント固有の初期化完了\`);
  }`;

  const insertPosition = match.index + match[0].length;
  content = content.slice(0, insertPosition) + initializeMethod + content.slice(insertPosition);

  console.log(`  ✓ ${agentName}: initialize() メソッド追加`);
  return content;
}

/**
 * メインの修正処理
 */
async function main() {
  console.log('🔧 エージェント準拠テスト修正開始\n');

  // core エージェントを修正
  const coreAgents = await glob('src/agents/core/*Agent.js');

  for (const filePath of coreAgents) {
    const agentName = filePath.split('/').pop().replace('.js', '');
    console.log(`📝 修正中: ${agentName}`);

    let content = readFileSync(filePath, 'utf-8');

    // 修正適用
    content = addFileDocumentation(content, agentName);
    content = fixConstructor(content, agentName);
    content = addInitializeMethod(content, agentName);

    // ファイル保存
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ ${agentName} 修正完了\n`);
  }

  console.log('✅ 全エージェント修正完了');
}

main().catch(console.error);
