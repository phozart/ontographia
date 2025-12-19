// lib/repositories/WorkspaceArtefactRepository.js
// Generic repository for workspace artefacts (PDW, DWD) stored in artefacts table

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Generic repository for workspace artefacts
 * Handles PDW (Product Design Workspace) and DWD (Dynamic Work Design) artefacts
 */
export class WorkspaceArtefactRepository extends BaseRepository {
  constructor() {
    super('artefacts', 'id');
  }

  /**
   * Find workspace artefacts with filters
   */
  async findArtefacts(projectId, prefix, filters = {}) {
    const { contextId, type, types, stage, module, search, limit, offset, statusField } = filters;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.project_id = $1 AND a.artefact_type LIKE $2
    `;
    const params = [projectId, `${prefix}_%`];
    let paramIdx = 3;

    // Filter by context (related artefacts)
    if (contextId) {
      sql += ` AND (a.id = $${paramIdx} OR a.id IN (
        SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $${paramIdx}
        UNION
        SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $${paramIdx}
      ))`;
      params.push(contextId);
      paramIdx++;
    }

    if (type) {
      sql += ` AND a.artefact_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (types && Array.isArray(types) && types.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(types);
      paramIdx++;
    }

    if (stage) {
      sql += ` AND a.custom_fields->>'${prefix}_stage' = $${paramIdx}`;
      params.push(stage);
      paramIdx++;
    }

    if (module) {
      sql += ` AND a.custom_fields->>'${prefix}_module' = $${paramIdx}`;
      params.push(module);
      paramIdx++;
    }

    if (statusField) {
      sql += ` AND (a.custom_fields->>'${statusField}' = $${paramIdx} OR a.status = $${paramIdx})`;
      params.push(filters.status);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'summary' ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.updated_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit, 10));
      paramIdx++;
    }
    if (offset) {
      sql += ` OFFSET $${paramIdx}`;
      params.push(parseInt(offset, 10));
    }

    const result = await query(sql, params);

    const countResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE $2`,
      [projectId, `${prefix}_%`]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find single artefact by ID
   */
  async findArtefactById(id, prefix) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.id = $1 AND a.artefact_type LIKE $2`,
      [id, `${prefix}_%`]
    );

    if (result.rows.length === 0) return null;

    const artefact = result.rows[0];

    const relResult = await query(
      `SELECT ar.*,
        fa.name as from_name, fa.artefact_type as from_type,
        ta.name as to_name, ta.artefact_type as to_type
      FROM artefact_relationships ar
      LEFT JOIN artefacts fa ON fa.id = ar.from_artefact_id
      LEFT JOIN artefacts ta ON ta.id = ar.to_artefact_id
      WHERE ar.from_artefact_id = $1 OR ar.to_artefact_id = $1`,
      [id]
    );

    return { ...artefact, relationships: relResult.rows };
  }

  /**
   * Create workspace artefact
   */
  async createArtefact(data) {
    const { projectId, artefactType, name, description, status, ownerId, tags, customFields, userId } = data;

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'N/A', 'Medium', $6, $7, $8, $9, now(), now())
      RETURNING *`,
      [
        projectId,
        artefactType,
        name.trim(),
        description || '',
        status || 'Draft',
        ownerId || userId,
        JSON.stringify(tags || []),
        JSON.stringify(customFields || {}),
        userId,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update workspace artefact
   */
  async updateArtefact(id, prefix, data) {
    const { name, description, status, ownerId, tags, customFields } = data;

    const current = await query(
      'SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE $2',
      [id, `${prefix}_%`]
    );

    if (current.rows.length === 0) return null;

    const artefact = current.rows[0];
    const mergedCustomFields = { ...(artefact.custom_fields || {}), ...(customFields || {}) };

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        owner_id = COALESCE($5, owner_id),
        tags = COALESCE($6, tags),
        custom_fields = $7,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        name?.trim() || null,
        description,
        status,
        ownerId,
        tags ? JSON.stringify(tags) : null,
        JSON.stringify(mergedCustomFields),
      ]
    );

    return result.rows[0];
  }

  /**
   * Delete workspace artefact
   */
  async deleteArtefact(id, prefix) {
    const current = await query(
      'SELECT id, project_id FROM artefacts WHERE id = $1 AND artefact_type LIKE $2',
      [id, `${prefix}_%`]
    );

    if (current.rows.length === 0) return null;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return { projectId: current.rows[0].project_id };
  }

  /**
   * Get workspace statistics
   */
  async getStats(projectId, prefix) {
    const countsByType = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE $2
       GROUP BY artefact_type`,
      [projectId, `${prefix}_%`]
    );

    const typeCounts = {};
    countsByType.rows.forEach(row => {
      typeCounts[row.artefact_type] = parseInt(row.count, 10);
    });

    return {
      typeCounts,
      totalArtefacts: Object.values(typeCounts).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Find relationships for workspace artefacts
   */
  async findRelationships(projectId, prefix, filters = {}) {
    const { artefactId, type } = filters;

    let sql = `
      SELECT ar.*,
        fa.name as from_name, fa.artefact_type as from_type, fa.custom_fields as from_custom_fields,
        ta.name as to_name, ta.artefact_type as to_type, ta.custom_fields as to_custom_fields
      FROM artefact_relationships ar
      INNER JOIN artefacts fa ON fa.id = ar.from_artefact_id
      INNER JOIN artefacts ta ON ta.id = ar.to_artefact_id
      WHERE fa.project_id = $1
        AND (fa.artefact_type LIKE $2 OR ta.artefact_type LIKE $2)
    `;
    const params = [projectId, `${prefix}_%`];
    let paramIdx = 3;

    if (artefactId) {
      sql += ` AND (ar.from_artefact_id = $${paramIdx} OR ar.to_artefact_id = $${paramIdx})`;
      params.push(artefactId);
      paramIdx++;
    }

    if (type) {
      sql += ` AND ar.relationship_type = $${paramIdx}`;
      params.push(type);
    }

    sql += ` ORDER BY ar.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create relationship between artefacts
   */
  async createRelationship(data, userId) {
    const { fromArtefactId, toArtefactId, relationshipType, metadata } = data;

    const artefactsResult = await query(
      'SELECT id, project_id, artefact_type FROM artefacts WHERE id = ANY($1::uuid[])',
      [[fromArtefactId, toArtefactId]]
    );

    if (artefactsResult.rows.length !== 2) {
      throw new Error('ARTEFACTS_NOT_FOUND');
    }

    const existing = await query(
      'SELECT id FROM artefact_relationships WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3',
      [fromArtefactId, toArtefactId, relationshipType]
    );

    if (existing.rows.length > 0) {
      throw new Error('RELATIONSHIP_EXISTS');
    }

    const result = await query(
      `INSERT INTO artefact_relationships (
        from_artefact_id, to_artefact_id, relationship_type, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, now())
      RETURNING *`,
      [fromArtefactId, toArtefactId, relationshipType, JSON.stringify(metadata || {}), userId]
    );

    return { relationship: result.rows[0], projectId: artefactsResult.rows[0].project_id };
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(relationshipId) {
    const relResult = await query(
      `SELECT ar.*, a.project_id
       FROM artefact_relationships ar
       INNER JOIN artefacts a ON a.id = ar.from_artefact_id
       WHERE ar.id = $1`,
      [relationshipId]
    );

    if (relResult.rows.length === 0) return null;

    await query('DELETE FROM artefact_relationships WHERE id = $1', [relationshipId]);

    return { projectId: relResult.rows[0].project_id };
  }
}

// Export singleton instance
export const workspaceArtefactRepository = new WorkspaceArtefactRepository();

export default workspaceArtefactRepository;
