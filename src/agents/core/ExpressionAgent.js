/**
 * ExpressionAgent - 表現案生成エージェント
 *
 * E:Stack Expression Layer の具体化
 * クリエイティブ分岐による複数案生成
 *
 * @module ExpressionAgent
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * ExpressionAgent クラス
 *
 * ブランド表現の複数案生成とクリエイティブ分岐を担当
 *
 * @extends BaseAgent
 */
export class ExpressionAgent extends BaseAgent {
  /**
   * @param {Object} config - エージェント設定
   * @param {Object} config.logger - ロガー
   * @param {Object} config.knowledge - ナレッジベース
   * @param {Object} [config.options] - 追加オプション
   */
  constructor(config) {
    super({
      ...config,
      type: AgentType.EXPRESSION,
      name: 'ExpressionAgent'
    });

    this.options = config.options || {};
    this.branchCount = this.options.branchCount || 3; // デフォルト3案
  }

  /**
   * メイン処理: 表現案生成
   *
   * @param {Object} input - 入力データ
   * @param {Object} input.estack - E:Stack構造
   * @param {string} [input.target] - 生成対象 ('all', 'copy', 'visual', 'tagline')
   * @param {number} [input.branches] - 生成案数
   * @returns {Promise<Object>} 複数の表現案
   */
  async process(input) {
    this.logger.info('[ExpressionAgent] 表現案生成開始', { input });

    const { estack, target = 'all', branches = this.branchCount } = input;

    if (!estack) {
      throw new Error('E:Stack 構造が必要です');
    }

    // 生成対象の決定
    const targets = target === 'all'
      ? ['coreMessage', 'tagline', 'visualConcept']
      : [target];

    // 各ターゲットの表現案生成
    const expressions = {};

    for (const targetType of targets) {
      expressions[targetType] = await this._generateBranches(
        targetType,
        estack,
        branches
      );
    }

    return {
      expressions,
      metadata: {
        branchCount: branches,
        targets,
        timestamp: new Date().toISOString(),
        agent: this.name
      }
    };
  }

  /**
   * 分岐案生成
   *
   * @private
   * @param {string} targetType - ターゲットタイプ
   * @param {Object} estack - E:Stack構造
   * @param {number} count - 生成数
   * @returns {Promise<Array>} 分岐案の配列
   */
  async _generateBranches(targetType, estack, count) {
    const branches = [];

    for (let i = 0; i < count; i++) {
      const branch = await this._generateSingleExpression(
        targetType,
        estack,
        i
      );

      branches.push({
        id: `${targetType}-branch-${i + 1}`,
        index: i,
        ...branch
      });
    }

    return branches;
  }

  /**
   * 単一表現案生成
   *
   * @private
   * @param {string} targetType - ターゲットタイプ
   * @param {Object} estack - E:Stack構造
   * @param {number} variation - バリエーション番号
   * @returns {Promise<Object>} 表現案
   */
  async _generateSingleExpression(targetType, estack, variation) {
    switch (targetType) {
      case 'coreMessage':
        return await this._generateCoreMessage(estack, variation);
      case 'tagline':
        return await this._generateTagline(estack, variation);
      case 'visualConcept':
        return await this._generateVisualConcept(estack, variation);
      default:
        throw new Error(`未対応のターゲットタイプ: ${targetType}`);
    }
  }

  /**
   * コアメッセージ生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {number} variation - バリエーション
   * @returns {Promise<Object>} コアメッセージ案
   */
  async _generateCoreMessage(estack, variation) {
    const { foundation, structure } = estack;

    // バリエーション戦略
    const strategies = [
      'purpose-driven', // Purpose中心
      'value-driven',   // Value中心
      'persona-driven'  // Persona中心
    ];

    const strategy = strategies[variation % strategies.length];

    let message;
    let rationale;

    switch (strategy) {
      case 'purpose-driven':
        message = `${foundation.purpose}`;
        rationale = 'Purpose を直接的に表現';
        break;

      case 'value-driven':
        message = `${foundation.values[0]}を体現し、${foundation.purpose}を実現する`;
        rationale = 'Values と Purpose の統合';
        break;

      case 'persona-driven':
        message = `${structure.persona?.description || 'あなた'}のために、${foundation.purpose}`;
        rationale = 'Persona への共感を重視';
        break;
    }

    return {
      type: 'coreMessage',
      content: message,
      strategy,
      rationale,
      characteristics: {
        length: message.length,
        tone: structure.tone?.voice || 'neutral',
        clarity: this._assessClarity(message)
      }
    };
  }

  /**
   * タグライン生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {number} variation - バリエーション
   * @returns {Promise<Object>} タグライン案
   */
  async _generateTagline(estack, variation) {
    const { foundation, structure } = estack;

    // タグライン戦略
    const strategies = [
      'declarative',  // 宣言型
      'aspirational', // 願望型
      'imperative'    // 命令型
    ];

    const strategy = strategies[variation % strategies.length];

    let tagline;
    let rationale;

    switch (strategy) {
      case 'declarative':
        tagline = `${foundation.values[0]}の実現`;
        rationale = '価値の宣言で信頼を構築';
        break;

      case 'aspirational':
        tagline = `${foundation.purpose}へ、共に`;
        rationale = '共感と参加を促す';
        break;

      case 'imperative':
        tagline = `${foundation.purpose}を始めよう`;
        rationale = '行動を促す直接的表現';
        break;
    }

    return {
      type: 'tagline',
      content: tagline,
      strategy,
      rationale,
      characteristics: {
        length: tagline.length,
        tone: structure.tone?.voice || 'neutral',
        memorability: this._assessMemorability(tagline),
        rhythm: this._assessRhythm(tagline)
      }
    };
  }

  /**
   * ビジュアルコンセプト生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {number} variation - バリエーション
   * @returns {Promise<Object>} ビジュアルコンセプト案
   */
  async _generateVisualConcept(estack, variation) {
    const { foundation, structure } = estack;

    // ビジュアル方向性
    const directions = [
      'minimal',      // ミニマル
      'bold',         // 大胆
      'organic'       // 有機的
    ];

    const direction = directions[variation % directions.length];

    let concept;
    let colorPalette;
    let typography;

    switch (direction) {
      case 'minimal':
        concept = '余白と精密さで信頼を表現';
        colorPalette = ['#FFFFFF', '#000000', '#F5F5F5'];
        typography = 'Sans-serif, ウェイト軽め';
        break;

      case 'bold':
        concept = 'ダイナミックな形状で革新性を表現';
        colorPalette = ['#FF5722', '#2196F3', '#FFFFFF'];
        typography = 'Sans-serif, ウェイト重め';
        break;

      case 'organic':
        concept = '柔らかな曲線で親しみやすさを表現';
        colorPalette = ['#4CAF50', '#FFC107', '#FFFFFF'];
        typography = 'Rounded, 優しい印象';
        break;
    }

    return {
      type: 'visualConcept',
      direction,
      concept,
      elements: {
        colorPalette,
        typography,
        composition: this._inferComposition(foundation, structure),
        symbolism: this._inferSymbolism(foundation)
      },
      rationale: `${direction} 方向性で ${foundation.values[0]} を視覚化`
    };
  }

  /**
   * 明瞭性評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string} 評価
   */
  _assessClarity(text) {
    const length = text.length;
    if (length < 20) return 'very-clear';
    if (length < 40) return 'clear';
    return 'moderate';
  }

  /**
   * 記憶性評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string} 評価
   */
  _assessMemorability(text) {
    const hasRhythm = text.includes('、') || text.includes('へ');
    const isShort = text.length < 30;

    if (hasRhythm && isShort) return 'high';
    if (isShort) return 'moderate';
    return 'low';
  }

  /**
   * リズム評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string} 評価
   */
  _assessRhythm(text) {
    const syllables = text.length; // 簡易実装
    if (syllables <= 15) return 'good';
    if (syllables <= 25) return 'moderate';
    return 'slow';
  }

  /**
   * 構成推論
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} structure - Structure Layer
   * @returns {string}
   */
  _inferComposition(foundation, structure) {
    const tone = structure.tone?.voice?.toLowerCase() || '';

    if (tone.includes('professional')) {
      return 'シンメトリー、水平基調';
    } else if (tone.includes('innovative')) {
      return '非対称、ダイナミック';
    } else {
      return '中央配置、バランス重視';
    }
  }

  /**
   * 象徴性推論
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @returns {string[]}
   */
  _inferSymbolism(foundation) {
    const symbols = [];

    if (foundation.purpose?.includes('未来')) {
      symbols.push('前進の矢印', '上昇曲線');
    }

    if (foundation.values?.includes('誠実さ')) {
      symbols.push('円', '安定した形状');
    }

    if (foundation.values?.includes('革新性')) {
      symbols.push('三角', '鋭角的要素');
    }

    return symbols.length > 0 ? symbols : ['抽象図形', 'ジオメトリ'];
  }
}

export default ExpressionAgent;
