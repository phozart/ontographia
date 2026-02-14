// lib/repositories/DocumentRepository.js
// Repository for document-related database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * Valid document status values
 */
export const DOCUMENT_STATUS = Object.freeze(['Draft', 'InReview', 'Published', 'Archived']);

/**
 * Normalize status to match database constraint (case-insensitive)
 * @param {string} [value]
 * @param {string} [defaultValue='Draft']
 * @returns {string|null}
 */
export function normalizeDocumentStatus(value, defaultValue = 'Draft') {
  if (!value) return defaultValue === null ? null : defaultValue;
  const lower = String(value).toLowerCase();
  const found = DOCUMENT_STATUS.find(v => v.toLowerCase() === lower);
  return found || defaultValue;
}

/**
 * Repository for Document operations
 */
export class DocumentRepository extends BaseRepository {
  constructor() {
    super('documents', 'id');
  }

  /**
   * Find all documents for a project
   * @param {string} projectId
   * @param {Object} [filters]
   * @param {string} [filters.type] - Document type filter
   * @param {string} [filters.status] - Status filter
   * @returns {Promise<Object[]>}
   */
  async findByProject(projectId, filters = {}) {
    const { type, status } = filters;

    let sql = `
      SELECT d.*,
        u.username as created_by_username,
        a.name as artefact_name,
        a.artefact_type as artefact_type
      FROM documents d
      LEFT JOIN users u ON u.id = d.created_by
      LEFT JOIN artefacts a ON a.id = d.artefact_id
      WHERE d.project_id = $1
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (type) {
      sql += ` AND d.document_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (status) {
      sql += ` AND d.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    sql += ` ORDER BY d.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a document by ID with related data
   * @param {string} documentId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithDetails(documentId) {
    const result = await query(
      `SELECT d.*,
        u.username as created_by_username,
        a.name as artefact_name,
        a.artefact_type as artefact_type,
        t.name as template_name
      FROM documents d
      LEFT JOIN users u ON u.id = d.created_by
      LEFT JOIN artefacts a ON a.id = d.artefact_id
      LEFT JOIN document_templates t ON t.id = d.template_id
      WHERE d.id = $1`,
      [documentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get the project ID for a document
   * @param {string} documentId
   * @returns {Promise<string|null>}
   */
  async getProjectId(documentId) {
    const result = await query(
      `SELECT project_id FROM documents WHERE id = $1`,
      [documentId]
    );
    return result.rows[0]?.project_id || null;
  }

  /**
   * Get template content by ID
   * @param {string} templateId
   * @returns {Promise<Array|null>}
   */
  async getTemplateContent(templateId) {
    const result = await query(
      `SELECT content FROM document_templates WHERE id = $1`,
      [templateId]
    );
    return result.rows[0]?.content || null;
  }

  /**
   * Create a new document
   * @param {Object} data
   * @param {string} data.projectId
   * @param {string} data.documentType
   * @param {string} data.title
   * @param {Array} [data.content]
   * @param {string} [data.artefactId]
   * @param {string} [data.templateId]
   * @param {string} [data.status]
   * @param {string} createdBy - User ID
   * @returns {Promise<Object>}
   */
  async createDocument(data, createdBy) {
    const {
      projectId,
      artefactId,
      documentType,
      title,
      content,
      templateId,
      status,
    } = data;

    if (!projectId) {
      throw new Error('Project ID required');
    }

    if (!documentType) {
      throw new Error('Document type required');
    }

    if (!title || !title.trim()) {
      throw new Error('Document title required');
    }

    // If templateId provided and no content, get template content
    let documentContent = content || [];
    if (templateId && (!content || content.length === 0)) {
      const templateContent = await this.getTemplateContent(templateId);
      if (templateContent) {
        documentContent = templateContent;
      }
    }

    const documentStatus = normalizeDocumentStatus(status);

    const result = await query(
      `INSERT INTO documents (
        project_id, artefact_id, document_type, title, content,
        template_id, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
      RETURNING *`,
      [
        projectId,
        artefactId || null,
        documentType,
        title.trim(),
        JSON.stringify(documentContent),
        templateId || null,
        documentStatus,
        createdBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a document
   * @param {string} documentId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateDocument(documentId, data) {
    const { title, content, status, artefactId } = data;

    const documentStatus = normalizeDocumentStatus(status, null);

    const result = await query(
      `UPDATE documents SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        status = COALESCE($3, status),
        artefact_id = $4,
        version = version + 1,
        updated_at = now()
      WHERE id = $5
      RETURNING *`,
      [
        title,
        content ? JSON.stringify(content) : null,
        documentStatus,
        artefactId,
        documentId,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a document
   * @param {string} documentId
   * @returns {Promise<boolean>}
   */
  async deleteDocument(documentId) {
    const result = await query(
      `DELETE FROM documents WHERE id = $1 RETURNING id`,
      [documentId]
    );
    return result.rowCount > 0;
  }

  /**
   * Find documents by artefact ID
   * @param {string} artefactId
   * @returns {Promise<Object[]>}
   */
  async findByArtefact(artefactId) {
    const result = await query(
      `SELECT d.*,
        u.username as created_by_username
      FROM documents d
      LEFT JOIN users u ON u.id = d.created_by
      WHERE d.artefact_id = $1
      ORDER BY d.updated_at DESC`,
      [artefactId]
    );
    return result.rows;
  }

  /**
   * Find document templates
   * @param {Object} [filters]
   * @param {string} [filters.type] - Document type filter
   * @param {string} [filters.artefactType] - Artefact type filter (uses JSONB ? operator)
   * @returns {Promise<Object[]>}
   */
  async findTemplates(filters = {}) {
    const { type, artefactType } = filters;

    let sql = `SELECT * FROM document_templates WHERE 1=1`;
    const params = [];
    let paramIdx = 1;

    if (type) {
      sql += ` AND document_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (artefactType) {
      sql += ` AND artefact_types ? $${paramIdx}`;
      params.push(artefactType);
      paramIdx++;
    }

    sql += ` ORDER BY name ASC`;

    const result = await query(sql, params);
    return result.rows;
  }
}

// Export singleton instance
export const documentRepository = new DocumentRepository();

export default documentRepository;
