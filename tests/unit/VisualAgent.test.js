/**
 * VisualAgent ユニットテスト
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { VisualAgent, VisualComponent, SystemLayer } from '../../src/agents/core/VisualAgent.js';
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

describe('VisualAgent', () => {
  let agent;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    agent = new VisualAgent({
      logger: mockLogger
    });
  });

  it('should initialize with correct type and name', () => {
    assert.strictEqual(agent.type, AgentType.VISUAL);
    assert.strictEqual(agent.name, 'VisualAgent');
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    // VisualAgent は initialize() でログ出力のみ
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

  it('should infer base colors for innovative purpose', () => {
    const foundation = { purpose: '革新する', values: ['革新'] };
    const colors = agent._inferBaseColors(foundation);

    assert.strictEqual(colors.primary, '#2196F3');
    assert.strictEqual(colors.secondary, '#03A9F4');
    assert.strictEqual(colors.accent, '#FF5722');
  });

  it('should infer base colors for trustworthy brand', () => {
    const foundation = { purpose: '信頼を提供', values: ['誠実'] };
    const colors = agent._inferBaseColors(foundation);

    assert.strictEqual(colors.primary, '#1976D2');
    assert.strictEqual(colors.secondary, '#64B5F6');
    assert.strictEqual(colors.accent, '#FFC107');
  });

  it('should infer base colors for quality-focused brand', () => {
    const foundation = { purpose: '品質を追求', values: ['洗練', '品質'] };
    const colors = agent._inferBaseColors(foundation);

    assert.strictEqual(colors.primary, '#424242');
    assert.strictEqual(colors.secondary, '#757575');
    assert.strictEqual(colors.accent, '#C0C0C0');
  });

  it('should generate color palette correctly', () => {
    const baseColors = {
      primary: '#2196F3',
      secondary: '#03A9F4',
      accent: '#FF5722'
    };
    const foundation = { purpose: 'Test' };
    const structure = { tone: 'professional' };

    const palette = agent._generateColorPalette(baseColors, foundation, structure);

    assert.strictEqual(palette.primary.main, '#2196F3');
    assert(palette.primary.light);
    assert(palette.primary.dark);
    assert.strictEqual(palette.primary.contrast, '#FFFFFF');
    assert(palette.neutral);
    assert.strictEqual(palette.neutral[100], '#FFFFFF');
    assert.strictEqual(palette.neutral[1000], '#000000');
  });

  it('should define semantic colors correctly', () => {
    const palette = { primary: { main: '#2196F3' } };
    const semantic = agent._defineSemanticColors(palette);

    assert(semantic.success);
    assert(semantic.warning);
    assert(semantic.error);
    assert(semantic.info);
    assert.strictEqual(semantic.success.main, '#4CAF50');
    assert.strictEqual(semantic.error.main, '#F44336');
  });

  it('should validate color accessibility', () => {
    const palette = { primary: { main: '#2196F3' } };
    const semantic = { success: { main: '#4CAF50' } };
    const accessibility = agent._validateColorAccessibility(palette, semantic);

    assert.strictEqual(accessibility.wcagCompliance, 'AA');
    assert(accessibility.contrastRatios);
    assert.strictEqual(accessibility.colorBlindSafe, true);
    assert(Array.isArray(accessibility.recommendations));
  });

  it('should define color usage correctly', () => {
    const palette = { primary: { main: '#2196F3' } };
    const semantic = { success: { main: '#4CAF50' } };
    const usage = agent._defineColorUsage(palette, semantic);

    assert(usage.primary);
    assert(usage.secondary);
    assert(usage.accent);
    assert(usage.semantic);
    assert(usage.primary.use);
    assert(usage.primary.avoid);
  });

  it('should select font family for professional tone', () => {
    const fonts = agent._selectFontFamily('professional');

    assert(fonts.primary.includes('Inter'));
    assert(fonts.secondary.includes('Roboto'));
    assert(fonts.mono.includes('Roboto Mono'));
  });

  it('should select font family for friendly tone', () => {
    const fonts = agent._selectFontFamily('friendly');

    assert(fonts.primary.includes('Nunito'));
    assert(fonts.secondary.includes('Open Sans'));
  });

  it('should select font family for innovative tone', () => {
    const fonts = agent._selectFontFamily('innovative');

    assert(fonts.primary.includes('Poppins'));
    assert(fonts.secondary.includes('Montserrat'));
  });

  it('should define type scale correctly', () => {
    const typeScale = agent._defineTypeScale();

    assert.strictEqual(typeScale.h1.size, '2.5rem');
    assert.strictEqual(typeScale.h1.weight, 700);
    assert.strictEqual(typeScale.body1.size, '1rem');
    assert.strictEqual(typeScale.body1.lineHeight, 1.6);
  });

  it('should define font weights correctly', () => {
    const weights = agent._defineFontWeights();

    assert.strictEqual(weights.light, 300);
    assert.strictEqual(weights.regular, 400);
    assert.strictEqual(weights.bold, 700);
  });

  it('should define typography spacing correctly', () => {
    const spacing = agent._defineTypographySpacing();

    assert(spacing.letterSpacing);
    assert(spacing.paragraphSpacing);
    assert.strictEqual(spacing.letterSpacing.normal, '0');
  });

  it('should define typography usage correctly', () => {
    const typeScale = agent._defineTypeScale();
    const usage = agent._defineTypographyUsage(typeScale);

    assert(usage.h1);
    assert(usage.body1);
    assert(usage.button);
  });

  it('should design typography system correctly', async () => {
    const estack = createTestEStack();
    const typography = await agent._designTypographySystem(estack);

    assert(typography.fontFamily);
    assert(typography.typeScale);
    assert(typography.fontWeights);
    assert(typography.spacing);
    assert(typography.usage);
  });

  it('should design grid system correctly', async () => {
    const estack = createTestEStack();
    const grid = await agent._designGridSystem(estack);

    assert.strictEqual(grid.columns, 12);
    assert(grid.gutters);
    assert(grid.margins);
    assert(grid.breakpoints);
    assert.strictEqual(grid.maxWidth, '1440px');
  });

  it('should design spacing system correctly', async () => {
    const spacing = await agent._designSpacingSystem();

    assert.strictEqual(spacing.base, 8);
    assert(spacing.scale);
    assert.strictEqual(spacing.scale[4], '1rem');
    assert(spacing.usage);
  });

  it('should design elevation system correctly', async () => {
    const estack = createTestEStack();
    const elevation = await agent._designElevationSystem(estack);

    assert(elevation.levels);
    assert.strictEqual(elevation.levels[0], 'none');
    assert(elevation.levels[1]);
    assert(elevation.usage);
    assert(elevation.usage[0].includes('背景'));
  });

  it('should design color system correctly', async () => {
    const estack = createTestEStack();
    const logoConcept = createLogoConcept();
    const colorSystem = await agent._designColorSystem(estack, logoConcept);

    assert(colorSystem.palette);
    assert(colorSystem.semantic);
    assert(colorSystem.accessibility);
    assert(colorSystem.usage);
  });

  it('should design foundation layer correctly', async () => {
    const estack = createTestEStack();
    const logoConcept = createLogoConcept();
    const foundation = await agent._designFoundation(estack, logoConcept);

    assert(foundation.color);
    assert(foundation.typography);
    assert(foundation.grid);
    assert(foundation.spacing);
    assert(foundation.elevation);
  });

  it('should design buttons correctly', () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3', dark: '#1976D2', contrast: '#FFFFFF' },
          secondary: { main: '#03A9F4', dark: '#0288D1', contrast: '#FFFFFF' },
          neutral: { 200: '#F5F5F5' }
        }
      },
      elevation: {
        levels: { 1: '0 1px 3px rgba(0,0,0,0.12)' }
      }
    };

    const buttons = agent._designButtons(foundation);

    assert(buttons.primary);
    assert(buttons.secondary);
    assert(buttons.outlined);
    assert(buttons.sizes);
    assert.strictEqual(buttons.primary.background, '#2196F3');
  });

  it('should design inputs correctly', () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3' },
          neutral: { 100: '#FFFFFF', 400: '#BDBDBD' }
        },
        semantic: {
          error: { main: '#F44336' }
        }
      }
    };

    const inputs = agent._designInputs(foundation);

    assert(inputs.default);
    assert(inputs.focus);
    assert(inputs.error);
    assert(inputs.default.border);
  });

  it('should design cards correctly', () => {
    const foundation = {
      color: {
        palette: {
          neutral: { 100: '#FFFFFF', 300: '#E0E0E0' }
        }
      },
      spacing: {
        scale: { 6: '1.5rem' }
      },
      elevation: {
        levels: { 1: 'shadow1', 2: 'shadow2' }
      }
    };

    const cards = agent._designCards(foundation);

    assert(cards.default);
    assert(cards.hover);
    assert.strictEqual(cards.default.background, '#FFFFFF');
  });

  it('should design navigation correctly', () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3' },
          neutral: { 100: '#FFFFFF', 600: '#757575' }
        }
      },
      elevation: {
        levels: { 1: 'shadow1', 2: 'shadow2' }
      }
    };

    const navigation = agent._designNavigation(foundation);

    assert(navigation.header);
    assert(navigation.sidebar);
    assert(navigation.tabs);
    assert.strictEqual(navigation.header.height, '64px');
  });

  it('should design feedback elements correctly', () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3' }
        },
        semantic: {
          success: { light: '#81C784', dark: '#388E3C' },
          warning: { light: '#FFB74D', dark: '#F57C00' },
          error: { light: '#E57373', dark: '#D32F2F' },
          info: { light: '#64B5F6', dark: '#1976D2' }
        }
      }
    };

    const feedback = agent._designFeedback(foundation);

    assert(feedback.alerts);
    assert(feedback.loaders);
    assert(feedback.alerts.success);
    assert(feedback.alerts.error);
  });

  it('should design components layer correctly', async () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3', dark: '#1976D2', contrast: '#FFFFFF' },
          secondary: { main: '#03A9F4', dark: '#0288D1', contrast: '#FFFFFF' },
          neutral: { 100: '#FFFFFF', 200: '#F5F5F5', 300: '#E0E0E0', 400: '#BDBDBD', 600: '#757575' }
        },
        semantic: {
          success: { light: '#81C784', dark: '#388E3C' },
          warning: { light: '#FFB74D', dark: '#F57C00' },
          error: { main: '#F44336', light: '#E57373', dark: '#D32F2F' },
          info: { light: '#64B5F6', dark: '#1976D2' }
        }
      },
      spacing: {
        scale: { 6: '1.5rem' }
      },
      elevation: {
        levels: { 1: 'shadow1', 2: 'shadow2' }
      }
    };
    const estack = createTestEStack();

    const components = await agent._designComponents(foundation, estack);

    assert(components.buttons);
    assert(components.inputs);
    assert(components.cards);
    assert(components.navigation);
    assert(components.feedback);
  });

  it('should design layouts correctly', () => {
    const foundation = {
      grid: {
        maxWidth: '1440px',
        columns: 12
      }
    };

    const layouts = agent._designLayouts(foundation);

    assert(layouts.appShell);
    assert(layouts.hero);
    assert(layouts.content);
    assert(layouts.dashboard);
  });

  it('should design compositions correctly', () => {
    const foundation = {
      spacing: {
        base: 8,
        scale: { 4: '1rem' }
      }
    };

    const compositions = agent._designCompositions(foundation);

    assert(compositions.spacing);
    assert(compositions.rhythm);
    assert(compositions.grouping);
    assert(compositions.hierarchy);
  });

  it('should design interactions correctly', () => {
    const foundation = {
      color: {
        palette: {
          primary: { main: '#2196F3' }
        }
      }
    };

    const interactions = agent._designInteractions(foundation);

    assert(interactions.hover);
    assert(interactions.focus);
    assert(interactions.active);
    assert(interactions.transitions);
    assert.strictEqual(interactions.hover.duration, '200ms');
  });

  it('should design patterns layer correctly', async () => {
    const foundation = {
      grid: { maxWidth: '1440px' },
      spacing: { base: 8 },
      color: {
        palette: {
          primary: { main: '#2196F3' }
        }
      }
    };
    const components = {};
    const estack = createTestEStack();

    const patterns = await agent._designPatterns(foundation, components, estack);

    assert(patterns.layouts);
    assert(patterns.compositions);
    assert(patterns.interactions);
  });

  it('should define design principles correctly', () => {
    const estack = createTestEStack();
    const principles = agent._defineDesignPrinciples(estack);

    assert(Array.isArray(principles));
    assert(principles.length > 0);
    assert(principles[0].principle);
    assert(principles[0].description);
  });

  it('should define best practices correctly', () => {
    const estack = createTestEStack();
    const practices = agent._defineBestPractices(estack);

    assert(practices.color);
    assert(practices.typography);
    assert(practices.layout);
    assert(practices.components);
    assert(Array.isArray(practices.color));
  });

  it('should define accessibility guidelines correctly', () => {
    const guidelines = agent._defineAccessibilityGuidelines();

    assert.strictEqual(guidelines.wcag, 'WCAG 2.1 Level AA 準拠');
    assert(guidelines.contrast);
    assert(guidelines.keyboard);
    assert(guidelines.screenReader);
  });

  it('should define responsiveness guidelines correctly', () => {
    const grid = {
      breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px'
      }
    };

    const guidelines = agent._defineResponsivenessGuidelines(grid);

    assert.strictEqual(guidelines.approach, 'Mobile First');
    assert(guidelines.breakpoints);
    assert(Array.isArray(guidelines.strategy));
  });

  it('should define implementation guidelines correctly', () => {
    const guidelines = agent._defineImplementationGuidelines();

    assert(Array.isArray(guidelines.technology));
    assert(Array.isArray(guidelines.documentation));
    assert(Array.isArray(guidelines.workflow));
  });

  it('should generate guidelines correctly', async () => {
    const foundation = { grid: { breakpoints: {} } };
    const components = {};
    const patterns = {};
    const estack = createTestEStack();

    const guidelines = await agent._generateGuidelines(foundation, components, patterns, estack);

    assert(Array.isArray(guidelines.principles));
    assert(guidelines.bestPractices);
    assert(guidelines.accessibility);
    assert(guidelines.responsiveness);
    assert(guidelines.implementation);
  });

  it('should generate VI guideline correctly', async () => {
    const foundation = { color: {} };
    const components = {};
    const patterns = {};
    const guidelines = { principles: [] };
    const estack = createTestEStack();

    const viGuideline = await agent._generateVIGuideline(
      foundation,
      components,
      patterns,
      guidelines,
      estack
    );

    assert(viGuideline.overview);
    assert.strictEqual(viGuideline.overview.brandName, 'Test Brand');
    assert(viGuideline.brandIdentity);
    assert(viGuideline.visualSystem);
    assert(viGuideline.applicationExamples);
    assert(viGuideline.maintenanceProtocol);
  });

  it('should process complete request successfully', async () => {
    const input = {
      estack: createTestEStack(),
      logoConcept: createLogoConcept()
    };

    const result = await agent.process(input);

    assert(result.visualSystem);
    assert(result.visualSystem.foundation);
    assert(result.visualSystem.components);
    assert(result.visualSystem.patterns);
    assert(result.guidelines);
    assert(result.viGuideline);
    assert(result.metadata);
  });

  it('should process without logo concept', async () => {
    const input = {
      estack: createTestEStack()
    };

    const result = await agent.process(input);

    assert(result.visualSystem);
    assert(result.visualSystem.foundation);
    assert(result.visualSystem.foundation.color);
  });

  it('should include metadata in process result', async () => {
    const input = {
      estack: createTestEStack()
    };

    const result = await agent.process(input);

    assert.strictEqual(result.metadata.protocol, 'Identity System Meta Principles');
    assert.strictEqual(result.metadata.agent, 'VisualAgent');
    assert(result.metadata.timestamp);
  });
});
