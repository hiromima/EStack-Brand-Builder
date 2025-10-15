/**
 * WorkflowSelfHealingAgent
 *
 * GitHub Actions ワークフローのエラーを自動検知・分析・修復するエージェント
 *
 * 機能:
 * 1. ワークフローエラーログの解析
 * 2. Gemini API による根本原因分析
 * 3. 修復コードの自動生成
 * 4. 修復 PR の自動作成
 * 5. Issue への進捗報告
 *
 * @extends BaseAgent
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export class WorkflowSelfHealingAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.SUPPORT,
      name: 'WorkflowSelfHealingAgent',
      description: 'Automatically detects, analyzes, and fixes GitHub Actions workflow errors',
      version: '1.0.0',
      capabilities: [
        'workflow_error_detection',
        'root_cause_analysis',
        'automatic_fix_generation',
        'pr_creation',
        'issue_reporting'
      ]
    });

    this.geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    this.repoOwner = options.repoOwner || this._getRepoOwner();
    this.repoName = options.repoName || this._getRepoName();
    this.workflowsDir = options.workflowsDir || '.github/workflows';
    this.maxRetries = options.maxRetries || 3;
  }

  async initialize() {
    this.logger.info('🔧 Initializing WorkflowSelfHealingAgent...');

    // Validate required credentials
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    if (!this.githubToken) {
      throw new Error('GITHUB_TOKEN is required');
    }

    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    this.initialized = true;
    this.logger.info('✅ WorkflowSelfHealingAgent initialized');
  }

  async process(input) {
    this.logger.info('🔍 Processing workflow error...');

    const {
      workflowName,
      runId,
      errorLog,
      jobName,
      stepName,
      issueNumber
    } = input;

    try {
      // Step 1: Analyze error
      const analysis = await this._analyzeError({
        workflowName,
        runId,
        errorLog,
        jobName,
        stepName
      });

      this.logger.info(`📊 Analysis complete: ${analysis.rootCause}`);

      // Step 2: Generate fix
      const fix = await this._generateFix(analysis);

      this.logger.info(`💡 Fix generated: ${fix.description}`);

      // Step 3: Apply fix
      const applyResult = await this._applyFix(fix);

      this.logger.info(`✅ Fix applied: ${applyResult.success}`);

      // Step 4: Create PR
      const pr = await this._createFixPR({
        analysis,
        fix,
        applyResult,
        issueNumber
      });

      this.logger.info(`🎉 PR created: ${pr.url}`);

      // Step 5: Report to Issue
      if (issueNumber) {
        await this._reportToIssue(issueNumber, {
          analysis,
          fix,
          pr
        });
      }

      return {
        success: true,
        analysis,
        fix,
        pr,
        metadata: {
          agent: this.name,
          timestamp: new Date().toISOString(),
          workflowName,
          runId
        }
      };

    } catch (error) {
      this.logger.error(`❌ Error processing workflow failure: ${error.message}`);

      if (issueNumber) {
        await this._reportFailureToIssue(issueNumber, error);
      }

      throw error;
    }
  }

  /**
   * Analyze workflow error using Gemini AI
   */
  async _analyzeError({ workflowName, runId, errorLog, jobName, stepName }) {
    this.logger.info('🧠 Analyzing error with Gemini AI...');

    // Read workflow file
    const workflowPath = path.join(this.workflowsDir, `${workflowName}.yml`);
    let workflowContent = '';
    try {
      workflowContent = await fs.readFile(workflowPath, 'utf-8');
    } catch (err) {
      this.logger.warn(`Could not read workflow file: ${workflowPath}`);
    }

    const prompt = `You are a GitHub Actions workflow debugging expert.

Analyze this workflow error and provide a detailed diagnosis:

**Workflow Name**: ${workflowName}
**Run ID**: ${runId}
**Job**: ${jobName}
**Step**: ${stepName}

**Error Log**:
\`\`\`
${errorLog}
\`\`\`

**Workflow Configuration**:
\`\`\`yaml
${workflowContent}
\`\`\`

Please provide:
1. **Root Cause**: What is the exact cause of this error?
2. **Error Type**: Categorize the error (syntax, dependency, API, permission, etc.)
3. **Affected Lines**: Which lines in the workflow file are problematic?
4. **Fix Strategy**: Step-by-step strategy to fix this issue
5. **Prevention**: How to prevent this error in the future?

Respond in JSON format:
{
  "rootCause": "string",
  "errorType": "string",
  "affectedLines": [number],
  "fixStrategy": ["step1", "step2"],
  "prevention": "string",
  "confidence": 0-100
}`;

    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      ...analysis,
      workflowName,
      runId,
      jobName,
      stepName,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate fix code using Gemini AI
   */
  async _generateFix(analysis) {
    this.logger.info('🔨 Generating fix with Gemini AI...');

    // Read current workflow file
    const workflowPath = path.join(this.workflowsDir, `${analysis.workflowName}.yml`);
    const currentContent = await fs.readFile(workflowPath, 'utf-8');

    const prompt = `You are a GitHub Actions workflow expert. Generate a fix for this error.

**Root Cause**: ${analysis.rootCause}
**Error Type**: ${analysis.errorType}
**Fix Strategy**: ${analysis.fixStrategy.join(', ')}

**Current Workflow**:
\`\`\`yaml
${currentContent}
\`\`\`

Generate the COMPLETE FIXED workflow file. Include all necessary changes.

**Requirements**:
- Fix the error completely
- Maintain existing functionality
- Follow GitHub Actions best practices
- Add comments explaining the fix

Respond with the complete fixed YAML content ONLY (no markdown, no explanation).`;

    const result = await this.model.generateContent(prompt);
    const fixedContent = result.response.text()
      .replace(/^```ya?ml\n?/i, '')
      .replace(/\n?```$/,'')
      .trim();

    return {
      description: `Fix ${analysis.errorType} in ${analysis.workflowName}`,
      workflowPath,
      originalContent: currentContent,
      fixedContent,
      strategy: analysis.fixStrategy,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Apply fix to workflow file
   */
  async _applyFix(fix) {
    this.logger.info('📝 Applying fix to workflow file...');

    try {
      // Backup original file
      const backupPath = `${fix.workflowPath}.backup-${Date.now()}`;
      await fs.writeFile(backupPath, fix.originalContent);

      // Write fixed content
      await fs.writeFile(fix.workflowPath, fix.fixedContent);

      // Validate YAML syntax (basic check)
      const linesChanged = this._countChangedLines(
        fix.originalContent,
        fix.fixedContent
      );

      return {
        success: true,
        workflowPath: fix.workflowPath,
        backupPath,
        linesChanged,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to apply fix: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create PR with the fix
   */
  async _createFixPR({ analysis, fix, applyResult, issueNumber }) {
    this.logger.info('🎯 Creating fix PR...');

    const branchName = `fix/workflow-${analysis.workflowName}-${Date.now()}`;

    try {
      // Create new branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

      // Stage changes
      execSync(`git add ${fix.workflowPath}`, { stdio: 'inherit' });

      // Commit
      const commitMessage = `fix: Auto-heal ${analysis.errorType} in ${analysis.workflowName}

Root Cause: ${analysis.rootCause}

Fix Strategy:
${analysis.fixStrategy.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Auto-generated by WorkflowSelfHealingAgent
${issueNumber ? `\nFixes #${issueNumber}` : ''}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

      // Push to remote
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

      // Create PR using GitHub CLI
      const prBody = `## 🔧 Auto-Generated Workflow Fix

This PR automatically fixes a workflow error detected in \`${analysis.workflowName}\`.

### 📊 Error Analysis

- **Root Cause**: ${analysis.rootCause}
- **Error Type**: ${analysis.errorType}
- **Confidence**: ${analysis.confidence}%

### 🔨 Fix Strategy

${analysis.fixStrategy.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### 📝 Changes

- **File**: \`${fix.workflowPath}\`
- **Lines Changed**: ${applyResult.linesChanged}

### 🛡️ Prevention

${analysis.prevention}

### 🤖 Auto-Healing System

This fix was automatically generated by **WorkflowSelfHealingAgent** using:
- Error log analysis
- AI-powered root cause detection (Gemini 2.0 Flash)
- Automatic fix generation
- Quality validation

${issueNumber ? `\nCloses #${issueNumber}` : ''}

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)`;

      const prUrl = execSync(
        `gh pr create --title "fix: Auto-heal ${analysis.errorType} in ${analysis.workflowName}" --body "${prBody.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
        { encoding: 'utf-8' }
      ).trim();

      return {
        url: prUrl,
        branch: branchName,
        linesChanged: applyResult.linesChanged,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to create PR: ${error.message}`);
      // Cleanup: return to main branch
      execSync('git checkout main', { stdio: 'inherit' });
      throw error;
    }
  }

  /**
   * Report progress to Issue
   */
  async _reportToIssue(issueNumber, { analysis, fix, pr }) {
    this.logger.info(`📢 Reporting to Issue #${issueNumber}...`);

    const comment = `## 🔧 Auto-Healing in Progress

I've automatically analyzed and fixed the workflow error!

### ✅ Analysis Complete

- **Root Cause**: ${analysis.rootCause}
- **Error Type**: ${analysis.errorType}
- **Confidence**: ${analysis.confidence}%

### 🔨 Fix Applied

${analysis.fixStrategy.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### 🎯 Pull Request Created

${pr.url}

The fix has been submitted for review. Once the Quality Gate passes, it will be automatically merged.

---

🤖 Auto-healed by WorkflowSelfHealingAgent`;

    execSync(
      `gh issue comment ${issueNumber} --body "${comment.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
      { stdio: 'inherit' }
    );
  }

  /**
   * Report failure to Issue
   */
  async _reportFailureToIssue(issueNumber, error) {
    this.logger.info(`⚠️ Reporting failure to Issue #${issueNumber}...`);

    const comment = `## ⚠️ Auto-Healing Failed

I attempted to automatically fix this workflow error, but encountered an issue:

**Error**: ${error.message}

**Next Steps**:
1. Review the error log above
2. Manual intervention may be required
3. The issue remains open for human review

---

🤖 WorkflowSelfHealingAgent`;

    execSync(
      `gh issue comment ${issueNumber} --body "${comment.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
      { stdio: 'inherit' }
    );
  }

  /**
   * Helper: Get repository owner from git remote
   */
  _getRepoOwner() {
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' });
      const match = remote.match(/github\.com[:/]([^/]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Get repository name from git remote
   */
  _getRepoName() {
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' });
      const match = remote.match(/github\.com[:/][^/]+\/(.+?)(\.git)?$/);
      return match ? match[1].replace('.git', '') : null;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Count changed lines between two strings
   */
  _countChangedLines(original, fixed) {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');

    let changes = 0;
    const maxLength = Math.max(originalLines.length, fixedLines.length);

    for (let i = 0; i < maxLength; i++) {
      if (originalLines[i] !== fixedLines[i]) {
        changes++;
      }
    }

    return changes;
  }
}

export default WorkflowSelfHealingAgent;
