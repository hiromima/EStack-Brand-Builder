/**
 * BaseAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BaseAgent, AgentState, AgentType } from '../../src/agents/base/BaseAgent.js';
import { Logger } from '../../src/utils/Logger.js';

// テスト用のコンクリートエージェント
class TestAgent extends BaseAgent {
  constructor(config) {
    super({ ...config, type: AgentType.STRUCTURE });
  }

  async process(input) {
    return { result: `processed: ${input.data}` };
  }
}

describe('BaseAgent', () => {
  let logger;
  let agent;

  beforeEach(() => {
    logger = new Logger({ name: 'TestLogger', console: false, file: false });
    agent = new TestAgent({ logger, knowledge: {} });
  });

  it('should not allow direct instantiation', () => {
    assert.throws(() => {
      new BaseAgent({ type: AgentType.STRUCTURE, logger });
    }, /抽象クラス/);
  });

  it('should execute task successfully', async () => {
    const result = await agent.execute({ data: 'test' });
    assert.strictEqual(result.result, 'processed: test');
    assert.strictEqual(agent.metrics.successCount, 1);
  });

  it('should track metrics', async () => {
    await agent.execute({ data: 'test1' });
    await agent.execute({ data: 'test2' });

    assert.strictEqual(agent.metrics.tasksProcessed, 2);
    assert.strictEqual(agent.metrics.successCount, 2);
    assert(agent.metrics.averageProcessingTime > 0);
  });

  it('should emit events', async () => {
    let completedEmitted = false;

    agent.on('completed', () => {
      completedEmitted = true;
    });

    await agent.execute({ data: 'test' });
    assert.strictEqual(completedEmitted, true);
  });

  it('should return health status', async () => {
    const health = await agent.healthCheck();
    assert.strictEqual(health.healthy, true);
    assert.strictEqual(health.state, AgentState.IDLE);
  });
});
