/**
 * Logger - 構造化ログシステム
 *
 * AGENTS.md v5.0 のトレーサビリティ原則に準拠
 * 全てのアクションは記録され追跡可能でなければならない
 *
 * @module Logger
 * @version 1.0.0
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * ログレベル
 * @enum {string}
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
};

/**
 * ログレベルの優先度
 */
const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

/**
 * Logger クラス
 *
 * 構造化ログの出力と永続化
 */
export class Logger {
  /**
   * @param {Object} config - ロガー設定
   * @param {string} config.name - ロガー名
   * @param {LogLevel} [config.level] - ログレベル
   * @param {string} [config.logDir] - ログディレクトリ
   * @param {boolean} [config.console] - コンソール出力の有無
   * @param {boolean} [config.file] - ファイル出力の有無
   */
  constructor(config) {
    this.name = config.name || 'BrandBuilder';
    this.level = config.level || LogLevel.INFO;
    this.logDir = config.logDir || process.env.LOG_DIRECTORY || '.ai/logs';
    this.enableConsole = config.console !== false;
    this.enableFile = config.file !== false;
    this.buffer = [];
    this.flushInterval = null;

    if (this.enableFile) {
      this._ensureLogDirectory();
      this._startBufferFlush();
    }
  }

  /**
   * ログディレクトリ作成
   *
   * @private
   */
  async _ensureLogDirectory() {
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * バッファフラッシュ開始
   *
   * @private
   */
  _startBufferFlush() {
    // 10 秒ごとにバッファをファイルに書き込み
    this.flushInterval = setInterval(() => {
      this.flush().catch(err => {
        console.error('ログフラッシュエラー:', err);
      });
    }, 10000);
  }

  /**
   * ログエントリ作成
   *
   * @private
   * @param {LogLevel} level - ログレベル
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト情報
   * @returns {Object} ログエントリ
   */
  _createLogEntry(level, message, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      name: this.name,
      message,
      ...context,
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'localhost'
    };
  }

  /**
   * ログ出力判定
   *
   * @private
   * @param {LogLevel} level - ログレベル
   * @returns {boolean} 出力するかどうか
   */
  _shouldLog(level) {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  /**
   * ログ出力
   *
   * @private
   * @param {LogLevel} level - ログレベル
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  _log(level, message, context) {
    if (!this._shouldLog(level)) {
      return;
    }

    const entry = this._createLogEntry(level, message, context);

    // コンソール出力
    if (this.enableConsole) {
      this._consoleOutput(level, entry);
    }

    // ファイル出力 (バッファに追加)
    if (this.enableFile) {
      this.buffer.push(entry);
    }
  }

  /**
   * コンソール出力
   *
   * @private
   * @param {LogLevel} level - ログレベル
   * @param {Object} entry - ログエントリ
   */
  _consoleOutput(level, entry) {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.name}]`;

    const output = `${prefix} ${entry.message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(output, entry);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output, entry);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output, entry);
        break;
    }
  }

  /**
   * DEBUG ログ
   *
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  debug(message, context) {
    this._log(LogLevel.DEBUG, message, context);
  }

  /**
   * INFO ログ
   *
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  info(message, context) {
    this._log(LogLevel.INFO, message, context);
  }

  /**
   * WARN ログ
   *
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  warn(message, context) {
    this._log(LogLevel.WARN, message, context);
  }

  /**
   * ERROR ログ
   *
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  error(message, context) {
    this._log(LogLevel.ERROR, message, context);
  }

  /**
   * FATAL ログ
   *
   * @param {string} message - メッセージ
   * @param {Object} [context] - コンテキスト
   */
  fatal(message, context) {
    this._log(LogLevel.FATAL, message, context);
  }

  /**
   * バッファをファイルにフラッシュ
   *
   * @returns {Promise<void>}
   */
  async flush() {
    if (this.buffer.length === 0) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];

    const date = new Date().toISOString().split('T')[0];
    const logFile = join(this.logDir, `${this.name}-${date}.log`);

    const logLines = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';

    try {
      await writeFile(logFile, logLines, { flag: 'a' });
    } catch (error) {
      console.error('ログファイル書き込みエラー:', error);
    }
  }

  /**
   * ロガー終了
   *
   * @returns {Promise<void>}
   */
  async close() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }

  /**
   * 子ロガー作成
   *
   * @param {string} childName - 子ロガー名
   * @returns {Logger} 子ロガー
   */
  child(childName) {
    return new Logger({
      name: `${this.name}:${childName}`,
      level: this.level,
      logDir: this.logDir,
      console: this.enableConsole,
      file: this.enableFile
    });
  }
}

export default Logger;
