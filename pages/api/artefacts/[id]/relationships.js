// pages/api/artefacts/[id]/relationships.js
// Manage relationships for an artefact

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkArtefactAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { id: artefactId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!artefactId) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  if (req.method === 'GET') {
    // Get all relationships for artefact
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type, fa.status as from_status,
          ta.name as to_name, ta.artefact_type as to_type, ta.status as to_status,
          CASE WHEN r.from_artefact_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.from_artefact_id = $1 OR r.to_artefact_id = $1
        ORDER BY r.created_at DESC`,
        [artefactId]
      );

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  if (req.method === 'POST') {
    // Create relationship
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { toArtefactId, relationshipType, metadata } = req.body;

    if (!toArtefactId) {
      return res.status(400).json({ error: 'Target artefact ID required' });
    }

    if (!relationshipType) {
      return res.status(400).json({ error: 'Relationship type required' });
    }

    if (artefactId === toArtefactId) {
      return res.status(400).json({ error: 'Cannot create relationship to self' });
    }

    try {
      // Get both artefacts to validate and get project_id
      const artefactResult = await query(
        `SELECT id, project_id, artefact_type FROM artefacts WHERE id IN ($1, $2)`,
        [artefactId, toArtefactId]
      );

      if (artefactResult.rows.length !== 2) {
        return res.status(404).json({ error: 'One or both artefacts not found' });
      }

      const fromArtefact = artefactResult.rows.find(a => a.id === artefactId);
      const toArtefact = artefactResult.rows.find(a => a.id === toArtefactId);

      // Must be in same project
      if (fromArtefact.project_id !== toArtefact.project_id) {
        return res.status(400).json({ error: 'Artefacts must be in the same project' });
      }

      // Check for duplicate
      const existingResult = await query(
        `SELECT id FROM artefact_relationships
         WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
        [artefactId, toArtefactId, relationshipType]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Relationship already exists' });
      }

      // Create relationship
      const result = await query(
        `INSERT INTO artefact_relationships (
          project_id, from_artefact_id, to_artefact_id, relationship_type, metadata, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          fromArtefact.project_id,
          artefactId,
          toArtefactId,
          relationshipType,
          JSON.stringify(metadata || {}),
          user
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete relationship
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { relationshipId } = req.body;

    if (!relationshipId) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      // Verify relationship belongs to this artefact
      const checkResult = await query(
        `SELECT id FROM artefact_relationships
         WHERE id = $1 AND (from_artefact_id = $2 OR to_artefact_id = $2)`,
        [relationshipId, artefactId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      await query(`DELETE FROM artefact_relationships WHERE id = $1`, [relationshipId]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
