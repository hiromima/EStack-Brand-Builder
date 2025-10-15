/**
 * @file CoordinatorAgent.js
 * @description Task routing, agent orchestration, and workflow management
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CoordinatorAgent
 *
 * Responsibilities:
 * 1. Route tasks to appropriate agents
 * 2. Orchestrate multi-agent workflows
 * 3. Manage agent dependencies
 * 4. Monitor workflow execution
 * 5. Handle workflow failures and retries
 */
export class CoordinatorAgent {
  constructor(options = {}) {
    this.options = {
      registryPath: options.registryPath || path.join(process.cwd(), '.miyabi/agent_registry.json'),
      workflowLogPath: options.workflowLogPath || path.join(process.cwd(), '.miyabi/logs/workflows.json'),
      maxRetries: options.maxRetries || 3,
      ...options
    };

    this.registry = null;
    this.workflows = [];
    this.activeWorkflows = new Map();
  }

  /**
   * Initialize agent
   */
  async initialize() {
    const logDir = path.dirname(this.options.workflowLogPath);
    await fs.mkdir(logDir, { recursive: true });

    await this.loadRegistry();
    await this.loadWorkflows();

    console.log('✅ CoordinatorAgent initialized');
  }

  /**
   * Load agent registry
   */
  async loadRegistry() {
    try {
      const content = await fs.readFile(this.options.registryPath, 'utf-8');
      this.registry = JSON.parse(content);
      console.log(`📋 Agent registry loaded: ${this.registry.agents.length} agents`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.registry = { version: '1.0', agents: [] };
        console.log('⚠️  Agent registry not found - starting empty');
      } else {
        throw error;
      }
    }
  }

  /**
   * Load workflow log
   */
  async loadWorkflows() {
    try {
      const content = await fs.readFile(this.options.workflowLogPath, 'utf-8');
      this.workflows = JSON.parse(content);
      console.log(`📋 Workflow log loaded: ${this.workflows.length} workflows`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.workflows = [];
        console.log('📋 Workflow log initialized (new)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Save workflows
   */
  async saveWorkflows() {
    await fs.writeFile(
      this.options.workflowLogPath,
      JSON.stringify(this.workflows, null, 2),
      'utf-8'
    );
  }

  /**
   * Route task to appropriate agent
   * @param {Object} task - Task to route
   * @returns {Object} Routing decision
   */
  routeTask(task) {
    const routing = {
      task_id: this.generateTaskId(),
      task,
      timestamp: new Date().toISOString(),
      selected_agent: null,
      reason: null,
      confidence: 0
    };

    // Task type mapping
    const taskTypeMapping = {
      // Support operations
      'cost_monitoring': { category: 'support', agent: 'CostMonitoringAgent' },
      'incident_response': { category: 'support', agent: 'IncidentCommanderAgent' },
      'agent_onboarding': { category: 'support', agent: 'SystemRegistryAgent' },
      'security_audit': { category: 'support', agent: 'AuditAgent' },

      // Core brand operations
      'brand_structure': { category: 'core', agent: 'StructureAgent' },
      'expression_generation': { category: 'core', agent: 'ExpressionAgent' },
      'evaluation': { category: 'core', agent: 'EvaluationAgent' },
      'copywriting': { category: 'core', agent: 'CopyAgent' },
      'logo_design': { category: 'core', agent: 'LogoAgent' },
      'visual_identity': { category: 'core', agent: 'VisualAgent' },

      // Quality operations
      'quality_control': { category: 'quality', agent: 'QualityControlAgent' }
    };

    // Find matching agent by task type
    const taskType = task.type || this.inferTaskType(task);
    const mapping = taskTypeMapping[taskType];

    if (mapping) {
      // Check if agent is registered and available
      const agent = this.findAgent(mapping.agent, mapping.category);

      if (agent) {
        routing.selected_agent = agent;
        routing.reason = `Task type '${taskType}' maps to ${agent.name}`;
        routing.confidence = 0.9;
      } else {
        routing.reason = `Agent '${mapping.agent}' not found in registry`;
        routing.confidence = 0;
      }
    } else {
      // Fuzzy matching based on task description
      const candidates = this.findCandidateAgents(task);

      if (candidates.length > 0) {
        routing.selected_agent = candidates[0].agent;
        routing.reason = `Best match based on capabilities: ${candidates[0].score.toFixed(2)}`;
        routing.confidence = candidates[0].score;
      } else {
        routing.reason = 'No suitable agent found';
        routing.confidence = 0;
      }
    }

    return routing;
  }

  /**
   * Infer task type from task description
   */
  inferTaskType(task) {
    const description = (task.description || '').toLowerCase();

    const keywords = {
      'cost_monitoring': ['cost', 'budget', 'billing', 'expense'],
      'incident_response': ['incident', 'error', 'failure', 'crash', 'rollback'],
      'security_audit': ['security', 'audit', 'access', 'permission'],
      'brand_structure': ['structure', 'estack', 'rsi', 'framework'],
      'expression_generation': ['expression', 'creative', 'concept'],
      'evaluation': ['evaluate', 'score', 'quality', 'assessment'],
      'copywriting': ['copy', 'message', 'tagline', 'tone'],
      'logo_design': ['logo', 'symbol', 'mark'],
      'visual_identity': ['visual', 'design', 'identity', 'vi']
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => description.includes(word))) {
        return type;
      }
    }

    return 'unknown';
  }

  /**
   * Find agent by name and category
   */
  findAgent(name, category = null) {
    if (!this.registry || !this.registry.agents) {
      return null;
    }

    return this.registry.agents.find(agent =>
      agent.name === name &&
      (agent.status === 'registered' || agent.status === 'failed_compliance') &&
      (category === null || agent.category === category)
    );
  }

  /**
   * Find candidate agents using fuzzy matching
   */
  findCandidateAgents(task) {
    if (!this.registry || !this.registry.agents) {
      return [];
    }

    const registeredAgents = this.registry.agents.filter(a =>
      a.status === 'registered' || a.status === 'failed_compliance'
    );
    const candidates = [];

    for (const agent of registeredAgents) {
      const score = this.calculateMatchScore(task, agent);

      if (score > 0.3) { // Minimum threshold
        candidates.push({ agent, score });
      }
    }

    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate match score between task and agent
   */
  calculateMatchScore(task, agent) {
    const taskWords = new Set(
      (task.description || '').toLowerCase().split(/\s+/)
    );

    const agentWords = new Set([
      ...agent.name.toLowerCase().split(/(?=[A-Z])/),
      ...(agent.description || '').toLowerCase().split(/\s+/)
    ]);

    // Count matching words
    let matches = 0;
    for (const word of taskWords) {
      if (agentWords.has(word)) {
        matches++;
      }
    }

    return taskWords.size > 0 ? matches / taskWords.size : 0;
  }

  /**
   * Generate task ID
   */
  generateTaskId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `TASK-${timestamp}-${random}`;
  }

  /**
   * Create workflow
   * @param {Object} workflowDef - Workflow definition
   * @returns {Object} Workflow instance
   */
  async createWorkflow(workflowDef) {
    const workflow = {
      id: this.generateWorkflowId(),
      name: workflowDef.name,
      description: workflowDef.description || '',
      created_at: new Date().toISOString(),
      status: 'created',
      steps: workflowDef.steps || [],
      current_step: 0,
      results: [],
      metadata: workflowDef.metadata || {}
    };

    this.workflows.push(workflow);
    this.activeWorkflows.set(workflow.id, workflow);

    await this.saveWorkflows();

    console.log(`🔄 Workflow created: ${workflow.name} (${workflow.id})`);

    return workflow;
  }

  /**
   * Generate workflow ID
   */
  generateWorkflowId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `WF-${timestamp}-${random}`;
  }

  /**
   * Execute workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Object} Execution result
   */
  async executeWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    console.log(`\n${'▶️ '.repeat(3)}EXECUTING WORKFLOW: ${workflow.name}${'▶️ '.repeat(3)}`);
    console.log(`ID: ${workflow.id}`);
    console.log(`Steps: ${workflow.steps.length}\n`);

    workflow.status = 'running';
    workflow.started_at = new Date().toISOString();

    try {
      for (let i = workflow.current_step; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        workflow.current_step = i;

        console.log(`\n[${i + 1}/${workflow.steps.length}] ${step.name}...`);

        const stepResult = await this.executeWorkflowStep(workflow, step);

        workflow.results.push({
          step_index: i,
          step_name: step.name,
          timestamp: new Date().toISOString(),
          success: stepResult.success,
          result: stepResult.result,
          error: stepResult.error || null
        });

        if (!stepResult.success) {
          if (step.continue_on_error) {
            console.log(`⚠️  Step failed but continuing: ${stepResult.error}`);
          } else {
            throw new Error(`Step failed: ${step.name} - ${stepResult.error}`);
          }
        }

        await this.saveWorkflows();
      }

      workflow.status = 'completed';
      workflow.completed_at = new Date().toISOString();

      console.log(`\n✅ Workflow completed: ${workflow.name}`);

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.failed_at = new Date().toISOString();

      console.log(`\n❌ Workflow failed: ${error.message}`);

      throw error;
    } finally {
      await this.saveWorkflows();
    }

    return workflow;
  }

  /**
   * Execute workflow step
   */
  async executeWorkflowStep(workflow, step) {
    const result = {
      success: false,
      result: null,
      error: null
    };

    try {
      // Route task to agent
      const routing = this.routeTask({
        type: step.type,
        description: step.description || step.name,
        params: step.params || {}
      });

      if (!routing.selected_agent) {
        throw new Error(`No agent available for step: ${step.name}`);
      }

      console.log(`  Agent: ${routing.selected_agent.name}`);
      console.log(`  Confidence: ${(routing.confidence * 100).toFixed(0)}%`);

      // In a real implementation, this would instantiate and execute the agent
      // For now, we simulate success
      result.result = {
        agent: routing.selected_agent.name,
        routing,
        simulated: true,
        message: `Step executed by ${routing.selected_agent.name}`
      };

      result.success = true;

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId) ||
                     this.workflows.find(w => w.id === workflowId);

    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      current_step: workflow.current_step,
      total_steps: workflow.steps.length,
      progress: workflow.steps.length > 0 ?
        (workflow.current_step / workflow.steps.length) * 100 : 0,
      created_at: workflow.created_at,
      started_at: workflow.started_at,
      completed_at: workflow.completed_at,
      failed_at: workflow.failed_at,
      error: workflow.error
    };
  }

  /**
   * List workflows
   */
  listWorkflows(filter = {}) {
    let workflows = this.workflows;

    if (filter.status) {
      workflows = workflows.filter(w => w.status === filter.status);
    }

    if (filter.limit) {
      workflows = workflows.slice(-filter.limit);
    }

    return workflows.map(w => this.getWorkflowStatus(w.id));
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      total_workflows: this.workflows.length,
      active_workflows: this.activeWorkflows.size,
      by_status: {},
      registered_agents: this.registry ? this.registry.agents.filter(a => a.status === 'registered').length : 0,
      total_agents: this.registry ? this.registry.agents.length : 0
    };

    for (const workflow of this.workflows) {
      stats.by_status[workflow.status] = (stats.by_status[workflow.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Generate routing report
   */
  generateRoutingReport(routings) {
    let report = '\n' + '='.repeat(70) + '\n';
    report += 'TASK ROUTING REPORT\n';
    report += '='.repeat(70) + '\n\n';

    for (const routing of routings) {
      report += `Task ID: ${routing.task_id}\n`;
      report += `Type: ${routing.task.type || 'unknown'}\n`;

      if (routing.selected_agent) {
        report += `✅ Assigned to: ${routing.selected_agent.name}\n`;
        report += `   Category: ${routing.selected_agent.category}\n`;
        report += `   Confidence: ${(routing.confidence * 100).toFixed(0)}%\n`;
        report += `   Reason: ${routing.reason}\n`;
      } else {
        report += `❌ No agent assigned\n`;
        report += `   Reason: ${routing.reason}\n`;
      }

      report += '\n';
    }

    report += '='.repeat(70) + '\n';

    return report;
  }

  /**
   * Generate workflow report
   */
  generateWorkflowReport(workflow) {
    let report = '\n' + '='.repeat(70) + '\n';
    report += 'WORKFLOW EXECUTION REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Workflow: ${workflow.name}\n`;
    report += `ID: ${workflow.id}\n`;
    report += `Status: ${workflow.status.toUpperCase()}\n`;
    report += `Created: ${new Date(workflow.created_at).toLocaleString()}\n`;

    if (workflow.started_at) {
      report += `Started: ${new Date(workflow.started_at).toLocaleString()}\n`;
    }

    if (workflow.completed_at) {
      report += `Completed: ${new Date(workflow.completed_at).toLocaleString()}\n`;

      const duration = new Date(workflow.completed_at) - new Date(workflow.started_at);
      report += `Duration: ${(duration / 1000).toFixed(1)}s\n`;
    }

    if (workflow.failed_at) {
      report += `Failed: ${new Date(workflow.failed_at).toLocaleString()}\n`;
      report += `Error: ${workflow.error}\n`;
    }

    report += `\nSteps: ${workflow.steps.length}\n`;
    report += `Progress: ${workflow.current_step}/${workflow.steps.length}\n\n`;

    if (workflow.results.length > 0) {
      report += 'Step Results:\n';
      report += '-'.repeat(70) + '\n';

      for (const result of workflow.results) {
        const icon = result.success ? '✅' : '❌';
        report += `${icon} [${result.step_index + 1}] ${result.step_name}\n`;

        if (result.result && result.result.agent) {
          report += `   Agent: ${result.result.agent}\n`;
        }

        if (result.error) {
          report += `   Error: ${result.error}\n`;
        }

        report += '\n';
      }
    }

    report += '='.repeat(70) + '\n';

    return report;
  }
}

/**
 * Default export
 */
export default CoordinatorAgent;
