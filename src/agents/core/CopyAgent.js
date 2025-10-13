/**
 * CopyAgent - コピー・トーン設計エージェント
 *
 * E:Stack Method™ v5.1 に基づくVoice & Tone設計
 * Brand Principles Atlas v1.1 準拠
 *
 * @module CopyAgent
 * @version 1.0.0
 */

import { BaseAgent, AgentType } from '../base/BaseAgent.js';

/**
 * トーン戦略
 * @enum {string}
 */
export const ToneStrategy = {
  DECLARATIVE: 'declarative',      // 宣言型
  ASPIRATIONAL: 'aspirational',    // 願望型
  IMPERATIVE: 'imperative',        // 命令型
  CONVERSATIONAL: 'conversational', // 対話型
  AUTHORITATIVE: 'authoritative'   // 権威型
};

/**
 * ボイスアーキタイプ
 * @enum {string}
 */
export const VoiceArchetype = {
  PROFESSIONAL: 'professional',    // プロフェッショナル
  FRIENDLY: 'friendly',            // フレンドリー
  INNOVATIVE: 'innovative',        // 革新的
  TRUSTWORTHY: 'trustworthy',      // 信頼できる
  PLAYFUL: 'playful',              // 遊び心
  SOPHISTICATED: 'sophisticated'    // 洗練された
};

/**
 * CopyAgent クラス
 *
 * ブランドのVoice & Tone設計、コアメッセージ、タグライン生成を担当
 *
 * @extends BaseAgent
 */
export class CopyAgent extends BaseAgent {
  /**
   * @param {Object} config - エージェント設定
   * @param {Object} config.logger - ロガー
   * @param {Object} config.knowledge - ナレッジベース
   * @param {Object} [config.options] - 追加オプション
   */
  constructor(config) {
    super({
      ...config,
      type: AgentType.COPY,
      name: 'CopyAgent'
    });

    this.options = config.options || {};
    this.variationCount = this.options.variationCount || 3;
  }

  /**
   * メイン処理: コピー・トーン設計
   *
   * @param {Object} input - 入力データ
   * @param {Object} input.estack - E:Stack構造
   * @param {string} [input.target] - 生成対象 ('all', 'voice', 'tone', 'coreMessage', 'tagline')
   * @param {Object} [input.requirements] - 追加要件
   * @returns {Promise<Object>} コピー・トーン設計結果
   */
  async process(input) {
    this.logger.info('[CopyAgent] コピー・トーン設計開始', { input });

    const { estack, target = 'all', requirements = {} } = input;

    if (!estack) {
      throw new Error('E:Stack 構造が必要です');
    }

    // Voice & Tone 設計
    const voiceDesign = await this._designVoice(estack, requirements);
    const toneMap = await this._createTonalityMap(estack, voiceDesign, requirements);

    // コアメッセージ生成
    const coreMessages = target === 'all' || target === 'coreMessage'
      ? await this._generateCoreMessages(estack, voiceDesign, this.variationCount)
      : [];

    // タグライン生成
    const taglines = target === 'all' || target === 'tagline'
      ? await this._generateTaglines(estack, voiceDesign, this.variationCount)
      : [];

    // ボイスガイドライン生成
    const voiceGuide = await this._generateVoiceGuide(voiceDesign, toneMap, estack);

    return {
      voiceDesign,
      toneMap,
      coreMessages,
      taglines,
      voiceGuide,
      metadata: {
        variationCount: this.variationCount,
        target,
        protocol: 'Brand Principles Atlas v1.1',
        timestamp: new Date().toISOString(),
        agent: this.name
      }
    };
  }

  /**
   * Voice 設計
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} requirements - 要件
   * @returns {Promise<Object>} Voice設計
   */
  async _designVoice(estack, requirements) {
    const { foundation, structure } = estack;

    // Purpose & Values からVoiceの基本性格を決定
    const archetype = this._inferVoiceArchetype(foundation, structure);

    // ボイスの特性定義
    const characteristics = this._defineVoiceCharacteristics(
      archetype,
      foundation,
      structure
    );

    // 言語スタイル定義
    const linguisticStyle = this._defineLinguisticStyle(
      archetype,
      structure.tone
    );

    return {
      archetype,
      characteristics,
      linguisticStyle,
      personality: this._synthesizePersonality(foundation, characteristics),
      dos: this._generateDos(archetype, foundation),
      donts: this._generateDonts(foundation.notAxis, characteristics)
    };
  }

  /**
   * Voice アーキタイプ推論
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} structure - Structure Layer
   * @returns {VoiceArchetype}
   */
  _inferVoiceArchetype(foundation, structure) {
    const purpose = foundation.purpose?.toLowerCase() || '';
    const values = foundation.values?.join(' ').toLowerCase() || '';
    const tone = structure.tone?.voice?.toLowerCase() || '';

    // Purpose & Values からアーキタイプを推論
    if (purpose.includes('革新') || purpose.includes('未来') || values.includes('革新')) {
      return VoiceArchetype.INNOVATIVE;
    }
    if (purpose.includes('信頼') || values.includes('誠実') || values.includes('信頼')) {
      return VoiceArchetype.TRUSTWORTHY;
    }
    if (tone.includes('friendly') || tone.includes('カジュアル')) {
      return VoiceArchetype.FRIENDLY;
    }
    if (tone.includes('professional') || tone.includes('フォーマル')) {
      return VoiceArchetype.PROFESSIONAL;
    }
    if (values.includes('洗練') || values.includes('品質')) {
      return VoiceArchetype.SOPHISTICATED;
    }

    return VoiceArchetype.PROFESSIONAL; // デフォルト
  }

  /**
   * Voice 特性定義
   *
   * @private
   * @param {VoiceArchetype} archetype - アーキタイプ
   * @param {Object} foundation - Foundation Layer
   * @param {Object} structure - Structure Layer
   * @returns {Object}
   */
  _defineVoiceCharacteristics(archetype, foundation, structure) {
    const baseCharacteristics = {
      [VoiceArchetype.PROFESSIONAL]: {
        formality: 'formal',
        complexity: 'moderate',
        emotion: 'controlled',
        directness: 'direct'
      },
      [VoiceArchetype.FRIENDLY]: {
        formality: 'casual',
        complexity: 'simple',
        emotion: 'warm',
        directness: 'conversational'
      },
      [VoiceArchetype.INNOVATIVE]: {
        formality: 'moderate',
        complexity: 'moderate-high',
        emotion: 'energetic',
        directness: 'bold'
      },
      [VoiceArchetype.TRUSTWORTHY]: {
        formality: 'formal-moderate',
        complexity: 'clear',
        emotion: 'steady',
        directness: 'transparent'
      },
      [VoiceArchetype.PLAYFUL]: {
        formality: 'casual',
        complexity: 'simple',
        emotion: 'playful',
        directness: 'indirect'
      },
      [VoiceArchetype.SOPHISTICATED]: {
        formality: 'formal',
        complexity: 'refined',
        emotion: 'subtle',
        directness: 'nuanced'
      }
    };

    return {
      ...baseCharacteristics[archetype],
      coreValues: foundation.values.slice(0, 3),
      persona: structure.persona?.description || 'ターゲット層'
    };
  }

  /**
   * 言語スタイル定義
   *
   * @private
   * @param {VoiceArchetype} archetype - アーキタイプ
   * @param {Object} tone - トーン情報
   * @returns {Object}
   */
  _defineLinguisticStyle(archetype, tone) {
    const styleMap = {
      [VoiceArchetype.PROFESSIONAL]: {
        vocabulary: '専門的だが明瞭な表現',
        sentenceStructure: '構造化された文章',
        punctuation: '標準的な句読点',
        rhythm: '整然とした流れ'
      },
      [VoiceArchetype.FRIENDLY]: {
        vocabulary: '日常的で親しみやすい表現',
        sentenceStructure: '会話的な短文',
        punctuation: '柔軟な句読点',
        rhythm: '軽快なテンポ'
      },
      [VoiceArchetype.INNOVATIVE]: {
        vocabulary: '新しい言葉や比喩',
        sentenceStructure: '動的で変化に富む',
        punctuation: '強調を活用',
        rhythm: 'エネルギッシュ'
      },
      [VoiceArchetype.TRUSTWORTHY]: {
        vocabulary: '明確で誠実な表現',
        sentenceStructure: '論理的で透明性の高い文章',
        punctuation: '正確な句読点',
        rhythm: '安定した流れ'
      },
      [VoiceArchetype.PLAYFUL]: {
        vocabulary: '遊び心のある表現',
        sentenceStructure: 'リズミカルな短文',
        punctuation: '感嘆符を活用',
        rhythm: '弾むようなテンポ'
      },
      [VoiceArchetype.SOPHISTICATED]: {
        vocabulary: '洗練された語彙',
        sentenceStructure: '優雅で精密な文章',
        punctuation: '繊細な句読点',
        rhythm: '流麗な流れ'
      }
    };

    return styleMap[archetype];
  }

  /**
   * パーソナリティ統合
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} characteristics - 特性
   * @returns {string}
   */
  _synthesizePersonality(foundation, characteristics) {
    const purpose = foundation.purpose;
    const primaryValue = foundation.values[0];

    return `${primaryValue}を体現し、${purpose}という使命を持つ、${characteristics.emotion}で${characteristics.directness}なブランドパーソナリティ`;
  }

  /**
   * Do's 生成
   *
   * @private
   * @param {VoiceArchetype} archetype - アーキタイプ
   * @param {Object} foundation - Foundation Layer
   * @returns {string[]}
   */
  _generateDos(archetype, foundation) {
    const baseDos = {
      [VoiceArchetype.PROFESSIONAL]: [
        '明確で構造化された表現を使用する',
        '専門性を保ちつつ理解しやすく伝える',
        'データや事実に基づいた論理展開を心がける'
      ],
      [VoiceArchetype.FRIENDLY]: [
        '親しみやすく会話的なトーンで語る',
        '共感と理解を示す表現を使う',
        'ポジティブで温かい言葉を選ぶ'
      ],
      [VoiceArchetype.INNOVATIVE]: [
        '新しい視点や比喩を積極的に使う',
        '未来志向の言葉で語る',
        'エネルギーと情熱を感じさせる表現を使う'
      ],
      [VoiceArchetype.TRUSTWORTHY]: [
        '透明性と誠実さを言葉で示す',
        '約束は明確に、責任は真摯に伝える',
        '一貫性のあるメッセージを維持する'
      ],
      [VoiceArchetype.PLAYFUL]: [
        'ユーモアと遊び心を適切に取り入れる',
        'リズムと韻を意識した表現を使う',
        '驚きと楽しさを感じさせる言葉を選ぶ'
      ],
      [VoiceArchetype.SOPHISTICATED]: [
        '洗練された語彙と表現を選ぶ',
        '繊細なニュアンスを大切にする',
        '品格と知性を感じさせる文章を書く'
      ]
    };

    const dos = [...baseDos[archetype]];
    dos.push(`${foundation.values[0]}を常に体現する表現を心がける`);

    return dos;
  }

  /**
   * Don'ts 生成
   *
   * @private
   * @param {Array} notAxis - NOT Axis
   * @param {Object} characteristics - 特性
   * @returns {string[]}
   */
  _generateDonts(notAxis, characteristics) {
    const donts = notAxis.map(not => `「${not}」を連想させる表現は避ける`);

    // 特性に基づく追加の Don'ts
    if (characteristics.formality === 'formal') {
      donts.push('過度にカジュアルなスラングは使わない');
    }
    if (characteristics.emotion === 'controlled') {
      donts.push('感情的すぎる表現は避ける');
    }

    return donts;
  }

  /**
   * Tonality Map 作成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} voiceDesign - Voice設計
   * @param {Object} requirements - 要件
   * @returns {Promise<Object>}
   */
  async _createTonalityMap(estack, voiceDesign, requirements) {
    const { archetype, characteristics } = voiceDesign;

    // 状況別トーン設定
    const contexts = {
      marketing: this._defineToneForContext('marketing', archetype, characteristics),
      support: this._defineToneForContext('support', archetype, characteristics),
      announcement: this._defineToneForContext('announcement', archetype, characteristics),
      education: this._defineToneForContext('education', archetype, characteristics),
      crisis: this._defineToneForContext('crisis', archetype, characteristics)
    };

    // トーンのレンジ定義
    const range = this._defineToneRange(characteristics);

    return {
      contexts,
      range,
      guidelines: this._generateToneGuidelines(contexts, range)
    };
  }

  /**
   * コンテキスト別トーン定義
   *
   * @private
   * @param {string} context - コンテキスト
   * @param {VoiceArchetype} archetype - アーキタイプ
   * @param {Object} characteristics - 特性
   * @returns {Object}
   */
  _defineToneForContext(context, archetype, characteristics) {
    const baseDefinitions = {
      marketing: {
        energy: 'high',
        formality: characteristics.formality,
        emotion: 'aspirational',
        focus: 'value proposition'
      },
      support: {
        energy: 'moderate',
        formality: 'moderate',
        emotion: 'empathetic',
        focus: 'problem solving'
      },
      announcement: {
        energy: 'moderate-high',
        formality: characteristics.formality,
        emotion: 'confident',
        focus: 'clarity'
      },
      education: {
        energy: 'moderate',
        formality: 'moderate',
        emotion: 'encouraging',
        focus: 'understanding'
      },
      crisis: {
        energy: 'low',
        formality: 'formal',
        emotion: 'steady',
        focus: 'transparency'
      }
    };

    return baseDefinitions[context];
  }

  /**
   * トーンレンジ定義
   *
   * @private
   * @param {Object} characteristics - 特性
   * @returns {Object}
   */
  _defineToneRange(characteristics) {
    return {
      formality: {
        min: 'casual',
        baseline: characteristics.formality,
        max: 'formal'
      },
      emotion: {
        min: 'controlled',
        baseline: characteristics.emotion,
        max: 'expressive'
      },
      complexity: {
        min: 'simple',
        baseline: characteristics.complexity,
        max: 'sophisticated'
      }
    };
  }

  /**
   * トーンガイドライン生成
   *
   * @private
   * @param {Object} contexts - コンテキスト
   * @param {Object} range - レンジ
   * @returns {string[]}
   */
  _generateToneGuidelines(contexts, range) {
    return [
      'Voiceは一貫させつつ、状況に応じてToneを調整する',
      `通常は ${range.formality.baseline} の形式性を維持する`,
      `感情表現は ${range.emotion.baseline} を基準とする`,
      'クライシス時は常にフォーマルで安定したトーンに切り替える',
      '各コンテキストでブランド価値を体現する'
    ];
  }

  /**
   * コアメッセージ生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} voiceDesign - Voice設計
   * @param {number} count - 生成数
   * @returns {Promise<Array>}
   */
  async _generateCoreMessages(estack, voiceDesign, count) {
    const messages = [];
    const { foundation, structure } = estack;
    const strategies = [
      ToneStrategy.DECLARATIVE,
      ToneStrategy.ASPIRATIONAL,
      ToneStrategy.IMPERATIVE
    ];

    for (let i = 0; i < count; i++) {
      const strategy = strategies[i % strategies.length];
      const message = await this._generateSingleCoreMessage(
        foundation,
        structure,
        voiceDesign,
        strategy
      );

      messages.push({
        id: `core-message-${i + 1}`,
        index: i,
        ...message
      });
    }

    return messages;
  }

  /**
   * 単一コアメッセージ生成
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} structure - Structure Layer
   * @param {Object} voiceDesign - Voice設計
   * @param {ToneStrategy} strategy - 戦略
   * @returns {Promise<Object>}
   */
  async _generateSingleCoreMessage(foundation, structure, voiceDesign, strategy) {
    let content;
    let rationale;

    switch (strategy) {
      case ToneStrategy.DECLARATIVE:
        content = `${foundation.purpose}`;
        rationale = 'Purposeを直接的に宣言';
        break;

      case ToneStrategy.ASPIRATIONAL:
        content = `${foundation.values[0]}を実現し、${foundation.purpose}`;
        rationale = 'Valuesを通じてPurposeへの道筋を示す';
        break;

      case ToneStrategy.IMPERATIVE:
        content = `${foundation.purpose}を、共に実現しよう`;
        rationale = '行動への呼びかけで共感を喚起';
        break;

      default:
        content = foundation.purpose;
        rationale = 'デフォルト';
    }

    return {
      type: 'coreMessage',
      content,
      strategy,
      rationale,
      voiceAlignment: voiceDesign.archetype,
      characteristics: {
        length: content.length,
        clarity: this._assessClarity(content),
        memorability: this._assessMemorability(content),
        emotionalResonance: this._assessEmotionalResonance(content, voiceDesign)
      }
    };
  }

  /**
   * タグライン生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} voiceDesign - Voice設計
   * @param {number} count - 生成数
   * @returns {Promise<Array>}
   */
  async _generateTaglines(estack, voiceDesign, count) {
    const taglines = [];
    const { foundation } = estack;
    const strategies = [
      ToneStrategy.DECLARATIVE,
      ToneStrategy.ASPIRATIONAL,
      ToneStrategy.IMPERATIVE
    ];

    for (let i = 0; i < count; i++) {
      const strategy = strategies[i % strategies.length];
      const tagline = await this._generateSingleTagline(
        foundation,
        voiceDesign,
        strategy
      );

      taglines.push({
        id: `tagline-${i + 1}`,
        index: i,
        ...tagline
      });
    }

    return taglines;
  }

  /**
   * 単一タグライン生成
   *
   * @private
   * @param {Object} foundation - Foundation Layer
   * @param {Object} voiceDesign - Voice設計
   * @param {ToneStrategy} strategy - 戦略
   * @returns {Promise<Object>}
   */
  async _generateSingleTagline(foundation, voiceDesign, strategy) {
    let content;
    let rationale;

    switch (strategy) {
      case ToneStrategy.DECLARATIVE:
        content = `${foundation.values[0]}の実現`;
        rationale = '価値の宣言で信頼を構築';
        break;

      case ToneStrategy.ASPIRATIONAL:
        content = `${foundation.purpose}へ、共に`;
        rationale = '共感と参加を促す';
        break;

      case ToneStrategy.IMPERATIVE:
        content = `${foundation.purpose}を始めよう`;
        rationale = '行動を促す直接的表現';
        break;

      default:
        content = foundation.values[0];
        rationale = 'デフォルト';
    }

    return {
      type: 'tagline',
      content,
      strategy,
      rationale,
      voiceAlignment: voiceDesign.archetype,
      characteristics: {
        length: content.length,
        memorability: this._assessMemorability(content),
        rhythm: this._assessRhythm(content),
        culturalFit: this._assessCulturalFit(content)
      }
    };
  }

  /**
   * ボイスガイド生成
   *
   * @private
   * @param {Object} voiceDesign - Voice設計
   * @param {Object} toneMap - Tonality Map
   * @param {Object} estack - E:Stack構造
   * @returns {Promise<Object>}
   */
  async _generateVoiceGuide(voiceDesign, toneMap, estack) {
    return {
      summary: {
        archetype: voiceDesign.archetype,
        personality: voiceDesign.personality,
        coreValues: voiceDesign.characteristics.coreValues
      },
      guidelines: {
        dos: voiceDesign.dos,
        donts: voiceDesign.donts,
        linguisticStyle: voiceDesign.linguisticStyle
      },
      tonalityMap: toneMap,
      examples: {
        good: this._generateGoodExamples(estack, voiceDesign),
        bad: this._generateBadExamples(estack, voiceDesign)
      },
      application: {
        copywriting: 'コアメッセージとタグラインに一貫したVoiceを適用',
        communication: '全てのタッチポイントでTonality Mapに従う',
        evaluation: 'Voice & Tone Principlesに基づき評価'
      }
    };
  }

  /**
   * Good Examples 生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} voiceDesign - Voice設計
   * @returns {string[]}
   */
  _generateGoodExamples(estack, voiceDesign) {
    return [
      `「${estack.foundation.purpose}」という明確なメッセージ`,
      `${voiceDesign.archetype} の特性を体現した表現`,
      `${estack.foundation.values[0]}を感じさせる言葉選び`
    ];
  }

  /**
   * Bad Examples 生成
   *
   * @private
   * @param {Object} estack - E:Stack構造
   * @param {Object} voiceDesign - Voice設計
   * @returns {string[]}
   */
  _generateBadExamples(estack, voiceDesign) {
    return [
      `「${estack.foundation.notAxis[0]}」を連想させる表現`,
      `${voiceDesign.archetype} と矛盾するトーン`,
      'ブランド価値と無関係な装飾的言葉'
    ];
  }

  /**
   * 明瞭性評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string}
   */
  _assessClarity(text) {
    const length = text.length;
    if (length < 20) return 'very-clear';
    if (length < 40) return 'clear';
    if (length < 80) return 'moderate';
    return 'complex';
  }

  /**
   * 記憶性評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string}
   */
  _assessMemorability(text) {
    const hasRhythm = /[、へをに]/.test(text);
    const isShort = text.length < 30;
    const hasRepetition = /(.{3,})\1/.test(text);

    if ((hasRhythm || hasRepetition) && isShort) return 'high';
    if (isShort) return 'moderate';
    return 'low';
  }

  /**
   * リズム評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string}
   */
  _assessRhythm(text) {
    const syllables = text.length;
    if (syllables <= 15) return 'excellent';
    if (syllables <= 25) return 'good';
    if (syllables <= 35) return 'moderate';
    return 'slow';
  }

  /**
   * 感情的共鳴評価
   *
   * @private
   * @param {string} text - テキスト
   * @param {Object} voiceDesign - Voice設計
   * @returns {string}
   */
  _assessEmotionalResonance(text, voiceDesign) {
    const emotionalWords = ['実現', '共に', '未来', '信頼', '革新', '価値'];
    const hasEmotionalWords = emotionalWords.some(word => text.includes(word));

    if (hasEmotionalWords && voiceDesign.characteristics.emotion !== 'controlled') {
      return 'high';
    }
    if (hasEmotionalWords) {
      return 'moderate';
    }
    return 'low';
  }

  /**
   * 文化適合性評価
   *
   * @private
   * @param {string} text - テキスト
   * @returns {string}
   */
  _assessCulturalFit(text) {
    // 簡易実装: 日本語として自然かチェック
    const hasUnnaturalPatterns = /[ぁ-んァ-ヶー一-龯]{20,}/.test(text);
    if (hasUnnaturalPatterns) return 'low';
    return 'high';
  }
}

export default CopyAgent;
