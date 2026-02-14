// pages/api/dwd/relationships.js
// Dynamic Work Design - Relationship management API

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { errorResponse } from '../../../lib/api/errorResponse';
import { DWD_RELATIONSHIP_TYPES, validateRelationship } from '../../../lib/dwd-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List relationships ==========
  if (req.method === 'GET') {
    const { projectId, caseId, artefactId } = req.query;

    if (!projectId && !caseId && !artefactId) {
      return res.status(400).json({ error: 'Project ID, Case ID, or Artefact ID required' });
    }

    try {
      let sql;
      let params;

      if (artefactId) {
        // Get relationships for a specific artefact
        sql = `
          SELECT ar.*,
            a1.name as from_name, a1.artefact_type as from_type, a1.project_id,
            a2.name as to_name, a2.artefact_type as to_type
          FROM artefact_relationships ar
          JOIN artefacts a1 ON a1.id = ar.from_artefact_id
          JOIN artefacts a2 ON a2.id = ar.to_artefact_id
          WHERE (ar.from_artefact_id = $1 OR ar.to_artefact_id = $1)
            AND a1.artefact_type LIKE 'dwd_%'
            AND a2.artefact_type LIKE 'dwd_%'
          ORDER BY ar.created_at DESC
        `;
        params = [artefactId];
      } else if (caseId) {
        // Get all relationships involving a case and its related artefacts
        sql = `
          SELECT ar.*,
            a1.name as from_name, a1.artefact_type as from_type, a1.project_id,
            a2.name as to_name, a2.artefact_type as to_type
          FROM artefact_relationships ar
          JOIN artefacts a1 ON a1.id = ar.from_artefact_id
          JOIN artefacts a2 ON a2.id = ar.to_artefact_id
          WHERE (ar.from_artefact_id = $1 OR ar.to_artefact_id = $1
            OR ar.from_artefact_id IN (SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $1)
            OR ar.to_artefact_id IN (SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $1))
            AND a1.artefact_type LIKE 'dwd_%'
            AND a2.artefact_type LIKE 'dwd_%'
          ORDER BY ar.created_at DESC
        `;
        params = [caseId];
      } else {
        // Get all DWD relationships for project
        sql = `
          SELECT ar.*,
            a1.name as from_name, a1.artefact_type as from_type,
            a2.name as to_name, a2.artefact_type as to_type
          FROM artefact_relationships ar
          JOIN artefacts a1 ON a1.id = ar.from_artefact_id
          JOIN artefacts a2 ON a2.id = ar.to_artefact_id
          WHERE a1.project_id = $1
            AND a1.artefact_type LIKE 'dwd_%'
            AND a2.artefact_type LIKE 'dwd_%'
          ORDER BY ar.created_at DESC
        `;
        params = [projectId];
      }

      const result = await query(sql, params);

      // If we have results, check access to the project
      if (result.rows.length > 0) {
        const projId = result.rows[0].project_id || projectId;
        const { hasAccess, error } = await checkProjectAccess(req, projId, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error });
        }
      }

      return res.status(200).json({ relationships: result.rows });
    } catch (err) {
      console.error('Error fetching DWD relationships:', err);
      return errorResponse(res, 500, 'Failed to fetch relationships', err);
    }
  }

  // ========== POST - Create relationship ==========
  if (req.method === 'POST') {
    const { fromArtefactId, toArtefactId, relationshipType, description } = req.body;

    if (!fromArtefactId || !toArtefactId || !relationshipType) {
      return res.status(400).json({ error: 'fromArtefactId, toArtefactId, and relationshipType are required' });
    }

    // Validate relationship type exists
    if (!DWD_RELATIONSHIP_TYPES[relationshipType]) {
      return res.status(400).json({ error: `Invalid relationship type: ${relationshipType}` });
    }

    try {
      // Fetch both artefacts to validate types and get project
      const artefactsResult = await query(
        `SELECT id, artefact_type, project_id FROM artefacts WHERE id IN ($1, $2)`,
        [fromArtefactId, toArtefactId]
      );

      if (artefactsResult.rows.length !== 2) {
        return res.status(404).json({ error: 'One or both artefacts not found' });
      }

      const fromArtefact = artefactsResult.rows.find(a => a.id === fromArtefactId);
      const toArtefact = artefactsResult.rows.find(a => a.id === toArtefactId);

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, fromArtefact.project_id, 'create');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Validate relationship is allowed between these types
      if (!validateRelationship(fromArtefact.artefact_type, toArtefact.artefact_type, relationshipType)) {
        return res.status(400).json({
          error: `Relationship '${relationshipType}' is not valid between ${fromArtefact.artefact_type} and ${toArtefact.artefact_type}`
        });
      }

      // Check for duplicate
      const existingCheck = await query(
        `SELECT id FROM artefact_relationships
         WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
        [fromArtefactId, toArtefactId, relationshipType]
      );

      if (existingCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Relationship already exists' });
      }

      // Create relationship
      const result = await query(
        `INSERT INTO artefact_relationships (project_id, from_artefact_id, to_artefact_id, relationship_type, metadata, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         RETURNING *`,
        [fromArtefact.project_id, fromArtefactId, toArtefactId, relationshipType, description ? { description } : {}, user]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating DWD relationship:', err);
      return errorResponse(res, 500, 'Failed to create relationship', err);
    }
  }

  // ========== DELETE - Remove relationship ==========
  if (req.method === 'DELETE') {
    const { id, fromArtefactId, toArtefactId, relationshipType } = req.query;

    if (!id && !(fromArtefactId && toArtefactId && relationshipType)) {
      return res.status(400).json({ error: 'Either id OR (fromArtefactId, toArtefactId, relationshipType) required' });
    }

    try {
      let relResult;

      if (id) {
        // Delete by ID
        relResult = await query(
          `DELETE FROM artefact_relationships WHERE id = $1 RETURNING *`,
          [id]
        );
      } else {
        // Delete by from/to/type
        relResult = await query(
          `DELETE FROM artefact_relationships
           WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3
           RETURNING *`,
          [fromArtefactId, toArtefactId, relationshipType]
        );
      }

      if (relResult.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, deleted: relResult.rows[0] });
    } catch (err) {
      console.error('Error deleting DWD relationship:', err);
      return errorResponse(res, 500, 'Failed to delete relationship', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
