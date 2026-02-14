// lib/repositories/AnalysisRepository.js
// Repository for Analysis Studio data operations
// Task AN-012: Create AnalysisRepository.js

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * Analysis Project Repository
 * Handles CRUD operations for analysis projects and their artefacts
 */
export class AnalysisProjectRepository extends BaseRepository {
  constructor() {
    super('analysis_projects', 'id');
  }

  /**
   * Find all projects for a domain
   * @param {string} domainId - Domain ID
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<Object[]>}
   */
  async findByDomain(domainId, options = {}) {
    const { status, limit, offset, orderBy = 'created_at', orderDirection = 'DESC' } = options;

    let sql = `
      SELECT ap.*,
        (SELECT COUNT(*) FROM analysis_artefacts WHERE project_id = ap.id) as artefact_count,
        (SELECT COUNT(*) FROM analysis_relationships WHERE project_id = ap.id) as relationship_count
      FROM analysis_projects ap
      WHERE ap.domain_id = $1
    `;
    const params = [domainId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND ap.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Validate orderDirection
    const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ap.${orderBy} ${direction}`;

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }
    if (offset) {
      sql += ` OFFSET ${parseInt(offset, 10)}`;
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find project with full details including linked initiatives and delivery projects
   * @param {string} id - Project ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithDetails(id) {
    const sql = `
      SELECT ap.*,
        (SELECT json_agg(row_to_json(i)) FROM blueprint_initiatives i
         WHERE i.id = ANY(ap.linked_initiatives)) as initiatives,
        (SELECT json_agg(row_to_json(p)) FROM pds_projects p
         WHERE p.id = ANY(ap.linked_projects)) as delivery_projects
      FROM analysis_projects ap
      WHERE ap.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get completeness metrics for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  async getCompleteness(projectId) {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE artefact_type = 'BusinessRequirement') as business_requirements,
        COUNT(*) FILTER (WHERE artefact_type = 'StakeholderRequirement') as stakeholder_requirements,
        COUNT(*) FILTER (WHERE artefact_type = 'SolutionRequirement') as solution_requirements,
        COUNT(*) FILTER (WHERE artefact_type = 'UserStory') as user_stories,
        COUNT(*) FILTER (WHERE artefact_type = 'ADR') as adrs,
        COUNT(*) FILTER (WHERE artefact_type = 'Persona') as personas,
        COUNT(*) FILTER (WHERE artefact_type = 'Stakeholder') as stakeholders
      FROM analysis_artefacts
      WHERE project_id = $1
    `;
    const result = await query(sql, [projectId]);
    return result.rows[0] || {};
  }
}

/**
 * Analysis Artefact Repository
 * Handles CRUD operations for analysis artefacts (requirements, stories, ADRs, etc.)
 */
export class AnalysisArtefactRepository extends BaseRepository {
  constructor() {
    super('analysis_artefacts', 'id');
  }

  /**
   * Find all artefacts for a project
   * @param {string} projectId - Project ID
   * @param {Object} options - Filtering options
   * @returns {Promise<Object[]>}
   */
  async findByProject(projectId, options = {}) {
    const { type, module, status, parentId } = options;

    let sql = `
      SELECT aa.*,
        (SELECT COUNT(*) FROM analysis_relationships WHERE from_id = aa.id OR to_id = aa.id) as relationship_count
      FROM analysis_artefacts aa
      WHERE aa.project_id = $1
    `;
    const params = [projectId];
    let paramIndex = 2;

    if (type) {
      sql += ` AND aa.artefact_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (module) {
      sql += ` AND aa.module = $${paramIndex}`;
      params.push(module);
      paramIndex++;
    }

    if (status) {
      sql += ` AND aa.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (parentId) {
      sql += ` AND aa.parent_id = $${paramIndex}`;
      params.push(parentId);
      paramIndex++;
    } else if (parentId === null) {
      sql += ` AND aa.parent_id IS NULL`;
    }

    sql += ` ORDER BY aa.sort_order ASC, aa.created_at ASC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find artefacts by type with hierarchy
   * @param {string} projectId - Project ID
   * @param {string} type - Artefact type
   * @returns {Promise<Object[]>}
   */
  async findByTypeWithHierarchy(projectId, type) {
    // Use recursive CTE for hierarchy
    const sql = `
      WITH RECURSIVE artefact_tree AS (
        -- Base case: root artefacts
        SELECT aa.*, 0 as depth, ARRAY[aa.id] as path
        FROM analysis_artefacts aa
        WHERE aa.project_id = $1 AND aa.artefact_type = $2 AND aa.parent_id IS NULL

        UNION ALL

        -- Recursive case: children
        SELECT aa.*, at.depth + 1, at.path || aa.id
        FROM analysis_artefacts aa
        JOIN artefact_tree at ON aa.parent_id = at.id
        WHERE aa.artefact_type = $2
      )
      SELECT * FROM artefact_tree
      ORDER BY path
    `;
    const result = await query(sql, [projectId, type]);
    return result.rows;
  }

  /**
   * Get artefact with full trace
   * @param {string} id - Artefact ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithTrace(id) {
    const artefact = await this.findById(id);
    if (!artefact) return null;

    // Get upstream (what this depends on)
    const upstreamSql = `
      SELECT aa.*, ar.relationship_type
      FROM analysis_relationships ar
      JOIN analysis_artefacts aa ON ar.from_id = aa.id
      WHERE ar.to_id = $1
    `;
    const upstream = await query(upstreamSql, [id]);

    // Get downstream (what depends on this)
    const downstreamSql = `
      SELECT aa.*, ar.relationship_type
      FROM analysis_relationships ar
      JOIN analysis_artefacts aa ON ar.to_id = aa.id
      WHERE ar.from_id = $1
    `;
    const downstream = await query(downstreamSql, [id]);

    return {
      ...artefact,
      upstream: upstream.rows,
      downstream: downstream.rows
    };
  }

  /**
   * Generate next reference number for artefact type
   * @param {string} projectId - Project ID
   * @param {string} prefix - Artefact prefix (e.g., 'BR', 'US')
   * @returns {Promise<string>}
   */
  async generateReferenceNumber(projectId, prefix) {
    const sql = `
      SELECT reference_number FROM analysis_artefacts
      WHERE project_id = $1 AND reference_number LIKE $2
      ORDER BY reference_number DESC
      LIMIT 1
    `;
    const result = await query(sql, [projectId, `${prefix}-%`]);

    if (result.rows.length === 0) {
      return `${prefix}-001`;
    }

    const lastNum = result.rows[0].reference_number;
    const numPart = parseInt(lastNum.split('-')[1], 10);
    return `${prefix}-${String(numPart + 1).padStart(3, '0')}`;
  }

  /**
   * Move artefact in hierarchy
   * @param {string} id - Artefact ID
   * @param {string|null} newParentId - New parent ID (null for root)
   * @param {number} newSortOrder - New sort order
   * @returns {Promise<Object>}
   */
  async moveInHierarchy(id, newParentId, newSortOrder) {
    // Validate depth won't exceed max (typically 5 levels)
    if (newParentId) {
      const parentDepth = await this.getDepth(newParentId);
      if (parentDepth >= 4) {
        throw new Error('Maximum hierarchy depth (5 levels) exceeded');
      }
    }

    return this.update(id, {
      parent_id: newParentId,
      sort_order: newSortOrder
    });
  }

  /**
   * Get depth of artefact in hierarchy
   * @param {string} id - Artefact ID
   * @returns {Promise<number>}
   */
  async getDepth(id) {
    const sql = `
      WITH RECURSIVE ancestors AS (
        SELECT id, parent_id, 0 as depth
        FROM analysis_artefacts
        WHERE id = $1

        UNION ALL

        SELECT aa.id, aa.parent_id, a.depth + 1
        FROM analysis_artefacts aa
        JOIN ancestors a ON aa.id = a.parent_id
      )
      SELECT MAX(depth) as depth FROM ancestors
    `;
    const result = await query(sql, [id]);
    return result.rows[0]?.depth || 0;
  }

  /**
   * Bulk update status
   * @param {string[]} ids - Array of artefact IDs
   * @param {string} status - New status
   * @returns {Promise<number>} - Number of updated rows
   */
  async bulkUpdateStatus(ids, status) {
    const sql = `
      UPDATE analysis_artefacts
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2)
    `;
    const result = await query(sql, [status, ids]);
    return result.rowCount;
  }
}

/**
 * Analysis Relationship Repository
 * Handles traceability relationships between artefacts
 */
export class AnalysisRelationshipRepository extends BaseRepository {
  constructor() {
    super('analysis_relationships', 'id');
  }

  /**
   * Find all relationships for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object[]>}
   */
  async findByProject(projectId) {
    const sql = `
      SELECT ar.*,
        json_build_object('id', af.id, 'name', af.name, 'artefact_type', af.artefact_type) as from_artefact,
        json_build_object('id', at.id, 'name', at.name, 'artefact_type', at.artefact_type) as to_artefact
      FROM analysis_relationships ar
      JOIN analysis_artefacts af ON ar.from_id = af.id
      JOIN analysis_artefacts at ON ar.to_id = at.id
      WHERE ar.project_id = $1
      ORDER BY ar.created_at DESC
    `;
    const result = await query(sql, [projectId]);
    return result.rows;
  }

  /**
   * Find relationships for an artefact
   * @param {string} artefactId - Artefact ID
   * @param {string} [direction] - 'upstream', 'downstream', or 'both'
   * @returns {Promise<Object[]>}
   */
  async findByArtefact(artefactId, direction = 'both') {
    let sql = `
      SELECT ar.*,
        json_build_object('id', af.id, 'name', af.name, 'artefact_type', af.artefact_type) as from_artefact,
        json_build_object('id', at.id, 'name', at.name, 'artefact_type', at.artefact_type) as to_artefact
      FROM analysis_relationships ar
      JOIN analysis_artefacts af ON ar.from_id = af.id
      JOIN analysis_artefacts at ON ar.to_id = at.id
    `;

    if (direction === 'upstream') {
      sql += ` WHERE ar.to_id = $1`;
    } else if (direction === 'downstream') {
      sql += ` WHERE ar.from_id = $1`;
    } else {
      sql += ` WHERE ar.from_id = $1 OR ar.to_id = $1`;
    }

    const result = await query(sql, [artefactId]);
    return result.rows;
  }

  /**
   * Check if relationship exists
   * @param {string} fromId - Source artefact ID
   * @param {string} toId - Target artefact ID
   * @param {string} [type] - Relationship type
   * @returns {Promise<boolean>}
   */
  async relationshipExists(fromId, toId, type = null) {
    let sql = `
      SELECT 1 FROM analysis_relationships
      WHERE from_id = $1 AND to_id = $2
    `;
    const params = [fromId, toId];

    if (type) {
      sql += ` AND relationship_type = $3`;
      params.push(type);
    }

    const result = await query(sql, params);
    return result.rowCount > 0;
  }

  /**
   * Get traceability matrix data
   * @param {string} projectId - Project ID
   * @param {string} fromType - Source artefact type
   * @param {string} toType - Target artefact type
   * @returns {Promise<Object>}
   */
  async getTraceabilityMatrix(projectId, fromType, toType) {
    // Get all source artefacts
    const sourcesSql = `
      SELECT id, name, reference_number FROM analysis_artefacts
      WHERE project_id = $1 AND artefact_type = $2
      ORDER BY reference_number
    `;
    const sources = await query(sourcesSql, [projectId, fromType]);

    // Get all target artefacts
    const targets = await query(sourcesSql, [projectId, toType]);

    // Get all relationships between these types
    const relationshipsSql = `
      SELECT from_id, to_id, relationship_type FROM analysis_relationships
      WHERE project_id = $1
        AND from_id IN (SELECT id FROM analysis_artefacts WHERE project_id = $1 AND artefact_type = $2)
        AND to_id IN (SELECT id FROM analysis_artefacts WHERE project_id = $1 AND artefact_type = $3)
    `;
    const relationships = await query(relationshipsSql, [projectId, fromType, toType]);

    // Build matrix
    const matrix = {};
    relationships.rows.forEach(r => {
      if (!matrix[r.from_id]) matrix[r.from_id] = {};
      matrix[r.from_id][r.to_id] = r.relationship_type;
    });

    return {
      sources: sources.rows,
      targets: targets.rows,
      matrix
    };
  }
}

// Export singleton instances
export const analysisProjectRepository = new AnalysisProjectRepository();
export const analysisArtefactRepository = new AnalysisArtefactRepository();
export const analysisRelationshipRepository = new AnalysisRelationshipRepository();

export default {
  AnalysisProjectRepository,
  AnalysisArtefactRepository,
  AnalysisRelationshipRepository,
  analysisProjectRepository,
  analysisArtefactRepository,
  analysisRelationshipRepository
};
