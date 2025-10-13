/**
 * @file SymbolConverter.test.js
 * @description Unit tests for SymbolConverter
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { SymbolConverter } from '../../src/utils/SymbolConverter.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SymbolConverter', () => {
  describe('Pattern Conversion', () => {
    let converter;

    before(() => {
      converter = new SymbolConverter({
        dryRun: true,
        verbose: false
      });
    });

    it('should convert phase-with-number pattern', () => {
      const input = '◤◢◤◢ STEP 2: Mapping 開始 ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '## Phase 2: Mapping 開始');
    });

    it('should convert completion messages', () => {
      const input = '◤◢◤◢ 完了 ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '> ✅ **完了**');
    });

    it('should convert ready messages', () => {
      const input = '◤◢◤◢ 準備完了: システム起動完了 ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '> **Ready**: システム起動完了');
    });

    it('should convert output-confirmed pattern', () => {
      const input = '◤◢◤◢ 出力構造確定: E:Stack形式 ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.ok(converted.includes('### Output Structure Confirmed'));
      assert.ok(converted.includes('> ✅ **Ready for Transfer**'));
    });

    it('should convert transfer-complete pattern', () => {
      const input = '◤◢◤◢ Structure Transfer Complete ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '> ✅ **Structure Transfer Complete**');
    });

    it('should convert general title pattern', () => {
      const input = '◤◢◤◢ セクションタイトル ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '## セクションタイトル');
    });

    it('should convert bracket-arrow pattern', () => {
      const input = '【Foundation】→【Structure】';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, 'Foundation → Structure');
    });

    it('should convert single bracket pattern', () => {
      const input = '【目的】プロジェクト名';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '目的プロジェクト名');
    });

    it('should handle multiple patterns in one text', () => {
      const input = `◤◢◤◢ STEP 1: 開始 ◤◢◤◢

【目的】システム改善
【A】→【B】の流れ

◤◢◤◢ 完了 ◤◢◤◢`;

      const { converted } = converter.convert(input);

      assert.ok(converted.includes('## Phase 1: 開始'));
      assert.ok(converted.includes('目的システム改善'));
      assert.ok(converted.includes('A → Bの流れ'));
      assert.ok(converted.includes('> ✅ **完了**'));
    });

    it('should preserve content without symbols', () => {
      const input = `## Normal Heading

This is normal text with no symbols.

- List item 1
- List item 2`;

      const { converted } = converter.convert(input);
      assert.strictEqual(converted, input);
    });

    it('should handle empty string', () => {
      const { converted } = converter.convert('');
      assert.strictEqual(converted, '');
    });

    it('should preserve code blocks', () => {
      const input = `\`\`\`javascript
const symbol = '◤◢◤◢ STEP 1: Test ◤◢◤◢';
\`\`\``;

      const { converted } = converter.convert(input);
      // Code blocks should still be converted
      assert.ok(converted.includes('## Phase 1: Test'));
    });
  });

  describe('Statistics Tracking', () => {
    it('should track replacement counts', () => {
      const converter = new SymbolConverter({ dryRun: true });

      const input = `◤◢◤◢ STEP 1: Test ◤◢◤◢
【A】→【B】
【目的】テスト`;

      const { replacements } = converter.convert(input);

      assert.strictEqual(replacements, 3);
      assert.strictEqual(converter.stats.replacementsByPattern['phase-with-number'], 1);
      assert.strictEqual(converter.stats.replacementsByPattern['bracket-arrow'], 1);
      assert.strictEqual(converter.stats.replacementsByPattern['bracket-single'], 1);
    });

    it('should track zero replacements', () => {
      const converter = new SymbolConverter({ dryRun: true });
      const input = 'Normal text with no symbols';

      const { replacements } = converter.convert(input);
      assert.strictEqual(replacements, 0);
    });
  });

  describe('File Operations', () => {
    const testDir = path.join(__dirname, '../fixtures/symbol-test');
    const testFile = path.join(testDir, 'test.md');

    before(async () => {
      await fs.mkdir(testDir, { recursive: true });
    });

    after(async () => {
      await fs.rm(testDir, { recursive: true, force: true });
    });

    it('should convert a file in dry-run mode', async () => {
      const content = '◤◢◤◢ STEP 1: Test ◤◢◤◢\n\nTest content';
      await fs.writeFile(testFile, content, 'utf-8');

      const converter = new SymbolConverter({ dryRun: true });
      const result = await converter.convertFile(testFile);

      assert.strictEqual(result.modified, true);
      assert.strictEqual(result.replacements, 1);

      // Verify file not actually modified in dry-run
      const fileContent = await fs.readFile(testFile, 'utf-8');
      assert.strictEqual(fileContent, content);
    });

    it('should convert a file with actual write', async () => {
      const content = '◤◢◤◢ STEP 1: Test ◤◢◤◢\n\nTest content';
      await fs.writeFile(testFile, content, 'utf-8');

      const converter = new SymbolConverter({ dryRun: false });
      const result = await converter.convertFile(testFile);

      assert.strictEqual(result.modified, true);
      assert.strictEqual(result.replacements, 1);

      // Verify file actually modified
      const fileContent = await fs.readFile(testFile, 'utf-8');
      assert.ok(fileContent.includes('## Phase 1: Test'));
      assert.ok(!fileContent.includes('◤◢◤◢'));
    });

    it('should skip files with no symbols', async () => {
      const content = '## Normal Heading\n\nNormal content';
      await fs.writeFile(testFile, content, 'utf-8');

      const converter = new SymbolConverter({ dryRun: false });
      const result = await converter.convertFile(testFile);

      assert.strictEqual(result.modified, false);
      assert.strictEqual(result.replacements, 0);
    });

    it('should handle file read errors gracefully', async () => {
      const converter = new SymbolConverter({ dryRun: true });
      const nonExistentFile = path.join(testDir, 'nonexistent.md');

      const result = await converter.convertFile(nonExistentFile);

      assert.ok(result.error);
      assert.ok(result.error.includes('ENOENT') || result.error.includes('no such file'));
    });
  });

  describe('Report Generation', () => {
    it('should generate accurate report', () => {
      const converter = new SymbolConverter({ dryRun: true });

      converter.stats.filesProcessed = 10;
      converter.stats.filesModified = 5;
      converter.stats.filesSkipped = 5;
      converter.stats.totalReplacements = 20;
      converter.stats.replacementsByPattern = {
        'phase-with-number': 5,
        'bracket-single': 10,
        'general-title': 5
      };

      const report = converter.generateReport(1500);

      assert.strictEqual(report.summary.filesProcessed, 10);
      assert.strictEqual(report.summary.filesModified, 5);
      assert.strictEqual(report.summary.filesSkipped, 5);
      assert.strictEqual(report.summary.totalReplacements, 20);
      assert.strictEqual(report.summary.duration, '1.50s');
      assert.strictEqual(report.dryRun, true);
      assert.deepStrictEqual(report.replacementsByPattern, {
        'phase-with-number': 5,
        'bracket-single': 10,
        'general-title': 5
      });
    });
  });

  describe('Options Configuration', () => {
    it('should use default options', () => {
      const converter = new SymbolConverter();

      assert.strictEqual(converter.options.dryRun, false);
      assert.strictEqual(converter.options.verbose, false);
      assert.deepStrictEqual(converter.options.excludePatterns, [
        '**/Archive/**',
        '**/node_modules/**'
      ]);
    });

    it('should accept custom options', () => {
      const converter = new SymbolConverter({
        dryRun: true,
        verbose: true,
        excludePatterns: ['**/test/**', '**/Archive/**']
      });

      assert.strictEqual(converter.options.dryRun, true);
      assert.strictEqual(converter.options.verbose, true);
      assert.deepStrictEqual(converter.options.excludePatterns, [
        '**/test/**',
        '**/Archive/**'
      ]);
    });
  });

  describe('Edge Cases', () => {
    let converter;

    before(() => {
      converter = new SymbolConverter({ dryRun: true });
    });

    it('should handle nested symbols', () => {
      const input = '◤◢◤◢ 【STEP 1】: Test ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.ok(!converted.includes('【'));
      assert.ok(!converted.includes('】'));
    });

    it('should handle Unicode variations', () => {
      const input = '◤◢◤◢ STEP 1: テスト文字列 ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, '## Phase 1: テスト文字列');
    });

    it('should handle whitespace variations', () => {
      const input = '◤◢◤◢   STEP 1:  Test   ◤◢◤◢';
      const { converted } = converter.convert(input);
      assert.ok(converted.includes('## Phase 1:'));
    });

    it('should handle multiple symbols on same line', () => {
      const input = '【A】text【B】more text【C】';
      const { converted } = converter.convert(input);
      assert.strictEqual(converted, 'AtextBmore textC');
    });
  });
});
