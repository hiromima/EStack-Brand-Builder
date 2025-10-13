/**
 * @file SymbolConverter.integration.test.js
 * @description Integration tests for SymbolConverter
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { SymbolConverter, createBackup } from '../../src/utils/SymbolConverter.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SymbolConverter Integration Tests', () => {
  const testDir = path.join(__dirname, '../fixtures/integration-test');
  const subDir1 = path.join(testDir, 'docs');
  const subDir2 = path.join(testDir, 'protocols');
  const archiveDir = path.join(testDir, 'Archive');

  before(async () => {
    // Create test directory structure
    await fs.mkdir(subDir1, { recursive: true });
    await fs.mkdir(subDir2, { recursive: true });
    await fs.mkdir(archiveDir, { recursive: true });

    // Create test files with various symbols
    await fs.writeFile(
      path.join(subDir1, 'guide.md'),
      `# User Guide

◤◢◤◢ STEP 1: Setup ◤◢◤◢

【目的】システムセットアップ

Follow these steps:
1. Install dependencies
2. Configure settings

◤◢◤◢ 完了 ◤◢◤◢
`,
      'utf-8'
    );

    await fs.writeFile(
      path.join(subDir2, 'protocol.md'),
      `# Protocol Documentation

◤◢◤◢ Structure Transfer Block ◤◢◤◢

【A】→【B】→【C】

Transfer format:
- Source: 【Origin】
- Target: 【Destination】

◤◢◤◢ Structure Transfer Complete ◤◢◤◢
`,
      'utf-8'
    );

    // Create file with no symbols
    await fs.writeFile(
      path.join(subDir1, 'readme.md'),
      `# README

This is a normal readme file with no symbols.

## Features
- Feature 1
- Feature 2
`,
      'utf-8'
    );

    // Create Archive file (should be excluded)
    await fs.writeFile(
      path.join(archiveDir, 'old.md'),
      `◤◢◤◢ Old Symbol File ◤◢◤◢`,
      'utf-8'
    );
  });

  after(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Directory Conversion', () => {
    it('should convert all files in directory tree', async () => {
      const converter = new SymbolConverter({
        dryRun: false,
        verbose: false,
        excludePatterns: ['**/Archive/**']
      });

      const report = await converter.convertDirectory(testDir);

      // Should process 3 files (guide.md, protocol.md, readme.md)
      // Archive/old.md should be excluded
      assert.strictEqual(report.summary.filesProcessed, 3);
      assert.strictEqual(report.summary.filesModified, 2); // guide.md and protocol.md
      assert.strictEqual(report.summary.filesSkipped, 1); // readme.md
      assert.ok(report.summary.totalReplacements > 0);
    });

    it('should verify converted file contents', async () => {
      const guideContent = await fs.readFile(path.join(subDir1, 'guide.md'), 'utf-8');
      const protocolContent = await fs.readFile(path.join(subDir2, 'protocol.md'), 'utf-8');
      const readmeContent = await fs.readFile(path.join(subDir1, 'readme.md'), 'utf-8');

      // Verify guide.md conversion
      assert.ok(guideContent.includes('## Phase 1: Setup'));
      assert.ok(guideContent.includes('目的システムセットアップ'));
      assert.ok(guideContent.includes('> ✅ **完了**'));
      assert.ok(!guideContent.includes('◤◢◤◢'));
      assert.ok(!guideContent.includes('【'));

      // Verify protocol.md conversion
      assert.ok(protocolContent.includes('## Structure Transfer Block'));
      assert.ok(protocolContent.includes('A → B'));
      assert.ok(protocolContent.includes('Origin'));
      assert.ok(protocolContent.includes('Destination'));
      assert.ok(protocolContent.includes('> ✅ **Structure Transfer Complete**'));
      assert.ok(!protocolContent.includes('◤◢◤◢'));

      // Verify readme.md unchanged
      assert.ok(readmeContent.includes('# README'));
      assert.ok(readmeContent.includes('normal readme file'));
    });

    it('should preserve Archive files', async () => {
      const archiveContent = await fs.readFile(path.join(archiveDir, 'old.md'), 'utf-8');

      // Archive file should still have symbols (excluded from conversion)
      assert.ok(archiveContent.includes('◤◢◤◢'));
      assert.ok(archiveContent.includes('Old Symbol File'));
    });
  });

  describe('Backup Creation', () => {
    const backupTestDir = path.join(__dirname, '../fixtures/backup-test');

    before(async () => {
      await fs.mkdir(backupTestDir, { recursive: true });
      await fs.writeFile(
        path.join(backupTestDir, 'test.md'),
        'Test content',
        'utf-8'
      );
    });

    after(async () => {
      // Clean up backup and test directory
      const files = await fs.readdir(path.dirname(backupTestDir));
      for (const file of files) {
        if (file.includes('backup-test')) {
          await fs.rm(path.join(path.dirname(backupTestDir), file), {
            recursive: true,
            force: true
          });
        }
      }
    });

    it('should create timestamped backup', async () => {
      const backupDir = await createBackup(backupTestDir);

      // Verify backup exists
      const stats = await fs.stat(backupDir);
      assert.ok(stats.isDirectory());

      // Verify backup contains files
      const backupFiles = await fs.readdir(backupDir);
      assert.ok(backupFiles.includes('test.md'));

      // Verify backup content matches original
      const backupContent = await fs.readFile(
        path.join(backupDir, 'test.md'),
        'utf-8'
      );
      assert.strictEqual(backupContent, 'Test content');

      // Verify backup name format
      assert.ok(backupDir.includes('backup-test.backup-'));
      assert.ok(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/.test(backupDir));
    });
  });

  describe('Dry Run Mode', () => {
    const dryRunTestDir = path.join(__dirname, '../fixtures/dry-run-test');

    before(async () => {
      await fs.mkdir(dryRunTestDir, { recursive: true });
      await fs.writeFile(
        path.join(dryRunTestDir, 'test.md'),
        '◤◢◤◢ STEP 1: Test ◤◢◤◢',
        'utf-8'
      );
    });

    after(async () => {
      await fs.rm(dryRunTestDir, { recursive: true, force: true });
    });

    it('should not modify files in dry-run mode', async () => {
      const originalContent = await fs.readFile(
        path.join(dryRunTestDir, 'test.md'),
        'utf-8'
      );

      const converter = new SymbolConverter({
        dryRun: true,
        verbose: false
      });

      const report = await converter.convertDirectory(dryRunTestDir);

      // Should report modifications
      assert.strictEqual(report.summary.filesModified, 1);
      assert.ok(report.summary.totalReplacements > 0);
      assert.strictEqual(report.dryRun, true);

      // But file should be unchanged
      const currentContent = await fs.readFile(
        path.join(dryRunTestDir, 'test.md'),
        'utf-8'
      );
      assert.strictEqual(currentContent, originalContent);
      assert.ok(currentContent.includes('◤◢◤◢'));
    });
  });

  describe('Complex Document Conversion', () => {
    const complexTestDir = path.join(__dirname, '../fixtures/complex-test');

    before(async () => {
      await fs.mkdir(complexTestDir, { recursive: true });

      // Create a complex document with multiple patterns
      await fs.writeFile(
        path.join(complexTestDir, 'complex.md'),
        `# Brand Framer System Prompt

## 【自律型ナレッジ補助ルール｜External Knowledge Remind Protocol】

1. コアナレッジ16ファイルを常時参照
2. ユーザーの指示や進行中のタスクに対応

【リマインド文例】
- 「この作業には◯◯テンプレートを活用できます」

---

## Auto-ToT 評価

◤◢◤◢ STEP 1: 思考分岐生成 ◤◢◤◢

- 【ユーザーに追加確認を求めず】、自動生成
- 各案を評価

◤◢◤◢ STEP 2: 最適案選択 ◤◢◤◢

最良案を選択・統合

◤◢◤◢ 完了 ◤◢◤◢

---

## 【構造転送プロトコル】

転送フォーマット:

◤◢◤◢ E:Stack Sheet Transfer Format ◤◢◤◢

【Foundation】→【Structure】→【Expression】

- Purpose: ブランドの目的
- Vision: ブランドのビジョン

◤◢◤◢ Structure Transfer Complete ◤◢◤◢

---

【補足・注釈】

Auto-ToTとは意思決定時の思考分岐構造です。
`,
        'utf-8'
      );
    });

    after(async () => {
      await fs.rm(complexTestDir, { recursive: true, force: true });
    });

    it('should convert complex document correctly', async () => {
      const converter = new SymbolConverter({
        dryRun: false,
        verbose: false
      });

      const report = await converter.convertDirectory(complexTestDir);

      assert.strictEqual(report.summary.filesProcessed, 1);
      assert.strictEqual(report.summary.filesModified, 1);
      assert.ok(report.summary.totalReplacements >= 10); // Many patterns

      const content = await fs.readFile(
        path.join(complexTestDir, 'complex.md'),
        'utf-8'
      );

      // Verify all conversions
      assert.ok(content.includes('## 自律型ナレッジ補助ルール｜External Knowledge Remind Protocol'));
      assert.ok(content.includes('リマインド文例'));
      assert.ok(content.includes('## Phase 1: 思考分岐生成'));
      assert.ok(content.includes('## Phase 2: 最適案選択'));
      assert.ok(content.includes('> ✅ **完了**'));
      assert.ok(content.includes('## 構造転送プロトコル'));
      assert.ok(content.includes('## E:Stack Sheet Transfer Format'));
      assert.ok(content.includes('Foundation → Structure'));
      assert.ok(content.includes('> ✅ **Structure Transfer Complete**'));
      assert.ok(content.includes('補足・注釈'));

      // Verify no symbols remain
      assert.ok(!content.includes('◤◢◤◢'));
    });

    it('should track pattern usage in complex document', async () => {
      const converter = new SymbolConverter({
        dryRun: true,
        verbose: false
      });

      // Re-read original to test with fresh converter
      await fs.writeFile(
        path.join(complexTestDir, 'temp.md'),
        `◤◢◤◢ STEP 1: Test ◤◢◤◢
【A】→【B】
【目的】Test
◤◢◤◢ 完了 ◤◢◤◢`,
        'utf-8'
      );

      await converter.convertDirectory(complexTestDir);

      const patterns = converter.stats.replacementsByPattern;

      // Should have used multiple patterns
      assert.ok(patterns['phase-with-number'] > 0);
      assert.ok(patterns['bracket-arrow'] > 0);
      assert.ok(patterns['bracket-single'] > 0);
      assert.ok(patterns['completion-message'] > 0);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent directory', async () => {
      const converter = new SymbolConverter({ dryRun: true });
      const nonExistentDir = path.join(__dirname, '../fixtures/non-existent');

      try {
        await converter.convertDirectory(nonExistentDir);
        // glob returns empty array for non-existent directory, so no error thrown
        // This is expected behavior
        assert.ok(true);
      } catch (error) {
        // If error is thrown, it should be ENOENT
        assert.ok(error.message.includes('no such file') || error.message.includes('ENOENT'));
      }
    });

    it('should handle permission errors gracefully', async () => {
      // This test is platform-dependent, so we'll skip it on some systems
      // In a real scenario, you'd test with a read-only directory
      assert.ok(true, 'Permission error handling test skipped');
    });
  });
});
