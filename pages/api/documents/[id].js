// pages/api/documents/[id].js
// Get, update, delete single document

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_STATUS = ['Draft', 'InReview', 'Published', 'Archived'];

// Normalize status to match database constraint (case-insensitive)
// Returns null if value not provided (so COALESCE keeps existing value)
const normalizeStatus = (value) => {
  if (!value) return null;
  const lower = String(value).toLowerCase();
  const found = VALID_STATUS.find(v => v.toLowerCase() === lower);
  return found || null;
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Document ID required' });
  }

  // Get document to check project access
  const docResult = await query(`SELECT project_id FROM documents WHERE id = $1`, [id]);
  if (docResult.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const projectId = docResult.rows[0].project_id;

  if (req.method === 'GET') {
    // Get single document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
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
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching document:', err);
      return res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  if (req.method === 'PUT') {
    // Update document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { title, content, status, artefactId } = req.body;

    // Normalize status to valid database value
    const documentStatus = normalizeStatus(status);

    try {
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
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating document:', err);
      return res.status(500).json({ error: 'Failed to update document' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      await query(`DELETE FROM documents WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting document:', err);
      return res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
