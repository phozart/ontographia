/**
 * PDS Relationships API - Project Design Workspace
 *
 * Manage relationships between PDS artefacts.
 *
 * @module pages/api/pds/relationships
 */

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { PDS_RELATIONSHIP_TYPES } from '../../../lib/pds-types';

// Check if type is a valid PDS type
const isPDSType = (type) => type && type.startsWith('pds_');

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List relationships
    const { projectId, pdsProjectId, artefactId, relationshipType, direction } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT
          ar.*,
          fa.name as from_name,
          fa.artefact_type as from_type,
          fa.custom_fields as from_custom_fields,
          ta.name as to_name,
          ta.artefact_type as to_type,
          ta.custom_fields as to_custom_fields,
          cu.username as created_by_username
        FROM artefact_relationships ar
        JOIN artefacts fa ON fa.id = ar.from_artefact_id
        JOIN artefacts ta ON ta.id = ar.to_artefact_id
        LEFT JOIN users cu ON cu.id = ar.created_by
        WHERE fa.project_id = $1
          AND (fa.artefact_type LIKE 'pds_%' OR ta.artefact_type LIKE 'pds_%')
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by PDS project
      if (pdsProjectId) {
        sql += ` AND (
          fa.id = $${paramIdx}
          OR ta.id = $${paramIdx}
          OR fa.custom_fields->>'pds_project_id' = $${paramIdx}
          OR ta.custom_fields->>'pds_project_id' = $${paramIdx}
        )`;
        params.push(pdsProjectId);
        paramIdx++;
      }

      // Filter by specific artefact
      if (artefactId) {
        if (direction === 'from') {
          sql += ` AND ar.from_artefact_id = $${paramIdx}`;
        } else if (direction === 'to') {
          sql += ` AND ar.to_artefact_id = $${paramIdx}`;
        } else {
          sql += ` AND (ar.from_artefact_id = $${paramIdx} OR ar.to_artefact_id = $${paramIdx})`;
        }
        params.push(artefactId);
        paramIdx++;
      }

      // Filter by relationship type
      if (relationshipType) {
        sql += ` AND ar.relationship_type = $${paramIdx}`;
        params.push(relationshipType);
        paramIdx++;
      }

      sql += ` ORDER BY ar.created_at DESC`;

      const result = await query(sql, params);

      return res.status(200).json({
        relationships: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      console.error('Error listing PDS relationships:', err);
      return res.status(500).json({ error: 'Failed to list relationships', details: err.message });
    }
  }

  if (req.method === 'POST') {
    // Create relationship
    const { projectId, fromArtefactId, toArtefactId, relationshipType, description } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!fromArtefactId || !toArtefactId) {
      return res.status(400).json({ error: 'Both from and to artefact IDs are required' });
    }

    if (!relationshipType) {
      return res.status(400).json({ error: 'Relationship type is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Validate artefacts exist and are PDS types
    try {
      const artefactsResult = await query(
        `SELECT id, artefact_type, project_id FROM artefacts WHERE id = ANY($1)`,
        [[fromArtefactId, toArtefactId]]
      );

      if (artefactsResult.rows.length !== 2) {
        return res.status(400).json({ error: 'One or both artefacts not found' });
      }

      const fromArtefact = artefactsResult.rows.find(a => a.id === fromArtefactId);
      const toArtefact = artefactsResult.rows.find(a => a.id === toArtefactId);

      // At least one must be a PDS type
      if (!isPDSType(fromArtefact.artefact_type) && !isPDSType(toArtefact.artefact_type)) {
        return res.status(400).json({ error: 'At least one artefact must be a PDS type' });
      }

      // Validate relationship type if defined in our type system
      const relTypeDef = PDS_RELATIONSHIP_TYPES[relationshipType];
      if (relTypeDef) {
        if (relTypeDef.fromType && fromArtefact.artefact_type !== relTypeDef.fromType) {
          // Allow flexibility - just warn in console
          console.warn(`Relationship type ${relationshipType} expects from type ${relTypeDef.fromType}, got ${fromArtefact.artefact_type}`);
        }
        if (relTypeDef.toType && toArtefact.artefact_type !== relTypeDef.toType) {
          console.warn(`Relationship type ${relationshipType} expects to type ${relTypeDef.toType}, got ${toArtefact.artefact_type}`);
        }
      }

      // Check for existing relationship
      const existingResult = await query(
        `SELECT id FROM artefact_relationships
         WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
        [fromArtefactId, toArtefactId, relationshipType]
      );

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          error: 'Relationship already exists',
          existing: existingResult.rows[0].id,
        });
      }

      // Create the relationship
      const result = await query(
        `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, description, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [fromArtefactId, toArtefactId, relationshipType, description || null, user]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating PDS relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    // Delete relationship
    const { id, fromArtefactId, toArtefactId, relationshipType } = req.body;

    // Can delete by ID or by from/to/type combination
    if (!id && !(fromArtefactId && toArtefactId && relationshipType)) {
      return res.status(400).json({
        error: 'Either relationship ID or (fromArtefactId, toArtefactId, relationshipType) required'
      });
    }

    try {
      let result;
      if (id) {
        // Get the relationship to check project access
        const relResult = await query(
          `SELECT ar.*, fa.project_id
           FROM artefact_relationships ar
           JOIN artefacts fa ON fa.id = ar.from_artefact_id
           WHERE ar.id = $1`,
          [id]
        );

        if (relResult.rows.length === 0) {
          return res.status(404).json({ error: 'Relationship not found' });
        }

        const { hasAccess, error } = await checkProjectAccess(req, relResult.rows[0].project_id, 'delete');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }

        result = await query(
          `DELETE FROM artefact_relationships WHERE id = $1 RETURNING *`,
          [id]
        );
      } else {
        // Get artefact to check project access
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

        result = await query(
          `DELETE FROM artefact_relationships
           WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3
           RETURNING *`,
          [fromArtefactId, toArtefactId, relationshipType]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, deleted: result.rows[0] });
    } catch (err) {
      console.error('Error deleting PDS relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
