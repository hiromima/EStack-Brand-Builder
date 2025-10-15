/**
 * @file LogoAgent.js
 * @description ロゴ・象徴設計エージェント
 * @responsibilities
 * - IAF Engine Full に基づくロゴ設計
 * - Brand Principles Atlas v1.1 準拠
 * - 意味から形への体系的変換
 * - シンボル分析と視覚化
 * - 多層的意味の表現
 * @module LogoAgent
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * 基本図形タイプ
 * @enum {string}
 */
export const ShapeType = {
  CIRCLE: 'circle',       // 全体性・調和・永続
  TRIANGLE: 'triangle',   // 方向性・緊張・変化
  SQUARE: 'square',       // 安定・構造・秩序
  LINE: 'line',           // 接続・移動・時間軸
  DOT: 'dot',             // 起点・焦点・単位
  WAVE: 'wave',           // 情報・エネルギー
  SPIRAL: 'spiral',       // 成長・進化
  GRID: 'grid'            // システム・空間
};

/**
 * デザイン方向性
 * @enum {string}
 */
export const DesignDirection = {
  MINIMAL: 'minimal',           // ミニマル・削ぎ落とし
  BOLD: 'bold',                 // 大胆・ダイナミック
  ORGANIC: 'organic',           // 有機的・柔らか
  GEOMETRIC: 'geometric',       // 幾何学的・精密
  ELEGANT: 'elegant',           // 優雅・洗練
  DYNAMIC: 'dynamic'            // 動的・エネルギッシュ
};

/**
 * LogoAgent クラス
 *
 * IAF Engine を用いたロゴ設計とシンボル分析を担当
 *
 * @extends BaseAgent
 */
export class LogoAgent extends BaseAgent {
  /**
   * @param {Object} options - エージェント設定オプション
   * @param {Object} [options.logger] - ロガー
   * @param {Object} [options.knowledge] - ナレッジベース
   * @param {number} [options.variationCount] - バリエーション数
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.LOGO,
      name: 'LogoAgent'
    });

    this.options = options;
    this.variationCount = this.options.variationCount || 3;
    this.iafEngine = this._initializeIAFEngine();
  }

  /**
   * エージェントの初期化
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[LogoAgent] Initializing...');
    this.logger?.info('[LogoAgent] IAF Engine version:', this.iafEngine.version);
    this.logger?.info('[LogoAgent] Default variations:', this.variationCount);
    this.logger?.info('[LogoAgent] Initialized successfully');
  }

  /**
   * IAF Engine 初期化
   *
   * @private
   * @returns {Object}
   */
  _initializeIAFEngine() {
    return {
      version: '1.0',
      protocol: 'IAF Engine Full',
      mappingRules: this._loadMappingRules()
    };
  }

  /**
   * メイン処理: ロゴ設計
   *
   * @param {Object} input - 入力データ
   * @param {Object} input.estack - E:Stack構造
   * @param {Object} [input.requirements] - 追加要件
   * @param {number} [input.variations] - バリエーション数
   * @returns {Promise<Object>} ロゴ設計結果
   */
  async process(input) {
    this.logger.info('[LogoAgent] ロゴ設計開始', { input });

    const { estack, requirements = {}, variations = this.variationCount } = input;

    if (!estack) {
      throw new Error('E:Stack 構造が必要です');
    }

    // Phase 1: 意味抽出 (IAF Processor)
    const symbolism = await this._extractSymbolism(estack);

    // Phase 2: 形状設計 (Form Builder)
    const formDesigns = await this._generateFormDesigns(
      symbolism,
      estack,
      variations
    );

    // Phase 3: 構成設計 (Composition)
    const compositions = await this._designCompositions(
      formDesigns,
      estack,
      symbolism
    );

    // Phase 4: スタイリング (Styling)
    const styledConcepts = await this._applyStylization(
      compositions,
      estack
    );

    // Phase 5: 検証 (Evaluator)
    const validation = await this._validateLogoConcepts(
      styledConcepts,
      estack
    );

    return {
      symbolism,
      concepts: styledConcepts,
      validation,
      designPrinciples: this._generateDesignPrinciples(symbolism, estack),
      metadata: {
        protocol: this.iafEngine.protocol,
        variationCount: variations,
        timestamp: new Date().toISOString(),
        agent: this.name
      }
    };
  }

  /**
   * マッピングルール読み込み
   *
   * @private
   * @returns {Object}
   */
  _loadMappingRules() {
    return {
      meaningToShape: {
        '信頼': ShapeType.CIRCLE,
        '安定': ShapeType.SQUARE,
        '革新': ShapeType.TRIANGLE,
        '成長': ShapeType.SPIRAL,
        '調和': ShapeType.CIRCLE,
        '変化': ShapeType.WAVE,
        '精密': ShapeType.GRID,
        '接続': ShapeType.LINE
      },
      toneToDirection: {
        'professional': DesignDirection.MINIMAL,
        'friendly': DesignDirection.ORGANIC,
        'innovative': DesignDirection.DYNAMIC,
        'trustworthy': DesignDirection.ELEGANT,
        'bold': DesignDirection.BOLD,
        'sophisticated': DesignDirection.GEOMETRIC
      },
      valueToSymbol: {
        '誠実': { shape: ShapeType.CIRCLE, meaning: '完全性と透明性' },
        '革新': { shape: ShapeType.TRIANGLE, meaning: '前進と変化' },
        '品質': { shape: ShapeType.SQUARE, meaning: '堅実と構造' },
        '成長': { shape: ShapeType.SPIRAL, meaning: '進化と拡大' },
        '調和': { shape: ShapeType.CIRCLE, meaning: 'バランスと統合' }
      }
    };
  }

  /**
   * 象徴性抽出 (IAF Processor)
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @returns {Promise<Object>}
   */
  async _extractSymbolism(estack) {
    const { foundation, structure } = estack;

    // Core Message から象徴性を抽出
    const coreSymbols = this._mapValuesToSymbols(foundation.values);

    // Tone & Voice から視覚特性を抽出
    const visualCharacteristics = this._inferVisualCharacteristics(
      structure.tone,
      foundation
    );

    // Positioning から差別化要素を抽出
    const differentiators = this._extractDifferentiators(
      structure.positioning,
      foundation
    );

    return {
      coreSymbols,
      visualCharacteristics,
      differentiators,
      primaryShape: coreSymbols[0]?.shape || ShapeType.CIRCLE,
      secondaryShapes: coreSymbols.slice(1, 3).map(s => s.shape),
      metaphor: this._synthesizeMetaphor(foundation, structure)
    };
  }

  /**
   * 価値観をシンボルにマッピング
   *
   * @private
   * @param {Array} values - 価値観
   * @returns {Array}
   */
  _mapValuesToSymbols(values) {
    const mappingRules = this.iafEngine.mappingRules.valueToSymbol;
    const symbols = [];

    for (const value of values) {
      // 完全一致を探す
      let symbol = mappingRules[value];

      // 部分一致を探す
      if (!symbol) {
        for (const [key, val] of Object.entries(mappingRules)) {
          if (value.includes(key) || key.includes(value)) {
            symbol = val;
            break;
          }
        }
      }

      // デフォルト
      if (!symbol) {
        symbol = {
          shape: ShapeType.CIRCLE,
          meaning: `${value}の象徴`
        };
      }

      symbols.push({
        value,
        ...symbol
      });
    }

    return symbols;
  }

  /**
   * 視覚特性推論
   *
   * @private
   * @param {Object} tone - トーン情報
   * @param {Object} foundation - Foundation Layer
   * @returns {Object}
   */
  _inferVisualCharacteristics(tone, foundation) {
    const voice = tone?.voice?.toLowerCase() || 'professional';
    const mappingRules = this.iafEngine.mappingRules;

    // Tone から デザイン方向性を決定
    let direction = DesignDirection.MINIMAL;
    for (const [key, value] of Object.entries(mappingRules.toneToDirection)) {
      if (voice.includes(key)) {
        direction = value;
        break;
      }
    }

    return {
      direction,
      weight: this._inferWeight(direction, voice),
      balance: this._inferBalance(direction),
      rhythm: this._inferRhythm(foundation),
      whitespace: this._inferWhitespace(direction)
    };
  }

  /**
   * ウェイト推論
   *
   * @private
   * @param {DesignDirection} direction - デザイン方向性
   * @param {string} voice - ボイス
   * @returns {string}
   */
  _inferWeight(direction, voice) {
    if (direction === DesignDirection.BOLD || direction === DesignDirection.DYNAMIC) {
      return 'heavy';
    }
    if (direction === DesignDirection.MINIMAL || direction === DesignDirection.ELEGANT) {
      return 'light';
    }
    return 'medium';
  }

  /**
   * バランス推論
   *
   * @private
   * @param {DesignDirection} direction - デザイン方向性
   * @returns {string}
   */
  _inferBalance(direction) {
    if (direction === DesignDirection.DYNAMIC) {
      return 'asymmetric';
    }
    if (direction === DesignDirection.MINIMAL || direction === DesignDirection.ELEGANT) {
      return 'symmetric';
    }
    return 'balanced';
  }

  /**
   * リズム推論
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @returns {string}
   */
  _inferRhythm(foundation) {
    const purpose = foundation.purpose?.toLowerCase() || '';

    if (purpose.includes('革新') || purpose.includes('未来')) {
      return 'dynamic';
    }
    if (purpose.includes('安定') || purpose.includes('信頼')) {
      return 'steady';
    }
    return 'moderate';
  }

  /**
   * 余白推論
   *
   * @private
   * @param {DesignDirection} direction - デザイン方向性
   * @returns {string}
   */
  _inferWhitespace(direction) {
    if (direction === DesignDirection.MINIMAL || direction === DesignDirection.ELEGANT) {
      return 'generous';
    }
    if (direction === DesignDirection.BOLD) {
      return 'minimal';
    }
    return 'moderate';
  }

  /**
   * 差別化要素抽出
   *
   * @private
   * @param {string} positioning - ポジショニング
   * @param {Object} foundation - Foundation Layer
   * @returns {Array}
   */
  _extractDifferentiators(positioning, foundation) {
    const differentiators = [];

    if (positioning) {
      differentiators.push({
        type: 'positioning',
        value: positioning,
        visual: 'ポジショニングを視覚的に表現する要素'
      });
    }

    // NOT Axis から差別化要素を抽出
    if (foundation.notAxis && foundation.notAxis.length > 0) {
      differentiators.push({
        type: 'contrast',
        value: foundation.notAxis[0],
        visual: `「${foundation.notAxis[0]}」と対照的な視覚表現`
      });
    }

    return differentiators;
  }

  /**
   * メタファー統合
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} structure - Structure Layer
   * @returns {string}
   */
  _synthesizeMetaphor(foundation, structure) {
    const purpose = foundation.purpose;
    const primaryValue = foundation.values[0];

    return `${primaryValue}を核とし、${purpose}という方向性を持つビジュアルメタファー`;
  }

  /**
   * 形状設計 (Form Builder)
   *
   * @private
   * @param {Object} symbolism - 象徴性
   * @param {Object} estack - E:Stack構造
   * @param {number} count - バリエーション数
   * @returns {Promise<Array>}
   */
  async _generateFormDesigns(symbolism, estack, count) {
    const designs = [];

    for (let i = 0; i < count; i++) {
      const design = await this._generateSingleFormDesign(
        symbolism,
        estack,
        i
      );

      designs.push({
        id: `form-${i + 1}`,
        index: i,
        ...design
      });
    }

    return designs;
  }

  /**
   * 単一形状設計
   *
   * @private
   * @param {Object} symbolism - 象徴性
   * @param {Object} estack - E:Stack構造
   * @param {number} variation - バリエーション番号
   * @returns {Promise<Object>}
   */
  async _generateSingleFormDesign(symbolism, estack, variation) {
    const { primaryShape, secondaryShapes, visualCharacteristics } = symbolism;

    // バリエーション戦略
    const strategies = ['primary-focus', 'hybrid', 'abstract'];
    const strategy = strategies[variation % strategies.length];

    let shapes;
    let composition;

    switch (strategy) {
      case 'primary-focus':
        shapes = [primaryShape];
        composition = 'single-primary';
        break;

      case 'hybrid':
        shapes = [primaryShape, secondaryShapes[0]].filter(Boolean);
        composition = 'primary-secondary';
        break;

      case 'abstract':
        shapes = [primaryShape, ...secondaryShapes].filter(Boolean);
        composition = 'abstract-composition';
        break;

      default:
        shapes = [primaryShape];
        composition = 'single-primary';
    }

    return {
      strategy,
      shapes,
      composition,
      geometry: this._defineGeometry(shapes, visualCharacteristics),
      proportion: this._defineProportion(visualCharacteristics),
      rationale: this._explainFormRationale(shapes, symbolism, strategy)
    };
  }

  /**
   * ジオメトリ定義
   *
   * @private
   * @param {Array} shapes - 形状
   * @param {Object} visualCharacteristics - 視覚特性
   * @returns {Object}
   */
  _defineGeometry(shapes, visualCharacteristics) {
    return {
      baseShapes: shapes,
      complexity: shapes.length > 1 ? 'compound' : 'simple',
      orientation: this._determineOrientation(visualCharacteristics),
      scale: visualCharacteristics.weight === 'heavy' ? 'large' : 'moderate',
      precision: visualCharacteristics.direction === DesignDirection.GEOMETRIC ? 'high' : 'moderate'
    };
  }

  /**
   * 方向性決定
   *
   * @private
   * @param {Object} visualCharacteristics - 視覚特性
   * @returns {string}
   */
  _determineOrientation(visualCharacteristics) {
    if (visualCharacteristics.rhythm === 'dynamic') {
      return 'diagonal';
    }
    if (visualCharacteristics.balance === 'symmetric') {
      return 'vertical';
    }
    return 'horizontal';
  }

  /**
   * プロポーション定義
   *
   * @private
   * @param {Object} visualCharacteristics - 視覚特性
   * @returns {Object}
   */
  _defineProportion(visualCharacteristics) {
    const goldenRatio = 1.618;

    return {
      ratio: visualCharacteristics.direction === DesignDirection.ELEGANT ? goldenRatio : 1.5,
      height: 100,
      width: visualCharacteristics.direction === DesignDirection.ELEGANT ? 100 * goldenRatio : 150,
      unit: 'relative'
    };
  }

  /**
   * 形状根拠説明
   *
   * @private
   * @param {Array} shapes - 形状
   * @param {Object} symbolism - 象徴性
   * @param {string} strategy - 戦略
   * @returns {string}
   */
  _explainFormRationale(shapes, symbolism, strategy) {
    const shapeNames = shapes.join(' + ');
    return `${strategy} 戦略: ${shapeNames} を用いて ${symbolism.metaphor}`;
  }

  /**
   * 構成設計 (Composition Agent)
   *
   * @private
   * @param {Array} formDesigns - 形状設計
   * @param {Object} estack - E:Stack構造
   * @param {Object} symbolism - 象徴性
   * @returns {Promise<Array>}
   */
  async _designCompositions(formDesigns, estack, symbolism) {
    return Promise.all(
      formDesigns.map(form => this._designSingleComposition(form, estack, symbolism))
    );
  }

  /**
   * 単一構成設計
   *
   * @private
   * @param {Object} formDesign - 形状設計
   * @param {Object} estack - E:Stack構造
   * @param {Object} symbolism - 象徴性
   * @returns {Promise<Object>}
   */
  async _designSingleComposition(formDesign, estack, symbolism) {
    return {
      ...formDesign,
      layout: this._defineLayout(formDesign, symbolism),
      iconPlacement: this._defineIconPlacement(formDesign),
      textPlacement: this._defineTextPlacement(formDesign, estack),
      hierarchy: this._defineVisualHierarchy(formDesign, symbolism)
    };
  }

  /**
   * レイアウト定義
   *
   * @private
   * @param {Object} formDesign - 形状設計
   * @param {Object} symbolism - 象徴性
   * @returns {Object}
   */
  _defineLayout(formDesign, symbolism) {
    const { balance } = symbolism.visualCharacteristics;

    return {
      type: balance === 'symmetric' ? 'centered' : 'dynamic',
      grid: '8px base grid',
      spacing: symbolism.visualCharacteristics.whitespace,
      alignment: balance === 'symmetric' ? 'center' : 'left'
    };
  }

  /**
   * アイコン配置定義
   *
   * @private
   * @param {Object} formDesign - 形状設計
   * @returns {Object}
   */
  _defineIconPlacement(formDesign) {
    return {
      position: 'primary',
      size: formDesign.geometry.scale,
      anchor: 'center',
      margin: 'moderate'
    };
  }

  /**
   * テキスト配置定義
   *
   * @private
   * @param {Object} formDesign - 形状設計
   * @param {Object} estack - E:Stack構造
   * @returns {Object}
   */
  _defineTextPlacement(formDesign, estack) {
    const brandName = estack.expression?.brandName || 'Brand Name';

    return {
      brandName,
      position: formDesign.geometry.orientation === 'vertical' ? 'below' : 'right',
      alignment: 'left',
      spacing: 'moderate'
    };
  }

  /**
   * 視覚階層定義
   *
   * @private
   * @param {Object} formDesign - 形状設計
   * @param {Object} symbolism - 象徴性
   * @returns {Object}
   */
  _defineVisualHierarchy(formDesign, symbolism) {
    return {
      primary: 'icon/symbol',
      secondary: 'brand name',
      tertiary: 'tagline (optional)',
      emphasis: symbolism.visualCharacteristics.weight
    };
  }

  /**
   * スタイリング適用 (Styling Agent)
   *
   * @private
   * @param {Array} compositions - 構成
   * @param {Object} estack - E:Stack構造
   * @returns {Promise<Array>}
   */
  async _applyStylization(compositions, estack) {
    return Promise.all(
      compositions.map(comp => this._stylizeSingleConcept(comp, estack))
    );
  }

  /**
   * 単一コンセプトスタイリング
   *
   * @private
   * @param {Object} composition - 構成
   * @param {Object} estack - E:Stack構造
   * @returns {Promise<Object>}
   */
  async _stylizeSingleConcept(composition, estack) {
    const colorPalette = this._defineColorPalette(composition, estack);
    const lineStyle = this._defineLineStyle(composition);
    const typography = this._defineTypography(composition, estack);

    return {
      ...composition,
      styling: {
        colorPalette,
        lineStyle,
        typography,
        effects: this._defineEffects(composition)
      },
      technical: this._defineTechnicalSpecs(composition)
    };
  }

  /**
   * カラーパレット定義
   *
   * @private
   * @param {Object} composition - 構成
   * @param {Object} estack - E:Stack構造
   * @returns {Object}
   */
  _defineColorPalette(composition, estack) {
    const direction = composition.geometry?.orientation || 'horizontal';

    // デザイン方向性に基づく配色
    const palettes = {
      minimal: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#F5F5F5'
      },
      bold: {
        primary: '#FF5722',
        secondary: '#2196F3',
        accent: '#FFFFFF'
      },
      elegant: {
        primary: '#1A237E',
        secondary: '#C0C0C0',
        accent: '#FFFFFF'
      },
      organic: {
        primary: '#4CAF50',
        secondary: '#8BC34A',
        accent: '#FFFFFF'
      }
    };

    const visualDirection = composition.geometry?.precision === 'high' ? 'minimal' : 'bold';
    const palette = palettes[visualDirection] || palettes.minimal;

    return {
      ...palette,
      rationale: `${visualDirection} 方向性に基づく配色`
    };
  }

  /**
   * 線スタイル定義
   *
   * @private
   * @param {Object} composition - 構成
   * @returns {Object}
   */
  _defineLineStyle(composition) {
    const weight = composition.geometry?.scale === 'large' ? 'heavy' : 'medium';

    return {
      weight,
      type: composition.geometry?.precision === 'high' ? 'precise' : 'organic',
      endings: 'rounded',
      consistency: 'uniform'
    };
  }

  /**
   * タイポグラフィ定義
   *
   * @private
   * @param {Object} composition - 構成
   * @param {Object} estack - E:Stack構造
   * @returns {Object}
   */
  _defineTypography(composition, estack) {
    const tone = estack.structure?.tone?.voice?.toLowerCase() || 'professional';

    return {
      family: tone.includes('friendly') ? 'Rounded Sans-serif' : 'Sans-serif',
      weight: composition.geometry?.scale === 'large' ? 'bold' : 'medium',
      style: 'clean and modern',
      alignment: composition.layout?.alignment || 'left'
    };
  }

  /**
   * エフェクト定義
   *
   * @private
   * @param {Object} composition - 構成
   * @returns {Object}
   */
  _defineEffects(composition) {
    return {
      shadow: composition.geometry?.scale === 'large' ? 'subtle' : 'none',
      gradient: 'optional',
      texture: 'none',
      transparency: 'none'
    };
  }

  /**
   * 技術仕様定義
   *
   * @private
   * @param {Object} composition - 構成
   * @returns {Object}
   */
  _defineTechnicalSpecs(composition) {
    return {
      format: ['SVG', 'PNG', 'PDF'],
      colorMode: ['RGB', 'CMYK'],
      minSize: '16px',
      maxSize: 'scalable',
      clearSpace: 'minimum 1x logo height',
      backgrounds: ['white', 'black', 'colored']
    };
  }

  /**
   * ロゴコンセプト検証 (Evaluator)
   *
   * @private
   * @param {Array} concepts - ロゴコンセプト
   * @param {Object} estack - E:Stack構造
   * @returns {Promise<Object>}
   */
  async _validateLogoConcepts(concepts, estack) {
    const validations = concepts.map(concept =>
      this._validateSingleConcept(concept, estack)
    );

    const summary = this._generateValidationSummary(validations);

    return {
      validations,
      summary,
      checklist: this._generateDesignChecklist()
    };
  }

  /**
   * 単一コンセプト検証
   *
   * @private
   * @param {Object} concept - コンセプト
   * @param {Object} estack - E:Stack構造
   * @returns {Object}
   */
  _validateSingleConcept(concept, estack) {
    const checks = {
      brandConsistency: this._checkBrandConsistency(concept, estack),
      visualClarity: this._checkVisualClarity(concept),
      scalability: this._checkScalability(concept),
      memorability: this._checkMemorability(concept),
      uniqueness: this._checkUniqueness(concept),
      reproductibility: this._checkReproductibility(concept)
    };

    const score = this._calculateValidationScore(checks);

    return {
      conceptId: concept.id,
      checks,
      score,
      passed: score >= 85,
      recommendations: this._generateRecommendations(checks, score)
    };
  }

  /**
   * ブランド一貫性チェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @param {Object} estack - E:Stack構造
   * @returns {number}
   */
  _checkBrandConsistency(concept, estack) {
    // E:Stack との整合性
    return 9; // 簡易実装
  }

  /**
   * 視覚的明瞭性チェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @returns {number}
   */
  _checkVisualClarity(concept) {
    const shapeCount = concept.shapes?.length || 1;
    if (shapeCount <= 2) return 10;
    if (shapeCount === 3) return 8;
    return 6;
  }

  /**
   * スケーラビリティチェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @returns {number}
   */
  _checkScalability(concept) {
    return concept.technical?.format?.includes('SVG') ? 10 : 7;
  }

  /**
   * 記憶性チェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @returns {number}
   */
  _checkMemorability(concept) {
    const isSimple = (concept.shapes?.length || 1) <= 2;
    return isSimple ? 9 : 7;
  }

  /**
   * 独自性チェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @returns {number}
   */
  _checkUniqueness(concept) {
    return 8; // 簡易実装
  }

  /**
   * 再現性チェック
   *
   * @private
   * @param {Object} concept - コンセプト
   * @returns {number}
   */
  _checkReproductibility(concept) {
    return 9; // 簡易実装
  }

  /**
   * 検証スコア計算
   *
   * @private
   * @param {Object} checks - チェック結果
   * @returns {number}
   */
  _calculateValidationScore(checks) {
    const values = Object.values(checks);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(average * 10); // 100点満点に変換
  }

  /**
   * 推奨事項生成
   *
   * @private
   * @param {Object} checks - チェック結果
   * @param {number} score - スコア
   * @returns {string[]}
   */
  _generateRecommendations(checks, score) {
    const recommendations = [];

    if (score >= 90) {
      recommendations.push('✅ 優れたロゴコンセプトです');
    } else if (score >= 80) {
      recommendations.push('⚠️ 良好ですが、改善の余地があります');
    } else {
      recommendations.push('❌ 改善が必要です');
    }

    Object.entries(checks).forEach(([key, value]) => {
      if (value < 7) {
        recommendations.push(`- ${key} の改善が必要です`);
      }
    });

    return recommendations;
  }

  /**
   * 検証サマリー生成
   *
   * @private
   * @param {Array} validations - 検証結果
   * @returns {Object}
   */
  _generateValidationSummary(validations) {
    const scores = validations.map(v => v.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      totalEvaluated: validations.length,
      passedCount: validations.filter(v => v.passed).length,
      averageScore: Math.round(avgScore),
      bestScore: Math.max(...scores)
    };
  }

  /**
   * デザインチェックリスト生成
   *
   * @private
   * @returns {Array}
   */
  _generateDesignChecklist() {
    return [
      '✓ ベース形状は 2〜3 まで（シンプル設計）',
      '✓ 主要方向性（水平／中央／上昇）のいずれかに統一',
      '✓ アーキタイプごとにストローク・姿勢を調整',
      '✓ 白黒検証を必ず実施',
      '✓ 最小サイズ（16px）での視認性確認',
      '✓ 各種背景での適用確認'
    ];
  }

  /**
   * デザイン原則生成
   *
   * @private
   * @param {Object} symbolism - 象徴性
   * @param {Object} estack - E:Stack構造
   * @returns {Object}
   */
  _generateDesignPrinciples(symbolism, estack) {
    return {
      philosophy: '意味が形に先立つ - ロゴは思想の断面図',
      approach: 'IAF Engine による体系的設計',
      coreSymbolism: symbolism.metaphor,
      visualCharacteristics: symbolism.visualCharacteristics,
      constraints: [
        'シンプル構造（禅的削ぎ落とし）',
        '記号性の追求',
        '多層的意味の蓄積',
        '汎用性と再現性'
      ]
    };
  }
}

export default LogoAgent;
