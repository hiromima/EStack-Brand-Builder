/**
 * CopyAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CopyAgent, ToneStrategy, VoiceArchetype } from '../../src/agents/core/CopyAgent.js';
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
    expression: {
      coreMessage: 'Test message'
    }
  };
}

function createInnovativeEStack() {
  return {
    foundation: {
      purpose: '未来を革新する',
      values: ['革新', '挑戦', '創造'],
      notAxis: ['保守', '現状維持']
    },
    structure: {
      persona: {
        description: 'テクノロジー企業'
      },
      tone: {
        voice: 'innovative'
      }
    },
    expression: {}
  };
}

describe('CopyAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new CopyAgent({
      logger: mockLogger,
      variationCount: 3
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.COPY);
    assert.strictEqual(agent.name, 'CopyAgent');
    assert.strictEqual(agent.variationCount, 3);
  });

  it('should initialize with default variation count', () => {
    const defaultAgent = new CopyAgent({ logger: mockLogger });
    assert.strictEqual(defaultAgent.variationCount, 3);
  });

  it('should initialize with custom variation count', () => {
    const customAgent = new CopyAgent({
      logger: mockLogger,
      variationCount: 5
    });
    assert.strictEqual(customAgent.variationCount, 5);
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    assert.strictEqual(agent.initialized, true);
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

  it('should infer voice archetype for trustworthy brand', () => {
    const estack = createTestEStack();
    const archetype = agent._inferVoiceArchetype(estack.foundation, estack.structure);

    // '革新性' が values に含まれるため INNOVATIVE になる
    assert.strictEqual(archetype, VoiceArchetype.INNOVATIVE);
  });

  it('should infer voice archetype for innovative brand', () => {
    const estack = createInnovativeEStack();
    const archetype = agent._inferVoiceArchetype(estack.foundation, estack.structure);

    assert.strictEqual(archetype, VoiceArchetype.INNOVATIVE);
  });

  it('should infer professional archetype as default', () => {
    const estack = {
      foundation: {
        purpose: 'General purpose',
        values: ['value1', 'value2']
      },
      structure: {
        tone: { voice: 'neutral' }
      }
    };

    const archetype = agent._inferVoiceArchetype(estack.foundation, estack.structure);
    assert.strictEqual(archetype, VoiceArchetype.PROFESSIONAL);
  });

  it('should define voice characteristics correctly', () => {
    const estack = createTestEStack();
    const characteristics = agent._defineVoiceCharacteristics(
      VoiceArchetype.PROFESSIONAL,
      estack.foundation,
      estack.structure
    );

    assert.strictEqual(characteristics.formality, 'formal');
    assert.strictEqual(characteristics.complexity, 'moderate');
    assert.strictEqual(characteristics.emotion, 'controlled');
    assert.strictEqual(characteristics.directness, 'direct');
    assert(Array.isArray(characteristics.coreValues));
    assert(characteristics.persona);
  });

  it('should define linguistic style correctly', () => {
    const style = agent._defineLinguisticStyle(
      VoiceArchetype.PROFESSIONAL,
      {}
    );

    assert(style.vocabulary);
    assert(style.sentenceStructure);
    assert(style.punctuation);
    assert(style.rhythm);
  });

  it('should synthesize personality correctly', () => {
    const estack = createTestEStack();
    const characteristics = {
      emotion: 'controlled',
      directness: 'direct'
    };

    const personality = agent._synthesizePersonality(
      estack.foundation,
      characteristics
    );

    assert(typeof personality === 'string');
    assert(personality.includes(estack.foundation.values[0]));
    assert(personality.includes(estack.foundation.purpose));
  });

  it('should generate dos for professional archetype', () => {
    const estack = createTestEStack();
    const dos = agent._generateDos(VoiceArchetype.PROFESSIONAL, estack.foundation);

    assert(Array.isArray(dos));
    assert(dos.length > 0);
    assert(dos.some(d => d.includes('明確')));
    assert(dos.some(d => d.includes(estack.foundation.values[0])));
  });

  it('should generate donts correctly', () => {
    const estack = createTestEStack();
    const characteristics = {
      formality: 'formal',
      emotion: 'controlled'
    };

    const donts = agent._generateDonts(estack.foundation.notAxis, characteristics);

    assert(Array.isArray(donts));
    assert(donts.length > 0);
    assert(donts.some(d => d.includes('妥協')));
    assert(donts.some(d => d.includes('停滞')));
  });

  it('should assess clarity based on length', () => {
    // 実装は文字数で判定: <20=very-clear, <40=clear, <80=moderate, >=80=complex
    assert.strictEqual(agent._assessClarity('短い'), 'very-clear');
    assert.strictEqual(agent._assessClarity('これは20文字以上のテキストですが40文字未満'), 'clear');
    assert.strictEqual(agent._assessClarity('これはさらに長いテキストで、文章が複雑になってきます。より詳細な説明が含まれています。'), 'moderate');
  });

  it('should assess memorability correctly', () => {
    const highMem = agent._assessMemorability('心に響く');
    const moderateMem = agent._assessMemorability('Test message');
    const lowMem = agent._assessMemorability('This is a very long message that is not memorable');

    assert(['high', 'moderate'].includes(highMem));
    assert(['moderate', 'low'].includes(moderateMem));
    assert.strictEqual(lowMem, 'low');
  });

  it('should assess rhythm correctly', () => {
    // 実装は文字数(syllables)で判定: <=15=excellent, <=25=good, <=35=moderate, >35=slow
    assert.strictEqual(agent._assessRhythm('短い'), 'excellent'); // 2文字
    assert.strictEqual(agent._assessRhythm('これは16文字以上25文字以下の範囲です'), 'good'); // 19文字
    assert.strictEqual(agent._assessRhythm('これは26文字以上35文字までの範囲のテキストですよ'), 'moderate'); // 26文字
  });

  it('should assess emotional resonance correctly', () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { emotion: 'warm' }
    };

    const highResonance = agent._assessEmotionalResonance('共に未来を実現する', voiceDesign);
    const lowResonance = agent._assessEmotionalResonance('Test message', voiceDesign);

    assert.strictEqual(highResonance, 'high');
    assert(['moderate', 'low'].includes(lowResonance));
  });

  it('should assess cultural fit correctly', () => {
    const goodFit = agent._assessCulturalFit('心に響く言葉');
    const badFit = agent._assessCulturalFit('あああああああああああああああああああああああああああああ');

    assert.strictEqual(goodFit, 'high');
    assert.strictEqual(badFit, 'low');
  });

  it('should define tone for context correctly', () => {
    const characteristics = { formality: 'formal' };
    const marketingTone = agent._defineToneForContext(
      'marketing',
      VoiceArchetype.PROFESSIONAL,
      characteristics
    );

    assert(marketingTone.energy);
    assert(marketingTone.formality);
    assert(marketingTone.emotion);
    assert(marketingTone.focus);
  });

  it('should define tone range correctly', () => {
    const characteristics = {
      formality: 'formal',
      emotion: 'controlled',
      complexity: 'moderate'
    };

    const range = agent._defineToneRange(characteristics);

    assert(range.formality.baseline === 'formal');
    assert(range.emotion.baseline === 'controlled');
    assert(range.complexity.baseline === 'moderate');
  });

  it('should generate tone guidelines', () => {
    const contexts = {
      marketing: { energy: 'high' }
    };
    const range = {
      formality: { baseline: 'formal' },
      emotion: { baseline: 'controlled' }
    };

    const guidelines = agent._generateToneGuidelines(contexts, range);

    assert(Array.isArray(guidelines));
    assert(guidelines.length > 0);
    assert(guidelines.some(g => g.includes('Voice')));
  });

  it('should generate single core message', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { emotion: 'controlled' }
    };

    const message = await agent._generateSingleCoreMessage(
      estack.foundation,
      estack.structure,
      voiceDesign,
      ToneStrategy.DECLARATIVE
    );

    assert.strictEqual(message.type, 'coreMessage');
    assert(message.content);
    assert.strictEqual(message.strategy, ToneStrategy.DECLARATIVE);
    assert(message.rationale);
    assert(message.characteristics);
    assert(message.voiceAlignment);
  });

  it('should generate single tagline', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { emotion: 'controlled' }
    };

    const tagline = await agent._generateSingleTagline(
      estack.foundation,
      voiceDesign,
      ToneStrategy.ASPIRATIONAL
    );

    assert.strictEqual(tagline.type, 'tagline');
    assert(tagline.content);
    assert.strictEqual(tagline.strategy, ToneStrategy.ASPIRATIONAL);
    assert(tagline.rationale);
    assert(tagline.characteristics);
  });

  it('should generate good examples', () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL
    };

    const examples = agent._generateGoodExamples(estack, voiceDesign);

    assert(Array.isArray(examples));
    assert(examples.length > 0);
    assert(examples.some(e => e.includes(estack.foundation.purpose)));
  });

  it('should generate bad examples', () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL
    };

    const examples = agent._generateBadExamples(estack, voiceDesign);

    assert(Array.isArray(examples));
    assert(examples.length > 0);
    assert(examples.some(e => e.includes(estack.foundation.notAxis[0])));
  });

  it('should design voice correctly', async () => {
    const estack = createTestEStack();
    const voiceDesign = await agent._designVoice(estack, {});

    assert(voiceDesign.archetype);
    assert(voiceDesign.characteristics);
    assert(voiceDesign.linguisticStyle);
    assert(voiceDesign.personality);
    assert(Array.isArray(voiceDesign.dos));
    assert(Array.isArray(voiceDesign.donts));
  });

  it('should create tonality map correctly', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { formality: 'formal' }
    };

    const toneMap = await agent._createTonalityMap(estack, voiceDesign, {});

    assert(toneMap.contexts);
    assert(toneMap.contexts.marketing);
    assert(toneMap.contexts.support);
    assert(toneMap.contexts.announcement);
    assert(toneMap.contexts.education);
    assert(toneMap.contexts.crisis);
    assert(toneMap.range);
    assert(Array.isArray(toneMap.guidelines));
  });

  it('should generate core messages correctly', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { emotion: 'controlled' }
    };

    const messages = await agent._generateCoreMessages(estack, voiceDesign, 3);

    assert(Array.isArray(messages));
    assert.strictEqual(messages.length, 3);
    assert(messages[0].id);
    assert.strictEqual(messages[0].index, 0);
    assert(messages[0].content);
  });

  it('should generate taglines correctly', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      characteristics: { emotion: 'controlled' }
    };

    const taglines = await agent._generateTaglines(estack, voiceDesign, 3);

    assert(Array.isArray(taglines));
    assert.strictEqual(taglines.length, 3);
    assert(taglines[0].id);
    assert.strictEqual(taglines[0].index, 0);
    assert(taglines[0].content);
  });

  it('should generate voice guide correctly', async () => {
    const estack = createTestEStack();
    const voiceDesign = {
      archetype: VoiceArchetype.PROFESSIONAL,
      personality: 'Test personality',
      characteristics: {
        coreValues: ['value1', 'value2']
      },
      dos: ['Do this'],
      donts: ['Don\'t do this'],
      linguisticStyle: { vocabulary: 'Professional' }
    };
    const toneMap = {
      contexts: {},
      range: {}
    };

    const guide = await agent._generateVoiceGuide(voiceDesign, toneMap, estack);

    assert(guide.summary);
    assert(guide.summary.archetype);
    assert(guide.guidelines);
    assert(guide.guidelines.dos);
    assert(guide.guidelines.donts);
    assert(guide.tonalityMap);
    assert(guide.examples);
    assert(guide.examples.good);
    assert(guide.examples.bad);
    assert(guide.application);
  });

  it('should process complete request successfully', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'all',
      requirements: {}
    };

    const result = await agent.process(input);

    assert(result.voiceDesign);
    assert(result.toneMap);
    assert(Array.isArray(result.coreMessages));
    assert(Array.isArray(result.taglines));
    assert(result.voiceGuide);
    assert(result.metadata);
    assert.strictEqual(result.metadata.variationCount, 3);
    assert.strictEqual(result.metadata.target, 'all');
  });

  it('should process with target coreMessage only', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'coreMessage'
    };

    const result = await agent.process(input);

    assert(Array.isArray(result.coreMessages));
    assert(result.coreMessages.length > 0);
    assert.strictEqual(result.taglines.length, 0);
  });

  it('should process with target tagline only', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'tagline'
    };

    const result = await agent.process(input);

    assert(Array.isArray(result.taglines));
    assert(result.taglines.length > 0);
    assert.strictEqual(result.coreMessages.length, 0);
  });

  it('should include metadata in process result', async () => {
    const input = {
      estack: createTestEStack(),
      target: 'all'
    };

    const result = await agent.process(input);

    assert.strictEqual(result.metadata.agent, 'CopyAgent');
    assert.strictEqual(result.metadata.protocol, 'Brand Principles Atlas v1.1');
    assert(result.metadata.timestamp);
  });
});
