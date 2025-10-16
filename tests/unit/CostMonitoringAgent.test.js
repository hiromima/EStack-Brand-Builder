/**
 * @file CostMonitoringAgent.test.js
 * @description Unit tests for CostMonitoringAgent
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { CostMonitoringAgent } from '../../src/agents/support/CostMonitoringAgent.js';
import fs from 'fs/promises';
import path from 'path';

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(process.cwd(), 'tests/fixtures/cost_monitoring_test');
const TEST_CONFIG = path.join(TEST_DIR, 'BUDGET.yml');
const TEST_LOG = path.join(TEST_DIR, 'cost_tracking.json');

// テスト用の予算設定
const TEST_BUDGET_CONFIG = `
budget:
  monthly_limit: 100
  warning_threshold: 0.7
  critical_threshold: 0.9
  circuit_breaker_threshold: 0.95

services:
  anthropic:
    budget: 50
  openai:
    budget: 30
  google:
    budget: 20

circuit_breaker:
  actions:
    on_warning:
      - log_alert
      - create_github_issue
    on_critical:
      - log_alert
      - create_critical_issue
      - notify_guardian
      - reduce_operations
    on_emergency:
      - log_alert
      - notify_guardian
      - halt_all_operations
      - disable_workflows

emergency:
  guardian:
    github_username: hiromima
`;

describe('CostMonitoringAgent', () => {
  let agent;

  beforeEach(async () => {
    // テストディレクトリ作成
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.writeFile(TEST_CONFIG, TEST_BUDGET_CONFIG, 'utf-8');

    agent = new CostMonitoringAgent({
      configPath: TEST_CONFIG,
      logPath: TEST_LOG
    });
  });

  afterEach(async () => {
    // テストディレクトリクリーンアップ
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await agent.initialize();
      assert.ok(agent.budget);
      assert.strictEqual(agent.budget.budget.monthly_limit, 100);
    });

    it('should load budget configuration', async () => {
      await agent.initialize();
      assert.strictEqual(agent.budget.budget.monthly_limit, 100);
      assert.strictEqual(agent.budget.budget.warning_threshold, 0.7);
      assert.strictEqual(agent.budget.budget.critical_threshold, 0.9);
    });

    it('should initialize empty cost log', async () => {
      await agent.initialize();
      assert.ok(Array.isArray(agent.costLog));
      assert.strictEqual(agent.costLog.length, 0);
    });

    it('should load existing cost log', async () => {
      const existingLog = [
        {
          timestamp: new Date().toISOString(),
          service: 'anthropic',
          model: 'claude-sonnet-4-5-20250929',
          tokens: { input: 1000, output: 500 },
          estimated_cost: 0.01
        }
      ];
      await fs.writeFile(TEST_LOG, JSON.stringify(existingLog), 'utf-8');

      await agent.initialize();
      assert.strictEqual(agent.costLog.length, 1);
      assert.strictEqual(agent.costLog[0].service, 'anthropic');
    });
  });

  describe('Cost Estimation', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should estimate cost for Anthropic Claude', () => {
      const usage = {
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: { input: 1000, output: 500 }
      };

      const cost = agent.estimateCost(usage);
      // (1000 * 0.003 / 1000) + (500 * 0.015 / 1000) = 0.003 + 0.0075 = 0.0105
      assert.ok(cost > 0.01 && cost < 0.011);
    });

    it('should estimate cost for OpenAI GPT', () => {
      const usage = {
        service: 'openai',
        model: 'gpt-5',
        tokens: { input: 1000, output: 500 }
      };

      const cost = agent.estimateCost(usage);
      // (1000 * 0.005 / 1000) + (500 * 0.015 / 1000) = 0.005 + 0.0075 = 0.0125
      assert.ok(cost > 0.012 && cost < 0.013);
    });

    it('should estimate cost for Google Gemini', () => {
      const usage = {
        service: 'google',
        model: 'gemini-2.5-pro',
        tokens: { input: 1000, output: 500 }
      };

      const cost = agent.estimateCost(usage);
      // (1000 * 0.00125 / 1000) + (500 * 0.005 / 1000) = 0.00125 + 0.0025 = 0.00375
      assert.ok(cost > 0.003 && cost < 0.004);
    });

    it('should estimate cost for embedding model', () => {
      const usage = {
        service: 'openai',
        model: 'text-embedding-3-small',
        tokens: { input: 1000 }
      };

      const cost = agent.estimateCost(usage);
      // 1000 * 0.00002 / 1000 = 0.00002
      assert.ok(cost > 0 && cost < 0.0001);
    });

    it('should handle unknown model gracefully', () => {
      const usage = {
        service: 'unknown',
        model: 'unknown-model',
        tokens: { input: 1000 }
      };

      const cost = agent.estimateCost(usage);
      assert.strictEqual(cost, 0);
    });

    it('should handle usage without output tokens', () => {
      const usage = {
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: 1000 // Only input
      };

      const cost = agent.estimateCost(usage);
      // 1000 * 0.003 / 1000 = 0.003
      assert.ok(cost > 0.002 && cost < 0.004);
    });
  });

  describe('Usage Recording', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should record API usage', async () => {
      const usage = {
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: { input: 1000, output: 500 }
      };

      const record = await agent.recordUsage(usage);

      assert.ok(record);
      assert.ok(record.timestamp);
      assert.strictEqual(record.service, 'anthropic');
      assert.strictEqual(record.model, 'claude-sonnet-4-5-20250929');
      assert.ok(record.estimated_cost > 0);
    });

    it('should save usage to log file', async () => {
      const usage = {
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: { input: 1000, output: 500 }
      };

      await agent.recordUsage(usage);

      const content = await fs.readFile(TEST_LOG, 'utf-8');
      const log = JSON.parse(content);

      assert.strictEqual(log.length, 1);
      assert.strictEqual(log[0].service, 'anthropic');
    });

    it('should accumulate multiple usage records', async () => {
      await agent.recordUsage({
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: { input: 1000, output: 500 }
      });

      await agent.recordUsage({
        service: 'openai',
        model: 'gpt-5',
        tokens: { input: 2000, output: 1000 }
      });

      assert.strictEqual(agent.costLog.length, 2);
    });

    it('should include metadata in record', async () => {
      const usage = {
        service: 'anthropic',
        model: 'claude-sonnet-4-5-20250929',
        tokens: { input: 1000, output: 500 },
        metadata: {
          agent: 'CopyAgent',
          task: 'generate_headline'
        }
      };

      const record = await agent.recordUsage(usage);

      assert.deepStrictEqual(record.metadata, usage.metadata);
    });
  });

  describe('Cost Calculation', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should calculate current month costs', async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 今月の使用記録を追加
      agent.costLog = [
        {
          timestamp: new Date(now.getTime() - 1000).toISOString(),
          service: 'anthropic',
          estimated_cost: 5.0
        },
        {
          timestamp: new Date(now.getTime() - 2000).toISOString(),
          service: 'openai',
          estimated_cost: 3.0
        }
      ];

      const costs = agent.getCurrentMonthCosts();

      assert.strictEqual(costs.total, 8.0);
      assert.strictEqual(costs.recordCount, 2);
      assert.strictEqual(costs.byService.anthropic, 5.0);
      assert.strictEqual(costs.byService.openai, 3.0);
    });

    it('should exclude previous month costs', async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      agent.costLog = [
        {
          timestamp: now.toISOString(),
          service: 'anthropic',
          estimated_cost: 5.0
        },
        {
          timestamp: lastMonth.toISOString(),
          service: 'openai',
          estimated_cost: 10.0
        }
      ];

      const costs = agent.getCurrentMonthCosts();

      assert.strictEqual(costs.total, 5.0);
      assert.strictEqual(costs.recordCount, 1);
    });

    it('should project monthly costs based on daily average', () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 月初から5日経過、10ドル使用と仮定
      agent.costLog = [
        {
          timestamp: new Date(monthStart.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_cost: 2.0
        },
        {
          timestamp: new Date(monthStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_cost: 3.0
        },
        {
          timestamp: new Date(monthStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_cost: 5.0
        }
      ];

      const projection = agent.projectMonthlyCosts();

      assert.strictEqual(projection.current, 10.0);
      assert.ok(projection.projected > projection.current);
      assert.ok(projection.dailyAverage > 0);
      assert.ok(projection.percentOfBudget > 0);
    });
  });

  describe('Threshold Checking', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should return normal status when under warning threshold', async () => {
      // 月の半分経過、予算の30%使用（60% projected）
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysElapsed = 15;

      agent.costLog = [
        {
          timestamp: new Date(monthStart.getTime() + daysElapsed * 24 * 60 * 60 * 1000).toISOString(),
          estimated_cost: 30.0
        }
      ];

      const status = await agent.checkThresholds();

      assert.strictEqual(status.status, 'normal');
      assert.strictEqual(status.actions_required.length, 0);
    });

    it('should trigger warning at 70% threshold', async () => {
      // 予算の70%に達するよう設定
      // 月の3分の2経過時点で46.67ドル使用 = projected 70ドル
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const totalDays = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
      const targetDaysElapsed = totalDays * 0.67; // 67% of month elapsed

      const targetTimestamp = new Date(monthStart.getTime() + targetDaysElapsed * 24 * 60 * 60 * 1000);

      agent.costLog = [
        {
          timestamp: targetTimestamp.toISOString(),
          estimated_cost: 46.67 // 67% elapsed with 46.67 = ~70 projected
        }
      ];

      const status = await agent.checkThresholds();

      assert.strictEqual(status.status, 'warning');
      assert.ok(status.actions_required.includes('log_alert'));
    });

    it('should trigger critical at 90% threshold', async () => {
      // 予算の90%に達するよう設定（95%を超えない）
      // 現在の月の経過率を計算し、それに基づいて90%projectedになるコストを設定
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const totalDays = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
      const daysElapsed = (now - monthStart) / (1000 * 60 * 60 * 24);

      // projected = (current / daysElapsed) * totalDays = 90
      // current = 90 * daysElapsed / totalDays
      const targetCurrent = 90 * daysElapsed / totalDays;

      agent.costLog = [
        {
          timestamp: now.toISOString(),
          estimated_cost: targetCurrent
        }
      ];

      const status = await agent.checkThresholds();

      assert.strictEqual(status.status, 'critical');
      assert.ok(status.actions_required.includes('notify_guardian'));
    });

    it('should trigger emergency at 95% threshold', async () => {
      // 予算の95%に達するよう設定
      // 月の3分の2経過時点で63.67ドル使用 = projected 95ドル
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const totalDays = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
      const targetDaysElapsed = totalDays * 0.67;

      const targetTimestamp = new Date(monthStart.getTime() + targetDaysElapsed * 24 * 60 * 60 * 1000);

      agent.costLog = [
        {
          timestamp: targetTimestamp.toISOString(),
          estimated_cost: 63.67 // 67% elapsed with 63.67 = ~95 projected
        }
      ];

      const status = await agent.checkThresholds();

      assert.strictEqual(status.status, 'emergency');
      assert.ok(status.actions_required.includes('halt_all_operations'));
    });
  });

  describe('Report Generation', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should generate cost report', () => {
      agent.costLog = [
        {
          timestamp: new Date().toISOString(),
          service: 'anthropic',
          estimated_cost: 25.0
        },
        {
          timestamp: new Date().toISOString(),
          service: 'openai',
          estimated_cost: 15.0
        },
        {
          timestamp: new Date().toISOString(),
          service: 'google',
          estimated_cost: 10.0
        }
      ];

      const report = agent.generateReport();

      assert.ok(report.includes('COST MONITORING REPORT'));
      assert.ok(report.includes('anthropic'));
      assert.ok(report.includes('openai'));
      assert.ok(report.includes('google'));
      assert.ok(report.includes('Projection:'));
    });

    it('should show correct status in report', () => {
      // 低使用量
      agent.costLog = [
        {
          timestamp: new Date().toISOString(),
          service: 'anthropic',
          estimated_cost: 5.0
        }
      ];

      const report = agent.generateReport();
      assert.ok(report.includes('✅ NORMAL'));
    });
  });
});
