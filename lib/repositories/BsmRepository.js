/**
 * BsmRepository - Data access layer for Business Service Management Studio
 *
 * Handles CRUD operations for service management artefacts including:
 * - Business services and service categories
 * - Service levels, SLAs, and SLOs
 * - Service consumers and agreements
 * - Dependencies and integrations
 *
 * @extends BaseRepository
 * @module lib/repositories/BsmRepository
 *
 * @example
 * import { bsmRepository } from '../lib/repositories';
 * const services = await bsmRepository.findByProject(projectId);
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * Repository for Business Service Management artefacts
 */
export class BsmRepository extends BaseRepository {
  constructor() {
    super('artefacts');
  }

  // ============================================================================
  // ARTEFACT OPERATIONS
  // ============================================================================

  /**
   * Find all BSM artefacts for a domain
   * @param {string} domainId - Domain UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.projectId] - Optional project filter
   * @param {string} [options.type] - Filter by specific type
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage
   * @param {string} [options.search] - Search in name/description
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<{artefacts: Array, total: number}>}
   */
  async findByDomain(domainId, options = {}) {
    const { projectId, type, types, stage, search, limit, offset } = options;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.domain_id = $1
        AND a.artefact_type LIKE 'bsm_%'
    `;
    const params = [domainId];
    let paramIdx = 2;

    if (projectId) {
      sql += ` AND a.project_id = $${paramIdx}`;
      params.push(projectId);
      paramIdx++;
    }

    if (type) {
      sql += ` AND a.artefact_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (types && types.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(types);
      paramIdx++;
    }

    if (stage) {
      sql += ` AND a.custom_fields->>'bsm_stage' = $${paramIdx}`;
      params.push(stage);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'value_proposition' ILIKE $${paramIdx})`;
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
      paramIdx++;
    }

    const result = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM artefacts WHERE domain_id = $1 AND artefact_type LIKE 'bsm_%'`;
    const countParams = [domainId];
    if (projectId) {
      countSql += ` AND project_id = $2`;
      countParams.push(projectId);
    }
    const countResult = await query(countSql, countParams);

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find all BSM artefacts for a project
   * @param {string} projectId - Project UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.type] - Filter by specific type
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage
   * @param {string} [options.search] - Search in name/description
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<{artefacts: Array, total: number}>}
   */
  async findByProject(projectId, options = {}) {
    const { type, types, stage, search, limit, offset } = options;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.project_id = $1
        AND a.artefact_type LIKE 'bsm_%'
    `;
    const params = [projectId];
    let paramIdx = 2;

    // Filter by single type
    if (type) {
      sql += ` AND a.artefact_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    // Filter by multiple types
    if (types && types.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(types);
      paramIdx++;
    }

    // Filter by stage (stored in custom_fields.bsm_stage)
    if (stage) {
      sql += ` AND a.custom_fields->>'bsm_stage' = $${paramIdx}`;
      params.push(stage);
      paramIdx++;
    }

    // Search
    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'value_proposition' ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.updated_at DESC`;

    // Pagination
    if (limit) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit, 10));
      paramIdx++;
    }
    if (offset) {
      sql += ` OFFSET $${paramIdx}`;
      params.push(parseInt(offset, 10));
      paramIdx++;
    }

    const result = await query(sql, params);

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'bsm_%'`,
      [projectId]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find a single BSM artefact by ID
   * @param {string} id - Artefact UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.id = $1 AND a.artefact_type LIKE 'bsm_%'`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find artefact with its relationships
   * @param {string} id - Artefact UUID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRelationships(id) {
    const artefact = await this.findById(id);
    if (!artefact) return null;

    const relsResult = await query(
      `SELECT ar.*,
        a1.name as from_name, a1.artefact_type as from_type,
        a2.name as to_name, a2.artefact_type as to_type
      FROM artefact_relationships ar
      LEFT JOIN artefacts a1 ON a1.id = ar.from_artefact_id
      LEFT JOIN artefacts a2 ON a2.id = ar.to_artefact_id
      WHERE ar.from_artefact_id = $1 OR ar.to_artefact_id = $1`,
      [id]
    );

    return {
      ...artefact,
      relationships: relsResult.rows,
    };
  }

  /**
   * Create a new BSM artefact
   * @param {Object} data - Artefact data
   * @param {string} data.domainId - Domain UUID (required)
   * @param {string} [data.projectId] - Project UUID (optional filter)
   * @param {string} data.artefactType - Type (bsm_service, bsm_consumer, etc.)
   * @param {string} data.name - Name
   * @param {string} [data.description] - Description
   * @param {string} [data.ownerId] - Owner user ID
   * @param {Array} [data.tags] - Tags
   * @param {Object} [data.customFields] - Type-specific fields
   * @param {string} data.createdBy - Creating user ID
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      domainId,
      projectId,
      artefactType,
      name,
      description = '',
      ownerId,
      tags = [],
      customFields = {},
      createdBy,
    } = data;

    if (!domainId) {
      throw new Error('Domain ID is required');
    }

    const result = await query(
      `INSERT INTO artefacts (
        domain_id, project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'Draft', 'N/A', 'Medium', $6, $7, $8, $9, now(), now())
      RETURNING *`,
      [
        domainId,
        projectId || null,
        artefactType,
        name.trim(),
        description,
        ownerId || createdBy,
        JSON.stringify(tags),
        JSON.stringify(customFields),
        createdBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a BSM artefact
   * @param {string} id - Artefact UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    // First fetch existing to merge custom_fields
    const existing = await this.findById(id);
    if (!existing) return null;

    const {
      name,
      description,
      ownerId,
      tags,
      customFields,
      status,
      ...otherFields
    } = data;

    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIdx}`);
      params.push(name.trim());
      paramIdx++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIdx}`);
      params.push(description);
      paramIdx++;
    }

    if (ownerId !== undefined) {
      updates.push(`owner_id = $${paramIdx}`);
      params.push(ownerId);
      paramIdx++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIdx}`);
      params.push(JSON.stringify(tags));
      paramIdx++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }

    // Merge custom_fields
    if (customFields !== undefined || Object.keys(otherFields).length > 0) {
      const existingCustomFields = existing.custom_fields || {};
      const mergedCustomFields = {
        ...existingCustomFields,
        ...(customFields || {}),
        ...otherFields,
      };
      updates.push(`custom_fields = $${paramIdx}`);
      params.push(JSON.stringify(mergedCustomFields));
      paramIdx++;
    }

    // Always update updated_at
    updates.push(`updated_at = now()`);

    if (updates.length === 1) {
      // Only updated_at, nothing to do
      return existing;
    }

    params.push(id);

    const sql = `
      UPDATE artefacts
      SET ${updates.join(', ')}
      WHERE id = $${paramIdx} AND artefact_type LIKE 'bsm_%'
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a BSM artefact
   * @param {string} id - Artefact UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    // Delete relationships first
    await query(
      `DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
      [id]
    );

    // Delete the artefact
    const result = await query(
      `DELETE FROM artefacts WHERE id = $1 AND artefact_type LIKE 'bsm_%' RETURNING id`,
      [id]
    );

    return result.rows.length > 0;
  }

  // ============================================================================
  // SERVICE-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Find all business services
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async findServices(projectId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        (SELECT COUNT(*) FROM artefacts c WHERE c.custom_fields->>'service_id' = a.id::text AND c.artefact_type LIKE 'bsm_%') as related_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'bsm_service'
      ORDER BY a.name`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Find services by category
   * @param {string} categoryId - Category UUID
   * @returns {Promise<Array>}
   */
  async findServicesByCategory(categoryId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.artefact_type = 'bsm_service'
        AND a.custom_fields->>'category_id' = $1
      ORDER BY a.name`,
      [categoryId]
    );
    return result.rows;
  }

  /**
   * Find service consumers
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async findConsumers(projectId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'bsm_consumer'
      ORDER BY a.name`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Find service levels for a service
   * @param {string} serviceId - Service UUID
   * @returns {Promise<Array>}
   */
  async findServiceLevels(serviceId) {
    const result = await query(
      `SELECT a.*
      FROM artefacts a
      WHERE a.artefact_type = 'bsm_service_level'
        AND a.custom_fields->>'service_id' = $1
      ORDER BY a.name`,
      [serviceId]
    );
    return result.rows;
  }

  /**
   * Find dependencies for a service
   * @param {string} serviceId - Service UUID
   * @returns {Promise<Array>}
   */
  async findServiceDependencies(serviceId) {
    const result = await query(
      `SELECT a.*,
        s1.name as source_name,
        s2.name as target_name
      FROM artefacts a
      LEFT JOIN artefacts s1 ON s1.id::text = a.custom_fields->>'source_service'
      LEFT JOIN artefacts s2 ON s2.id::text = a.custom_fields->>'target_service'
      WHERE a.artefact_type = 'bsm_dependency'
        AND (a.custom_fields->>'source_service' = $1 OR a.custom_fields->>'target_service' = $1)
      ORDER BY a.name`,
      [serviceId]
    );
    return result.rows;
  }

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Find all relationships for a domain's BSM artefacts
   * @param {string} domainId - Domain UUID
   * @param {string} [projectId] - Optional project filter
   * @returns {Promise<Array>}
   */
  async findRelationshipsByDomain(domainId, projectId = null) {
    let sql = `
      SELECT ar.*,
        a1.name as from_name, a1.artefact_type as from_type,
        a2.name as to_name, a2.artefact_type as to_type
      FROM artefact_relationships ar
      JOIN artefacts a1 ON a1.id = ar.from_artefact_id
      JOIN artefacts a2 ON a2.id = ar.to_artefact_id
      WHERE ar.domain_id = $1
        AND a1.artefact_type LIKE 'bsm_%'
        AND a2.artefact_type LIKE 'bsm_%'
    `;
    const params = [domainId];

    if (projectId) {
      sql += ` AND a1.project_id = $2`;
      params.push(projectId);
    }

    sql += ` ORDER BY ar.created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find all relationships for a project (legacy - use findRelationshipsByDomain)
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async findRelationships(projectId) {
    const result = await query(
      `SELECT ar.*,
        a1.name as from_name, a1.artefact_type as from_type,
        a2.name as to_name, a2.artefact_type as to_type
      FROM artefact_relationships ar
      JOIN artefacts a1 ON a1.id = ar.from_artefact_id
      JOIN artefacts a2 ON a2.id = ar.to_artefact_id
      WHERE a1.project_id = $1
        AND a1.artefact_type LIKE 'bsm_%'
        AND a2.artefact_type LIKE 'bsm_%'
      ORDER BY ar.created_at DESC`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Create a relationship between artefacts
   * @param {Object} data - Relationship data
   * @param {string} data.domainId - Domain UUID (required)
   * @param {string} [data.projectId] - Project UUID (optional)
   * @param {string} data.fromArtefactId - Source artefact UUID
   * @param {string} data.toArtefactId - Target artefact UUID
   * @param {string} data.relationshipType - Type of relationship
   * @param {Object} [data.metadata] - Additional metadata
   * @param {string} data.createdBy - Creating user ID
   * @returns {Promise<Object>}
   */
  async createRelationship(data) {
    const { domainId, projectId, fromArtefactId, toArtefactId, relationshipType, metadata = {}, createdBy } = data;

    if (!domainId) {
      throw new Error('Domain ID is required');
    }

    const result = await query(
      `INSERT INTO artefact_relationships (domain_id, project_id, from_artefact_id, to_artefact_id, relationship_type, metadata, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       RETURNING *`,
      [domainId, projectId || null, fromArtefactId, toArtefactId, relationshipType, metadata, createdBy]
    );

    return result.rows[0];
  }

  /**
   * Delete a relationship
   * @param {string} id - Relationship UUID
   * @returns {Promise<boolean>}
   */
  async deleteRelationship(id) {
    const result = await query(
      `DELETE FROM artefact_relationships WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  }

  // ============================================================================
  // STATISTICS AND AGGREGATION
  // ============================================================================

  /**
   * Get statistics for a project's services
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async getStats(projectId) {
    // Count by type
    const typeCountsResult = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'bsm_%'
       GROUP BY artefact_type`,
      [projectId]
    );

    const countsByType = {};
    typeCountsResult.rows.forEach(row => {
      countsByType[row.artefact_type] = parseInt(row.count, 10);
    });

    // Service status distribution
    const statusResult = await query(
      `SELECT custom_fields->>'status' as status, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'bsm_service'
       GROUP BY custom_fields->>'status'`,
      [projectId]
    );

    const statusDistribution = {};
    statusResult.rows.forEach(row => {
      statusDistribution[row.status || 'draft'] = parseInt(row.count, 10);
    });

    // Criticality distribution
    const criticalityResult = await query(
      `SELECT custom_fields->>'criticality' as criticality, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'bsm_service'
       GROUP BY custom_fields->>'criticality'`,
      [projectId]
    );

    const criticalityDistribution = {};
    criticalityResult.rows.forEach(row => {
      criticalityDistribution[row.criticality || 'unassessed'] = parseInt(row.count, 10);
    });

    // Consumer type distribution
    const consumerTypeResult = await query(
      `SELECT custom_fields->>'consumer_type' as consumer_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'bsm_consumer'
       GROUP BY custom_fields->>'consumer_type'`,
      [projectId]
    );

    const consumerTypeDistribution = {};
    consumerTypeResult.rows.forEach(row => {
      consumerTypeDistribution[row.consumer_type || 'unknown'] = parseInt(row.count, 10);
    });

    // Total count
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'bsm_%'`,
      [projectId]
    );

    // Recent activity
    const recentResult = await query(
      `SELECT id, name, artefact_type, updated_at, created_at
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'bsm_%'
       ORDER BY updated_at DESC
       LIMIT 10`,
      [projectId]
    );

    return {
      total: parseInt(totalResult.rows[0].total, 10),
      countsByType,
      services: {
        total: countsByType['bsm_service'] || 0,
        byStatus: statusDistribution,
        byCriticality: criticalityDistribution,
      },
      consumers: {
        total: countsByType['bsm_consumer'] || 0,
        byType: consumerTypeDistribution,
      },
      serviceLevels: countsByType['bsm_service_level'] || 0,
      slas: countsByType['bsm_sla'] || 0,
      dependencies: countsByType['bsm_dependency'] || 0,
      integrations: countsByType['bsm_integration'] || 0,
      recentActivity: recentResult.rows,
    };
  }

  /**
   * Build service dependency map
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async buildDependencyMap(projectId) {
    const services = await this.findServices(projectId);
    const dependenciesResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.project_id = $1 AND a.artefact_type = 'bsm_dependency'`,
      [projectId]
    );

    // Build adjacency list
    const nodes = services.map(s => ({
      id: s.id,
      name: s.name,
      type: s.artefact_type,
      status: s.custom_fields?.status,
      criticality: s.custom_fields?.criticality,
    }));

    const edges = dependenciesResult.rows.map(d => ({
      id: d.id,
      source: d.custom_fields?.source_service,
      target: d.custom_fields?.target_service,
      type: d.custom_fields?.dependency_type,
    })).filter(e => e.source && e.target);

    return { nodes, edges };
  }
}

// Export singleton instance
export const bsmRepository = new BsmRepository();
