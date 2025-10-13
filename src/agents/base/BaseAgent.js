/**
 * BaseAgent - すべてのエージェントの抽象基底クラス
 *
 * AGENTS.md v5.0 に準拠した自律型エージェントの共通機能を提供
 *
 * @module BaseAgent
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * エージェントの状態
 * @enum {string}
 */
export const AgentState = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  WAITING: 'waiting',
  ERROR: 'error',
  COMPLETED: 'completed'
};

/**
 * エージェントタイプ
 * @enum {string}
 */
export const AgentType = {
  STRUCTURE: 'StructureAgent',
  EXPRESSION: 'ExpressionAgent',
  EVALUATION: 'EvaluationAgent',
  COPY: 'CopyAgent',
  LOGO: 'LogoAgent',
  VISUAL: 'VisualAgent',
  COORDINATOR: 'CoordinatorAgent',
  QUALITY_CONTROL: 'QualityControlAgent',
  INCIDENT_COMMANDER: 'IncidentCommanderAgent',
  COST_MONITORING: 'CostMonitoringAgent',
  AUDIT: 'AuditAgent'
};

/**
 * BaseAgent 抽象クラス
 *
 * すべてのエージェントはこのクラスを継承する
 *
 * @abstract
 * @extends EventEmitter
 */
export class BaseAgent extends EventEmitter {
  /**
   * @param {Object} config - エージェント設定
   * @param {AgentType} config.type - エージェントタイプ
   * @param {string} config.name - エージェント名
   * @param {Object} config.logger - ロガーインスタンス
   * @param {Object} config.knowledge - ナレッジベース
   */
  constructor(config) {
    super();

    if (new.target === BaseAgent) {
      throw new Error('BaseAgent は抽象クラスです。直接インスタンス化できません');
    }

    this.type = config.type;
    this.name = config.name || this.type;
    this.state = AgentState.IDLE;
    this.logger = config.logger;
    this.knowledge = config.knowledge;
    this.metrics = {
      tasksProcessed: 0,
      successCount: 0,
      errorCount: 0,
      averageProcessingTime: 0
    };

    this._validateConfiguration();
  }

  /**
   * 設定の検証
   * @private
   */
  _validateConfiguration() {
    if (!this.type) {
      throw new Error('エージェントタイプが指定されていません');
    }
    if (!this.logger) {
      throw new Error('ロガーが設定されていません');
    }
  }

  /**
   * タスクを処理する (抽象メソッド)
   *
   * 各エージェントで実装必須
   *
   * @abstract
   * @param {Object} input - 入力データ
   * @returns {Promise<Object>} 処理結果
   */
  async process(input) {
    throw new Error('process() メソッドは各エージェントで実装する必要があります');
  }

  /**
   * タスク実行のラッパー
   *
   * - ステート管理
   * - エラーハンドリング
   * - メトリクス収集
   * - ログ出力
   *
   * @param {Object} input - 入力データ
   * @returns {Promise<Object>} 処理結果
   */
  async execute(input) {
    const startTime = Date.now();
    const traceId = this._generateTraceId();

    try {
      this._setState(AgentState.PROCESSING);
      this.logger.info(`[${this.name}] タスク実行開始`, { traceId, input });

      // 前処理
      await this._preProcess(input);

      // メイン処理
      const result = await this.process(input);

      // 後処理
      await this._postProcess(result);

      // メトリクス更新
      this._updateMetrics(startTime, true);

      this._setState(AgentState.COMPLETED);
      this.logger.info(`[${this.name}] タスク完了`, { traceId, result });

      this.emit('completed', { traceId, result });

      return result;

    } catch (error) {
      this._setState(AgentState.ERROR);
      this._updateMetrics(startTime, false);

      this.logger.error(`[${this.name}] エラー発生`, { traceId, error });
      this.emit('error', { traceId, error });

      throw error;
    } finally {
      this._setState(AgentState.IDLE);
    }
  }

  /**
   * 前処理 (オーバーライド可能)
   *
   * @protected
   * @param {Object} input - 入力データ
   */
  async _preProcess(input) {
    // サブクラスでオーバーライド可能
  }

  /**
   * 後処理 (オーバーライド可能)
   *
   * @protected
   * @param {Object} result - 処理結果
   */
  async _postProcess(result) {
    // サブクラスでオーバーライド可能
  }

  /**
   * ステート設定
   *
   * @private
   * @param {AgentState} newState - 新しいステート
   */
  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChange', { oldState, newState });
  }

  /**
   * メトリクス更新
   *
   * @private
   * @param {number} startTime - 開始時刻
   * @param {boolean} success - 成功したかどうか
   */
  _updateMetrics(startTime, success) {
    this.metrics.tasksProcessed++;

    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    const processingTime = Date.now() - startTime;
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.tasksProcessed - 1) + processingTime) /
      this.metrics.tasksProcessed;
  }

  /**
   * トレース ID 生成
   *
   * @private
   * @returns {string} トレース ID
   */
  _generateTraceId() {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * エージェント情報取得
   *
   * @returns {Object} エージェント情報
   */
  getInfo() {
    return {
      type: this.type,
      name: this.name,
      state: this.state,
      metrics: { ...this.metrics }
    };
  }

  /**
   * ヘルスチェック
   *
   * @returns {Promise<Object>} ヘルス情報
   */
  async healthCheck() {
    return {
      healthy: this.state !== AgentState.ERROR,
      state: this.state,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * メトリクスリセット
   */
  resetMetrics() {
    this.metrics = {
      tasksProcessed: 0,
      successCount: 0,
      errorCount: 0,
      averageProcessingTime: 0
    };
  }
}

export default BaseAgent;
