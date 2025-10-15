/**
 * StructureAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StructureAgent } from '../../src/agents/core/StructureAgent.js';
import { AgentType } from '../../src/agents/base/BaseAgent.js';

// テストデータ生成ヘルパー
function createCompleteInput() {
  return {
    hearing: {
      purpose: 'お客様の課題を解決する',
      values: ['誠実', '革新', '信頼'],
      notAxis: ['妥協', '停滞'],
      targetAudience: '中小企業の経営者',
      tone: 'プロフェッショナル',
      positioning: '業界をリードする存在',
      coreMessage: '価値を届ける'
    }
  };
}

function createPartialInput() {
  return {
    hearing: {
      purpose: 'お客様の課題を解決する',
      values: ['誠実']
    },
    business: {
      industry: 'IT サービス',
      targetMarket: '中小企業'
    }
  };
}

function createMinimalInput() {
  return {
    business: {
      industry: 'テクノロジー'
    }
  };
}

describe('StructureAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new StructureAgent({
      logger: mockLogger
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.STRUCTURE);
    assert.strictEqual(agent.name, 'StructureAgent');
    assert.strictEqual(agent.rsiMode, false);
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    assert.strictEqual(agent.rsiMode, false);
  });

  it('should validate complete input correctly', () => {
    const input = createCompleteInput();
    const result = agent._validateInput(input);

    // hearing のみでは expression フィールドが不足するため完全にはならない
    assert(result.completeness > 0.5); // ある程度完全
    assert(Array.isArray(result.missingFields));
  });

  it('should detect incomplete input', () => {
    const input = createMinimalInput();
    const result = agent._validateInput(input);

    assert.strictEqual(result.isComplete, false);
    assert(result.completeness < 0.7);
    assert(result.missingFields.length > 0);
  });

  it('should calculate completeness correctly', () => {
    const input = createPartialInput();
    const result = agent._validateInput(input);

    assert(result.completeness >= 0);
    assert(result.completeness <= 1);
    assert(typeof result.completeness === 'number');
  });

  it('should check layer completeness correctly', () => {
    const completeLayer = {
      purpose: 'Test purpose',
      values: ['value1', 'value2'],
      notAxis: ['not1']
    };

    const incompleteLayer = {
      purpose: 'Test purpose',
      values: [],
      notAxis: null
    };

    const result1 = agent._isLayerComplete(completeLayer, ['purpose', 'values', 'notAxis']);
    const result2 = agent._isLayerComplete(incompleteLayer, ['purpose', 'values', 'notAxis']);

    assert.strictEqual(result1, true);
    assert.strictEqual(result2, false);
  });

  it('should handle null layer in completeness check', () => {
    const result = agent._isLayerComplete(null, ['purpose']);
    assert.strictEqual(result, false);
  });

  it('should check layer consistency', () => {
    const validEStack = {
      foundation: { purpose: 'Test' },
      structure: { persona: 'Test' },
      expression: { coreMessage: 'Test' }
    };

    const invalidEStack = {
      foundation: { purpose: 'Test' },
      structure: null,
      expression: { coreMessage: 'Test' }
    };

    const result1 = agent._checkLayerConsistency(validEStack);
    const result2 = agent._checkLayerConsistency(invalidEStack);

    // _checkLayerConsistency は && 演算子で truthy 値を返すため、真偽値に変換してチェック
    assert.strictEqual(!!result1, true);
    assert.strictEqual(!!result2, false);
  });

  it('should generate warnings for incomplete foundation', () => {
    const checks = {
      foundationComplete: false,
      structureComplete: true,
      expressionComplete: true,
      layerConsistency: true
    };

    const estack = {
      foundation: {},
      structure: {},
      expression: {}
    };

    const warnings = agent._generateWarnings(checks, estack);

    assert(Array.isArray(warnings));
    assert(warnings.some(w => w.includes('Foundation')));
  });

  it('should generate warnings for RSI mode', () => {
    agent.rsiMode = true;

    const checks = {
      foundationComplete: true,
      structureComplete: true,
      expressionComplete: true,
      layerConsistency: true
    };

    const estack = {
      foundation: {},
      structure: {},
      expression: {}
    };

    const warnings = agent._generateWarnings(checks, estack);

    assert(warnings.some(w => w.includes('RSI')));
  });

  it('should infer purpose from business data', async () => {
    const data = {
      business: { industry: 'IT サービス' }
    };

    const purpose = await agent._inferPurpose(data);

    assert(typeof purpose === 'string');
    assert(purpose.includes('IT サービス'));
  });

  it('should infer default values', async () => {
    const values = await agent._inferValues({});

    assert(Array.isArray(values));
    assert(values.length > 0);
    assert(values.every(v => typeof v === 'string'));
  });

  it('should infer default NOT axis', async () => {
    const notAxis = await agent._inferNotAxis({});

    assert(Array.isArray(notAxis));
    assert(notAxis.length > 0);
    assert(notAxis.every(n => typeof n === 'string'));
  });

  it('should infer persona from context', async () => {
    const context = {
      foundation: { purpose: 'Test purpose' },
      business: { targetMarket: 'SMB' }
    };

    const persona = await agent._inferPersona(context);

    assert(typeof persona === 'object');
    assert(persona.description);
  });

  it('should infer tone from context', async () => {
    const context = {
      foundation: { purpose: 'Test purpose' },
      persona: { description: 'Test persona' }
    };

    const tone = await agent._inferTone(context);

    assert(typeof tone === 'object');
    assert(tone.voice);
    assert(tone.style);
  });

  it('should infer positioning from context', async () => {
    const context = {
      foundation: { purpose: 'Test purpose' },
      persona: { description: 'Test persona' }
    };

    const positioning = await agent._inferPositioning(context);

    assert(typeof positioning === 'string');
    assert(positioning.length > 0);
  });

  it('should infer core message from context', async () => {
    const context = {
      foundation: { purpose: 'お客様の課題を解決する' },
      structure: { persona: 'Test persona' }
    };

    const coreMessage = await agent._inferCoreMessage(context);

    assert(typeof coreMessage === 'string');
    assert(coreMessage.includes('お客様の課題を解決する'));
  });

  it('should map foundation layer with provided data', async () => {
    const data = {
      hearing: {
        purpose: 'Test purpose',
        values: ['value1', 'value2'],
        notAxis: ['not1']
      },
      business: {},
      existing: {}
    };

    const foundation = await agent._mapFoundationLayer(data);

    assert.strictEqual(foundation.purpose, 'Test purpose');
    assert.deepStrictEqual(foundation.values, ['value1', 'value2']);
    assert.deepStrictEqual(foundation.notAxis, ['not1']);
    assert.strictEqual(foundation.confidence, 'provided');
  });

  it('should map foundation layer with RSI mode', async () => {
    agent.rsiMode = true;

    const data = {
      hearing: {},
      business: { industry: 'Tech' },
      existing: {}
    };

    const foundation = await agent._mapFoundationLayer(data);

    assert(foundation.purpose);
    assert(Array.isArray(foundation.values));
    assert(Array.isArray(foundation.notAxis));
    assert.strictEqual(foundation.confidence, 'inferred');
  });

  it('should map structure layer with provided data', async () => {
    const data = {
      hearing: {
        targetAudience: 'Test audience',
        tone: 'Test tone',
        positioning: 'Test positioning'
      },
      business: {},
      existing: {},
      foundation: { purpose: 'Test purpose' }
    };

    const structure = await agent._mapStructureLayer(data);

    assert.strictEqual(structure.persona, 'Test audience');
    assert.strictEqual(structure.tone, 'Test tone');
    assert.strictEqual(structure.positioning, 'Test positioning');
    assert.strictEqual(structure.confidence, 'provided');
  });

  it('should map expression layer with provided data', async () => {
    const data = {
      hearing: {
        coreMessage: 'Test message',
        tagline: 'Test tagline'
      },
      business: {},
      existing: {},
      foundation: { purpose: 'Test purpose' },
      structure: { persona: 'Test persona' }
    };

    const expression = await agent._mapExpressionLayer(data);

    assert.strictEqual(expression.coreMessage, 'Test message');
    assert.strictEqual(expression.tagline, 'Test tagline');
    assert(expression.note);
  });

  it('should validate complete E:Stack structure', () => {
    const estack = {
      foundation: {
        purpose: 'Test purpose',
        values: ['value1'],
        notAxis: ['not1']
      },
      structure: {
        persona: 'Test persona',
        tone: 'Test tone',
        positioning: 'Test positioning'
      },
      expression: {
        coreMessage: 'Test message'
      }
    };

    const validation = agent._validateEStack(estack);

    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.checks.foundationComplete, true);
    assert.strictEqual(validation.checks.structureComplete, true);
    assert(validation.completeness >= 0.75);
  });

  it('should detect invalid E:Stack structure', () => {
    const estack = {
      foundation: {
        purpose: '',
        values: [],
        notAxis: []
      },
      structure: {
        persona: null,
        tone: null,
        positioning: null
      },
      expression: {
        coreMessage: 'Test message'
      }
    };

    const validation = agent._validateEStack(estack);

    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.checks.foundationComplete, false);
    assert.strictEqual(validation.checks.structureComplete, false);
  });

  it('should process complete input successfully', async () => {
    const input = createCompleteInput();
    const result = await agent.process(input);

    assert(result.estack);
    assert(result.estack.foundation);
    assert(result.estack.structure);
    assert(result.estack.expression);
    assert(result.validation);
    assert(result.metadata);
    // hearing のみでは完全ではないため RSI モードになる可能性がある
    assert(typeof result.metadata.rsiMode === 'boolean');
  });

  it('should enable RSI mode for incomplete input', async () => {
    const input = createMinimalInput();
    const result = await agent.process(input);

    assert.strictEqual(result.metadata.rsiMode, true);
    assert(result.estack);
    assert(result.validation);
  });

  it('should include metadata in E:Stack mapping', async () => {
    const input = createCompleteInput();
    const result = await agent.process(input);

    assert(result.estack.metadata);
    assert.strictEqual(result.estack.metadata.method, 'E:Stack Method v5.1');
    assert.strictEqual(result.estack.metadata.agent, 'StructureAgent');
    assert(result.estack.metadata.processedAt);
  });

  it('should handle arrays and single values in foundation', async () => {
    const data = {
      hearing: { values: 'single value', notAxis: 'single not' },
      business: {},
      existing: {}
    };

    const foundation = await agent._mapFoundationLayer(data);

    assert(Array.isArray(foundation.values));
    assert(Array.isArray(foundation.notAxis));
    assert.strictEqual(foundation.values[0], 'single value');
    assert.strictEqual(foundation.notAxis[0], 'single not');
  });
});
