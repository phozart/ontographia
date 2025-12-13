// pages/api/projects/[id]/relationships.js
// List and create artefact relationships for a project

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { id: projectId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // List relationships for project
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT r.*,
          fa.name as from_name,
          fa.artefact_type as from_type,
          ta.name as to_name,
          ta.artefact_type as to_type
        FROM artefact_relationships r
        JOIN artefacts fa ON fa.id = r.from_artefact_id
        JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.project_id = $1
        ORDER BY r.created_at DESC`,
        [projectId]
      );

      // Map to frontend format
      const relationships = result.rows.map(r => ({
        id: r.id,
        type: r.relationship_type,
        from: r.from_artefact_id,
        to: r.to_artefact_id,
        fromName: r.from_name,
        fromType: r.from_type,
        toName: r.to_name,
        toType: r.to_type,
        metadata: r.metadata || {},
        createdAt: r.created_at,
      }));

      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error listing relationships:', err);
      return res.status(500).json({ error: 'Failed to list relationships' });
    }
  }

  if (req.method === 'POST') {
    // Create relationship
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { type, from, to, metadata } = req.body;

    if (!type || !from || !to) {
      return res.status(400).json({ error: 'type, from, and to are required' });
    }

    try {
      const result = await query(
        `INSERT INTO artefact_relationships (
          project_id, relationship_type, from_artefact_id, to_artefact_id, metadata, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, now())
        RETURNING *`,
        [projectId, type, from, to, JSON.stringify(metadata || {}), user]
      );

      const created = result.rows[0];
      return res.status(201).json({
        id: created.id,
        type: created.relationship_type,
        from: created.from_artefact_id,
        to: created.to_artefact_id,
        metadata: created.metadata || {},
        createdAt: created.created_at,
      });
    } catch (err) {
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete relationship by id (passed in query)
    const { relationshipId } = req.query;
    if (!relationshipId) {
      return res.status(400).json({ error: 'relationshipId required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      await query('DELETE FROM artefact_relationships WHERE id = $1', [relationshipId]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
