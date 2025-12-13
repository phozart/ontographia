// pages/api/documents/index.js
// List and create documents with access control

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_STATUS = ['Draft', 'InReview', 'Published', 'Archived'];

// Normalize status to match database constraint (case-insensitive)
const normalizeStatus = (value, defaultValue = 'Draft') => {
  if (!value) return defaultValue;
  const lower = String(value).toLowerCase();
  const found = VALID_STATUS.find(v => v.toLowerCase() === lower);
  return found || defaultValue;
};

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List documents for project
    const { projectId, type, status } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
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
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error listing documents:', err);
      return res.status(500).json({ error: 'Failed to list documents' });
    }
  }

  if (req.method === 'POST') {
    // Create document
    const {
      projectId,
      artefactId,
      documentType,
      title,
      content,
      templateId,
      status
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (!documentType) {
      return res.status(400).json({ error: 'Document type required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Document title required' });
    }

    try {
      // If templateId provided, get template content
      let documentContent = content || [];

      if (templateId && (!content || content.length === 0)) {
        const templateResult = await query(
          `SELECT content FROM document_templates WHERE id = $1`,
          [templateId]
        );
        if (templateResult.rows.length > 0) {
          documentContent = templateResult.rows[0].content;
        }
      }

      // Normalize status to valid database value
      const documentStatus = normalizeStatus(status);

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
          user
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating document:', err);
      return res.status(500).json({ error: 'Failed to create document' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
