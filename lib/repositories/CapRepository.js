/**
 * CapRepository - Data access layer for Capability and Operating Model Studio
 *
 * Handles CRUD operations for capability artefacts including:
 * - Capabilities and capability groups
 * - Value streams
 * - Assessments and gaps
 * - Operating models and accountabilities
 * - Initiatives and roadmap items
 *
 * @extends BaseRepository
 * @module lib/repositories/CapRepository
 *
 * @example
 * import { capRepository } from '../lib/repositories';
 * const capabilities = await capRepository.findByProject(projectId);
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * Helper to retry operations on deadlock
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms between retries
 * @returns {Promise<any>}
 */
async function withDeadlockRetry(operation, maxRetries = 3, baseDelay = 100) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      // Check if it's a deadlock error (PostgreSQL error code 40P01)
      if (err.code === '40P01' && attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 50;
        console.warn(`Deadlock detected, retrying (attempt ${attempt}/${maxRetries}) after ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Repository for Capability and Operating Model artefacts
 */
export class CapRepository extends BaseRepository {
  constructor() {
    super('artefacts');
  }

  // ============================================================================
  // ARTEFACT OPERATIONS
  // ============================================================================

  /**
   * Find all capability artefacts for a domain
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
        AND a.artefact_type LIKE 'cap_%'
    `;
    const params = [domainId];
    let paramIdx = 2;

    // Optional project filter
    if (projectId) {
      sql += ` AND a.project_id = $${paramIdx}`;
      params.push(projectId);
      paramIdx++;
    }

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

    // Filter by stage (stored in custom_fields.cap_stage)
    if (stage) {
      sql += ` AND a.custom_fields->>'cap_stage' = $${paramIdx}`;
      params.push(stage);
      paramIdx++;
    }

    // Search
    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'definition' ILIKE $${paramIdx})`;
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
    let countSql = `SELECT COUNT(*) as total FROM artefacts WHERE domain_id = $1 AND artefact_type LIKE 'cap_%'`;
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
   * Find all capability artefacts for a project
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
        AND a.artefact_type LIKE 'cap_%'
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

    // Filter by stage (stored in custom_fields.cap_stage)
    if (stage) {
      sql += ` AND a.custom_fields->>'cap_stage' = $${paramIdx}`;
      params.push(stage);
      paramIdx++;
    }

    // Search
    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'definition' ILIKE $${paramIdx})`;
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
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'cap_%'`,
      [projectId]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find a single capability artefact by ID
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
      WHERE a.id = $1 AND a.artefact_type LIKE 'cap_%'`,
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
   * Create a new capability artefact
   * @param {Object} data - Artefact data
   * @param {string} data.domainId - Domain UUID (required)
   * @param {string} [data.projectId] - Project UUID (optional)
   * @param {string} data.artefactType - Type (cap_capability, cap_assessment, etc.)
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

    // Use retry logic to handle potential deadlocks from concurrent operations
    return withDeadlockRetry(async () => {
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
    });
  }

  /**
   * Update a capability artefact
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
      WHERE id = $${paramIdx} AND artefact_type LIKE 'cap_%'
      RETURNING *
    `;

    // Use retry logic to handle potential deadlocks
    return withDeadlockRetry(async () => {
      const result = await query(sql, params);
      return result.rows[0] || null;
    });
  }

  /**
   * Delete a capability artefact
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
      `DELETE FROM artefacts WHERE id = $1 AND artefact_type LIKE 'cap_%' RETURNING id`,
      [id]
    );

    return result.rows.length > 0;
  }

  // ============================================================================
  // CAPABILITY-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Find all capabilities (hierarchical)
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async findCapabilities(projectId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        (SELECT COUNT(*) FROM artefacts c WHERE c.custom_fields->>'parent_id' = a.id::text) as child_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'cap_capability'
      ORDER BY a.name`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Find child capabilities of a parent
   * @param {string} parentId - Parent capability UUID
   * @returns {Promise<Array>}
   */
  async findChildCapabilities(parentId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.artefact_type = 'cap_capability'
        AND a.custom_fields->>'parent_id' = $1
      ORDER BY a.name`,
      [parentId]
    );
    return result.rows;
  }

  /**
   * Find root capabilities (no parent)
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async findRootCapabilities(projectId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        (SELECT COUNT(*) FROM artefacts c WHERE c.custom_fields->>'parent_id' = a.id::text) as child_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'cap_capability'
        AND (a.custom_fields->>'parent_id' IS NULL OR a.custom_fields->>'parent_id' = '')
      ORDER BY a.name`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Build capability tree structure
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async buildCapabilityTree(projectId) {
    const capabilities = await this.findCapabilities(projectId);

    // Build tree structure
    const capMap = new Map();
    const roots = [];

    capabilities.forEach(cap => {
      capMap.set(cap.id, { ...cap, children: [] });
    });

    capabilities.forEach(cap => {
      const parentId = cap.custom_fields?.parent_id;
      const node = capMap.get(cap.id);

      if (parentId && capMap.has(parentId)) {
        capMap.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Find all relationships for a project
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
        AND a1.artefact_type LIKE 'cap_%'
        AND a2.artefact_type LIKE 'cap_%'
      ORDER BY ar.created_at DESC`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Create a relationship between artefacts
   * @param {Object} data - Relationship data
   * @param {string} data.projectId - Project UUID
   * @param {string} data.fromArtefactId - Source artefact UUID
   * @param {string} data.toArtefactId - Target artefact UUID
   * @param {string} data.relationshipType - Type of relationship
   * @param {Object} [data.metadata] - Additional metadata
   * @param {string} data.createdBy - Creating user ID
   * @returns {Promise<Object>}
   */
  async createRelationship(data) {
    const { projectId, fromArtefactId, toArtefactId, relationshipType, metadata = {}, createdBy } = data;

    const result = await query(
      `INSERT INTO artefact_relationships (project_id, from_artefact_id, to_artefact_id, relationship_type, metadata, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       RETURNING *`,
      [projectId, fromArtefactId, toArtefactId, relationshipType, metadata, createdBy]
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
   * Get statistics for a project's capabilities
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async getStats(projectId) {
    // Count by type
    const typeCountsResult = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'cap_%'
       GROUP BY artefact_type`,
      [projectId]
    );

    const countsByType = {};
    typeCountsResult.rows.forEach(row => {
      countsByType[row.artefact_type] = parseInt(row.count, 10);
    });

    // Maturity distribution
    const maturityResult = await query(
      `SELECT custom_fields->>'maturity' as maturity, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'cap_capability'
       GROUP BY custom_fields->>'maturity'`,
      [projectId]
    );

    const maturityDistribution = {};
    maturityResult.rows.forEach(row => {
      maturityDistribution[row.maturity || 'unassessed'] = parseInt(row.count, 10);
    });

    // Strategic importance distribution
    const importanceResult = await query(
      `SELECT custom_fields->>'strategic_importance' as importance, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'cap_capability'
       GROUP BY custom_fields->>'strategic_importance'`,
      [projectId]
    );

    const importanceDistribution = {};
    importanceResult.rows.forEach(row => {
      importanceDistribution[row.importance || 'unassessed'] = parseInt(row.count, 10);
    });

    // Gap counts by severity
    const gapResult = await query(
      `SELECT custom_fields->>'severity' as severity, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'cap_gap'
       GROUP BY custom_fields->>'severity'`,
      [projectId]
    );

    const gapsBySeverity = {};
    gapResult.rows.forEach(row => {
      gapsBySeverity[row.severity || 'unassessed'] = parseInt(row.count, 10);
    });

    // Total count
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'cap_%'`,
      [projectId]
    );

    // Recent activity
    const recentResult = await query(
      `SELECT id, name, artefact_type, updated_at, created_at
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'cap_%'
       ORDER BY updated_at DESC
       LIMIT 10`,
      [projectId]
    );

    return {
      total: parseInt(totalResult.rows[0].total, 10),
      countsByType,
      capabilities: {
        total: countsByType['cap_capability'] || 0,
        byMaturity: maturityDistribution,
        byImportance: importanceDistribution,
      },
      gaps: {
        total: countsByType['cap_gap'] || 0,
        bySeverity: gapsBySeverity,
      },
      valueStreams: countsByType['cap_value_stream'] || 0,
      assessments: countsByType['cap_assessment'] || 0,
      initiatives: countsByType['cap_initiative'] || 0,
      recentActivity: recentResult.rows,
    };
  }
}

// Export singleton instance
export const capRepository = new CapRepository();
