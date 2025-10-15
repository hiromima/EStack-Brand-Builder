/**
 * ExpressionAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ExpressionAgent } from '../../src/agents/core/ExpressionAgent.js';
import { AgentType } from '../../src/agents/base/BaseAgent.js';

// テストデータ生成ヘルパー
function createTestEStack() {
  return {
    foundation: {
      purpose: 'お客様の課題を解決する',
      values: ['誠実さ', '革新性', '顧客第一'],
      notAxis: ['妥協', '停滞']
    },
    structure: {
      persona: {
        description: '中小企業の経営者'
      },
      tone: {
        voice: 'professional'
      }
    },
    expression: {}
  };
}

describe('ExpressionAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new ExpressionAgent({
      logger: mockLogger,
      branchCount: 3
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.EXPRESSION);
    assert.strictEqual(agent.name, 'ExpressionAgent');
    assert.strictEqual(agent.branchCount, 3);
  });

  it('should initialize with default branch count', () => {
    const defaultAgent = new ExpressionAgent({ logger: mockLogger });
    assert.strictEqual(defaultAgent.branchCount, 3);
  });

  it('should initialize with custom branch count', () => {
    const customAgent = new ExpressionAgent({
      logger: mockLogger,
      branchCount: 5
    });
    assert.strictEqual(customAgent.branchCount, 5);
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    // ExpressionAgent は initialize() で何も設定しないため、チェックのみ
    assert(true);
  });

  it('should throw error when estack is not provided', async () => {
    await assert.rejects(
      async () => {
        await agent.process({});
      },
      {
        message: /E:Stack 構造が必要です/
      }
    );
  });

  it('should assess clarity based on length', () => {
    // 実装: <20=very-clear, <40=clear, >=40=moderate
    assert.strictEqual(agent._assessClarity('短い'), 'very-clear');
    assert.strictEqual(agent._assessClarity('これは20文字以上40文字未満のテキストですよおお'), 'clear');
    assert.strictEqual(agent._assessClarity('これは40文字以上の長いテキストで、明瞭性が中程度になりますねえええええええええ'), 'moderate');
  });

  it('should assess memorability correctly', () => {
    assert.strictEqual(agent._assessMemorability('心に響く、言葉'), 'high');
    assert.strictEqual(agent._assessMemorability('短いメッセージ'), 'moderate');
    assert.strictEqual(agent._assessMemorability('This is a very long message that is not memorable'), 'low');
  });

  it('should assess rhythm correctly', () => {
    // 実装: <=15=good, <=25=moderate, >25=slow
    assert.strictEqual(agent._assessRhythm('短い'), 'good');
    assert.strictEqual(agent._assessRhythm('これは16文字以上25文字以下のテキスト'), 'moderate');
    assert.strictEqual(agent._assessRhythm('これは26文字以上の非常に長いテキストですよねえええ'), 'slow');
  });

  it('should infer composition for professional tone', () => {
    const estack = createTestEStack();
    const composition = agent._inferComposition(estack.foundation, estack.structure);

    assert.strictEqual(composition, 'シンメトリー、水平基調');
  });

  it('should infer composition for innovative tone', () => {
    const estack = createTestEStack();
    estack.structure.tone.voice = 'innovative';

    const composition = agent._inferComposition(estack.foundation, estack.structure);
    assert.strictEqual(composition, '非対称、ダイナミック');
  });

  it('should infer composition for default tone', () => {
    const estack = createTestEStack();
    estack.structure.tone.voice = 'neutral';

    const composition = agent._inferComposition(estack.foundation, estack.structure);
    assert.strictEqual(composition, '中央配置、バランス重視');
  });

  it('should infer symbolism from purpose', () => {
    const foundation = {
      purpose: '未来を創る',
      values: []
    };

    const symbols = agent._inferSymbolism(foundation);
    assert(symbols.includes('前進の矢印'));
  });

  it('should infer symbolism from values', () => {
    const foundation = {
      purpose: 'Test',
      values: ['誠実さ', '革新性']
    };

    const symbols = agent._inferSymbolism(foundation);
    assert(symbols.includes('円'));
    assert(symbols.includes('三角'));
  });

  it('should return default symbols when no match', () => {
    const foundation = {
      purpose: 'Test',
      values: ['test']
    };

    const symbols = agent._inferSymbolism(foundation);
    assert(symbols.includes('抽象図形'));
  });

  it('should generate core message with purpose-driven strategy', async () => {
    const estack = createTestEStack();
    const message = await agent._generateCoreMessage(estack, 0);

    assert.strictEqual(message.type, 'coreMessage');
    assert(message.content);
    assert.strictEqual(message.strategy, 'purpose-driven');
    assert(message.rationale);
    assert(message.characteristics);
    assert(message.characteristics.length > 0);
  });

  it('should generate core message with value-driven strategy', async () => {
    const estack = createTestEStack();
    const message = await agent._generateCoreMessage(estack, 1);

    assert.strictEqual(message.strategy, 'value-driven');
    assert(message.content.includes(estack.foundation.values[0]));
  });

  it('should generate core message with persona-driven strategy', async () => {
    const estack = createTestEStack();
    const message = await agent._generateCoreMessage(estack, 2);

    assert.strictEqual(message.strategy, 'persona-driven');
    assert(message.content.includes(estack.structure.persona.description));
  });

  it('should generate tagline with declarative strategy', async () => {
    const estack = createTestEStack();
    const tagline = await agent._generateTagline(estack, 0);

    assert.strictEqual(tagline.type, 'tagline');
    assert.strictEqual(tagline.strategy, 'declarative');
    assert(tagline.content);
    assert(tagline.characteristics.memorability);
    assert(tagline.characteristics.rhythm);
  });

  it('should generate tagline with aspirational strategy', async () => {
    const estack = createTestEStack();
    const tagline = await agent._generateTagline(estack, 1);

    assert.strictEqual(tagline.strategy, 'aspirational');
    assert(tagline.content.includes('共に'));
  });

  it('should generate tagline with imperative strategy', async () => {
    const estack = createTestEStack();
    const tagline = await agent._generateTagline(estack, 2);

    assert.strictEqual(tagline.strategy, 'imperative');
  });

  it('should generate visual concept with minimal direction', async () => {
    const estack = createTestEStack();
    const visual = await agent._generateVisualConcept(estack, 0);

    assert.strictEqual(visual.type, 'visualConcept');
    assert.strictEqual(visual.direction, 'minimal');
    assert(visual.concept);
    assert(visual.elements.colorPalette);
    assert(visual.elements.typography);
    assert(visual.elements.composition);
    assert(visual.elements.symbolism);
  });

  it('should generate visual concept with bold direction', async () => {
    const estack = createTestEStack();
    const visual = await agent._generateVisualConcept(estack, 1);

    assert.strictEqual(visual.direction, 'bold');
    assert(visual.elements.colorPalette.includes('#FF5722'));
  });

  it('should generate visual concept with organic direction', async () => {
    const estack = createTestEStack();
    const visual = await agent._generateVisualConcept(estack, 2);

    assert.strictEqual(visual.direction, 'organic');
    assert(visual.elements.colorPalette.includes('#4CAF50'));
  });

  it('should generate single expression for each type', async () => {
    const estack = createTestEStack();

    const coreMsg = await agent._generateSingleExpression('coreMessage', estack, 0);
    assert.strictEqual(coreMsg.type, 'coreMessage');

    const tagline = await agent._generateSingleExpression('tagline', estack, 0);
    assert.strictEqual(tagline.type, 'tagline');

    const visual = await agent._generateSingleExpression('visualConcept', estack, 0);
    assert.strictEqual(visual.type, 'visualConcept');
  });

  it('should throw error for unsupported target type', async () => {
    const estack = createTestEStack();

    await assert.rejects(
      async () => {
        await agent._generateSingleExpression('unsupported', estack, 0);
      },
      {
        message: /未対応のターゲットタイプ/
      }
    );
  });

  it('should generate branches correctly', async () => {
    const estack = createTestEStack();
    const branches = await agent._generateBranches('coreMessage', estack, 3);

    assert(Array.isArray(branches));
    assert.strictEqual(branches.length, 3);
    assert(branches[0].id.startsWith('coreMessage-branch-'));
    assert.strictEqual(branches[0].index, 0);
    assert(branches[0].type);
  });

  it('should process with all targets', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'all',
      branches: 3
    };

    const result = await agent.process(input);

    assert(result.expressions);
    assert(result.expressions.coreMessage);
    assert(result.expressions.tagline);
    assert(result.expressions.visualConcept);
    assert.strictEqual(result.expressions.coreMessage.length, 3);
    assert(result.metadata);
    assert.strictEqual(result.metadata.branchCount, 3);
  });

  it('should process with specific target', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'coreMessage',
      branches: 2
    };

    const result = await agent.process(input);

    assert(result.expressions.coreMessage);
    assert.strictEqual(result.expressions.coreMessage.length, 2);
    assert(!result.expressions.tagline);
    assert(!result.expressions.visualConcept);
  });

  it('should use default branch count when not specified', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'tagline'
    };

    const result = await agent.process(input);

    assert.strictEqual(result.expressions.tagline.length, 3);
    assert.strictEqual(result.metadata.branchCount, 3);
  });

  it('should include metadata in process result', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'all'
    };

    const result = await agent.process(input);

    assert.strictEqual(result.metadata.agent, 'ExpressionAgent');
    assert(result.metadata.timestamp);
    assert(Array.isArray(result.metadata.targets));
    assert(result.metadata.targets.includes('coreMessage'));
    assert(result.metadata.targets.includes('tagline'));
    assert(result.metadata.targets.includes('visualConcept'));
  });
});
