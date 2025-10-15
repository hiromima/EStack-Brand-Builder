/**
 * @file StructureAgent.js
 * @description ブランド構造分析エージェント
 * @responsibilities
 * - E:Stack Method™ v5.1 に基づくブランドの意味・構造分析
 * - RSI Protocol による仮構造推論サポート
 * - E:Stack 三層マッピング（Foundation, Structure, Expression）
 * - ブランド構造の検証と整合性チェック
 *
 * @module StructureAgent
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * StructureAgent クラス
 *
 * ブランドの構造化とE:Stack三層マッピングを担当
 *
 * @extends BaseAgent
 */
export class StructureAgent extends BaseAgent {
  /**
   * @param {Object} options - エージェント設定
   * @param {Object} options.logger - ロガー
   * @param {Object} options.knowledge - ナレッジベース
   */
  constructor(options = {}) {
    super({
      ...options,
      type: AgentType.STRUCTURE,
      name: 'StructureAgent'
    });

    this.options = options;
    this.rsiMode = false; // RSI モードフラグ
  }

  /**
   * エージェント初期化
   * BaseAgent準拠の必須メソッド
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger?.info('[StructureAgent] Initializing...');

    // RSIモードリセット
    this.rsiMode = false;

    this.logger?.info('[StructureAgent] Initialized successfully');
  }

  /**
   * メイン処理: ブランド構造分析とE:Stackマッピング
   *
   * @param {Object} input - 入力データ
   * @param {Object} [input.hearing] - ヒアリング情報
   * @param {Object} [input.business] - ビジネス要件
   * @param {Object} [input.existing] - 既存のE:Stack構造 (部分的)
   * @returns {Promise<Object>} E:Stack構造
   */
  async process(input) {
    this.logger.info('[StructureAgent] ブランド構造分析開始', { input });

    // 入力データ検証
    const validationResult = this._validateInput(input);

    if (!validationResult.isComplete) {
      this.logger.warn('[StructureAgent] 構造情報不完全 - RSI モード発動', {
        missingFields: validationResult.missingFields
      });
      this.rsiMode = true;
    }

    // E:Stack 三層マッピング
    const estack = await this._mapToEStack(input);

    // 構造検証
    const validation = this._validateEStack(estack);

    return {
      estack,
      validation,
      metadata: {
        rsiMode: this.rsiMode,
        confidence: validation.confidence,
        completeness: validation.completeness,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 入力データ検証
   *
   * @private
   * @param {Object} input - 入力データ
   * @returns {Object} 検証結果
   */
  _validateInput(input) {
    const requiredFields = {
      foundation: ['purpose', 'values', 'notAxis'],
      structure: ['persona', 'tone', 'positioning'],
      expression: ['coreMessage', 'tagline', 'visualIdentity']
    };

    const missingFields = [];
    let totalFields = 0;
    let providedFields = 0;

    for (const [layer, fields] of Object.entries(requiredFields)) {
      for (const field of fields) {
        totalFields++;
        const hasField = input.hearing?.[field] ||
                        input.business?.[field] ||
                        input.existing?.[layer]?.[field];

        if (hasField) {
          providedFields++;
        } else {
          missingFields.push(`${layer}.${field}`);
        }
      }
    }

    const completeness = providedFields / totalFields;

    return {
      isComplete: completeness >= 0.7, // 70% 以上で完全とみなす
      completeness,
      missingFields
    };
  }

  /**
   * E:Stack 三層マッピング
   *
   * @private
   * @param {Object} input - 入力データ
   * @returns {Promise<Object>} E:Stack 構造
   */
  async _mapToEStack(input) {
    const hearing = input.hearing || {};
    const business = input.business || {};
    const existing = input.existing || {};

    // Foundation Layer (信念層)
    const foundation = await this._mapFoundationLayer({
      hearing,
      business,
      existing: existing.foundation
    });

    // Structure Layer (骨格層)
    const structure = await this._mapStructureLayer({
      hearing,
      business,
      existing: existing.structure,
      foundation
    });

    // Expression Layer (表現層)
    const expression = await this._mapExpressionLayer({
      hearing,
      business,
      existing: existing.expression,
      foundation,
      structure
    });

    return {
      foundation,
      structure,
      expression,
      metadata: {
        method: 'E:Stack Method v5.1',
        agent: this.name,
        processedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Foundation Layer マッピング
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<Object>} Foundation Layer
   */
  async _mapFoundationLayer(data) {
    const { hearing, business, existing } = data;

    // Purpose (パーパス)
    const purpose = existing?.purpose ||
                   hearing.purpose ||
                   business.mission ||
                   (this.rsiMode ? await this._inferPurpose(data) : null);

    // Values (価値観)
    const values = existing?.values ||
                  hearing.values ||
                  business.values ||
                  (this.rsiMode ? await this._inferValues(data) : []);

    // NOT Axis (絶対NG)
    const notAxis = existing?.notAxis ||
                   hearing.notAxis ||
                   business.notAxis ||
                   (this.rsiMode ? await this._inferNotAxis(data) : []);

    return {
      purpose,
      values: Array.isArray(values) ? values : [values],
      notAxis: Array.isArray(notAxis) ? notAxis : [notAxis],
      confidence: this.rsiMode ? 'inferred' : 'provided'
    };
  }

  /**
   * Structure Layer マッピング
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<Object>} Structure Layer
   */
  async _mapStructureLayer(data) {
    const { hearing, business, existing, foundation } = data;

    // Persona (ターゲットペルソナ)
    const persona = existing?.persona ||
                   hearing.targetAudience ||
                   business.targetMarket ||
                   (this.rsiMode ? await this._inferPersona({ foundation, hearing, business }) : null);

    // Tone (トーン・ボイス)
    const tone = existing?.tone ||
                hearing.tone ||
                business.brandVoice ||
                (this.rsiMode ? await this._inferTone({ foundation, persona }) : null);

    // Positioning (ポジショニング)
    const positioning = existing?.positioning ||
                       hearing.positioning ||
                       business.positioning ||
                       (this.rsiMode ? await this._inferPositioning({ foundation, persona }) : null);

    return {
      persona,
      tone,
      positioning,
      confidence: this.rsiMode ? 'inferred' : 'provided'
    };
  }

  /**
   * Expression Layer マッピング
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<Object>} Expression Layer
   */
  async _mapExpressionLayer(data) {
    const { hearing, business, existing, foundation, structure } = data;

    // Core Message (コアメッセージ)
    const coreMessage = existing?.coreMessage ||
                       hearing.coreMessage ||
                       business.keyMessage ||
                       (this.rsiMode ? await this._inferCoreMessage({ foundation, structure }) : null);

    // Tagline (タグライン)
    const tagline = existing?.tagline ||
                   hearing.tagline ||
                   business.tagline ||
                   null; // Expression Layer は他のエージェントに委譲

    // Visual Identity (ビジュアルアイデンティティ)
    const visualIdentity = existing?.visualIdentity ||
                          hearing.visualIdentity ||
                          business.visualIdentity ||
                          null; // LogoAgent / VisualAgent に委譲

    return {
      coreMessage,
      tagline,
      visualIdentity,
      confidence: this.rsiMode ? 'inferred' : 'provided',
      note: 'Expression details delegated to ExpressionAgent, CopyAgent, LogoAgent, VisualAgent'
    };
  }

  /**
   * E:Stack 構造検証
   *
   * @private
   * @param {Object} estack - E:Stack 構造
   * @returns {Object} 検証結果
   */
  _validateEStack(estack) {
    const checks = {
      foundationComplete: this._isLayerComplete(estack.foundation, ['purpose', 'values', 'notAxis']),
      structureComplete: this._isLayerComplete(estack.structure, ['persona', 'tone', 'positioning']),
      expressionComplete: this._isLayerComplete(estack.expression, ['coreMessage']),
      layerConsistency: this._checkLayerConsistency(estack)
    };

    const completeness = Object.values(checks).filter(v => v).length / Object.keys(checks).length;
    const confidence = this.rsiMode ? 0.7 : 0.95;

    return {
      isValid: checks.foundationComplete && checks.structureComplete,
      checks,
      completeness,
      confidence,
      warnings: this._generateWarnings(checks, estack)
    };
  }

  /**
   * レイヤー完全性チェック
   *
   * @private
   * @param {Object} layer - レイヤーデータ
   * @param {string[]} requiredFields - 必須フィールド
   * @returns {boolean}
   */
  _isLayerComplete(layer, requiredFields) {
    if (!layer) return false;
    return requiredFields.every(field => {
      const value = layer[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }

  /**
   * レイヤー間整合性チェック
   *
   * @private
   * @param {Object} estack - E:Stack 構造
   * @returns {boolean}
   */
  _checkLayerConsistency(estack) {
    // Foundation → Structure の論理整合性
    // Structure → Expression の論理整合性
    // 簡易実装: すべてのレイヤーが存在すれば true
    return estack.foundation && estack.structure && estack.expression;
  }

  /**
   * 警告生成
   *
   * @private
   * @param {Object} checks - チェック結果
   * @param {Object} estack - E:Stack 構造
   * @returns {string[]}
   */
  _generateWarnings(checks, estack) {
    const warnings = [];

    if (this.rsiMode) {
      warnings.push('⚠️ RSI モードで実行: 一部の構造が推論されています。正確性向上のため、ヒアリング情報の追加を推奨します。');
    }

    if (!checks.foundationComplete) {
      warnings.push('⚠️ Foundation Layer が不完全です。Purpose、Values、NOT Axis を確認してください。');
    }

    if (!checks.structureComplete) {
      warnings.push('⚠️ Structure Layer が不完全です。Persona、Tone、Positioning を確認してください。');
    }

    if (!checks.expressionComplete) {
      warnings.push('ℹ️ Expression Layer は ExpressionAgent で詳細化されます。');
    }

    return warnings;
  }

  /**
   * RSI: Purpose 推論
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<string>}
   */
  async _inferPurpose(data) {
    // 簡易実装: ビジネス情報から推論
    return `${data.business?.industry || 'この事業'} を通じて価値を提供する`;
  }

  /**
   * RSI: Values 推論
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<string[]>}
   */
  async _inferValues(data) {
    return ['誠実さ', '革新性', '顧客第一']; // デフォルト値
  }

  /**
   * RSI: NOT Axis 推論
   *
   * @private
   * @param {Object} data - データ
   * @returns {Promise<string[]>}
   */
  async _inferNotAxis(data) {
    return ['妥協', '停滞']; // デフォルト値
  }

  /**
   * RSI: Persona 推論
   *
   * @private
   * @param {Object} context - コンテキスト
   * @returns {Promise<Object>}
   */
  async _inferPersona(context) {
    return {
      description: '想定されるターゲット層',
      demographics: 'ビジネス情報から推定',
      psychographics: 'Foundation Layer から推定'
    };
  }

  /**
   * RSI: Tone 推論
   *
   * @private
   * @param {Object} context - コンテキスト
   * @returns {Promise<Object>}
   */
  async _inferTone(context) {
    return {
      voice: 'プロフェッショナル',
      style: 'フレンドリーかつ信頼性重視',
      range: ['カジュアル', 'フォーマル']
    };
  }

  /**
   * RSI: Positioning 推論
   *
   * @private
   * @param {Object} context - コンテキスト
   * @returns {Promise<string>}
   */
  async _inferPositioning(context) {
    return 'Foundation に基づく差別化ポジション';
  }

  /**
   * RSI: Core Message 推論
   *
   * @private
   * @param {Object} context - コンテキスト
   * @returns {Promise<string>}
   */
  async _inferCoreMessage(context) {
    return `${context.foundation.purpose} を実現する`;
  }
}

export default StructureAgent;
