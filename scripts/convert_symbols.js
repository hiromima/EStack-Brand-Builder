#!/usr/bin/env node

/**
 * @file convert_symbols.js
 * @description シンボルシステムを現代的なMarkdownに変換するCLIスクリプト
 * @version 1.0.0
 */

import { SymbolConverter, createBackup } from '../src/utils/SymbolConverter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// コマンドライン引数解析
function parseArgs(args) {
  const options = {
    input: null,
    exclude: ['**/Archive/**', '**/node_modules/**'],
    dryRun: false,
    verbose: false,
    backup: true,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;

      case '--exclude':
      case '-e':
        options.exclude.push(args[++i]);
        break;

      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--no-backup':
        options.backup = false;
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;

      default:
        if (!arg.startsWith('-') && !options.input) {
          options.input = arg;
        }
    }
  }

  return options;
}

// ヘルプメッセージ
function showHelp() {
  console.log(`
Symbol Converter - GPT-3時代のシンボルを現代的なMarkdownに変換

Usage:
  node scripts/convert_symbols.js [options] <input-directory>

Options:
  -i, --input <dir>     入力ディレクトリ (デフォルト: atlas-knowledge-base)
  -e, --exclude <pattern> 除外パターン (複数指定可)
  -d, --dry-run         Dry runモード（実際には変更しない）
  -v, --verbose         詳細ログを表示
  --no-backup           バックアップを作成しない
  -h, --help            このヘルプを表示

Examples:
  # デフォルト（atlas-knowledge-baseを変換、Archiveは除外）
  node scripts/convert_symbols.js

  # Dry runで確認
  node scripts/convert_symbols.js --dry-run

  # 詳細ログ付きで実行
  node scripts/convert_symbols.js --verbose

  # カスタムディレクトリを変換
  node scripts/convert_symbols.js --input ./custom-docs

  # バックアップなしで実行（非推奨）
  node scripts/convert_symbols.js --no-backup

Conversion Patterns:
  ◤◢◤◢ STEP X: 名前 ◤◢◤◢  →  ## Phase X: 名前
  ◤◢◤◢ タイトル ◤◢◤◢      →  ## タイトル
  ◤◢◤◢ 完了 ◤◢◤◢          →  > ✅ **完了**
  【A】→【B】              →  A → B

Note:
  - Archiveディレクトリはデフォルトで除外されます
  - 変換前に自動的にバックアップを作成します
  - Dry runモードで事前に確認することを推奨します
`);
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // ヘルプ表示
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // 入力ディレクトリのデフォルト設定
  if (!options.input) {
    options.input = path.join(__dirname, '../atlas-knowledge-base');
  } else {
    options.input = path.resolve(options.input);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Symbol Converter');
  console.log('='.repeat(60) + '\n');

  console.log(`Input Directory: ${options.input}`);
  console.log(`Dry Run: ${options.dryRun ? 'YES' : 'NO'}`);
  console.log(`Backup: ${options.backup ? 'YES' : 'NO'}`);
  console.log(`Exclude Patterns: ${options.exclude.join(', ')}`);
  console.log();

  try {
    // バックアップ作成
    if (options.backup && !options.dryRun) {
      console.log('Creating backup...');
      const backupDir = await createBackup(options.input);
      console.log(`✅ Backup created: ${backupDir}\n`);
    }

    // 変換実行
    const converter = new SymbolConverter({
      dryRun: options.dryRun,
      verbose: options.verbose,
      excludePatterns: options.exclude
    });

    console.log('Starting conversion...\n');

    const report = await converter.convertDirectory(options.input);

    // レポート表示
    converter.printReport(report);

    // 終了コード
    if (report.summary.filesModified > 0) {
      console.log('✅ Conversion completed successfully!');

      if (options.dryRun) {
        console.log('\n💡 Tip: Remove --dry-run flag to apply changes');
      } else {
        console.log('\n💡 Next steps:');
        console.log('   1. Review changes: git diff atlas-knowledge-base/');
        console.log('   2. Run tests: npm test');
        console.log('   3. Commit changes: git add . && git commit -m "Convert symbols to modern Markdown"');
      }

      process.exit(0);
    } else {
      console.log('ℹ️  No files needed conversion');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error);
  process.exit(1);
});

// 実行
main();
