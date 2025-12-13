// pages/api/pdw/relationships.js
// Product Design Workspace - Relationships API
// Manage relationships between PDW artefacts

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess, checkArtefactAccess } from '../../../lib/projectAccess';
import { PDW_RELATIONSHIP_TYPES, isPDWType, isValidRelationship } from '../../../lib/pdw-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List relationships for a project or artefact
    const { projectId, artefactId, type } = req.query;

    if (!projectId && !artefactId) {
      return res.status(400).json({ error: 'Either projectId or artefactId is required' });
    }

    try {
      let sql = `
        SELECT r.*,
          fa.name as from_name,
          fa.artefact_type as from_type,
          fa.custom_fields as from_custom_fields,
          ta.name as to_name,
          ta.artefact_type as to_type,
          ta.custom_fields as to_custom_fields
        FROM artefact_relationships r
        JOIN artefacts fa ON fa.id = r.from_artefact_id
        JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE fa.artefact_type LIKE 'pdw_%'
          AND ta.artefact_type LIKE 'pdw_%'
      `;
      const params = [];
      let paramIdx = 1;

      if (projectId) {
        // Check project access
        const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }
        sql += ` AND fa.project_id = $${paramIdx}`;
        params.push(projectId);
        paramIdx++;
      }

      if (artefactId) {
        // Check artefact access
        const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }
        sql += ` AND (r.from_artefact_id = $${paramIdx} OR r.to_artefact_id = $${paramIdx})`;
        params.push(artefactId);
        paramIdx++;
      }

      if (type) {
        sql += ` AND r.relationship_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      sql += ` ORDER BY r.created_at DESC`;

      const result = await query(sql, params);

      return res.status(200).json({
        relationships: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      console.error('Error listing PDW relationships:', err);
      return res.status(500).json({ error: 'Failed to list relationships' });
    }
  }

  if (req.method === 'POST') {
    // Create a relationship
    const { fromArtefactId, toArtefactId, relationshipType, description } = req.body;

    if (!fromArtefactId || !toArtefactId || !relationshipType) {
      return res.status(400).json({
        error: 'fromArtefactId, toArtefactId, and relationshipType are required'
      });
    }

    // Check if relationship type is valid
    if (!PDW_RELATIONSHIP_TYPES[relationshipType]) {
      return res.status(400).json({
        error: `Invalid relationship type: ${relationshipType}`,
        validTypes: Object.keys(PDW_RELATIONSHIP_TYPES)
      });
    }

    try {
      // Get both artefacts to validate types
      const artefactsResult = await query(
        `SELECT id, artefact_type, project_id FROM artefacts WHERE id = ANY($1::uuid[])`,
        [[fromArtefactId, toArtefactId]]
      );

      if (artefactsResult.rows.length !== 2) {
        return res.status(404).json({ error: 'One or both artefacts not found' });
      }

      const fromArtefact = artefactsResult.rows.find(a => a.id === fromArtefactId);
      const toArtefact = artefactsResult.rows.find(a => a.id === toArtefactId);

      // Verify both are PDW types
      if (!isPDWType(fromArtefact.artefact_type) || !isPDWType(toArtefact.artefact_type)) {
        return res.status(400).json({ error: 'Both artefacts must be PDW types' });
      }

      // Verify they're in the same project
      if (fromArtefact.project_id !== toArtefact.project_id) {
        return res.status(400).json({ error: 'Artefacts must be in the same project' });
      }

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, fromArtefact.project_id, 'create');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Validate relationship type is valid for these artefact types
      if (!isValidRelationship(relationshipType, fromArtefact.artefact_type, toArtefact.artefact_type)) {
        const relDef = PDW_RELATIONSHIP_TYPES[relationshipType];
        return res.status(400).json({
          error: `Relationship type '${relationshipType}' is not valid between ${fromArtefact.artefact_type} and ${toArtefact.artefact_type}`,
          allowedFrom: relDef.fromTypes,
          allowedTo: relDef.toTypes,
        });
      }

      // Check for duplicate relationship
      const existingResult = await query(
        `SELECT id FROM artefact_relationships
         WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
        [fromArtefactId, toArtefactId, relationshipType]
      );

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          error: 'Relationship already exists',
          existingId: existingResult.rows[0].id
        });
      }

      // Create the relationship
      const result = await query(
        `INSERT INTO artefact_relationships (
          from_artefact_id, to_artefact_id, relationship_type, description, created_at
        ) VALUES ($1, $2, $3, $4, now())
        RETURNING *`,
        [fromArtefactId, toArtefactId, relationshipType, description || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating PDW relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete a relationship
    const { id, fromArtefactId, toArtefactId, relationshipType } = req.query;

    try {
      let sql, params;

      if (id) {
        // Delete by relationship ID
        // First get the relationship to check access
        const relResult = await query(
          `SELECT r.*, fa.project_id
           FROM artefact_relationships r
           JOIN artefacts fa ON fa.id = r.from_artefact_id
           WHERE r.id = $1`,
          [id]
        );

        if (relResult.rows.length === 0) {
          return res.status(404).json({ error: 'Relationship not found' });
        }

        const { hasAccess, error } = await checkProjectAccess(req, relResult.rows[0].project_id, 'delete');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }

        sql = `DELETE FROM artefact_relationships WHERE id = $1 RETURNING *`;
        params = [id];
      } else if (fromArtefactId && toArtefactId && relationshipType) {
        // Delete by from/to/type
        const artefactResult = await query(
          `SELECT project_id FROM artefacts WHERE id = $1`,
          [fromArtefactId]
        );

        if (artefactResult.rows.length === 0) {
          return res.status(404).json({ error: 'From artefact not found' });
        }

        const { hasAccess, error } = await checkProjectAccess(req, artefactResult.rows[0].project_id, 'delete');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }

        sql = `DELETE FROM artefact_relationships
               WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3
               RETURNING *`;
        params = [fromArtefactId, toArtefactId, relationshipType];
      } else {
        return res.status(400).json({
          error: 'Either id or (fromArtefactId, toArtefactId, relationshipType) required'
        });
      }

      const result = await query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, deleted: result.rows[0] });
    } catch (err) {
      console.error('Error deleting PDW relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
