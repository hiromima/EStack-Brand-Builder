/**
 * @file CostMonitoringAgent.js
 * @description Cost monitoring and economic circuit breaker agent
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CostMonitoringAgent
 *
 * Responsibilities:
 * 1. Monitor API costs in real-time
 * 2. Project monthly costs based on current usage
 * 3. Trigger circuit breaker when threshold exceeded
 * 4. Generate cost reports and recommendations
 */
export class CostMonitoringAgent {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || path.join(process.cwd(), '.miyabi/BUDGET.yml'),
      logPath: options.logPath || path.join(process.cwd(), '.miyabi/logs/cost_tracking.json'),
      ...options
    };

    this.budget = null;
    this.costLog = [];
    this.lastCheck = null;
  }

  /**
   * Initialize agent
   */
  async initialize() {
    // Load budget configuration
    await this.loadBudgetConfig();

    // Ensure log directory exists
    const logDir = path.dirname(this.options.logPath);
    await fs.mkdir(logDir, { recursive: true });

    // Load existing cost log
    await this.loadCostLog();

    console.log('✅ CostMonitoringAgent initialized');
  }

  /**
   * Load budget configuration
   */
  async loadBudgetConfig() {
    try {
      const content = await fs.readFile(this.options.configPath, 'utf-8');
      this.budget = yaml.load(content);
      console.log(`📊 Budget loaded: $${this.budget.budget.monthly_limit}/month`);
    } catch (error) {
      throw new Error(`Failed to load budget config: ${error.message}`);
    }
  }

  /**
   * Load cost log
   */
  async loadCostLog() {
    try {
      const content = await fs.readFile(this.options.logPath, 'utf-8');
      this.costLog = JSON.parse(content);
      console.log(`📋 Cost log loaded: ${this.costLog.length} entries`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.costLog = [];
        console.log('📋 Cost log initialized (new)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Save cost log
   */
  async saveCostLog() {
    await fs.writeFile(
      this.options.logPath,
      JSON.stringify(this.costLog, null, 2),
      'utf-8'
    );
  }

  /**
   * Record API usage
   * @param {Object} usage - API usage record
   */
  async recordUsage(usage) {
    const record = {
      timestamp: new Date().toISOString(),
      service: usage.service,
      model: usage.model,
      tokens: usage.tokens || 0,
      requests: usage.requests || 1,
      estimated_cost: this.estimateCost(usage),
      metadata: usage.metadata || {}
    };

    this.costLog.push(record);
    await this.saveCostLog();

    return record;
  }

  /**
   * Estimate cost for usage
   * @param {Object} usage - Usage data
   * @returns {number} Estimated cost in USD
   */
  estimateCost(usage) {
    // Pricing (as of 2025-10)
    const pricing = {
      anthropic: {
        'claude-sonnet-4-5-20250929': {
          input: 0.003,  // per 1K tokens
          output: 0.015
        }
      },
      openai: {
        'gpt-5': {
          input: 0.005,
          output: 0.015
        },
        'text-embedding-3-small': {
          input: 0.00002,
          output: 0
        }
      },
      google: {
        'gemini-2.5-pro': {
          input: 0.00125,
          output: 0.005
        }
      }
    };

    const servicePricing = pricing[usage.service]?.[usage.model];
    if (!servicePricing) {
      console.warn(`⚠️  Unknown pricing for ${usage.service}:${usage.model}`);
      return 0;
    }

    const inputCost = (usage.tokens?.input || usage.tokens || 0) / 1000 * servicePricing.input;
    const outputCost = (usage.tokens?.output || 0) / 1000 * servicePricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get current month costs
   * @returns {Object} Cost summary
   */
  getCurrentMonthCosts() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthRecords = this.costLog.filter(record =>
      new Date(record.timestamp) >= monthStart
    );

    const total = monthRecords.reduce((sum, record) => sum + record.estimated_cost, 0);

    const byService = {};
    for (const record of monthRecords) {
      if (!byService[record.service]) {
        byService[record.service] = 0;
      }
      byService[record.service] += record.estimated_cost;
    }

    return {
      total,
      byService,
      recordCount: monthRecords.length,
      period: {
        start: monthStart.toISOString(),
        end: now.toISOString()
      }
    };
  }

  /**
   * Project monthly costs
   * @returns {Object} Projected costs
   */
  projectMonthlyCosts() {
    const current = this.getCurrentMonthCosts();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const daysElapsed = (now - monthStart) / (1000 * 60 * 60 * 24);
    const totalDays = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);

    const projectedTotal = (current.total / daysElapsed) * totalDays;

    return {
      current: current.total,
      projected: projectedTotal,
      daysElapsed,
      totalDays,
      dailyAverage: current.total / daysElapsed,
      percentOfBudget: (projectedTotal / this.budget.budget.monthly_limit) * 100
    };
  }

  /**
   * Check thresholds and trigger alerts
   * @returns {Object} Check result
   */
  async checkThresholds() {
    const projection = this.projectMonthlyCosts();
    const budget = this.budget.budget;

    const status = {
      timestamp: new Date().toISOString(),
      current_cost: projection.current,
      projected_cost: projection.projected,
      monthly_limit: budget.monthly_limit,
      percent_of_budget: projection.percentOfBudget,
      status: 'normal',
      actions_required: []
    };

    // Check thresholds
    if (projection.percentOfBudget >= budget.circuit_breaker_threshold * 100) {
      status.status = 'emergency';
      status.actions_required = this.budget.circuit_breaker.actions.on_emergency;
      await this.triggerCircuitBreaker('emergency', status);
    } else if (projection.percentOfBudget >= budget.critical_threshold * 100) {
      status.status = 'critical';
      status.actions_required = this.budget.circuit_breaker.actions.on_critical;
      await this.triggerCircuitBreaker('critical', status);
    } else if (projection.percentOfBudget >= budget.warning_threshold * 100) {
      status.status = 'warning';
      status.actions_required = this.budget.circuit_breaker.actions.on_warning;
      await this.triggerCircuitBreaker('warning', status);
    }

    this.lastCheck = status;
    return status;
  }

  /**
   * Trigger circuit breaker
   * @param {string} level - Alert level
   * @param {Object} status - Status information
   */
  async triggerCircuitBreaker(level, status) {
    console.log(`\n${'🚨'.repeat(3)} CIRCUIT BREAKER TRIGGERED: ${level.toUpperCase()} ${'🚨'.repeat(3)}`);
    console.log(`Projected cost: $${status.projected_cost.toFixed(2)}`);
    console.log(`Monthly limit: $${status.monthly_limit}`);
    console.log(`Percent of budget: ${status.percent_of_budget.toFixed(1)}%`);
    console.log(`Actions required: ${status.actions_required.join(', ')}\n`);

    // Log alert
    await this.logAlert(level, status);

    // Execute configured actions
    for (const action of status.actions_required) {
      await this.executeAction(action, level, status);
    }
  }

  /**
   * Log alert
   */
  async logAlert(level, status) {
    const alertLog = {
      timestamp: status.timestamp,
      level,
      status
    };

    const alertLogPath = path.join(
      path.dirname(this.options.logPath),
      'cost_alerts.json'
    );

    let alerts = [];
    try {
      const content = await fs.readFile(alertLogPath, 'utf-8');
      alerts = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    alerts.push(alertLog);
    await fs.writeFile(alertLogPath, JSON.stringify(alerts, null, 2), 'utf-8');
  }

  /**
   * Execute circuit breaker action
   */
  async executeAction(action, level, status) {
    switch (action) {
      case 'log_alert':
        console.log(`✅ Action: Alert logged`);
        break;

      case 'create_github_issue':
      case 'create_critical_issue':
        console.log(`⚠️  Action: GitHub Issue creation required`);
        console.log(`   Use GitHub CLI: gh issue create --title "Cost Alert: ${level}" ...`);
        break;

      case 'notify_guardian':
        console.log(`📧 Action: Guardian notification required`);
        console.log(`   Guardian: ${this.budget.emergency.guardian.github_username}`);
        break;

      case 'reduce_operations':
        console.log(`⏸️  Action: Reducing non-critical operations`);
        // Implemented by workflow
        break;

      case 'halt_all_operations':
        console.log(`🛑 Action: Halting all automated operations`);
        // Implemented by workflow
        break;

      case 'disable_workflows':
        console.log(`🔴 Action: Disabling GitHub Actions workflows`);
        // Implemented by workflow
        break;

      default:
        console.log(`❓ Unknown action: ${action}`);
    }
  }

  /**
   * Generate cost report
   * @returns {string} Report
   */
  generateReport() {
    const current = this.getCurrentMonthCosts();
    const projection = this.projectMonthlyCosts();

    let report = '\n' + '='.repeat(70) + '\n';
    report += 'COST MONITORING REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Period: ${new Date(current.period.start).toLocaleDateString()} - ${new Date(current.period.end).toLocaleDateString()}\n\n`;

    report += 'Current Month Costs:\n';
    report += '-'.repeat(70) + '\n';
    report += `  Total: $${current.total.toFixed(2)}\n`;
    report += `  Records: ${current.recordCount}\n\n`;

    report += 'By Service:\n';
    for (const [service, cost] of Object.entries(current.byService)) {
      const budget = this.budget.services[service]?.budget || 0;
      const percent = budget > 0 ? (cost / budget) * 100 : 0;
      report += `  ${service}: $${cost.toFixed(2)} / $${budget} (${percent.toFixed(1)}%)\n`;
    }

    report += '\n' + '-'.repeat(70) + '\n';
    report += 'Projection:\n';
    report += '-'.repeat(70) + '\n';
    report += `  Days elapsed: ${projection.daysElapsed.toFixed(1)} / ${projection.totalDays}\n`;
    report += `  Daily average: $${projection.dailyAverage.toFixed(2)}\n`;
    report += `  Projected total: $${projection.projected.toFixed(2)}\n`;
    report += `  Monthly limit: $${this.budget.budget.monthly_limit}\n`;
    report += `  Percent of budget: ${projection.percentOfBudget.toFixed(1)}%\n\n`;

    const status = projection.percentOfBudget >= this.budget.budget.critical_threshold * 100 ? '🔴 CRITICAL' :
                   projection.percentOfBudget >= this.budget.budget.warning_threshold * 100 ? '⚠️  WARNING' :
                   '✅ NORMAL';

    report += `Status: ${status}\n`;
    report += '='.repeat(70) + '\n';

    return report;
  }
}

/**
 * Default export
 */
export default CostMonitoringAgent;
