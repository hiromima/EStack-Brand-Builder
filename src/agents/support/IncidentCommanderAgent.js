/**
 * @file IncidentCommanderAgent.js
 * @description Autonomous incident detection, response, and recovery agent
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * IncidentCommanderAgent
 *
 * Responsibilities:
 * 1. Detect incidents (errors, failures, anomalies)
 * 2. Perform root cause analysis
 * 3. Execute automatic rollback
 * 4. Escalate to human when necessary (Handshake Protocol)
 */
export class IncidentCommanderAgent {
  constructor(options = {}) {
    this.options = {
      logPath: options.logPath || path.join(process.cwd(), '.miyabi/logs/incidents.json'),
      maxRollbackAttempts: options.maxRollbackAttempts || 3,
      ...options
    };

    this.incidents = [];
    this.activeIncident = null;
  }

  /**
   * Initialize agent
   */
  async initialize() {
    const logDir = path.dirname(this.options.logPath);
    await fs.mkdir(logDir, { recursive: true });

    await this.loadIncidents();

    console.log('✅ IncidentCommanderAgent initialized');
  }

  /**
   * Load incident history
   */
  async loadIncidents() {
    try {
      const content = await fs.readFile(this.options.logPath, 'utf-8');
      this.incidents = JSON.parse(content);
      console.log(`📋 Incident log loaded: ${this.incidents.length} incidents`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.incidents = [];
        console.log('📋 Incident log initialized (new)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Save incidents
   */
  async saveIncidents() {
    await fs.writeFile(
      this.options.logPath,
      JSON.stringify(this.incidents, null, 2),
      'utf-8'
    );
  }

  /**
   * Report an incident
   * @param {Object} incident - Incident data
   */
  async reportIncident(incident) {
    const incidentRecord = {
      id: this.generateIncidentId(),
      timestamp: new Date().toISOString(),
      severity: incident.severity || 'medium', // low | medium | high | critical
      type: incident.type || 'unknown', // error | failure | performance | security
      title: incident.title,
      description: incident.description,
      context: incident.context || {},
      status: 'detected',
      rollback_attempts: 0,
      actions_taken: [],
      resolution: null
    };

    this.incidents.push(incidentRecord);
    this.activeIncident = incidentRecord;

    await this.saveIncidents();

    console.log(`\n${'🚨'.repeat(3)} INCIDENT DETECTED ${'🚨'.repeat(3)}`);
    console.log(`ID: ${incidentRecord.id}`);
    console.log(`Severity: ${incidentRecord.severity.toUpperCase()}`);
    console.log(`Type: ${incidentRecord.type}`);
    console.log(`Title: ${incidentRecord.title}\n`);

    // Start incident response
    await this.respondToIncident(incidentRecord);

    return incidentRecord;
  }

  /**
   * Generate incident ID
   */
  generateIncidentId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `INC-${timestamp}-${random}`;
  }

  /**
   * Respond to incident
   * @param {Object} incident - Incident record
   */
  async respondToIncident(incident) {
    console.log('🔍 Starting incident response protocol...\n');

    // Step 1: Root cause analysis
    const rootCause = await this.analyzeRootCause(incident);
    incident.root_cause = rootCause;
    incident.actions_taken.push({
      timestamp: new Date().toISOString(),
      action: 'root_cause_analysis',
      result: rootCause
    });

    console.log(`Root cause identified: ${rootCause.summary}\n`);

    // Step 2: Determine recovery strategy
    const strategy = this.determineRecoveryStrategy(incident);
    console.log(`Recovery strategy: ${strategy}\n`);

    // Step 3: Execute recovery
    if (strategy === 'rollback') {
      const rollbackSuccess = await this.executeRollback(incident);

      if (rollbackSuccess) {
        incident.status = 'resolved';
        incident.resolution = {
          type: 'automatic_rollback',
          timestamp: new Date().toISOString(),
          success: true
        };
        console.log('✅ Incident resolved via automatic rollback\n');
      } else {
        // Rollback failed - check attempts
        if (incident.rollback_attempts >= this.options.maxRollbackAttempts) {
          console.log(`⚠️  Rollback failed after ${incident.rollback_attempts} attempts\n`);
          await this.executeHandshakeProtocol(incident);
        }
      }
    } else if (strategy === 'graceful_degradation') {
      await this.executeGracefulDegradation(incident);
      incident.status = 'degraded';
      incident.resolution = {
        type: 'graceful_degradation',
        timestamp: new Date().toISOString()
      };
      console.log('⚠️  System degraded - non-critical features disabled\n');
    } else if (strategy === 'escalate') {
      await this.executeHandshakeProtocol(incident);
    }

    await this.saveIncidents();
  }

  /**
   * Analyze root cause
   * @param {Object} incident - Incident data
   * @returns {Object} Root cause analysis
   */
  async analyzeRootCause(incident) {
    console.log('🔍 Analyzing root cause...');

    // Simple heuristic-based analysis
    // In production, this would use AI models
    const analysis = {
      summary: 'Unknown cause',
      category: 'unknown',
      confidence: 0,
      factors: []
    };

    // Analyze error type
    if (incident.type === 'error') {
      if (incident.context.error_message) {
        const errorMsg = incident.context.error_message.toLowerCase();

        if (errorMsg.includes('timeout') || errorMsg.includes('econnrefused')) {
          analysis.summary = 'Network connectivity issue';
          analysis.category = 'infrastructure';
          analysis.confidence = 0.8;
          analysis.factors.push('Network timeout or connection refused');
        } else if (errorMsg.includes('out of memory') || errorMsg.includes('oom')) {
          analysis.summary = 'Memory exhaustion';
          analysis.category = 'resource';
          analysis.confidence = 0.9;
          analysis.factors.push('System ran out of memory');
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          analysis.summary = 'API rate limit exceeded';
          analysis.category = 'api';
          analysis.confidence = 0.95;
          analysis.factors.push('Too many API requests');
        } else if (errorMsg.includes('unauthorized') || errorMsg.includes('403') || errorMsg.includes('401')) {
          analysis.summary = 'Authentication failure';
          analysis.category = 'security';
          analysis.confidence = 0.9;
          analysis.factors.push('Invalid or expired credentials');
        }
      }
    } else if (incident.type === 'failure') {
      analysis.summary = 'Operation failed';
      analysis.category = 'operational';
      analysis.confidence = 0.7;
      analysis.factors.push('Task execution failed');
    }

    // Check for recent similar incidents
    const similarIncidents = this.findSimilarIncidents(incident);
    if (similarIncidents.length > 0) {
      analysis.factors.push(`${similarIncidents.length} similar incidents in last 24h`);
      analysis.confidence = Math.min(0.95, analysis.confidence + 0.1);
    }

    return analysis;
  }

  /**
   * Find similar incidents
   */
  findSimilarIncidents(incident) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.incidents.filter(inc =>
      inc.id !== incident.id &&
      new Date(inc.timestamp) >= dayAgo &&
      inc.type === incident.type &&
      inc.severity === incident.severity
    );
  }

  /**
   * Determine recovery strategy
   */
  determineRecoveryStrategy(incident) {
    // Critical incidents require immediate escalation
    if (incident.severity === 'critical') {
      return 'escalate';
    }

    // If root cause is clear and confidence is high, attempt rollback
    if (incident.root_cause && incident.root_cause.confidence >= 0.7) {
      if (incident.root_cause.category === 'infrastructure' ||
          incident.root_cause.category === 'resource') {
        return 'rollback';
      }

      if (incident.root_cause.category === 'api' ||
          incident.root_cause.category === 'operational') {
        return 'graceful_degradation';
      }
    }

    // Default to graceful degradation
    return 'graceful_degradation';
  }

  /**
   * Execute rollback
   * @param {Object} incident - Incident record
   * @returns {boolean} Success
   */
  async executeRollback(incident) {
    incident.rollback_attempts++;

    console.log(`🔄 Executing rollback (attempt ${incident.rollback_attempts}/${this.options.maxRollbackAttempts})...`);

    incident.actions_taken.push({
      timestamp: new Date().toISOString(),
      action: 'rollback',
      attempt: incident.rollback_attempts
    });

    // Simulate rollback
    // In production, this would:
    // 1. Identify last known good state
    // 2. Revert code/config changes
    // 3. Restart affected services
    // 4. Verify system health

    const success = Math.random() > 0.3; // 70% success rate for simulation

    if (success) {
      console.log('✅ Rollback successful');
      incident.actions_taken[incident.actions_taken.length - 1].result = 'success';
    } else {
      console.log('❌ Rollback failed');
      incident.actions_taken[incident.actions_taken.length - 1].result = 'failed';
    }

    await this.saveIncidents();
    return success;
  }

  /**
   * Execute graceful degradation
   */
  async executeGracefulDegradation(incident) {
    console.log('⚙️  Executing graceful degradation...');

    const actions = [
      'Disable non-critical features',
      'Enable circuit breaker',
      'Reduce operation rate',
      'Switch to fallback mode'
    ];

    for (const action of actions) {
      console.log(`  - ${action}`);
    }

    incident.actions_taken.push({
      timestamp: new Date().toISOString(),
      action: 'graceful_degradation',
      steps: actions
    });

    await this.saveIncidents();
  }

  /**
   * Execute Handshake Protocol (Human escalation)
   * @param {Object} incident - Incident record
   */
  async executeHandshakeProtocol(incident) {
    console.log('\n' + '🆘'.repeat(10));
    console.log('HANDSHAKE PROTOCOL ACTIVATED');
    console.log('🆘'.repeat(10) + '\n');

    console.log('Our autonomous recovery capabilities have been exhausted.');
    console.log('Requesting Guardian intervention.\n');

    incident.status = 'escalated';
    incident.escalation = {
      timestamp: new Date().toISOString(),
      reason: 'Autonomous recovery failed after multiple attempts',
      requires_human_intervention: true
    };

    incident.actions_taken.push({
      timestamp: new Date().toISOString(),
      action: 'human_escalation',
      protocol: 'handshake'
    });

    await this.saveIncidents();

    // Generate escalation report
    const report = this.generateEscalationReport(incident);
    console.log(report);

    console.log('\n💡 Action required:');
    console.log('   1. Review incident details above');
    console.log('   2. GitHub Issue should be created with label "human-intervention-required"');
    console.log('   3. System will remain in degraded mode until resolved\n');
  }

  /**
   * Generate escalation report
   */
  generateEscalationReport(incident) {
    let report = '\n' + '='.repeat(70) + '\n';
    report += 'INCIDENT ESCALATION REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Incident ID: ${incident.id}\n`;
    report += `Timestamp: ${incident.timestamp}\n`;
    report += `Severity: ${incident.severity.toUpperCase()}\n`;
    report += `Type: ${incident.type}\n`;
    report += `Title: ${incident.title}\n\n`;

    report += 'Description:\n';
    report += '-'.repeat(70) + '\n';
    report += `${incident.description}\n\n`;

    if (incident.root_cause) {
      report += 'Root Cause Analysis:\n';
      report += '-'.repeat(70) + '\n';
      report += `Summary: ${incident.root_cause.summary}\n`;
      report += `Category: ${incident.root_cause.category}\n`;
      report += `Confidence: ${(incident.root_cause.confidence * 100).toFixed(0)}%\n`;
      report += `Factors:\n`;
      incident.root_cause.factors.forEach(f => report += `  - ${f}\n`);
      report += '\n';
    }

    report += 'Actions Taken:\n';
    report += '-'.repeat(70) + '\n';
    incident.actions_taken.forEach((action, index) => {
      report += `${index + 1}. [${new Date(action.timestamp).toLocaleTimeString()}] ${action.action}\n`;
      if (action.result) {
        report += `   Result: ${action.result}\n`;
      }
    });
    report += '\n';

    report += `Rollback Attempts: ${incident.rollback_attempts}/${this.options.maxRollbackAttempts}\n`;
    report += `Status: ${incident.status.toUpperCase()}\n\n`;

    report += '='.repeat(70) + '\n';
    report += 'GUARDIAN INTERVENTION REQUIRED\n';
    report += '='.repeat(70) + '\n';

    return report;
  }

  /**
   * Get incident statistics
   */
  getStatistics(days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentIncidents = this.incidents.filter(inc =>
      new Date(inc.timestamp) >= cutoff
    );

    const stats = {
      total: recentIncidents.length,
      by_severity: {},
      by_type: {},
      by_status: {},
      resolution_rate: 0,
      escalation_rate: 0,
      avg_resolution_time: 0
    };

    for (const inc of recentIncidents) {
      // By severity
      stats.by_severity[inc.severity] = (stats.by_severity[inc.severity] || 0) + 1;

      // By type
      stats.by_type[inc.type] = (stats.by_type[inc.type] || 0) + 1;

      // By status
      stats.by_status[inc.status] = (stats.by_status[inc.status] || 0) + 1;
    }

    const resolved = stats.by_status.resolved || 0;
    const escalated = stats.by_status.escalated || 0;

    stats.resolution_rate = stats.total > 0 ? (resolved / stats.total) * 100 : 0;
    stats.escalation_rate = stats.total > 0 ? (escalated / stats.total) * 100 : 0;

    return stats;
  }
}

/**
 * Default export
 */
export default IncidentCommanderAgent;
