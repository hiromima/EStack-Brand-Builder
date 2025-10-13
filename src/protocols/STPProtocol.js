/**
 * STP Protocol - Structural Transfer Protocol
 *
 * エージェント間の構造化データ転送プロトコル
 * AGENTS.md v5.0 準拠
 *
 * @module STPProtocol
 * @version 1.0.0
 */

/**
 * メッセージタイプ
 * @enum {string}
 */
export const MessageType = {
  REQUEST: 'request',
  RESPONSE: 'response',
  NOTIFICATION: 'notification',
  ERROR: 'error'
};

/**
 * E:Stack 構造
 * @typedef {Object} EStack
 * @property {Foundation} foundation - Foundation Layer
 * @property {Structure} structure - Structure Layer
 * @property {Expression} expression - Expression Layer
 */

/**
 * STP Protocol クラス
 *
 * エージェント間の標準化されたメッセージング
 */
export class STPProtocol {
  /**
   * @param {Object} config - プロトコル設定
   * @param {string} config.version - プロトコルバージョン
   */
  constructor(config = {}) {
    this.version = config.version || '1.0.0';
  }

  /**
   * メッセージ作成
   *
   * @param {Object} params - メッセージパラメータ
   * @param {MessageType} params.type - メッセージタイプ
   * @param {string} params.from - 送信元エージェント
   * @param {string} params.to - 送信先エージェント
   * @param {*} params.payload - ペイロード
   * @param {Object} [params.metadata] - 追加メタデータ
   * @returns {Object} STP メッセージ
   */
  createMessage({ type, from, to, payload, metadata = {} }) {
    this._validateMessageParams({ type, from, to, payload });

    return {
      protocol: 'STP',
      version: this.version,
      type,
      from,
      to,
      payload,
      metadata: {
        timestamp: new Date().toISOString(),
        traceId: this._generateTraceId(),
        ...metadata
      }
    };
  }

  /**
   * リクエストメッセージ作成
   *
   * @param {string} from - 送信元
   * @param {string} to - 送信先
   * @param {*} payload - ペイロード
   * @param {Object} [metadata] - メタデータ
   * @returns {Object} リクエストメッセージ
   */
  createRequest(from, to, payload, metadata) {
    return this.createMessage({
      type: MessageType.REQUEST,
      from,
      to,
      payload,
      metadata
    });
  }

  /**
   * レスポンスメッセージ作成
   *
   * @param {string} from - 送信元
   * @param {string} to - 送信先
   * @param {*} payload - ペイロード
   * @param {string} requestTraceId - 元のリクエストのトレース ID
   * @param {Object} [metadata] - メタデータ
   * @returns {Object} レスポンスメッセージ
   */
  createResponse(from, to, payload, requestTraceId, metadata = {}) {
    return this.createMessage({
      type: MessageType.RESPONSE,
      from,
      to,
      payload,
      metadata: {
        ...metadata,
        requestTraceId
      }
    });
  }

  /**
   * 通知メッセージ作成
   *
   * @param {string} from - 送信元
   * @param {string} to - 送信先 ('*' で全エージェント)
   * @param {*} payload - ペイロード
   * @param {Object} [metadata] - メタデータ
   * @returns {Object} 通知メッセージ
   */
  createNotification(from, to, payload, metadata) {
    return this.createMessage({
      type: MessageType.NOTIFICATION,
      from,
      to,
      payload,
      metadata
    });
  }

  /**
   * エラーメッセージ作成
   *
   * @param {string} from - 送信元
   * @param {string} to - 送信先
   * @param {Error} error - エラーオブジェクト
   * @param {string} [requestTraceId] - 元のリクエストのトレース ID
   * @returns {Object} エラーメッセージ
   */
  createError(from, to, error, requestTraceId) {
    return this.createMessage({
      type: MessageType.ERROR,
      from,
      to,
      payload: {
        error: error.message,
        stack: error.stack,
        name: error.name
      },
      metadata: requestTraceId ? { requestTraceId } : {}
    });
  }

  /**
   * E:Stack 構造メッセージ作成
   *
   * E:Stack Method に準拠した構造化データの転送
   *
   * @param {string} from - 送信元
   * @param {string} to - 送信先
   * @param {EStack} estack - E:Stack 構造
   * @returns {Object} E:Stack メッセージ
   */
  createEStackMessage(from, to, estack) {
    this._validateEStack(estack);

    return this.createMessage({
      type: MessageType.REQUEST,
      from,
      to,
      payload: {
        type: 'EStack',
        data: estack
      },
      metadata: {
        schema: 'EStack-v5.1'
      }
    });
  }

  /**
   * メッセージ検証
   *
   * @param {Object} message - 検証するメッセージ
   * @returns {boolean} 有効かどうか
   * @throws {Error} 検証失敗時
   */
  validateMessage(message) {
    if (!message || typeof message !== 'object') {
      throw new Error('メッセージは Object である必要があります');
    }

    if (message.protocol !== 'STP') {
      throw new Error('無効なプロトコル指定です');
    }

    if (!Object.values(MessageType).includes(message.type)) {
      throw new Error(`無効なメッセージタイプ: ${message.type}`);
    }

    if (!message.from || !message.to) {
      throw new Error('送信元・送信先が指定されていません');
    }

    if (!message.metadata || !message.metadata.timestamp) {
      throw new Error('メタデータが不正です');
    }

    return true;
  }

  /**
   * メッセージパラメータ検証
   *
   * @private
   * @param {Object} params - パラメータ
   */
  _validateMessageParams({ type, from, to, payload }) {
    if (!Object.values(MessageType).includes(type)) {
      throw new Error(`無効なメッセージタイプ: ${type}`);
    }

    if (!from || typeof from !== 'string') {
      throw new Error('送信元が無効です');
    }

    if (!to || typeof to !== 'string') {
      throw new Error('送信先が無効です');
    }

    if (payload === undefined) {
      throw new Error('ペイロードが指定されていません');
    }
  }

  /**
   * E:Stack 構造検証
   *
   * @private
   * @param {EStack} estack - E:Stack 構造
   */
  _validateEStack(estack) {
    if (!estack || typeof estack !== 'object') {
      throw new Error('E:Stack は Object である必要があります');
    }

    const requiredLayers = ['foundation', 'structure', 'expression'];
    for (const layer of requiredLayers) {
      if (!estack[layer]) {
        throw new Error(`E:Stack に ${layer} レイヤーがありません`);
      }
    }
  }

  /**
   * トレース ID 生成
   *
   * @private
   * @returns {string} トレース ID
   */
  _generateTraceId() {
    return `stp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * メッセージのシリアライズ
   *
   * @param {Object} message - メッセージ
   * @returns {string} JSON 文字列
   */
  serialize(message) {
    this.validateMessage(message);
    return JSON.stringify(message, null, 2);
  }

  /**
   * メッセージのデシリアライズ
   *
   * @param {string} json - JSON 文字列
   * @returns {Object} メッセージオブジェクト
   */
  deserialize(json) {
    const message = JSON.parse(json);
    this.validateMessage(message);
    return message;
  }
}

export default STPProtocol;
