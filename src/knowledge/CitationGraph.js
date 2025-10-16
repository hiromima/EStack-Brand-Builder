import { Logger } from '../utils/Logger.js';

const logger = new Logger('CitationGraph');

/**
 * CitationGraph - 引用グラフ構築システム
 *
 * Knowledge Entry 間の引用関係を管理し、
 * 信頼性スコアの伝播、循環参照検出、影響度分析を提供します。
 *
 * @class
 * @example
 * const graph = new CitationGraph();
 * graph.addNode('entry1', { title: 'Entry 1', credibility: 85 });
 * graph.addEdge('entry1', 'entry2', { citationType: 'supports' });
 * const score = graph.calculateInfluenceScore('entry1');
 */
export class CitationGraph {
  /**
   * CitationGraph コンストラクタ
   *
   * @param {Object} options - 設定オプション
   * @param {number} [options.dampingFactor=0.85] - PageRank 減衰係数
   * @param {number} [options.maxIterations=100] - PageRank 最大反復回数
   * @param {number} [options.convergenceThreshold=0.0001] - PageRank 収束閾値
   */
  constructor(options = {}) {
    this.config = {
      dampingFactor: options.dampingFactor || 0.85,
      maxIterations: options.maxIterations || 100,
      convergenceThreshold: options.convergenceThreshold || 0.0001
    };

    // グラフ構造
    this.nodes = new Map(); // nodeId -> nodeData
    this.edges = new Map(); // sourceId -> Set<{targetId, edgeData}>
    this.reverseEdges = new Map(); // targetId -> Set<{sourceId, edgeData}>

    // キャッシュ
    this.influenceScoreCache = new Map();
    this.pageRankCache = null;
    this.cacheInvalidated = true;
  }

  /**
   * ノード追加
   *
   * @param {string} nodeId - ノード ID
   * @param {Object} nodeData - ノードデータ
   * @param {string} nodeData.title - タイトル
   * @param {number} [nodeData.credibility=50] - 信頼性スコア (0-100)
   * @param {string} [nodeData.type='knowledge'] - ノードタイプ
   * @param {Object} [nodeData.metadata={}] - メタデータ
   */
  addNode(nodeId, nodeData) {
    if (!nodeId) {
      throw new Error('nodeId is required');
    }

    if (!nodeData.title) {
      throw new Error('nodeData.title is required');
    }

    const node = {
      id: nodeId,
      title: nodeData.title,
      credibility: nodeData.credibility || 50,
      type: nodeData.type || 'knowledge',
      metadata: nodeData.metadata || {},
      createdAt: new Date().toISOString()
    };

    this.nodes.set(nodeId, node);
    this.invalidateCache();

    logger.debug(`Node added: ${nodeId}`);
  }

  /**
   * エッジ追加（引用関係）
   *
   * @param {string} sourceId - 引用元 ID
   * @param {string} targetId - 引用先 ID
   * @param {Object} [edgeData={}] - エッジデータ
   * @param {string} [edgeData.citationType='references'] - 引用タイプ
   * @param {number} [edgeData.weight=1.0] - 重み
   * @param {string} [edgeData.context] - 引用コンテキスト
   */
  addEdge(sourceId, targetId, edgeData = {}) {
    if (!this.nodes.has(sourceId)) {
      throw new Error(`Source node '${sourceId}' does not exist`);
    }

    if (!this.nodes.has(targetId)) {
      throw new Error(`Target node '${targetId}' does not exist`);
    }

    if (sourceId === targetId) {
      throw new Error('Self-reference is not allowed');
    }

    const edge = {
      sourceId,
      targetId,
      citationType: edgeData.citationType || 'references',
      weight: edgeData.weight || 1.0,
      context: edgeData.context || '',
      createdAt: new Date().toISOString()
    };

    // Forward edges
    if (!this.edges.has(sourceId)) {
      this.edges.set(sourceId, new Set());
    }
    this.edges.get(sourceId).add(edge);

    // Reverse edges
    if (!this.reverseEdges.has(targetId)) {
      this.reverseEdges.set(targetId, new Set());
    }
    this.reverseEdges.get(targetId).add(edge);

    this.invalidateCache();

    logger.debug(`Edge added: ${sourceId} -> ${targetId} (${edge.citationType})`);
  }

  /**
   * ノード取得
   *
   * @param {string} nodeId - ノード ID
   * @returns {Object|null} ノードデータ
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * 出力エッジ取得
   *
   * @param {string} nodeId - ノード ID
   * @returns {Array<Object>} エッジリスト
   */
  getOutgoingEdges(nodeId) {
    const edges = this.edges.get(nodeId);
    return edges ? Array.from(edges) : [];
  }

  /**
   * 入力エッジ取得
   *
   * @param {string} nodeId - ノード ID
   * @returns {Array<Object>} エッジリスト
   */
  getIncomingEdges(nodeId) {
    const edges = this.reverseEdges.get(nodeId);
    return edges ? Array.from(edges) : [];
  }

  /**
   * 影響度スコア計算
   *
   * 引用数、被引用数、信頼性スコアを総合して影響度を算出します。
   *
   * @param {string} nodeId - ノード ID
   * @returns {number} 影響度スコア (0-100)
   */
  calculateInfluenceScore(nodeId) {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node '${nodeId}' does not exist`);
    }

    // キャッシュチェック
    if (!this.cacheInvalidated && this.influenceScoreCache.has(nodeId)) {
      return this.influenceScoreCache.get(nodeId);
    }

    // 基本スコア: ノード自身の信頼性
    const baseScore = node.credibility;

    // 被引用数（入力エッジ数）
    const incomingEdges = this.getIncomingEdges(nodeId);
    const citationCount = incomingEdges.length;

    // 引用元の信頼性加重平均
    const citationQuality = citationCount > 0
      ? incomingEdges.reduce((sum, edge) => {
        const sourceNode = this.getNode(edge.sourceId);
        return sum + (sourceNode ? sourceNode.credibility * edge.weight : 0);
      }, 0) / citationCount
      : 0;

    // 影響度スコア計算
    // Formula: 0.5 * baseScore + 0.3 * citationQuality + 0.2 * min(citationCount * 5, 100)
    const citationBonus = Math.min(citationCount * 5, 100);
    const influenceScore = 0.5 * baseScore + 0.3 * citationQuality + 0.2 * citationBonus;

    // 0-100 に正規化
    const normalizedScore = Math.max(0, Math.min(100, influenceScore));

    // キャッシュ保存
    this.influenceScoreCache.set(nodeId, normalizedScore);

    return normalizedScore;
  }

  /**
   * PageRank 計算
   *
   * グラフ全体の PageRank を計算します。
   *
   * @returns {Map<string, number>} nodeId -> PageRank スコア
   */
  calculatePageRank() {
    // キャッシュチェック
    if (!this.cacheInvalidated && this.pageRankCache) {
      return this.pageRankCache;
    }

    const nodeIds = Array.from(this.nodes.keys());
    const n = nodeIds.length;

    if (n === 0) {
      return new Map();
    }

    // 初期スコア（均等）
    const scores = new Map();
    nodeIds.forEach(id => scores.set(id, 1.0 / n));

    // 反復計算
    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      const newScores = new Map();
      let maxDiff = 0;

      for (const nodeId of nodeIds) {
        // PageRank formula: (1-d)/N + d * Σ(PR(incoming) / outgoingCount(incoming))
        const incomingEdges = this.getIncomingEdges(nodeId);
        const incomingSum = incomingEdges.reduce((sum, edge) => {
          const sourceId = edge.sourceId;
          const sourceScore = scores.get(sourceId) || 0;
          const outgoingCount = this.getOutgoingEdges(sourceId).length || 1;
          return sum + (sourceScore / outgoingCount);
        }, 0);

        const newScore = (1 - this.config.dampingFactor) / n +
                        this.config.dampingFactor * incomingSum;

        newScores.set(nodeId, newScore);

        // 収束判定
        const diff = Math.abs(newScore - scores.get(nodeId));
        maxDiff = Math.max(maxDiff, diff);
      }

      // スコア更新
      scores.clear();
      newScores.forEach((score, id) => scores.set(id, score));

      // 収束判定
      if (maxDiff < this.config.convergenceThreshold) {
        logger.debug(`PageRank converged after ${iteration + 1} iterations`);
        break;
      }
    }

    // 正規化（0-100）
    const maxScore = Math.max(...scores.values());
    const normalizedScores = new Map();
    scores.forEach((score, id) => {
      normalizedScores.set(id, (score / maxScore) * 100);
    });

    // キャッシュ保存
    this.pageRankCache = normalizedScores;
    this.cacheInvalidated = false;

    return normalizedScores;
  }

  /**
   * 循環参照検出
   *
   * @param {string} startNodeId - 開始ノード ID
   * @returns {Array<Array<string>>|null} 循環パスリストまたは null
   */
  detectCycles(startNodeId) {
    const cycles = [];
    const visited = new Set();
    const path = [];

    const dfs = (nodeId) => {
      if (path.includes(nodeId)) {
        // 循環検出
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat(nodeId));
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      path.push(nodeId);

      const outgoing = this.getOutgoingEdges(nodeId);
      for (const edge of outgoing) {
        dfs(edge.targetId);
      }

      path.pop();
    };

    dfs(startNodeId);

    return cycles.length > 0 ? cycles : null;
  }

  /**
   * グラフ統計取得
   *
   * @returns {Object} グラフ統計
   */
  getStatistics() {
    const nodeCount = this.nodes.size;
    const edgeCount = Array.from(this.edges.values()).reduce((sum, set) => sum + set.size, 0);

    // 孤立ノード
    const isolatedNodes = Array.from(this.nodes.keys()).filter(id => {
      return this.getIncomingEdges(id).length === 0 && this.getOutgoingEdges(id).length === 0;
    });

    // 最大被引用ノード
    let maxCitations = 0;
    let mostCitedNode = null;
    this.nodes.forEach((node, id) => {
      const citationCount = this.getIncomingEdges(id).length;
      if (citationCount > maxCitations) {
        maxCitations = citationCount;
        mostCitedNode = id;
      }
    });

    // 平均被引用数
    const avgCitations = nodeCount > 0
      ? edgeCount / nodeCount
      : 0;

    return {
      nodeCount,
      edgeCount,
      isolatedNodeCount: isolatedNodes.length,
      mostCitedNode,
      maxCitations,
      avgCitations: avgCitations.toFixed(2)
    };
  }

  /**
   * グラフエクスポート（JSON）
   *
   * @returns {Object} グラフデータ
   */
  toJSON() {
    const nodes = Array.from(this.nodes.values());
    const edges = [];

    this.edges.forEach((edgeSet, _sourceId) => {
      edgeSet.forEach(edge => edges.push(edge));
    });

    return {
      nodes,
      edges,
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * グラフインポート（JSON）
   *
   * @param {Object} data - グラフデータ
   */
  fromJSON(data) {
    this.clear();

    // ノード追加
    data.nodes.forEach(node => {
      this.addNode(node.id, node);
    });

    // エッジ追加
    data.edges.forEach(edge => {
      this.addEdge(edge.sourceId, edge.targetId, edge);
    });

    logger.info(`Graph imported: ${data.nodes.length} nodes, ${data.edges.length} edges`);
  }

  /**
   * グラフクリア
   */
  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.reverseEdges.clear();
    this.invalidateCache();
    logger.info('Graph cleared');
  }

  /**
   * キャッシュ無効化
   *
   * @private
   */
  invalidateCache() {
    this.influenceScoreCache.clear();
    this.pageRankCache = null;
    this.cacheInvalidated = true;
  }
}

export default CitationGraph;
