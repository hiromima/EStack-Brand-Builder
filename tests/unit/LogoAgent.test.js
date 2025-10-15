/**
 * LogoAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { LogoAgent, ShapeType, DesignDirection } from '../../src/agents/core/LogoAgent.js';
import { AgentType } from '../../src/agents/base/BaseAgent.js';

// テストデータ生成ヘルパー
function createTestEStack() {
  return {
    foundation: {
      purpose: 'お客様の課題を解決する',
      values: ['誠実', '革新', '品質'],
      notAxis: ['妥協', '停滞']
    },
    structure: {
      persona: { description: '中小企業の経営者' },
      tone: { voice: 'professional' },
      positioning: '業界をリードする存在'
    },
    expression: {
      brandName: 'Test Brand'
    }
  };
}

function createInnovativeEStack() {
  return {
    foundation: {
      purpose: '未来を革新する',
      values: ['革新', '成長', '挑戦'],
      notAxis: ['保守', '停滞']
    },
    structure: {
      persona: { description: 'テクノロジー企業' },
      tone: { voice: 'innovative' },
      positioning: '業界の先駆者'
    },
    expression: {
      brandName: 'Innovation Co.'
    }
  };
}

function createLogoConcept() {
  return {
    styling: {
      colorPalette: {
        primary: '#2196F3',
        secondary: '#03A9F4',
        accent: '#FF5722'
      }
    }
  };
}

describe('LogoAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new LogoAgent({
      logger: mockLogger,
      variationCount: 3
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.LOGO);
    assert.strictEqual(agent.name, 'LogoAgent');
    assert.strictEqual(agent.variationCount, 3);
  });

  it('should initialize with default variation count', () => {
    const defaultAgent = new LogoAgent({ logger: mockLogger });
    assert.strictEqual(defaultAgent.variationCount, 3);
  });

  it('should initialize with custom variation count', () => {
    const customAgent = new LogoAgent({
      logger: mockLogger,
      variationCount: 5
    });
    assert.strictEqual(customAgent.variationCount, 5);
  });

  it('should initialize IAF Engine', () => {
    assert(agent.iafEngine);
    assert.strictEqual(agent.iafEngine.version, '1.0');
    assert.strictEqual(agent.iafEngine.protocol, 'IAF Engine Full');
    assert(agent.iafEngine.mappingRules);
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    // LogoAgent は initialize() でログ出力のみ
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

  it('should have correct mapping rules for meaning to shape', () => {
    const rules = agent.iafEngine.mappingRules.meaningToShape;

    assert.strictEqual(rules['信頼'], ShapeType.CIRCLE);
    assert.strictEqual(rules['安定'], ShapeType.SQUARE);
    assert.strictEqual(rules['革新'], ShapeType.TRIANGLE);
    assert.strictEqual(rules['成長'], ShapeType.SPIRAL);
  });

  it('should have correct mapping rules for tone to direction', () => {
    const rules = agent.iafEngine.mappingRules.toneToDirection;

    assert.strictEqual(rules.professional, DesignDirection.MINIMAL);
    assert.strictEqual(rules.friendly, DesignDirection.ORGANIC);
    assert.strictEqual(rules.innovative, DesignDirection.DYNAMIC);
    assert.strictEqual(rules.trustworthy, DesignDirection.ELEGANT);
  });

  it('should map values to symbols correctly', () => {
    const values = ['誠実', '革新', '品質'];
    const symbols = agent._mapValuesToSymbols(values);

    assert.strictEqual(symbols.length, 3);
    assert.strictEqual(symbols[0].value, '誠実');
    assert.strictEqual(symbols[0].shape, ShapeType.CIRCLE);
    assert.strictEqual(symbols[0].meaning, '完全性と透明性');
  });

  it('should handle unmapped values with default symbol', () => {
    const values = ['unknown'];
    const symbols = agent._mapValuesToSymbols(values);

    assert.strictEqual(symbols.length, 1);
    assert.strictEqual(symbols[0].shape, ShapeType.CIRCLE);
    assert(symbols[0].meaning.includes('unknown'));
  });

  it('should infer visual characteristics for professional tone', () => {
    const tone = { voice: 'professional' };
    const foundation = { purpose: 'Test' };
    const characteristics = agent._inferVisualCharacteristics(tone, foundation);

    assert.strictEqual(characteristics.direction, DesignDirection.MINIMAL);
    assert.strictEqual(characteristics.weight, 'light');
    assert.strictEqual(characteristics.balance, 'symmetric');
  });

  it('should infer visual characteristics for innovative tone', () => {
    const tone = { voice: 'innovative' };
    const foundation = { purpose: '革新する' };
    const characteristics = agent._inferVisualCharacteristics(tone, foundation);

    assert.strictEqual(characteristics.direction, DesignDirection.DYNAMIC);
    assert.strictEqual(characteristics.weight, 'heavy');
    assert.strictEqual(characteristics.balance, 'asymmetric');
    assert.strictEqual(characteristics.rhythm, 'dynamic');
  });

  it('should infer weight based on direction', () => {
    assert.strictEqual(agent._inferWeight(DesignDirection.BOLD, 'bold'), 'heavy');
    assert.strictEqual(agent._inferWeight(DesignDirection.MINIMAL, 'minimal'), 'light');
    assert.strictEqual(agent._inferWeight(DesignDirection.ORGANIC, 'organic'), 'medium');
  });

  it('should infer balance based on direction', () => {
    assert.strictEqual(agent._inferBalance(DesignDirection.DYNAMIC), 'asymmetric');
    assert.strictEqual(agent._inferBalance(DesignDirection.MINIMAL), 'symmetric');
    assert.strictEqual(agent._inferBalance(DesignDirection.ORGANIC), 'balanced');
  });

  it('should infer rhythm based on purpose', () => {
    assert.strictEqual(agent._inferRhythm({ purpose: '革新する' }), 'dynamic');
    assert.strictEqual(agent._inferRhythm({ purpose: '安定を提供' }), 'steady');
    assert.strictEqual(agent._inferRhythm({ purpose: 'サービス提供' }), 'moderate');
  });

  it('should infer whitespace based on direction', () => {
    assert.strictEqual(agent._inferWhitespace(DesignDirection.MINIMAL), 'generous');
    assert.strictEqual(agent._inferWhitespace(DesignDirection.ELEGANT), 'generous');
    assert.strictEqual(agent._inferWhitespace(DesignDirection.BOLD), 'minimal');
    assert.strictEqual(agent._inferWhitespace(DesignDirection.ORGANIC), 'moderate');
  });

  it('should extract differentiators from positioning', () => {
    const positioning = 'Test positioning';
    const foundation = { notAxis: ['妥協'] };
    const differentiators = agent._extractDifferentiators(positioning, foundation);

    assert(Array.isArray(differentiators));
    assert(differentiators.length >= 2);
    assert(differentiators.some(d => d.type === 'positioning'));
    assert(differentiators.some(d => d.type === 'contrast'));
  });

  it('should synthesize metaphor correctly', () => {
    const foundation = { purpose: 'Test purpose', values: ['誠実'] };
    const structure = { persona: 'Test persona' };
    const metaphor = agent._synthesizeMetaphor(foundation, structure);

    assert(typeof metaphor === 'string');
    assert(metaphor.includes('誠実'));
    assert(metaphor.includes('Test purpose'));
  });

  it('should extract symbolism from estack', async () => {
    const estack = createTestEStack();
    const symbolism = await agent._extractSymbolism(estack);

    assert(symbolism.coreSymbols);
    assert(Array.isArray(symbolism.coreSymbols));
    assert(symbolism.visualCharacteristics);
    assert(symbolism.differentiators);
    assert(symbolism.primaryShape);
    assert(symbolism.metaphor);
  });

  it('should define geometry correctly', () => {
    const shapes = [ShapeType.CIRCLE];
    const visualCharacteristics = {
      weight: 'heavy',
      direction: DesignDirection.GEOMETRIC,
      rhythm: 'dynamic',
      balance: 'symmetric'
    };

    const geometry = agent._defineGeometry(shapes, visualCharacteristics);

    assert.deepStrictEqual(geometry.baseShapes, shapes);
    assert.strictEqual(geometry.complexity, 'simple');
    assert.strictEqual(geometry.scale, 'large');
    assert.strictEqual(geometry.precision, 'high');
  });

  it('should determine orientation based on characteristics', () => {
    const dynamic = agent._determineOrientation({ rhythm: 'dynamic', balance: 'balanced' });
    const symmetric = agent._determineOrientation({ rhythm: 'moderate', balance: 'symmetric' });
    const other = agent._determineOrientation({ rhythm: 'steady', balance: 'balanced' });

    assert.strictEqual(dynamic, 'diagonal');
    assert.strictEqual(symmetric, 'vertical');
    assert.strictEqual(other, 'horizontal');
  });

  it('should define proportion with golden ratio for elegant direction', () => {
    const elegant = agent._defineProportion({ direction: DesignDirection.ELEGANT });
    const other = agent._defineProportion({ direction: DesignDirection.MINIMAL });

    assert.strictEqual(elegant.ratio, 1.618);
    assert.strictEqual(other.ratio, 1.5);
  });

  it('should generate single form design with primary-focus strategy', async () => {
    const symbolism = {
      primaryShape: ShapeType.CIRCLE,
      secondaryShapes: [ShapeType.TRIANGLE, ShapeType.SQUARE],
      visualCharacteristics: { weight: 'medium', direction: DesignDirection.MINIMAL }
    };
    const estack = createTestEStack();

    const design = await agent._generateSingleFormDesign(symbolism, estack, 0);

    assert.strictEqual(design.strategy, 'primary-focus');
    assert.deepStrictEqual(design.shapes, [ShapeType.CIRCLE]);
    assert.strictEqual(design.composition, 'single-primary');
    assert(design.geometry);
    assert(design.proportion);
    assert(design.rationale);
  });

  it('should generate single form design with hybrid strategy', async () => {
    const symbolism = {
      primaryShape: ShapeType.CIRCLE,
      secondaryShapes: [ShapeType.TRIANGLE],
      visualCharacteristics: { weight: 'medium', direction: DesignDirection.MINIMAL }
    };
    const estack = createTestEStack();

    const design = await agent._generateSingleFormDesign(symbolism, estack, 1);

    assert.strictEqual(design.strategy, 'hybrid');
    assert.strictEqual(design.shapes.length, 2);
    assert.strictEqual(design.composition, 'primary-secondary');
  });

  it('should generate form designs with correct count', async () => {
    const symbolism = {
      primaryShape: ShapeType.CIRCLE,
      secondaryShapes: [ShapeType.TRIANGLE],
      visualCharacteristics: { weight: 'medium', direction: DesignDirection.MINIMAL }
    };
    const estack = createTestEStack();

    const designs = await agent._generateFormDesigns(symbolism, estack, 3);

    assert(Array.isArray(designs));
    assert.strictEqual(designs.length, 3);
    assert(designs[0].id.startsWith('form-'));
    assert.strictEqual(designs[0].index, 0);
  });

  it('should design single composition correctly', async () => {
    const formDesign = {
      shapes: [ShapeType.CIRCLE],
      geometry: { orientation: 'vertical', scale: 'large' }
    };
    const estack = createTestEStack();
    const symbolism = {
      visualCharacteristics: { balance: 'symmetric', whitespace: 'generous' }
    };

    const composition = await agent._designSingleComposition(formDesign, estack, symbolism);

    assert(composition.layout);
    assert(composition.iconPlacement);
    assert(composition.textPlacement);
    assert(composition.hierarchy);
  });

  it('should define layout based on balance', () => {
    const symmetric = agent._defineLayout(
      { geometry: {} },
      { visualCharacteristics: { balance: 'symmetric', whitespace: 'generous' } }
    );
    const asymmetric = agent._defineLayout(
      { geometry: {} },
      { visualCharacteristics: { balance: 'asymmetric', whitespace: 'minimal' } }
    );

    assert.strictEqual(symmetric.type, 'centered');
    assert.strictEqual(symmetric.alignment, 'center');
    assert.strictEqual(asymmetric.type, 'dynamic');
    assert.strictEqual(asymmetric.alignment, 'left');
  });

  it('should define text placement based on orientation', () => {
    const vertical = agent._defineTextPlacement(
      { geometry: { orientation: 'vertical' } },
      createTestEStack()
    );
    const horizontal = agent._defineTextPlacement(
      { geometry: { orientation: 'horizontal' } },
      createTestEStack()
    );

    assert.strictEqual(vertical.position, 'below');
    assert.strictEqual(horizontal.position, 'right');
  });

  it('should define color palette based on precision', () => {
    const high = agent._defineColorPalette({ geometry: { precision: 'high' } }, createTestEStack());
    const low = agent._defineColorPalette({ geometry: { precision: 'moderate' } }, createTestEStack());

    assert.strictEqual(high.primary, '#000000');
    assert.strictEqual(low.primary, '#FF5722');
  });

  it('should define line style based on geometry', () => {
    const large = agent._defineLineStyle({ geometry: { scale: 'large', precision: 'high' } });
    const small = agent._defineLineStyle({ geometry: { scale: 'moderate', precision: 'moderate' } });

    assert.strictEqual(large.weight, 'heavy');
    assert.strictEqual(large.type, 'precise');
    assert.strictEqual(small.weight, 'medium');
    assert.strictEqual(small.type, 'organic');
  });

  it('should define typography based on tone', () => {
    const friendly = agent._defineTypography(
      { geometry: { scale: 'large' }, layout: { alignment: 'center' } },
      { structure: { tone: { voice: 'friendly' } } }
    );
    const professional = agent._defineTypography(
      { geometry: { scale: 'moderate' }, layout: { alignment: 'left' } },
      createTestEStack()
    );

    assert(friendly.family.includes('Rounded'));
    assert.strictEqual(friendly.weight, 'bold');
    assert(!professional.family.includes('Rounded'));
    assert.strictEqual(professional.weight, 'medium');
  });

  it('should check visual clarity based on shape count', () => {
    assert.strictEqual(agent._checkVisualClarity({ shapes: [ShapeType.CIRCLE] }), 10);
    assert.strictEqual(agent._checkVisualClarity({ shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE] }), 10);
    assert.strictEqual(agent._checkVisualClarity({ shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE, ShapeType.SQUARE] }), 8);
    assert.strictEqual(agent._checkVisualClarity({ shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE, ShapeType.SQUARE, ShapeType.LINE] }), 6);
  });

  it('should check scalability based on format', () => {
    assert.strictEqual(agent._checkScalability({ technical: { format: ['SVG', 'PNG'] } }), 10);
    assert.strictEqual(agent._checkScalability({ technical: { format: ['PNG'] } }), 7);
  });

  it('should check memorability based on simplicity', () => {
    assert.strictEqual(agent._checkMemorability({ shapes: [ShapeType.CIRCLE] }), 9);
    assert.strictEqual(agent._checkMemorability({ shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE] }), 9);
    assert.strictEqual(agent._checkMemorability({ shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE, ShapeType.SQUARE] }), 7);
  });

  it('should calculate validation score correctly', () => {
    const checks = {
      brandConsistency: 9,
      visualClarity: 10,
      scalability: 10,
      memorability: 9,
      uniqueness: 8,
      reproductibility: 9
    };

    const score = agent._calculateValidationScore(checks);
    assert.strictEqual(score, 92); // average 9.17 * 10
  });

  it('should generate recommendations based on score', () => {
    const highScore = agent._generateRecommendations({ check1: 9, check2: 10 }, 95);
    const mediumScore = agent._generateRecommendations({ check1: 8, check2: 9 }, 85);
    const lowScore = agent._generateRecommendations({ check1: 6, check2: 5 }, 55);

    assert(highScore.some(r => r.includes('✅')));
    assert(mediumScore.some(r => r.includes('⚠️')));
    assert(lowScore.some(r => r.includes('❌')));
  });

  it('should validate single concept correctly', () => {
    const concept = {
      id: 'test-1',
      shapes: [ShapeType.CIRCLE, ShapeType.TRIANGLE],
      technical: { format: ['SVG', 'PNG'] }
    };
    const estack = createTestEStack();

    const validation = agent._validateSingleConcept(concept, estack);

    assert.strictEqual(validation.conceptId, 'test-1');
    assert(validation.checks);
    assert(typeof validation.score === 'number');
    assert(typeof validation.passed === 'boolean');
    assert(Array.isArray(validation.recommendations));
  });

  it('should generate validation summary correctly', () => {
    const validations = [
      { score: 95, passed: true },
      { score: 87, passed: true },
      { score: 78, passed: false }
    ];

    const summary = agent._generateValidationSummary(validations);

    assert.strictEqual(summary.totalEvaluated, 3);
    assert.strictEqual(summary.passedCount, 2);
    assert.strictEqual(summary.bestScore, 95);
    assert(summary.averageScore > 0);
  });

  it('should generate design checklist', () => {
    const checklist = agent._generateDesignChecklist();

    assert(Array.isArray(checklist));
    assert(checklist.length > 0);
    assert(checklist.every(item => item.includes('✓')));
  });

  it('should generate design principles correctly', () => {
    const symbolism = {
      metaphor: 'Test metaphor',
      visualCharacteristics: { direction: DesignDirection.MINIMAL }
    };
    const estack = createTestEStack();

    const principles = agent._generateDesignPrinciples(symbolism, estack);

    assert.strictEqual(principles.philosophy, '意味が形に先立つ - ロゴは思想の断面図');
    assert.strictEqual(principles.approach, 'IAF Engine による体系的設計');
    assert.strictEqual(principles.coreSymbolism, 'Test metaphor');
    assert(Array.isArray(principles.constraints));
  });

  it('should process complete request successfully', async () => {
    const input = {
      estack: createTestEStack(),
      variations: 3
    };

    const result = await agent.process(input);

    assert(result.symbolism);
    assert(result.concepts);
    assert(Array.isArray(result.concepts));
    assert.strictEqual(result.concepts.length, 3);
    assert(result.validation);
    assert(result.designPrinciples);
    assert(result.metadata);
    assert.strictEqual(result.metadata.variationCount, 3);
  });

  it('should use default variation count when not specified', async () => {
    const input = {
      estack: createTestEStack()
    };

    const result = await agent.process(input);

    assert.strictEqual(result.concepts.length, 3);
    assert.strictEqual(result.metadata.variationCount, 3);
  });

  it('should include metadata in process result', async () => {
    const input = {
      estack: createTestEStack()
    };

    const result = await agent.process(input);

    assert.strictEqual(result.metadata.protocol, 'IAF Engine Full');
    assert.strictEqual(result.metadata.agent, 'LogoAgent');
    assert(result.metadata.timestamp);
  });
});
