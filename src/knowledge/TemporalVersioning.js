import { Logger } from '../utils/Logger.js';

const logger = new Logger('TemporalVersioning');

/**
 * TemporalVersioning - 時系列バージョニングシステム
 *
 * Knowledge Entry の時系列変更履歴を管理し、
 * 差分追跡、ロールバック、スナップショット機能を提供します。
 *
 * @class
 * @example
 * const versioning = new TemporalVersioning();
 * versioning.createVersion('entry1', data1, { author: 'user1' });
 * versioning.createVersion('entry1', data2, { author: 'user2' });
 * const history = versioning.getHistory('entry1');
 */
export class TemporalVersioning {
  /**
   * TemporalVersioning コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {number} [options.maxVersions=50] - 最大バージョン保持数
   * @param {boolean} [options.compressOldVersions=true] - 古いバージョンの圧縮
   */
  constructor(options = {}) {
    this.config = {
      maxVersions: options.maxVersions || 50,
      compressOldVersions: options.compressOldVersions !== false
    };

    // エンティティID -> バージョンリスト
    this.versions = new Map();

    // エンティティID -> 現在バージョン番号
    this.currentVersions = new Map();

    // スナップショットキャッシュ
    this.snapshotCache = new Map();
  }

  /**
   * バージョン作成
   *
   * @param {string} entityId - エンティティ ID
   * @param {Object} data - データ
   * @param {Object} [metadata={}] - メタデータ
   * @param {string} [metadata.author] - 作成者
   * @param {string} [metadata.comment] - コメント
   * @param {Array<string>} [metadata.tags] - タグ
   * @returns {Object} 作成されたバージョン
   */
  createVersion(entityId, data, metadata = {}) {
    if (!entityId) {
      throw new Error('entityId is required');
    }

    if (!data) {
      throw new Error('data is required');
    }

    // エンティティのバージョンリスト取得または作成
    if (!this.versions.has(entityId)) {
      this.versions.set(entityId, []);
      this.currentVersions.set(entityId, 0);
    }

    const versionList = this.versions.get(entityId);
    const versionNumber = versionList.length + 1;

    // 差分計算（前バージョンとの比較）
    const previousVersion = versionList[versionList.length - 1];
    const diff = previousVersion
      ? this._calculateDiff(previousVersion.data, data)
      : null;

    // バージョン作成
    const version = {
      versionNumber,
      entityId,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      diff,
      metadata: {
        author: metadata.author || 'system',
        comment: metadata.comment || '',
        tags: metadata.tags || [],
        createdAt: new Date().toISOString()
      }
    };

    versionList.push(version);
    this.currentVersions.set(entityId, versionNumber);

    // 最大バージョン数チェック
    if (versionList.length > this.config.maxVersions) {
      this._pruneOldVersions(entityId);
    }

    // スナップショットキャッシュ無効化
    this.snapshotCache.delete(entityId);

    logger.debug(`Version ${versionNumber} created for entity '${entityId}'`);

    return version;
  }

  /**
   * バージョン取得
   *
   * @param {string} entityId - エンティティ ID
   * @param {number} [versionNumber] - バージョン番号（省略時は最新）
   * @returns {Object|null} バージョン
   */
  getVersion(entityId, versionNumber) {
    const versionList = this.versions.get(entityId);
    if (!versionList || versionList.length === 0) {
      return null;
    }

    if (versionNumber === undefined) {
      // 最新バージョン
      return versionList[versionList.length - 1];
    }

    // 指定バージョン
    return versionList.find(v => v.versionNumber === versionNumber) || null;
  }

  /**
   * 履歴取得
   *
   * @param {string} entityId - エンティティ ID
   * @param {Object} [options={}] - オプション
   * @param {number} [options.limit] - 取得件数制限
   * @param {string} [options.since] - 開始日時（ISO 8601）
   * @param {string} [options.until] - 終了日時（ISO 8601）
   * @returns {Array<Object>} バージョンリスト
   */
  getHistory(entityId, options = {}) {
    let versionList = this.versions.get(entityId);
    if (!versionList || versionList.length === 0) {
      return [];
    }

    // 時間範囲フィルタ
    if (options.since || options.until) {
      versionList = versionList.filter(v => {
        const createdAt = new Date(v.metadata.createdAt);
        if (options.since && createdAt < new Date(options.since)) {
          return false;
        }
        if (options.until && createdAt > new Date(options.until)) {
          return false;
        }
        return true;
      });
    }

    // 件数制限
    if (options.limit) {
      versionList = versionList.slice(-options.limit);
    }

    return versionList;
  }

  /**
   * ロールバック
   *
   * @param {string} entityId - エンティティ ID
   * @param {number} targetVersion - ロールバック先バージョン番号
   * @param {Object} [metadata={}] - メタデータ
   * @returns {Object} 新しいバージョン
   */
  rollback(entityId, targetVersion, metadata = {}) {
    const targetVersionData = this.getVersion(entityId, targetVersion);
    if (!targetVersionData) {
      throw new Error(`Version ${targetVersion} not found for entity '${entityId}'`);
    }

    // ロールバック用の新しいバージョン作成
    const rollbackMetadata = {
      ...metadata,
      comment: metadata.comment || `Rollback to version ${targetVersion}`,
      tags: [...(metadata.tags || []), 'rollback'],
      rollbackFrom: this.currentVersions.get(entityId),
      rollbackTo: targetVersion
    };

    const newVersion = this.createVersion(entityId, targetVersionData.data, rollbackMetadata);

    logger.info(`Rolled back entity '${entityId}' from v${rollbackMetadata.rollbackFrom} to v${targetVersion}`);

    return newVersion;
  }

  /**
   * スナップショット作成
   *
   * @param {string} entityId - エンティティ ID
   * @param {string} snapshotName - スナップショット名
   * @param {Object} [metadata={}] - メタデータ
   * @returns {Object} スナップショット
   */
  createSnapshot(entityId, snapshotName, metadata = {}) {
    const currentVersion = this.getVersion(entityId);
    if (!currentVersion) {
      throw new Error(`No versions found for entity '${entityId}'`);
    }

    const snapshot = {
      snapshotName,
      entityId,
      versionNumber: currentVersion.versionNumber,
      data: JSON.parse(JSON.stringify(currentVersion.data)),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    };

    // スナップショットキャッシュに保存
    const cacheKey = `${entityId}:${snapshotName}`;
    this.snapshotCache.set(cacheKey, snapshot);

    logger.info(`Snapshot '${snapshotName}' created for entity '${entityId}' at v${currentVersion.versionNumber}`);

    return snapshot;
  }

  /**
   * スナップショット取得
   *
   * @param {string} entityId - エンティティ ID
   * @param {string} snapshotName - スナップショット名
   * @returns {Object|null} スナップショット
   */
  getSnapshot(entityId, snapshotName) {
    const cacheKey = `${entityId}:${snapshotName}`;
    return this.snapshotCache.get(cacheKey) || null;
  }

  /**
   * 差分計算
   *
   * @private
   * @param {Object} oldData - 古いデータ
   * @param {Object} newData - 新しいデータ
   * @returns {Object} 差分
   */
  _calculateDiff(oldData, newData) {
    const diff = {
      added: {},
      modified: {},
      removed: {}
    };

    // 追加・変更
    for (const key in newData) {
      if (!(key in oldData)) {
        diff.added[key] = newData[key];
      } else if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        diff.modified[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }

    // 削除
    for (const key in oldData) {
      if (!(key in newData)) {
        diff.removed[key] = oldData[key];
      }
    }

    return diff;
  }

  /**
   * 古いバージョン削除
   *
   * @private
   * @param {string} entityId - エンティティ ID
   */
  _pruneOldVersions(entityId) {
    const versionList = this.versions.get(entityId);
    if (versionList.length > this.config.maxVersions) {
      const removeCount = versionList.length - this.config.maxVersions;
      versionList.splice(0, removeCount);

      // バージョン番号を再調整
      versionList.forEach((v, i) => {
        v.versionNumber = i + 1;
      });

      logger.debug(`Pruned ${removeCount} old versions for entity '${entityId}'`);
    }
  }

  /**
   * 統計取得
   *
   * @returns {Object} 統計情報
   */
  getStatistics() {
    const entityCount = this.versions.size;
    let totalVersions = 0;
    let avgVersionsPerEntity = 0;

    this.versions.forEach((versionList) => {
      totalVersions += versionList.length;
    });

    if (entityCount > 0) {
      avgVersionsPerEntity = (totalVersions / entityCount).toFixed(2);
    }

    return {
      entityCount,
      totalVersions,
      avgVersionsPerEntity,
      snapshotCount: this.snapshotCache.size
    };
  }

  /**
   * クリア
   */
  clear() {
    this.versions.clear();
    this.currentVersions.clear();
    this.snapshotCache.clear();
    logger.info('TemporalVersioning cleared');
  }
}

export default TemporalVersioning;
