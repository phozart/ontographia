/**
 * GovRepository - Data access layer for Governance & Decision Design Studio
 *
 * Handles CRUD operations and business logic for governance artefacts including:
 * - Decision Types and Decision Rights
 * - Governance Forums and Committees
 * - Policies, Standards, and Guidelines
 * - Escalation Paths and RACI Accountabilities
 * - Governance Principles
 *
 * @extends BaseRepository
 * @module lib/repositories/GovRepository
 *
 * @example
 * import { govRepository } from '../lib/repositories';
 * const matrix = await govRepository.getDecisionRightsMatrix(projectId);
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';
import { GOV_STAGES, buildGovernanceTree, buildDecisionRightsMatrix } from '../gov-types';

/**
 * Repository for Governance & Decision Design artefacts
 */
export class GovRepository extends BaseRepository {
  constructor() {
    super('artefacts');
  }

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  /**
   * Find all Governance artefacts for a domain
   * @param {string} domainId - Domain UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.projectId] - Optional project filter
   * @param {string} [options.type] - Filter by specific type
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage
   * @param {string} [options.search] - Search in name/description
   * @param {string} [options.status] - Filter by status
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<{artefacts: Array, total: number}>}
   */
  async findByDomain(domainId, options = {}) {
    const { projectId, type, types, stage, search, status, limit, offset } = options;

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
        AND a.artefact_type LIKE 'gov_%'
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

    // Filter by stage
    if (stage && GOV_STAGES[stage]) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(GOV_STAGES[stage].types);
      paramIdx++;
    }

    // Filter by status
    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    // Search
    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
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
    let countSql = `SELECT COUNT(*) as total FROM artefacts WHERE domain_id = $1 AND artefact_type LIKE 'gov_%'`;
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
   * Find all Governance artefacts for a project (legacy - use findByDomain)
   * @param {string} projectId - Project UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.type] - Filter by specific type
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage
   * @param {string} [options.search] - Search in name/description
   * @param {string} [options.status] - Filter by status
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<{artefacts: Array, total: number}>}
   */
  async findByProject(projectId, options = {}) {
    const { type, types, stage, search, status, limit, offset } = options;

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
        AND a.artefact_type LIKE 'gov_%'
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

    // Filter by stage
    if (stage && GOV_STAGES[stage]) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(GOV_STAGES[stage].types);
      paramIdx++;
    }

    // Filter by status
    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    // Search
    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
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
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'gov_%'`,
      [projectId]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find a single Governance artefact by ID
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
      WHERE a.id = $1 AND a.artefact_type LIKE 'gov_%'`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new Governance artefact
   * @param {Object} data - Artefact data
   * @param {string} data.domainId - Domain UUID (required)
   * @param {string} [data.projectId] - Project UUID (optional)
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
   * Update a Governance artefact
   * @param {string} id - Artefact UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
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
      const mergedFields = {
        ...existing.custom_fields,
        ...customFields,
        ...otherFields,
      };
      updates.push(`custom_fields = $${paramIdx}`);
      params.push(JSON.stringify(mergedFields));
      paramIdx++;
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push(`updated_at = now()`);
    params.push(id);

    const result = await query(
      `UPDATE artefacts SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );

    return result.rows[0];
  }

  /**
   * Delete a Governance artefact
   * @param {string} id - Artefact UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    // Delete relationships first
    await query(
      `DELETE FROM artefact_relationships
       WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
      [id]
    );

    const result = await query(
      `DELETE FROM artefacts WHERE id = $1 AND artefact_type LIKE 'gov_%' RETURNING id`,
      [id]
    );

    return result.rowCount > 0;
  }

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Create a relationship between artefacts
   * @param {Object} data - Relationship data
   * @returns {Promise<Object>}
   */
  async createRelationship(data) {
    const { fromId, toId, relationshipType, properties = {} } = data;

    const result = await query(
      `INSERT INTO artefact_relationships (
        from_artefact_id, to_artefact_id, relationship_type, properties, created_at
      ) VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (from_artefact_id, to_artefact_id, relationship_type)
      DO UPDATE SET properties = $4, updated_at = now()
      RETURNING *`,
      [fromId, toId, relationshipType, JSON.stringify(properties)]
    );

    return result.rows[0];
  }

  /**
   * Get relationships for an artefact
   * @param {string} id - Artefact UUID
   * @returns {Promise<Array>}
   */
  async getRelationships(id) {
    const result = await query(
      `SELECT r.*,
        fa.name as from_name, fa.artefact_type as from_type,
        ta.name as to_name, ta.artefact_type as to_type
      FROM artefact_relationships r
      JOIN artefacts fa ON fa.id = r.from_artefact_id
      JOIN artefacts ta ON ta.id = r.to_artefact_id
      WHERE r.from_artefact_id = $1 OR r.to_artefact_id = $1`,
      [id]
    );

    return result.rows;
  }

  /**
   * Get all relationships for a project's governance artefacts
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async getProjectRelationships(projectId) {
    const result = await query(
      `SELECT r.*,
        fa.name as source_name, fa.artefact_type as source_type,
        ta.name as target_name, ta.artefact_type as target_type
      FROM artefact_relationships r
      JOIN artefacts fa ON fa.id = r.from_artefact_id
      JOIN artefacts ta ON ta.id = r.to_artefact_id
      WHERE fa.project_id = $1
        AND fa.artefact_type LIKE 'gov_%'
        AND ta.artefact_type LIKE 'gov_%'`,
      [projectId]
    );

    return result.rows;
  }

  // ============================================================================
  // SPECIALIZED QUERIES
  // ============================================================================

  /**
   * Get governance structure (forum hierarchy)
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>} Tree structure of forums
   */
  async getGovernanceStructure(projectId) {
    // Get all forums
    const forumsResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_forum'
       ORDER BY name`,
      [projectId]
    );

    const forums = forumsResult.rows;

    // Get reports_to relationships
    const relResult = await query(
      `SELECT r.* FROM artefact_relationships r
       JOIN artefacts a ON a.id = r.from_artefact_id
       WHERE a.project_id = $1
         AND a.artefact_type = 'gov_forum'
         AND r.relationship_type = 'reports_to'`,
      [projectId]
    );

    return buildGovernanceTree(forums, relResult.rows);
  }

  /**
   * Get decision rights matrix
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} Matrix of decision types vs forums
   */
  async getDecisionRightsMatrix(projectId) {
    // Get decision types
    const typesResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_decision_type'
       ORDER BY custom_fields->>'scope', name`,
      [projectId]
    );

    // Get decision rights
    const rightsResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_decision_right'`,
      [projectId]
    );

    // Get forums
    const forumsResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_forum'
       ORDER BY name`,
      [projectId]
    );

    return buildDecisionRightsMatrix(
      typesResult.rows,
      rightsResult.rows,
      forumsResult.rows
    );
  }

  /**
   * Get policy hierarchy
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>} Tree structure of policies
   */
  async getPolicyHierarchy(projectId) {
    // Get all policies
    const policiesResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_policy'
       ORDER BY custom_fields->>'policy_type', name`,
      [projectId]
    );

    const policies = policiesResult.rows;

    // Get parent_policy relationships
    const relResult = await query(
      `SELECT r.* FROM artefact_relationships r
       JOIN artefacts a ON a.id = r.from_artefact_id
       WHERE a.project_id = $1
         AND a.artefact_type = 'gov_policy'
         AND r.relationship_type = 'parent_policy'`,
      [projectId]
    );

    // Build hierarchy
    const policyMap = {};
    policies.forEach(p => {
      policyMap[p.id] = { ...p, children: [] };
    });

    const roots = [];
    policies.forEach(policy => {
      const parentRel = relResult.rows.find(r => r.from_artefact_id === policy.id);
      if (parentRel && policyMap[parentRel.to_artefact_id]) {
        policyMap[parentRel.to_artefact_id].children.push(policyMap[policy.id]);
      } else {
        roots.push(policyMap[policy.id]);
      }
    });

    // Sort by policy type order
    const typeOrder = ['policy', 'standard', 'guideline', 'procedure', 'principle'];
    roots.sort((a, b) => {
      const aIdx = typeOrder.indexOf(a.custom_fields?.policy_type) || 0;
      const bIdx = typeOrder.indexOf(b.custom_fields?.policy_type) || 0;
      return aIdx - bIdx;
    });

    return roots;
  }

  /**
   * Get escalation paths
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>} List of escalation paths with context
   */
  async getEscalationPaths(projectId) {
    const result = await query(
      `SELECT e.*,
        (SELECT array_agg(json_build_object(
          'id', a.id,
          'name', a.name,
          'type', a.artefact_type
        ))
        FROM artefact_relationships r
        JOIN artefacts a ON a.id = r.to_artefact_id
        WHERE r.from_artefact_id = e.id AND r.relationship_type = 'escalates_to'
        ) as targets
      FROM artefacts e
      WHERE e.project_id = $1 AND e.artefact_type = 'gov_escalation'
      ORDER BY e.name`,
      [projectId]
    );

    return result.rows;
  }

  /**
   * Get RACI matrix for accountabilities
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} RACI matrix data
   */
  async getRaciMatrix(projectId) {
    // Get accountabilities
    const accResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_accountability'
       ORDER BY custom_fields->>'role', name`,
      [projectId]
    );

    // Group by role
    const byRole = {};
    accResult.rows.forEach(acc => {
      const role = acc.custom_fields?.role || 'Unassigned';
      if (!byRole[role]) {
        byRole[role] = [];
      }
      byRole[role].push(acc);
    });

    // Get unique scopes/deliverables for columns
    const scopes = new Set();
    accResult.rows.forEach(acc => {
      if (acc.custom_fields?.scope) {
        scopes.add(acc.custom_fields.scope);
      }
    });

    return {
      roles: Object.keys(byRole),
      scopes: Array.from(scopes),
      accountabilities: accResult.rows,
      byRole,
    };
  }

  // ============================================================================
  // STATISTICS AND DASHBOARD
  // ============================================================================

  /**
   * Get governance statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(projectId) {
    const countsResult = await query(
      `SELECT
        artefact_type,
        COUNT(*) as count
      FROM artefacts
      WHERE project_id = $1 AND artefact_type LIKE 'gov_%'
      GROUP BY artefact_type`,
      [projectId]
    );

    const counts = {};
    let total = 0;
    countsResult.rows.forEach(row => {
      counts[row.artefact_type] = parseInt(row.count, 10);
      total += parseInt(row.count, 10);
    });

    // Get policy status breakdown
    const policyStatusResult = await query(
      `SELECT
        custom_fields->>'status' as status,
        COUNT(*) as count
      FROM artefacts
      WHERE project_id = $1 AND artefact_type = 'gov_policy'
      GROUP BY custom_fields->>'status'`,
      [projectId]
    );

    const policyStatus = {};
    policyStatusResult.rows.forEach(row => {
      policyStatus[row.status || 'unknown'] = parseInt(row.count, 10);
    });

    // Get forum types breakdown
    const forumTypesResult = await query(
      `SELECT
        custom_fields->>'forum_type' as forum_type,
        COUNT(*) as count
      FROM artefacts
      WHERE project_id = $1 AND artefact_type = 'gov_forum'
      GROUP BY custom_fields->>'forum_type'`,
      [projectId]
    );

    const forumTypes = {};
    forumTypesResult.rows.forEach(row => {
      forumTypes[row.forum_type || 'unknown'] = parseInt(row.count, 10);
    });

    // Get decision scope breakdown
    const decisionScopeResult = await query(
      `SELECT
        custom_fields->>'scope' as scope,
        COUNT(*) as count
      FROM artefacts
      WHERE project_id = $1 AND artefact_type = 'gov_decision_type'
      GROUP BY custom_fields->>'scope'`,
      [projectId]
    );

    const decisionScopes = {};
    decisionScopeResult.rows.forEach(row => {
      decisionScopes[row.scope || 'unknown'] = parseInt(row.count, 10);
    });

    // Coverage metrics
    const decisionTypesCount = counts.gov_decision_type || 0;
    const decisionRightsCount = counts.gov_decision_right || 0;
    const forumsCount = counts.gov_forum || 0;
    const policiesCount = counts.gov_policy || 0;
    const approvedPolicies = policyStatus.approved || 0;

    return {
      total,
      counts,
      policyStatus,
      forumTypes,
      decisionScopes,
      coverage: {
        hasDecisionTypes: decisionTypesCount > 0,
        hasDecisionRights: decisionRightsCount > 0,
        hasForums: forumsCount > 0,
        hasPolicies: policiesCount > 0,
        decisionRightsCoverage: decisionTypesCount > 0
          ? Math.round((decisionRightsCount / decisionTypesCount) * 100)
          : 0,
        policyApprovalRate: policiesCount > 0
          ? Math.round((approvedPolicies / policiesCount) * 100)
          : 0,
      },
    };
  }

  /**
   * Get dashboard summary for visualization
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardSummary(projectId) {
    const stats = await this.getStats(projectId);
    const governanceStructure = await this.getGovernanceStructure(projectId);
    const policyHierarchy = await this.getPolicyHierarchy(projectId);

    // Get recent activity
    const recentResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'gov_%'
       ORDER BY updated_at DESC LIMIT 5`,
      [projectId]
    );

    // Get principles
    const principlesResult = await query(
      `SELECT * FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'gov_principle'
       ORDER BY name`,
      [projectId]
    );

    return {
      stats,
      governanceStructure,
      policyHierarchy,
      principles: principlesResult.rows,
      recentActivity: recentResult.rows,
    };
  }

  /**
   * Validate governance completeness
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} Validation results with recommendations
   */
  async validateCompleteness(projectId) {
    const stats = await this.getStats(projectId);
    const issues = [];
    const recommendations = [];

    // Check for foundational elements
    if (!stats.coverage.hasDecisionTypes) {
      issues.push({
        severity: 'high',
        message: 'No decision types defined',
        recommendation: 'Define the types of decisions your organization makes',
      });
    }

    if (!stats.coverage.hasForums) {
      issues.push({
        severity: 'high',
        message: 'No governance forums defined',
        recommendation: 'Create governance bodies to oversee decisions',
      });
    }

    // Check coverage ratios
    if (stats.coverage.decisionRightsCoverage < 50 && stats.counts.gov_decision_type > 0) {
      issues.push({
        severity: 'medium',
        message: `Only ${stats.coverage.decisionRightsCoverage}% of decision types have assigned rights`,
        recommendation: 'Assign decision rights for remaining decision types',
      });
    }

    // Check policy approval
    if (stats.coverage.policyApprovalRate < 50 && stats.counts.gov_policy > 0) {
      issues.push({
        severity: 'medium',
        message: `Only ${stats.coverage.policyApprovalRate}% of policies are approved`,
        recommendation: 'Review and approve pending policies',
      });
    }

    // Check for principles
    if (!stats.counts.gov_principle) {
      recommendations.push({
        type: 'enhancement',
        message: 'Consider defining governance principles',
        benefit: 'Principles provide guidance for consistent governance decisions',
      });
    }

    // Check for escalation paths
    if (!stats.counts.gov_escalation) {
      recommendations.push({
        type: 'enhancement',
        message: 'Consider defining escalation paths',
        benefit: 'Escalation paths ensure issues are resolved at appropriate levels',
      });
    }

    return {
      isComplete: issues.filter(i => i.severity === 'high').length === 0,
      completenessScore: calculateCompletenessScore(stats),
      issues,
      recommendations,
    };
  }
}

/**
 * Calculate completeness score
 */
function calculateCompletenessScore(stats) {
  let score = 0;
  const weights = {
    hasDecisionTypes: 20,
    hasDecisionRights: 20,
    hasForums: 20,
    hasPolicies: 15,
    decisionRightsCoverage: 15,
    policyApprovalRate: 10,
  };

  if (stats.coverage.hasDecisionTypes) score += weights.hasDecisionTypes;
  if (stats.coverage.hasDecisionRights) score += weights.hasDecisionRights;
  if (stats.coverage.hasForums) score += weights.hasForums;
  if (stats.coverage.hasPolicies) score += weights.hasPolicies;
  score += (stats.coverage.decisionRightsCoverage / 100) * weights.decisionRightsCoverage;
  score += (stats.coverage.policyApprovalRate / 100) * weights.policyApprovalRate;

  return Math.round(score);
}

// Export singleton instance
export const govRepository = new GovRepository();

export default govRepository;
