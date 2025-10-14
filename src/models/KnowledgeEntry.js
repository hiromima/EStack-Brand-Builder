/**
 * @file KnowledgeEntry.js
 * @description Knowledge Entry モデル定義
 * @version 1.0.0
 */

/**
 * 知識エントリのソース情報
 * @typedef {Object} KnowledgeSource
 * @property {'journal'|'book'|'website'|'gallery'|'internal'} type - ソースタイプ
 * @property {string} name - ソース名
 * @property {string} [url] - URL (任意)
 * @property {string[]} author - 著者リスト
 * @property {Date} publishedDate - 公開日
 * @property {Date} accessedDate - アクセス日
 */

/**
 * 引用情報
 * @typedef {Object} CitationInfo
 * @property {string} apa - APA形式の引用
 * @property {string} mla - MLA形式の引用
 * @property {string} ieee - IEEE形式の引用
 * @property {string} bibtex - BibTeX形式の引用
 */

/**
 * 信頼性指標
 * @typedef {Object} CredibilityMetrics
 * @property {number} score - 信頼性スコア (0-100)
 * @property {boolean} peerReviewed - 査読済みかどうか
 * @property {number} citations - 引用数
 * @property {'Q1'|'Q2'|'Q3'|'Q4'|null} sourceRank - ソースランク
 */

/**
 * 関連性情報
 * @typedef {Object} RelevanceInfo
 * @property {string[]} categories - カテゴリリスト
 * @property {string[]} keywords - キーワードリスト
 * @property {string[]} relatedEntries - 関連エントリIDリスト
 */

/**
 * メタデータ
 * @typedef {Object} EntryMetadata
 * @property {Date} addedAt - 追加日時
 * @property {Date} updatedAt - 更新日時
 * @property {number} version - バージョン番号
 * @property {'active'|'archived'|'pending-review'} status - ステータス
 */

/**
 * 知識エントリクラス
 */
export class KnowledgeEntry {
  /**
   * @param {Object} data - エントリデータ
   * @param {string} data.id - エントリID
   * @param {'academic'|'design'|'method'|'standard'|'template'} data.type - エントリタイプ
   * @param {string} data.title - タイトル
   * @param {string} data.content - コンテンツ
   * @param {string} data.summary - 要約
   * @param {KnowledgeSource} data.source - ソース情報
   * @param {CitationInfo} data.citation - 引用情報
   * @param {CredibilityMetrics} data.credibility - 信頼性指標
   * @param {RelevanceInfo} data.relevance - 関連性情報
   * @param {number[]} [data.embedding] - ベクトル埋め込み
   * @param {EntryMetadata} [data.metadata] - メタデータ
   */
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title;
    this.content = data.content;
    this.summary = data.summary;
    this.source = data.source;
    this.citation = data.citation;
    this.credibility = data.credibility;
    this.relevance = data.relevance;
    this.embedding = data.embedding || null;
    this.metadata = data.metadata || {
      addedAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      status: 'pending-review'
    };

    // バリデーション
    this.validate();
  }

  /**
   * エントリのバリデーション
   * @throws {Error} バリデーションエラー
   */
  validate() {
    const errors = [];

    // 必須フィールド
    if (!this.id) errors.push('id is required');
    if (!this.type) errors.push('type is required');
    if (!this.title) errors.push('title is required');
    if (!this.content) errors.push('content is required');
    if (!this.summary) errors.push('summary is required');

    // タイプバリデーション
    const validTypes = ['academic', 'design', 'method', 'standard', 'template'];
    if (!validTypes.includes(this.type)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }

    // ソースバリデーション
    if (!this.source || !this.source.type || !this.source.name) {
      errors.push('source.type and source.name are required');
    }

    // 信頼性スコアバリデーション
    if (!this.credibility || typeof this.credibility.score !== 'number') {
      errors.push('credibility.score is required and must be a number');
    } else if (this.credibility.score < 0 || this.credibility.score > 100) {
      errors.push('credibility.score must be between 0 and 100');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * JSON形式にシリアライズ
   * @returns {Object} JSON表現
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      content: this.content,
      summary: this.summary,
      source: this.source,
      citation: this.citation,
      credibility: this.credibility,
      relevance: this.relevance,
      embedding: this.embedding,
      metadata: {
        ...this.metadata,
        addedAt: this.metadata.addedAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString()
      }
    };
  }

  /**
   * JSONからKnowledgeEntryインスタンスを生成
   * @param {Object} json - JSON表現
   * @returns {KnowledgeEntry} インスタンス
   */
  static fromJSON(json) {
    const data = {
      ...json,
      metadata: {
        ...json.metadata,
        addedAt: new Date(json.metadata.addedAt),
        updatedAt: new Date(json.metadata.updatedAt)
      }
    };

    if (json.source.publishedDate) {
      data.source.publishedDate = new Date(json.source.publishedDate);
    }
    if (json.source.accessedDate) {
      data.source.accessedDate = new Date(json.source.accessedDate);
    }

    return new KnowledgeEntry(data);
  }

  /**
   * エントリを更新
   * @param {Object} updates - 更新内容
   */
  update(updates) {
    const allowedFields = [
      'title',
      'content',
      'summary',
      'source',
      'citation',
      'credibility',
      'relevance',
      'embedding'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        this[key] = value;
      }
    }

    this.metadata.updatedAt = new Date();
    this.metadata.version++;

    this.validate();
  }

  /**
   * エントリをアーカイブ
   */
  archive() {
    this.metadata.status = 'archived';
    this.metadata.updatedAt = new Date();
  }

  /**
   * エントリを承認
   */
  approve() {
    this.metadata.status = 'active';
    this.metadata.updatedAt = new Date();
  }

  /**
   * 検索用のテキスト表現を生成
   * @returns {string} 検索用テキスト
   */
  toSearchText() {
    return `${this.title}\n\n${this.summary}\n\n${this.content}`;
  }

  /**
   * メタデータ用の簡略化表現
   * @returns {Object} メタデータ
   */
  toMetadata() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      categories: this.relevance.categories,
      keywords: this.relevance.keywords,
      credibilityScore: this.credibility.score,
      peerReviewed: this.credibility.peerReviewed,
      status: this.metadata.status
    };
  }
}

/**
 * 引用情報を生成
 * @param {KnowledgeEntry} entry - 知識エントリ
 * @returns {CitationInfo} 引用情報
 */
export function generateCitations(entry) {
  const { source } = entry;
  const authors = source.author.join(', ');
  const year = source.publishedDate.getFullYear();
  const accessDate = source.accessedDate.toLocaleDateString('en-US');

  // APA形式
  const apa = `${authors} (${year}). ${entry.title}. ${source.name}. ${
    source.url ? `Retrieved ${accessDate}, from ${source.url}` : ''
  }`;

  // MLA形式
  const mla = `${authors}. "${entry.title}." ${source.name}, ${year}${
    source.url ? `, ${source.url}. Accessed ${accessDate}.` : '.'
  }`;

  // IEEE形式
  const ieee = `${authors}, "${entry.title}," ${source.name}, ${year}${
    source.url ? `. [Online]. Available: ${source.url}` : '.'
  }`;

  // BibTeX形式
  const bibtex = `@article{${entry.id},
  author = {${authors}},
  title = {${entry.title}},
  journal = {${source.name}},
  year = {${year}},
  ${source.url ? `url = {${source.url}},` : ''}
}`;

  return { apa, mla, ieee, bibtex };
}

/**
 * デフォルトエクスポート
 */
export default KnowledgeEntry;
