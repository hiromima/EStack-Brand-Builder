/**
 * @file SymbolConverter.js
 * @description GPT-3時代のシンボルシステムを現代的なMarkdownに変換
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

/**
 * シンボル変換クラス
 */
export class SymbolConverter {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      excludePatterns: options.excludePatterns || ['**/Archive/**', '**/node_modules/**'],
      ...options
    };

    // 変換パターン定義
    this.patterns = [
      // パターン1: STEP X: 名前 形式
      {
        name: 'phase-with-number',
        from: /◤◢◤◢\s*STEP\s+(\d+):\s*(.+?)\s*◤◢◤◢/g,
        to: '## Phase $1: $2',
        description: 'フェーズ番号付き見出し'
      },

      // パターン2: 完了メッセージ
      {
        name: 'completion-message',
        from: /◤◢◤◢\s*(完了|Complete|完成|Finished|Done)\s*◤◢◤◢/gi,
        to: '> ✅ **$1**',
        description: '完了ステータス'
      },

      // パターン3: 準備完了メッセージ
      {
        name: 'ready-message',
        from: /◤◢◤◢\s*(準備完了|Ready|準備OK):\s*(.+?)\s*◤◢◤◢/gi,
        to: '> **Ready**: $2',
        description: '準備完了ステータス'
      },

      // パターン4: 出力構造確定メッセージ
      {
        name: 'output-confirmed',
        from: /◤◢◤◢\s*出力構造確定[:：]\s*(.+?)\s*◤◢◤◢/g,
        to: '### Output Structure Confirmed\n\n> ✅ **Ready for Transfer**\n> \n> **Details**: $1',
        description: '出力構造確定'
      },

      // パターン5: Structure Transfer Complete
      {
        name: 'transfer-complete',
        from: /◤◢◤◢\s*Structure Transfer Complete\s*◤◢◤◢/g,
        to: '> ✅ **Structure Transfer Complete**',
        description: '構造転送完了'
      },

      // パターン6: 一般的なタイトル（最後に適用）
      {
        name: 'general-title',
        from: /◤◢◤◢\s*(.+?)\s*◤◢◤◢/g,
        to: '## $1',
        description: '一般的な見出し'
      },

      // パターン7: 【A】→【B】形式
      {
        name: 'bracket-arrow',
        from: /【(.+?)】→【(.+?)】/g,
        to: '$1 → $2',
        description: 'ブラケット矢印記法'
      },

      // パターン8: 【A】形式（単体）
      {
        name: 'bracket-single',
        from: /【(.+?)】/g,
        to: '$1',
        description: 'ブラケット除去'
      }
    ];

    // 統計情報
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      filesSkipped: 0,
      totalReplacements: 0,
      replacementsByPattern: {}
    };
  }

  /**
   * ディレクトリ全体を変換
   * @param {string} inputDir - 入力ディレクトリ
   * @returns {Promise<Object>} 変換結果
   */
  async convertDirectory(inputDir) {
    const startTime = Date.now();

    this.log(`Starting conversion in: ${inputDir}`);
    this.log(`Dry run mode: ${this.options.dryRun ? 'ON' : 'OFF'}`);

    // Markdownファイルを検索
    const files = await this.findMarkdownFiles(inputDir);

    this.log(`Found ${files.length} markdown files`);

    // 各ファイルを変換
    for (const file of files) {
      await this.convertFile(file);
    }

    const duration = Date.now() - startTime;

    // 結果レポート生成
    const report = this.generateReport(duration);

    return report;
  }

  /**
   * Markdownファイルを検索
   * @param {string} dir - 検索ディレクトリ
   * @returns {Promise<string[]>} ファイルパスの配列
   */
  async findMarkdownFiles(dir) {
    const patterns = ['**/*.md'];
    const ignore = this.options.excludePatterns;

    const files = await glob(patterns, {
      cwd: dir,
      ignore,
      absolute: true
    });

    return files;
  }

  /**
   * 単一ファイルを変換
   * @param {string} filePath - ファイルパス
   * @returns {Promise<Object>} 変換結果
   */
  async convertFile(filePath) {
    this.stats.filesProcessed++;

    try {
      // ファイル読み込み
      const content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      // 変換実行
      const { converted, replacements } = this.convert(content);

      // 変更があった場合
      if (converted !== originalContent) {
        this.stats.filesModified++;
        this.stats.totalReplacements += replacements;

        this.log(`Modified: ${path.relative(process.cwd(), filePath)} (${replacements} replacements)`);

        // Dry runでなければ書き込み
        if (!this.options.dryRun) {
          await fs.writeFile(filePath, converted, 'utf-8');
        }

        return {
          path: filePath,
          modified: true,
          replacements
        };
      } else {
        this.stats.filesSkipped++;
        return {
          path: filePath,
          modified: false,
          replacements: 0
        };
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return {
        path: filePath,
        error: error.message
      };
    }
  }

  /**
   * コンテンツを変換
   * @param {string} content - 変換するコンテンツ
   * @returns {Object} 変換結果
   */
  convert(content) {
    let converted = content;
    let totalReplacements = 0;

    // 各パターンを順番に適用
    for (const pattern of this.patterns) {
      let replacements = 0;

      converted = converted.replace(pattern.from, (...args) => {
        replacements++;
        totalReplacements++;

        // 統計更新
        if (!this.stats.replacementsByPattern[pattern.name]) {
          this.stats.replacementsByPattern[pattern.name] = 0;
        }
        this.stats.replacementsByPattern[pattern.name]++;

        // $1, $2を実際の値に置換
        let result = pattern.to;
        for (let i = 1; i < args.length - 2; i++) {
          result = result.replace(new RegExp(`\\$${i}`, 'g'), args[i]);
        }

        return result;
      });

      if (replacements > 0 && this.options.verbose) {
        this.log(`  Applied ${pattern.name}: ${replacements} replacements`);
      }
    }

    return {
      converted,
      replacements: totalReplacements
    };
  }

  /**
   * レポート生成
   * @param {number} duration - 処理時間（ミリ秒）
   * @returns {Object} レポート
   */
  generateReport(duration) {
    const report = {
      summary: {
        filesProcessed: this.stats.filesProcessed,
        filesModified: this.stats.filesModified,
        filesSkipped: this.stats.filesSkipped,
        totalReplacements: this.stats.totalReplacements,
        duration: `${(duration / 1000).toFixed(2)}s`
      },
      replacementsByPattern: this.stats.replacementsByPattern,
      dryRun: this.options.dryRun
    };

    return report;
  }

  /**
   * ログ出力
   * @param {string} message - メッセージ
   * @param {string} level - ログレベル
   */
  log(message, level = 'info') {
    if (this.options.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : '✓';
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * レポートを整形して出力
   * @param {Object} report - レポート
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('Symbol Conversion Report');
    console.log('='.repeat(60));

    console.log('\nSummary:');
    console.log(`  Files Processed: ${report.summary.filesProcessed}`);
    console.log(`  Files Modified:  ${report.summary.filesModified}`);
    console.log(`  Files Skipped:   ${report.summary.filesSkipped}`);
    console.log(`  Total Replacements: ${report.summary.totalReplacements}`);
    console.log(`  Duration: ${report.summary.duration}`);

    if (report.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were actually modified');
    }

    if (Object.keys(report.replacementsByPattern).length > 0) {
      console.log('\nReplacements by Pattern:');
      for (const [pattern, count] of Object.entries(report.replacementsByPattern)) {
        console.log(`  ${pattern}: ${count}`);
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

/**
 * バックアップを作成
 * @param {string} dir - ディレクトリ
 * @returns {Promise<string>} バックアップディレクトリパス
 */
export async function createBackup(dir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = `${dir}.backup-${timestamp}`;

  console.log(`Creating backup: ${backupDir}`);

  // ディレクトリをコピー
  await fs.cp(dir, backupDir, { recursive: true });

  console.log(`✅ Backup created successfully`);

  return backupDir;
}

/**
 * デフォルトエクスポート
 */
export default SymbolConverter;
