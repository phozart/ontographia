// lib/repositories/CMRepository.js
// Repository for Change Management database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * CM artefact type constants
 */
export const CM_ARTEFACT_TYPES = Object.freeze({
  CONTEXT: 'cm_context',
  STAKEHOLDER_GROUP: 'cm_stakeholder_group',
  PCT_ASSESSMENT: 'cm_pct_assessment',
  IMPACT_ASSESSMENT: 'cm_impact_assessment',
  RISK: 'cm_risk',
  ADOPTION_SIGNAL: 'cm_adoption_signal',
});

/**
 * CM relationship type constants
 */
export const CM_RELATIONSHIP_TYPES = Object.freeze([
  'cm_context_has_stakeholder',
  'cm_stakeholder_has_assessment',
  'cm_context_has_risk',
  'cm_context_has_signal',
  'cm_stakeholder_has_impact',
  'cm_risk_affects_stakeholder',
]);

/**
 * Helper functions
 */
export function calculateRiskScore(probability, impact) {
  const probScore = { high: 3, medium: 2, low: 1 }[probability] || 2;
  const impScore = { high: 3, medium: 2, low: 1 }[impact] || 2;
  return probScore * impScore;
}

export function calculateOverallLevel(impacts) {
  if (!impacts || Object.keys(impacts).length === 0) return 'medium';
  const levels = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
  const scores = Object.values(impacts).map(i => levels[i.level] || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avgScore <= 0.5) return 'none';
  if (avgScore <= 1.5) return 'low';
  if (avgScore <= 2.5) return 'medium';
  if (avgScore <= 3.5) return 'high';
  return 'critical';
}

/**
 * Transform functions for consistent API responses
 */
export const transformers = {
  stakeholder: (row) => {
    const cf = row.custom_fields || {};
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      size: cf.size || 0,
      impactLevel: cf.impact_level || 'medium',
      influenceLevel: cf.influence_level || 'medium',
      currentState: cf.current_state || '',
      desiredState: cf.desired_state || '',
      representative: cf.representative || '',
      readinessLevel: cf.readiness_level || 'not_assessed',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  risk: (row) => {
    const cf = row.custom_fields || {};
    return {
      id: row.id,
      title: row.name,
      description: row.description || '',
      category: cf.category || 'resistance',
      probability: cf.probability || 'medium',
      impact: cf.impact || 'medium',
      riskScore: calculateRiskScore(cf.probability, cf.impact),
      mitigationStrategy: cf.mitigation_strategy || '',
      owner: cf.owner || '',
      status: cf.status || 'identified',
      stakeholderGroupId: cf.stakeholder_group_id || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  impact: (row) => {
    const cf = row.custom_fields || {};
    return {
      id: row.id,
      name: row.name,
      stakeholderGroupId: cf.stakeholder_group_id || null,
      impacts: cf.impacts || {},
      overallLevel: cf.overall_level || 'medium',
      notes: cf.notes || '',
      assessedBy: cf.assessed_by || '',
      assessedDate: cf.assessed_date || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  assessment: (row) => {
    const cf = row.custom_fields || {};
    return {
      id: row.id,
      name: row.name,
      stakeholderGroupId: cf.stakeholder_group_id || null,
      templateType: 'PCT',
      status: cf.status || 'not_started',
      responses: cf.responses || {},
      leadershipScore: parseInt(cf.leadership_score) || 0,
      projectScore: parseInt(cf.project_score) || 0,
      changeScore: parseInt(cf.change_score) || 0,
      successScore: parseInt(cf.success_score) || 0,
      purposeScore: parseFloat(cf.purpose_score) || 0,
      purposeNotes: cf.purpose_notes || '',
      capacityScore: parseFloat(cf.capacity_score) || 0,
      capacityNotes: cf.capacity_notes || '',
      trustScore: parseFloat(cf.trust_score) || 0,
      trustNotes: cf.trust_notes || '',
      assessedDate: cf.assessed_date || null,
      assessor: cf.assessor || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  context: (row) => {
    const cf = row.custom_fields || {};
    return {
      id: row.id,
      title: row.name,
      changeStatement: cf.changeStatement || cf.vision || '',
      businessDriver: cf.businessDriver || cf.rationale || '',
      desiredFutureState: cf.desiredFutureState || '',
      currentStateSummary: cf.currentStateSummary || '',
      changeType: cf.change_type || 'incremental',
      ownerId: row.owner_id,
      sponsorId: cf.sponsor || '',
      startDate: cf.timeline_start || null,
      targetDate: cf.timeline_end || null,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },
};

/**
 * Repository for Change Management operations
 */
export class CMRepository extends BaseRepository {
  constructor() {
    super('artefacts', 'id');
  }

  // ============================================================
  // Generic CM Artefact Operations
  // ============================================================

  async findCMArtefacts(projectId, filters = {}) {
    const { contextId, type, types, search, limit, offset } = filters;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.project_id = $1 AND a.artefact_type LIKE 'cm_%'
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (contextId) {
      sql += ` AND (a.id = $${paramIdx} OR a.custom_fields->>'context_id' = $${paramIdx}::text OR a.id IN (
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

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'title' ILIKE $${paramIdx})`;
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
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'cm_%'`,
      [projectId]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async findCMArtefactById(id) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users cb ON cb.id = a.created_by
      WHERE a.id = $1 AND a.artefact_type LIKE 'cm_%'`,
      [id]
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

  async createCMArtefact(data) {
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

  async updateCMArtefact(id, data) {
    const { name, description, status, ownerId, tags, customFields } = data;

    const current = await query(
      'SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE $2',
      [id, 'cm_%']
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

  async deleteCMArtefact(id) {
    const current = await query(
      'SELECT id, project_id FROM artefacts WHERE id = $1 AND artefact_type LIKE $2',
      [id, 'cm_%']
    );

    if (current.rows.length === 0) return null;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return { projectId: current.rows[0].project_id };
  }

  // ============================================================
  // Context Operations
  // ============================================================

  async findContext(projectId) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type = 'cm_context'`,
      [projectId]
    );
    return result.rows[0] ? transformers.context(result.rows[0]) : null;
  }

  async createContext(projectId, data, userId) {
    const { title, changeStatement, businessDriver, desiredFutureState, currentStateSummary,
      changeType, ownerId, sponsorId, startDate, targetDate } = data;

    const existing = await query(
      "SELECT id FROM artefacts WHERE project_id = $1 AND artefact_type = 'cm_context'",
      [projectId]
    );

    if (existing.rows.length > 0) {
      throw new Error('CONTEXT_EXISTS');
    }

    const customFields = {
      changeStatement: changeStatement || '',
      businessDriver: businessDriver || '',
      desiredFutureState: desiredFutureState || '',
      currentStateSummary: currentStateSummary || '',
      change_type: changeType || 'incremental',
      sponsor: sponsorId || '',
      timeline_start: startDate || null,
      timeline_end: targetDate || null,
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, 'cm_context', $2, $3, 'Draft', 'N/A', 'High', $4, '[]', $5, $6, now(), now())
      RETURNING *`,
      [projectId, title.trim(), changeStatement || '', ownerId || userId, JSON.stringify(customFields), userId]
    );

    return transformers.context(result.rows[0]);
  }

  async updateContext(projectId, data) {
    const { title, changeStatement, businessDriver, desiredFutureState, currentStateSummary,
      changeType, ownerId, sponsorId, startDate, targetDate } = data;

    const existing = await query(
      "SELECT * FROM artefacts WHERE project_id = $1 AND artefact_type = 'cm_context'",
      [projectId]
    );

    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const currentCF = current.custom_fields || {};

    const customFields = {
      ...currentCF,
      changeStatement: changeStatement ?? currentCF.changeStatement ?? '',
      businessDriver: businessDriver ?? currentCF.businessDriver ?? '',
      desiredFutureState: desiredFutureState ?? currentCF.desiredFutureState ?? '',
      currentStateSummary: currentStateSummary ?? currentCF.currentStateSummary ?? '',
      change_type: changeType ?? currentCF.change_type ?? 'incremental',
      sponsor: sponsorId ?? currentCF.sponsor ?? '',
      timeline_start: startDate ?? currentCF.timeline_start,
      timeline_end: targetDate ?? currentCF.timeline_end,
    };

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        owner_id = COALESCE($4, owner_id),
        custom_fields = $5,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [current.id, title?.trim(), changeStatement, ownerId, JSON.stringify(customFields)]
    );

    return transformers.context(result.rows[0]);
  }

  // ============================================================
  // Stakeholder Operations
  // ============================================================

  async findStakeholders(projectId) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type = 'cm_stakeholder_group'
       ORDER BY a.name ASC`,
      [projectId]
    );
    return result.rows.map(transformers.stakeholder);
  }

  async findStakeholderById(projectId, id) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.id = $1 AND a.project_id = $2 AND a.artefact_type = 'cm_stakeholder_group'`,
      [id, projectId]
    );
    return result.rows[0] ? transformers.stakeholder(result.rows[0]) : null;
  }

  async createStakeholder(projectId, data, userId) {
    const { name, description, size, impactLevel, influenceLevel, currentState, desiredState, representative } = data;

    const customFields = {
      size: parseInt(size, 10) || 0,
      impact_level: impactLevel || 'medium',
      influence_level: influenceLevel || 'medium',
      current_state: currentState || '',
      desired_state: desiredState || '',
      representative: representative || '',
      readiness_level: 'not_assessed',
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, 'cm_stakeholder_group', $2, $3, 'Draft', 'N/A', 'Medium', $4, '[]', $5, $4, now(), now())
      RETURNING *`,
      [projectId, name.trim(), description || '', userId, JSON.stringify(customFields)]
    );

    return transformers.stakeholder(result.rows[0]);
  }

  async updateStakeholder(projectId, id, data) {
    const { name, description, size, impactLevel, influenceLevel, currentState, desiredState, representative, readinessLevel } = data;

    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_stakeholder_group'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return null;

    const currentCF = existing.rows[0].custom_fields || {};
    const customFields = {
      ...currentCF,
      size: size !== undefined ? parseInt(size, 10) : currentCF.size,
      impact_level: impactLevel ?? currentCF.impact_level,
      influence_level: influenceLevel ?? currentCF.influence_level,
      current_state: currentState ?? currentCF.current_state,
      desired_state: desiredState ?? currentCF.desired_state,
      representative: representative ?? currentCF.representative,
      readiness_level: readinessLevel ?? currentCF.readiness_level,
    };

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        custom_fields = $4,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [id, name?.trim(), description, JSON.stringify(customFields)]
    );

    return transformers.stakeholder(result.rows[0]);
  }

  async deleteStakeholder(projectId, id) {
    const existing = await query(
      `SELECT id FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_stakeholder_group'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return false;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return true;
  }

  // ============================================================
  // Risk Operations
  // ============================================================

  async findRisks(projectId, filters = {}) {
    const { status, category } = filters;

    let sql = `
      SELECT a.*, u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1 AND a.artefact_type = 'cm_risk'
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (category) {
      sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
      params.push(category);
    }

    sql += ` ORDER BY
      CASE a.custom_fields->>'probability'
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END,
      a.created_at DESC`;

    const result = await query(sql, params);
    return result.rows.map(transformers.risk);
  }

  async findRiskById(projectId, id) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.id = $1 AND a.project_id = $2 AND a.artefact_type = 'cm_risk'`,
      [id, projectId]
    );
    return result.rows[0] ? transformers.risk(result.rows[0]) : null;
  }

  async createRisk(projectId, data, userId) {
    const { title, description, category, probability, impact, mitigationStrategy, owner, stakeholderGroupId } = data;

    const customFields = {
      category: category || 'resistance',
      probability: probability || 'medium',
      impact: impact || 'medium',
      mitigation_strategy: mitigationStrategy || '',
      owner: owner || '',
      status: 'identified',
      stakeholder_group_id: stakeholderGroupId || null,
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, 'cm_risk', $2, $3, 'Draft', 'N/A', 'High', $4, '[]', $5, $4, now(), now())
      RETURNING *`,
      [projectId, title.trim(), description || '', userId, JSON.stringify(customFields)]
    );

    return transformers.risk(result.rows[0]);
  }

  async updateRisk(projectId, id, data) {
    const { title, description, category, probability, impact, mitigationStrategy, owner, status, stakeholderGroupId } = data;

    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_risk'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return null;

    const currentCF = existing.rows[0].custom_fields || {};
    const customFields = {
      ...currentCF,
      category: category ?? currentCF.category,
      probability: probability ?? currentCF.probability,
      impact: impact ?? currentCF.impact,
      mitigation_strategy: mitigationStrategy ?? currentCF.mitigation_strategy,
      owner: owner ?? currentCF.owner,
      status: status ?? currentCF.status,
      stakeholder_group_id: stakeholderGroupId ?? currentCF.stakeholder_group_id,
    };

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        custom_fields = $4,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [id, title?.trim(), description, JSON.stringify(customFields)]
    );

    return transformers.risk(result.rows[0]);
  }

  async deleteRisk(projectId, id) {
    const existing = await query(
      `SELECT id FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_risk'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return false;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return true;
  }

  // ============================================================
  // Impact Assessment Operations
  // ============================================================

  async findImpacts(projectId, filters = {}) {
    const { stakeholderGroupId } = filters;

    let sql = `
      SELECT a.*, u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1 AND a.artefact_type = 'cm_impact_assessment'
    `;
    const params = [projectId];

    if (stakeholderGroupId) {
      sql += ` AND a.custom_fields->>'stakeholder_group_id' = $2`;
      params.push(stakeholderGroupId);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    return result.rows.map(transformers.impact);
  }

  async createImpact(projectId, data, userId) {
    const { name, stakeholderGroupId, impacts, overallLevel, notes } = data;

    const existing = await query(
      `SELECT id FROM artefacts
       WHERE project_id = $1
         AND artefact_type = 'cm_impact_assessment'
         AND custom_fields->>'stakeholder_group_id' = $2`,
      [projectId, stakeholderGroupId]
    );

    if (existing.rows.length > 0) {
      throw new Error('IMPACT_EXISTS');
    }

    const customFields = {
      stakeholder_group_id: stakeholderGroupId,
      impacts: impacts || {},
      overall_level: overallLevel || calculateOverallLevel(impacts),
      notes: notes || '',
      assessed_by: userId,
      assessed_date: new Date().toISOString(),
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, 'cm_impact_assessment', $2, '', 'Draft', 'N/A', 'Medium', $3, '[]', $4, $3, now(), now())
      RETURNING *`,
      [projectId, name || 'Impact Assessment', userId, JSON.stringify(customFields)]
    );

    return transformers.impact(result.rows[0]);
  }

  async findImpactById(projectId, id) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.id = $1 AND a.project_id = $2 AND a.artefact_type = 'cm_impact_assessment'`,
      [id, projectId]
    );
    return result.rows[0] ? transformers.impact(result.rows[0]) : null;
  }

  async updateImpact(projectId, id, data) {
    const { name, impacts, overallLevel, notes } = data;

    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_impact_assessment'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return null;

    const currentCF = existing.rows[0].custom_fields || {};
    const customFields = {
      ...currentCF,
      impacts: impacts ?? currentCF.impacts,
      overall_level: overallLevel ?? calculateOverallLevel(impacts ?? currentCF.impacts),
      notes: notes ?? currentCF.notes,
    };

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        custom_fields = $3,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [id, name?.trim(), JSON.stringify(customFields)]
    );

    return transformers.impact(result.rows[0]);
  }

  async deleteImpact(projectId, id) {
    const existing = await query(
      `SELECT id FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_impact_assessment'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return false;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return true;
  }

  // ============================================================
  // PCT Assessment Operations
  // ============================================================

  async findAssessments(projectId, filters = {}) {
    const { stakeholderGroupId } = filters;

    let sql = `
      SELECT a.*, u.username as owner_username
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1 AND a.artefact_type = 'cm_pct_assessment'
    `;
    const params = [projectId];

    if (stakeholderGroupId) {
      sql += ` AND a.custom_fields->>'stakeholder_group_id' = $2`;
      params.push(stakeholderGroupId);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    return result.rows.map(transformers.assessment);
  }

  async createAssessment(projectId, data, userId) {
    const { name, stakeholderGroupId, responses, leadershipScore, projectScore, changeScore, successScore,
      purposeScore, purposeNotes, capacityScore, capacityNotes, trustScore, trustNotes, assessedDate } = data;

    const customFields = {
      stakeholder_group_id: stakeholderGroupId || null,
      status: 'in_progress',
      responses: responses || {},
      leadership_score: parseInt(leadershipScore) || 0,
      project_score: parseInt(projectScore) || 0,
      change_score: parseInt(changeScore) || 0,
      success_score: parseInt(successScore) || 0,
      purpose_score: parseFloat(purposeScore) || 0,
      purpose_notes: purposeNotes || '',
      capacity_score: parseFloat(capacityScore) || 0,
      capacity_notes: capacityNotes || '',
      trust_score: parseFloat(trustScore) || 0,
      trust_notes: trustNotes || '',
      assessed_date: assessedDate || new Date().toISOString().split('T')[0],
      assessor: userId,
    };

    const result = await query(
      `INSERT INTO artefacts (
        project_id, artefact_type, name, description, status,
        architecture_state, priority, owner_id, tags, custom_fields,
        created_by, created_at, updated_at
      ) VALUES ($1, 'cm_pct_assessment', $2, '', 'Draft', 'N/A', 'Medium', $3, '[]', $4, $3, now(), now())
      RETURNING *`,
      [projectId, name.trim(), userId, JSON.stringify(customFields)]
    );

    return transformers.assessment(result.rows[0]);
  }

  async findAssessmentById(projectId, id) {
    const result = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.id = $1 AND a.project_id = $2 AND a.artefact_type = 'cm_pct_assessment'`,
      [id, projectId]
    );
    return result.rows[0] ? transformers.assessment(result.rows[0]) : null;
  }

  async updateAssessment(projectId, id, data) {
    const { name, stakeholderGroupId, status, responses, leadershipScore, projectScore, changeScore,
      successScore, purposeScore, purposeNotes, capacityScore, capacityNotes, trustScore, trustNotes, assessedDate } = data;

    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_pct_assessment'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return null;

    const currentCF = existing.rows[0].custom_fields || {};
    const customFields = {
      ...currentCF,
      stakeholder_group_id: stakeholderGroupId ?? currentCF.stakeholder_group_id,
      status: status ?? currentCF.status,
      responses: responses ?? currentCF.responses ?? {},
      leadership_score: leadershipScore !== undefined ? parseInt(leadershipScore) : currentCF.leadership_score,
      project_score: projectScore !== undefined ? parseInt(projectScore) : currentCF.project_score,
      change_score: changeScore !== undefined ? parseInt(changeScore) : currentCF.change_score,
      success_score: successScore !== undefined ? parseInt(successScore) : currentCF.success_score,
      purpose_score: purposeScore !== undefined ? parseFloat(purposeScore) : currentCF.purpose_score,
      purpose_notes: purposeNotes ?? currentCF.purpose_notes,
      capacity_score: capacityScore !== undefined ? parseFloat(capacityScore) : currentCF.capacity_score,
      capacity_notes: capacityNotes ?? currentCF.capacity_notes,
      trust_score: trustScore !== undefined ? parseFloat(trustScore) : currentCF.trust_score,
      trust_notes: trustNotes ?? currentCF.trust_notes,
      assessed_date: assessedDate ?? currentCF.assessed_date,
    };

    // Mark as completed if all new scores are filled in
    const l = customFields.leadership_score || 0;
    const p = customFields.project_score || 0;
    const c = customFields.change_score || 0;
    const s = customFields.success_score || 0;
    if (l >= 10 && p >= 10 && c >= 10 && s >= 10) {
      customFields.status = 'completed';
    }

    const result = await query(
      `UPDATE artefacts SET
        name = COALESCE($2, name),
        custom_fields = $3,
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [id, name?.trim(), JSON.stringify(customFields)]
    );

    return transformers.assessment(result.rows[0]);
  }

  async deleteAssessment(projectId, id) {
    const existing = await query(
      `SELECT id FROM artefacts WHERE id = $1 AND project_id = $2 AND artefact_type = 'cm_pct_assessment'`,
      [id, projectId]
    );

    if (existing.rows.length === 0) return false;

    await query('DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1', [id]);
    await query('DELETE FROM artefacts WHERE id = $1', [id]);

    return true;
  }

  // ============================================================
  // Full Project Data
  // ============================================================

  async getProjectData(projectId) {
    const artefactsResult = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type LIKE 'cm_%'
       ORDER BY a.created_at DESC`,
      [projectId]
    );

    const artefacts = artefactsResult.rows;

    const changeContextRow = artefacts.find(a => a.artefact_type === 'cm_context');
    const stakeholderGroups = artefacts.filter(a => a.artefact_type === 'cm_stakeholder_group');
    const pctAssessments = artefacts.filter(a => a.artefact_type === 'cm_pct_assessment');
    const impactAssessments = artefacts.filter(a => a.artefact_type === 'cm_impact_assessment');
    const risks = artefacts.filter(a => a.artefact_type === 'cm_risk');
    const adoptionSignals = artefacts.filter(a => a.artefact_type === 'cm_adoption_signal');

    return {
      changeContext: changeContextRow ? transformers.context(changeContextRow) : null,
      stakeholderGroups: stakeholderGroups.map(transformers.stakeholder),
      assessments: pctAssessments.map(transformers.assessment),
      impactAssessments: impactAssessments.map(transformers.impact),
      risks: risks.map(transformers.risk),
      adoptionSignals: adoptionSignals.map(as => ({
        id: as.id,
        ...as.custom_fields,
        name: as.name,
      })),
    };
  }

  // ============================================================
  // Statistics
  // ============================================================

  async getStats(projectId, contextId = null) {
    const countsByType = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'cm_%'
       GROUP BY artefact_type`,
      [projectId]
    );

    const contexts = await query(
      `SELECT a.*, u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type = 'cm_context'
       ORDER BY a.updated_at DESC`,
      [projectId]
    );

    const typeCounts = {};
    countsByType.rows.forEach(row => {
      typeCounts[row.artefact_type] = parseInt(row.count, 10);
    });

    let contextStats = null;
    if (contextId) {
      contextStats = await this._getContextStats(projectId, contextId);
    }

    return {
      typeCounts,
      totalArtefacts: Object.values(typeCounts).reduce((a, b) => a + b, 0),
      contexts: contexts.rows,
      contextCount: contexts.rows.length,
      contextStats,
    };
  }

  async _getContextStats(projectId, contextId) {
    const [stakeholderGroups, pctAssessments, risks, adoptionSignals] = await Promise.all([
      query(
        `SELECT a.* FROM artefacts a
         WHERE a.project_id = $1 AND a.artefact_type = 'cm_stakeholder_group'
           AND (a.custom_fields->>'context_id' = $2 OR a.id IN (
             SELECT to_artefact_id FROM artefact_relationships
             WHERE from_artefact_id = $2 AND relationship_type = 'cm_context_has_stakeholder'
           ))`,
        [projectId, contextId]
      ),
      query(
        `SELECT a.* FROM artefacts a
         WHERE a.project_id = $1 AND a.artefact_type = 'cm_pct_assessment'
           AND (a.custom_fields->>'context_id' = $2 OR a.custom_fields->>'stakeholder_group_id' = ANY(
             SELECT id::text FROM artefacts WHERE project_id = $1 AND artefact_type = 'cm_stakeholder_group' AND (custom_fields->>'context_id' = $2)
           ))`,
        [projectId, contextId]
      ),
      query(
        `SELECT a.* FROM artefacts a
         WHERE a.project_id = $1 AND a.artefact_type = 'cm_risk'
           AND (a.custom_fields->>'context_id' = $2 OR a.id IN (
             SELECT to_artefact_id FROM artefact_relationships
             WHERE from_artefact_id = $2 AND relationship_type = 'cm_context_has_risk'
           ))`,
        [projectId, contextId]
      ),
      query(
        `SELECT a.* FROM artefacts a
         WHERE a.project_id = $1 AND a.artefact_type = 'cm_adoption_signal'
           AND (a.custom_fields->>'context_id' = $2 OR a.id IN (
             SELECT to_artefact_id FROM artefact_relationships
             WHERE from_artefact_id = $2 AND relationship_type = 'cm_context_has_signal'
           ))`,
        [projectId, contextId]
      ),
    ]);

    let overallReadiness = null;
    if (pctAssessments.rows.length > 0) {
      const totalPurpose = pctAssessments.rows.reduce((sum, a) => sum + (parseFloat(a.custom_fields?.purpose_score) || 0), 0);
      const totalCapacity = pctAssessments.rows.reduce((sum, a) => sum + (parseFloat(a.custom_fields?.capacity_score) || 0), 0);
      const totalTrust = pctAssessments.rows.reduce((sum, a) => sum + (parseFloat(a.custom_fields?.trust_score) || 0), 0);
      const count = pctAssessments.rows.length;

      overallReadiness = {
        purpose: count > 0 ? (totalPurpose / count).toFixed(1) : 0,
        capacity: count > 0 ? (totalCapacity / count).toFixed(1) : 0,
        trust: count > 0 ? (totalTrust / count).toFixed(1) : 0,
        overall: count > 0 ? ((totalPurpose + totalCapacity + totalTrust) / (count * 3)).toFixed(1) : 0,
        assessmentCount: count,
      };
    }

    const riskSummary = { total: risks.rows.length, byStatus: {}, byProbability: {}, byImpact: {} };
    risks.rows.forEach(r => {
      const status = r.custom_fields?.status || 'identified';
      const probability = r.custom_fields?.probability || 'medium';
      const impact = r.custom_fields?.impact || 'medium';
      riskSummary.byStatus[status] = (riskSummary.byStatus[status] || 0) + 1;
      riskSummary.byProbability[probability] = (riskSummary.byProbability[probability] || 0) + 1;
      riskSummary.byImpact[impact] = (riskSummary.byImpact[impact] || 0) + 1;
    });

    return {
      stakeholderGroups: stakeholderGroups.rows,
      stakeholderCount: stakeholderGroups.rows.length,
      pctAssessments: pctAssessments.rows,
      assessmentCount: pctAssessments.rows.length,
      risks: risks.rows,
      riskSummary,
      adoptionSignals: adoptionSignals.rows,
      signalCount: adoptionSignals.rows.length,
      overallReadiness,
    };
  }

  // ============================================================
  // Relationship Operations
  // ============================================================

  async findRelationships(projectId, filters = {}) {
    const { contextId, artefactId, type } = filters;

    let sql = `
      SELECT ar.*,
        fa.name as from_name, fa.artefact_type as from_type, fa.custom_fields as from_custom_fields,
        ta.name as to_name, ta.artefact_type as to_type, ta.custom_fields as to_custom_fields
      FROM artefact_relationships ar
      INNER JOIN artefacts fa ON fa.id = ar.from_artefact_id
      INNER JOIN artefacts ta ON ta.id = ar.to_artefact_id
      WHERE fa.project_id = $1
        AND (fa.artefact_type LIKE 'cm_%' OR ta.artefact_type LIKE 'cm_%')
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (contextId) {
      sql += ` AND (ar.from_artefact_id = $${paramIdx} OR ar.to_artefact_id = $${paramIdx})`;
      params.push(contextId);
      paramIdx++;
    }

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
    return { relationships: result.rows, types: CM_RELATIONSHIP_TYPES };
  }

  async createRelationship(data, userId) {
    const { fromArtefactId, toArtefactId, relationshipType, metadata } = data;

    const artefactsResult = await query(
      'SELECT id, project_id, artefact_type FROM artefacts WHERE id = ANY($1::uuid[])',
      [[fromArtefactId, toArtefactId]]
    );

    if (artefactsResult.rows.length !== 2) {
      throw new Error('ARTEFACTS_NOT_FOUND');
    }

    const fromArtefact = artefactsResult.rows.find(a => a.id === fromArtefactId);
    const toArtefact = artefactsResult.rows.find(a => a.id === toArtefactId);

    if (!fromArtefact.artefact_type.startsWith('cm_') && !toArtefact.artefact_type.startsWith('cm_')) {
      throw new Error('NOT_CM_ARTEFACT');
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

    return { relationship: result.rows[0], projectId: fromArtefact.project_id };
  }

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
export const cmRepository = new CMRepository();

export default cmRepository;
