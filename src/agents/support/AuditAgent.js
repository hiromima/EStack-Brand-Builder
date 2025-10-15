/**
 * @file AuditAgent.js
 * @description Security auditing, access log analysis, and anomaly detection
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AuditAgent
 *
 * Responsibilities:
 * 1. Security audit of system operations
 * 2. Access log analysis
 * 3. Anomaly detection
 * 4. Compliance verification
 * 5. Audit trail maintenance
 */
export class AuditAgent {
  constructor(options = {}) {
    this.options = {
      auditLogPath: options.auditLogPath || path.join(process.cwd(), '.miyabi/logs/audit.log'),
      retentionDays: options.retentionDays || 365,
      alertThresholds: options.alertThresholds || {
        failed_operations: 10,
        unusual_access_patterns: 5,
        security_violations: 1
      },
      ...options
    };

    this.auditEntries = [];
    this.anomalies = [];
    this.baseline = null;
  }

  /**
   * Initialize agent
   */
  async initialize() {
    const logDir = path.dirname(this.options.auditLogPath);
    await fs.mkdir(logDir, { recursive: true });

    await this.loadAuditLog();
    await this.buildBaseline();

    console.log('✅ AuditAgent initialized');
  }

  /**
   * Load audit log
   */
  async loadAuditLog() {
    try {
      const content = await fs.readFile(this.options.auditLogPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      this.auditEntries = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(entry => entry !== null);

      console.log(`📋 Audit log loaded: ${this.auditEntries.length} entries`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.auditEntries = [];
        console.log('📋 Audit log initialized (new)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Build baseline for anomaly detection
   */
  async buildBaseline() {
    if (this.auditEntries.length < 100) {
      console.log('⚠️  Insufficient data for baseline (minimum 100 entries)');
      this.baseline = this.getDefaultBaseline();
      return;
    }

    const recentEntries = this.auditEntries.slice(-1000); // Last 1000 entries

    this.baseline = {
      timestamp: new Date().toISOString(),
      metrics: {
        operations_per_hour: this.calculateOperationsPerHour(recentEntries),
        error_rate: this.calculateErrorRate(recentEntries),
        common_operations: this.getTopOperations(recentEntries, 10),
        common_agents: this.getTopAgents(recentEntries, 10),
        access_patterns: this.analyzeAccessPatterns(recentEntries)
      }
    };

    console.log('📊 Baseline established from recent operations');
  }

  /**
   * Get default baseline
   */
  getDefaultBaseline() {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        operations_per_hour: 10,
        error_rate: 0.05,
        common_operations: [],
        common_agents: [],
        access_patterns: {
          peak_hours: [9, 10, 11, 14, 15, 16],
          weekend_activity: 0.2
        }
      }
    };
  }

  /**
   * Calculate operations per hour
   */
  calculateOperationsPerHour(entries) {
    if (entries.length === 0) return 0;

    const first = new Date(entries[0].timestamp);
    const last = new Date(entries[entries.length - 1].timestamp);
    const hours = (last - first) / (1000 * 60 * 60);

    return hours > 0 ? entries.length / hours : 0;
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(entries) {
    if (entries.length === 0) return 0;

    const errors = entries.filter(e => e.level === 'ERROR' || e.success === false);
    return errors.length / entries.length;
  }

  /**
   * Get top operations
   */
  getTopOperations(entries, limit = 10) {
    const counts = {};

    for (const entry of entries) {
      const op = entry.operation || entry.action || 'unknown';
      counts[op] = (counts[op] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([operation, count]) => ({ operation, count }));
  }

  /**
   * Get top agents
   */
  getTopAgents(entries, limit = 10) {
    const counts = {};

    for (const entry of entries) {
      const agent = entry.agent || 'unknown';
      counts[agent] = (counts[agent] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([agent, count]) => ({ agent, count }));
  }

  /**
   * Analyze access patterns
   */
  analyzeAccessPatterns(entries) {
    const hourCounts = new Array(24).fill(0);
    const dayOfWeekCounts = new Array(7).fill(0);

    for (const entry of entries) {
      const date = new Date(entry.timestamp);
      hourCounts[date.getHours()]++;
      dayOfWeekCounts[date.getDay()]++;
    }

    // Find peak hours (top 6 hours)
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(h => h.hour)
      .sort((a, b) => a - b);

    // Calculate weekend activity ratio
    const weekdayTotal = dayOfWeekCounts.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekendTotal = dayOfWeekCounts[0] + dayOfWeekCounts[6];
    const weekendActivity = weekdayTotal > 0 ? weekendTotal / weekdayTotal : 0;

    return {
      peak_hours: peakHours,
      weekend_activity: weekendActivity
    };
  }

  /**
   * Log audit entry
   * @param {Object} entry - Audit entry
   */
  async logEntry(entry) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level || 'INFO',
      agent: entry.agent || 'unknown',
      operation: entry.operation,
      success: entry.success !== false,
      details: entry.details || {},
      user: entry.user || 'system',
      ip_address: entry.ip_address || 'localhost'
    };

    this.auditEntries.push(auditEntry);

    // Append to log file (JSON lines format)
    await fs.appendFile(
      this.options.auditLogPath,
      JSON.stringify(auditEntry) + '\n',
      'utf-8'
    );

    // Check for anomalies
    await this.detectAnomalies(auditEntry);

    return auditEntry;
  }

  /**
   * Detect anomalies in audit entry
   * @param {Object} entry - Audit entry
   */
  async detectAnomalies(entry) {
    if (!this.baseline) return;

    const anomalies = [];

    // Check 1: Failed operation
    if (!entry.success) {
      const recentFailures = this.getRecentEntries(600) // Last 10 minutes
        .filter(e => e.operation === entry.operation && !e.success);

      if (recentFailures.length >= this.options.alertThresholds.failed_operations) {
        anomalies.push({
          type: 'repeated_failures',
          severity: 'high',
          message: `${recentFailures.length} failures of operation "${entry.operation}" in last 10 minutes`,
          entries: recentFailures.length
        });
      }
    }

    // Check 2: Unusual access time
    const hour = new Date(entry.timestamp).getHours();
    if (!this.baseline.metrics.access_patterns.peak_hours.includes(hour)) {
      const dayOfWeek = new Date(entry.timestamp).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend || hour < 6 || hour > 22) {
        anomalies.push({
          type: 'unusual_access_time',
          severity: 'medium',
          message: `Operation at unusual time: ${hour}:00 (${isWeekend ? 'weekend' : 'off-peak'})`,
          hour,
          is_weekend: isWeekend
        });
      }
    }

    // Check 3: Unusual operation
    const commonOps = this.baseline.metrics.common_operations.map(o => o.operation);
    if (!commonOps.includes(entry.operation)) {
      anomalies.push({
        type: 'unusual_operation',
        severity: 'low',
        message: `Uncommon operation: ${entry.operation}`,
        operation: entry.operation
      });
    }

    // Check 4: Security-sensitive operations
    const securityOps = ['secret_access', 'config_change', 'user_add', 'permission_change'];
    if (securityOps.some(op => entry.operation.includes(op))) {
      anomalies.push({
        type: 'security_sensitive',
        severity: 'high',
        message: `Security-sensitive operation: ${entry.operation}`,
        operation: entry.operation,
        user: entry.user
      });
    }

    // Record anomalies
    if (anomalies.length > 0) {
      for (const anomaly of anomalies) {
        await this.recordAnomaly({
          ...anomaly,
          audit_entry: entry,
          detected_at: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Get recent entries
   * @param {number} seconds - Number of seconds to look back
   */
  getRecentEntries(seconds) {
    const cutoff = new Date(Date.now() - seconds * 1000);
    return this.auditEntries.filter(e => new Date(e.timestamp) >= cutoff);
  }

  /**
   * Record anomaly
   */
  async recordAnomaly(anomaly) {
    this.anomalies.push(anomaly);

    // Log to anomaly file
    const anomalyLogPath = path.join(
      path.dirname(this.options.auditLogPath),
      'anomalies.json'
    );

    let anomalies = [];
    try {
      const content = await fs.readFile(anomalyLogPath, 'utf-8');
      anomalies = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    anomalies.push(anomaly);
    await fs.writeFile(anomalyLogPath, JSON.stringify(anomalies, null, 2), 'utf-8');

    // Alert if high severity
    if (anomaly.severity === 'high') {
      console.log(`\n${'⚠️ '.repeat(3)}SECURITY ANOMALY DETECTED${'⚠️ '.repeat(3)}`);
      console.log(`Type: ${anomaly.type}`);
      console.log(`Message: ${anomaly.message}`);
      console.log(`Severity: ${anomaly.severity.toUpperCase()}\n`);
    }
  }

  /**
   * Run security audit
   * @returns {Object} Audit report
   */
  async runSecurityAudit() {
    console.log('\n' + '='.repeat(70));
    console.log('SECURITY AUDIT');
    console.log('='.repeat(70) + '\n');

    const report = {
      timestamp: new Date().toISOString(),
      period: this.getAuditPeriod(),
      findings: [],
      risk_level: 'low',
      recommendations: []
    };

    // Audit 1: Check for excessive failed operations
    const failedOps = this.auditEntries.filter(e => !e.success);
    const failureRate = failedOps.length / this.auditEntries.length;

    if (failureRate > 0.1) {
      report.findings.push({
        category: 'reliability',
        severity: 'high',
        message: `High failure rate: ${(failureRate * 100).toFixed(1)}%`,
        count: failedOps.length
      });
      report.risk_level = 'high';
      report.recommendations.push('Investigate and fix recurring errors');
    }

    // Audit 2: Check for unusual access patterns
    const recentAnomalies = this.anomalies.filter(a => {
      const age = Date.now() - new Date(a.detected_at).getTime();
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentAnomalies.length > this.options.alertThresholds.unusual_access_patterns) {
      report.findings.push({
        category: 'access_patterns',
        severity: 'medium',
        message: `${recentAnomalies.length} anomalies detected in last 24 hours`,
        count: recentAnomalies.length
      });

      if (report.risk_level === 'low') {
        report.risk_level = 'medium';
      }

      report.recommendations.push('Review anomaly patterns for potential security issues');
    }

    // Audit 3: Check for security-sensitive operations
    const securityOps = this.auditEntries.filter(e => {
      const sensOps = ['secret', 'config', 'permission', 'auth'];
      return sensOps.some(op => e.operation.toLowerCase().includes(op));
    });

    if (securityOps.length > 0) {
      report.findings.push({
        category: 'security_operations',
        severity: 'info',
        message: `${securityOps.length} security-sensitive operations performed`,
        count: securityOps.length
      });
      report.recommendations.push('Regularly review security-sensitive operations');
    }

    // Audit 4: Check log retention
    const oldestEntry = this.auditEntries[0];
    if (oldestEntry) {
      const age = (Date.now() - new Date(oldestEntry.timestamp).getTime()) / (1000 * 60 * 60 * 24);

      if (age > this.options.retentionDays) {
        report.findings.push({
          category: 'compliance',
          severity: 'low',
          message: `Audit logs exceed retention period (${age.toFixed(0)} days > ${this.options.retentionDays} days)`,
          age_days: Math.floor(age)
        });
        report.recommendations.push('Run log rotation to comply with retention policy');
      }
    }

    console.log(`Risk Level: ${report.risk_level.toUpperCase()}`);
    console.log(`Findings: ${report.findings.length}`);
    console.log(`Recommendations: ${report.recommendations.length}\n`);

    console.log('='.repeat(70) + '\n');

    return report;
  }

  /**
   * Get audit period
   */
  getAuditPeriod() {
    if (this.auditEntries.length === 0) {
      return {
        start: null,
        end: null,
        entries: 0
      };
    }

    return {
      start: this.auditEntries[0].timestamp,
      end: this.auditEntries[this.auditEntries.length - 1].timestamp,
      entries: this.auditEntries.length
    };
  }

  /**
   * Generate audit report
   */
  generateAuditReport(auditResults) {
    let report = '\n' + '='.repeat(70) + '\n';
    report += 'SECURITY AUDIT REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Timestamp: ${auditResults.timestamp}\n`;
    report += `Period: ${new Date(auditResults.period.start).toLocaleDateString()} - ${new Date(auditResults.period.end).toLocaleDateString()}\n`;
    report += `Total entries: ${auditResults.period.entries}\n`;
    report += `Risk level: ${auditResults.risk_level.toUpperCase()}\n\n`;

    if (auditResults.findings.length > 0) {
      report += 'Findings:\n';
      report += '-'.repeat(70) + '\n';

      for (const finding of auditResults.findings) {
        const icon = finding.severity === 'high' ? '🔴' :
                     finding.severity === 'medium' ? '🟡' :
                     finding.severity === 'low' ? '🟢' : 'ℹ️';

        report += `${icon} [${finding.severity.toUpperCase()}] ${finding.category}\n`;
        report += `   ${finding.message}\n`;

        if (finding.count) {
          report += `   Count: ${finding.count}\n`;
        }

        report += '\n';
      }
    }

    if (auditResults.recommendations.length > 0) {
      report += 'Recommendations:\n';
      report += '-'.repeat(70) + '\n';

      for (let i = 0; i < auditResults.recommendations.length; i++) {
        report += `${i + 1}. ${auditResults.recommendations[i]}\n`;
      }

      report += '\n';
    }

    report += '='.repeat(70) + '\n';

    return report;
  }

  /**
   * Rotate logs
   * @returns {Object} Rotation summary
   */
  async rotateLogs() {
    const cutoff = new Date(Date.now() - this.options.retentionDays * 24 * 60 * 60 * 1000);

    const retained = this.auditEntries.filter(e => new Date(e.timestamp) >= cutoff);
    const archived = this.auditEntries.filter(e => new Date(e.timestamp) < cutoff);

    if (archived.length === 0) {
      console.log('✅ No logs to rotate');
      return { retained: retained.length, archived: 0 };
    }

    // Archive old logs
    const archivePath = path.join(
      path.dirname(this.options.auditLogPath),
      `audit_archive_${new Date().toISOString().split('T')[0]}.log`
    );

    await fs.writeFile(
      archivePath,
      archived.map(e => JSON.stringify(e)).join('\n'),
      'utf-8'
    );

    // Update current log
    await fs.writeFile(
      this.options.auditLogPath,
      retained.map(e => JSON.stringify(e)).join('\n'),
      'utf-8'
    );

    this.auditEntries = retained;

    console.log(`📦 Archived ${archived.length} entries to ${path.basename(archivePath)}`);
    console.log(`📋 Retained ${retained.length} entries`);

    return {
      retained: retained.length,
      archived: archived.length,
      archive_file: archivePath
    };
  }

  /**
   * Get statistics
   */
  getStatistics(days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEntries = this.auditEntries.filter(e => new Date(e.timestamp) >= cutoff);

    const stats = {
      total_entries: recentEntries.length,
      success_rate: 0,
      error_rate: 0,
      by_level: {},
      by_agent: {},
      by_operation: {},
      anomalies: this.anomalies.filter(a => new Date(a.detected_at) >= cutoff).length
    };

    const successful = recentEntries.filter(e => e.success);
    stats.success_rate = recentEntries.length > 0 ? (successful.length / recentEntries.length) * 100 : 0;
    stats.error_rate = 100 - stats.success_rate;

    for (const entry of recentEntries) {
      // By level
      stats.by_level[entry.level] = (stats.by_level[entry.level] || 0) + 1;

      // By agent
      stats.by_agent[entry.agent] = (stats.by_agent[entry.agent] || 0) + 1;

      // By operation
      stats.by_operation[entry.operation] = (stats.by_operation[entry.operation] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Default export
 */
export default AuditAgent;
