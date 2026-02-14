// lib/repositories/BlueprintRepository.js
// Repository for Blueprint Studio initiative operations
// Task BP-016: Create BlueprintRepository.js

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';
import {
  BPS_STAGES,
  BPS_STAGE_INFO,
  BPS_SCORING_CRITERIA,
  calculateOverallScore,
  calculateSLAStatus,
  checkKillCriteria,
  getNextStage,
  canAdvanceStage,
  calculateFunnelMetrics,
} from '../blueprint-types';

/**
 * Blueprint Initiative Repository
 * Handles CRUD operations for blueprint initiatives (BPS-xxx)
 */
export class BlueprintRepository extends BaseRepository {
  constructor() {
    super('blueprint_initiatives', 'id');
  }

  /**
   * Generate next initiative ID (BPS-001, BPS-002, etc.)
   * @returns {Promise<string>}
   */
  async generateInitiativeId() {
    const result = await query("SELECT nextval('blueprint_initiative_seq') as seq");
    const seq = result.rows[0].seq;
    return `BPS-${String(seq).padStart(3, '0')}`;
  }

  /**
   * Find all initiatives for a domain
   * @param {string} domainId - Domain ID
   * @param {Object} options - Filtering and pagination options
   * @returns {Promise<Object[]>}
   */
  async findByDomain(domainId, options = {}) {
    const {
      stage,
      horizon,
      ownerId,
      search,
      limit,
      offset,
      orderBy = 'created_at',
      orderDirection = 'DESC',
    } = options;

    let sql = `
      SELECT bi.*,
        u1.username as submitter_username,
        u2.username as owner_username,
        u3.username as sponsor_username
      FROM blueprint_initiatives bi
      LEFT JOIN users u1 ON u1.username = bi.submitter_id
      LEFT JOIN users u2 ON u2.username = bi.owner_id
      LEFT JOIN users u3 ON u3.username = bi.sponsor_id
      WHERE bi.domain_id = $1
    `;
    const params = [domainId];
    let paramIndex = 2;

    if (stage) {
      sql += ` AND bi.stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (horizon) {
      sql += ` AND bi.horizon = $${paramIndex}`;
      params.push(horizon);
      paramIndex++;
    }

    if (ownerId) {
      sql += ` AND bi.owner_id = $${paramIndex}`;
      params.push(ownerId);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (bi.name ILIKE $${paramIndex} OR bi.description ILIKE $${paramIndex} OR bi.initiative_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate orderDirection
    const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const validColumns = ['created_at', 'updated_at', 'name', 'stage', 'initiative_id'];
    const orderCol = validColumns.includes(orderBy) ? orderBy : 'created_at';
    sql += ` ORDER BY bi.${orderCol} ${direction}`;

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }
    if (offset) {
      sql += ` OFFSET ${parseInt(offset, 10)}`;
    }

    const result = await query(sql, params);

    // Enrich with computed fields
    return result.rows.map(row => this.enrichInitiative(row));
  }

  /**
   * Find initiative by ID with full details
   * @param {string} id - Initiative UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const sql = `
      SELECT bi.*,
        u1.username as submitter_username,
        u2.username as owner_username,
        u3.username as sponsor_username
      FROM blueprint_initiatives bi
      LEFT JOIN users u1 ON u1.username = bi.submitter_id
      LEFT JOIN users u2 ON u2.username = bi.owner_id
      LEFT JOIN users u3 ON u3.username = bi.sponsor_id
      WHERE bi.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Find initiative by initiative_id (BPS-xxx)
   * @param {string} initiativeId - Initiative ID (e.g., BPS-001)
   * @returns {Promise<Object|null>}
   */
  async findByInitiativeId(initiativeId) {
    const sql = `
      SELECT bi.*,
        u1.username as submitter_username,
        u2.username as owner_username,
        u3.username as sponsor_username
      FROM blueprint_initiatives bi
      LEFT JOIN users u1 ON u1.username = bi.submitter_id
      LEFT JOIN users u2 ON u2.username = bi.owner_id
      LEFT JOIN users u3 ON u3.username = bi.sponsor_id
      WHERE bi.initiative_id = $1
    `;
    const result = await query(sql, [initiativeId]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Create a new initiative
   * @param {Object} data - Initiative data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      domainId,
      projectId,
      name,
      description,
      stage = 'idea',
      horizon,
      submitterId,
      ownerId,
      sponsorId,
      ideaData,
      exploreData,
      assessData,
      caseData,
      tags,
      customFields,
      createdBy,
    } = data;

    // Generate initiative ID
    const initiativeId = await this.generateInitiativeId();

    // Initialize governance data with stage history
    const governanceData = {
      stage_history: [
        {
          stage,
          entered: new Date().toISOString(),
          entered_by: createdBy,
        },
      ],
      sla_status: 'on_track',
      kill_criteria_triggered: [],
    };

    const sql = `
      INSERT INTO blueprint_initiatives (
        domain_id, project_id, initiative_id, name, description,
        stage, horizon, submitter_id, owner_id, sponsor_id,
        idea_data, explore_data, assess_data, case_data,
        governance_data, tags, custom_fields, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const params = [
      domainId,
      projectId || null,
      initiativeId,
      name,
      description || '',
      stage,
      horizon || null,
      submitterId || createdBy,
      ownerId || null,
      sponsorId || null,
      JSON.stringify(ideaData || {}),
      JSON.stringify(exploreData || {}),
      JSON.stringify(assessData || {}),
      JSON.stringify(caseData || {}),
      JSON.stringify(governanceData),
      JSON.stringify(tags || []),
      JSON.stringify(customFields || {}),
      createdBy,
    ];

    const result = await query(sql, params);
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Update an initiative
   * @param {string} id - Initiative UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    const {
      name,
      description,
      horizon,
      ownerId,
      sponsorId,
      ideaData,
      exploreData,
      assessData,
      caseData,
      approvalData,
      tags,
      customFields,
    } = data;

    // Build dynamic update
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }
    if (horizon !== undefined) {
      updates.push(`horizon = $${paramIndex}`);
      params.push(horizon);
      paramIndex++;
    }
    if (ownerId !== undefined) {
      updates.push(`owner_id = $${paramIndex}`);
      params.push(ownerId);
      paramIndex++;
    }
    if (sponsorId !== undefined) {
      updates.push(`sponsor_id = $${paramIndex}`);
      params.push(sponsorId);
      paramIndex++;
    }
    if (ideaData !== undefined) {
      updates.push(`idea_data = $${paramIndex}`);
      params.push(JSON.stringify(ideaData));
      paramIndex++;
    }
    if (exploreData !== undefined) {
      updates.push(`explore_data = $${paramIndex}`);
      params.push(JSON.stringify(exploreData));
      paramIndex++;
    }
    if (assessData !== undefined) {
      updates.push(`assess_data = $${paramIndex}`);
      params.push(JSON.stringify(assessData));
      paramIndex++;
    }
    if (caseData !== undefined) {
      updates.push(`case_data = $${paramIndex}`);
      params.push(JSON.stringify(caseData));
      paramIndex++;
    }
    if (approvalData !== undefined) {
      updates.push(`approval_data = $${paramIndex}`);
      params.push(JSON.stringify(approvalData));
      paramIndex++;
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      params.push(JSON.stringify(tags));
      paramIndex++;
    }
    if (customFields !== undefined) {
      updates.push(`custom_fields = $${paramIndex}`);
      params.push(JSON.stringify(customFields));
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = now()');

    const sql = `
      UPDATE blueprint_initiatives
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Advance initiative to next stage
   * @param {string} id - Initiative UUID
   * @param {Object} options - Advance options
   * @returns {Promise<Object|null>}
   */
  async advanceStage(id, options = {}) {
    const { decision = 'approved', decisionBy, notes, conditions } = options;

    // Get current initiative
    const initiative = await this.findById(id);
    if (!initiative) return null;

    const currentStage = initiative.stage;
    const nextStage = decision === 'declined' ? 'declined' : getNextStage(currentStage);

    if (!nextStage && decision !== 'declined') {
      throw new Error(`Cannot advance from stage: ${currentStage}`);
    }

    // Update governance data
    const governanceData = initiative.governance_data || { stage_history: [] };
    governanceData.stage_history = governanceData.stage_history || [];

    // Record exit from current stage
    const currentEntry = governanceData.stage_history.find(h => h.stage === currentStage && !h.exited);
    if (currentEntry) {
      currentEntry.exited = new Date().toISOString();
      currentEntry.exited_by = decisionBy;
      currentEntry.exit_decision = decision;
    }

    // Record entry to new stage
    governanceData.stage_history.push({
      stage: nextStage,
      entered: new Date().toISOString(),
      entered_by: decisionBy,
    });

    // Record gate decision
    governanceData.gate_decisions = governanceData.gate_decisions || [];
    governanceData.gate_decisions.push({
      from_stage: currentStage,
      to_stage: nextStage,
      decision,
      decision_by: decisionBy,
      decision_date: new Date().toISOString(),
      notes,
      conditions,
    });

    const sql = `
      UPDATE blueprint_initiatives
      SET stage = $2, governance_data = $3, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, nextStage, JSON.stringify(governanceData)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Update scoring for an initiative
   * @param {string} id - Initiative UUID
   * @param {Object} scores - Scoring data
   * @returns {Promise<Object|null>}
   */
  async updateScoring(id, scores) {
    // Get current initiative
    const initiative = await this.findById(id);
    if (!initiative) return null;

    const assessData = initiative.assess_data || {};

    // Update individual scores
    Object.entries(scores).forEach(([criterion, data]) => {
      if (BPS_SCORING_CRITERIA[criterion]) {
        assessData[criterion] = {
          score: data.score,
          rationale: data.rationale || '',
          scored_by: data.scoredBy,
          scored_at: new Date().toISOString(),
        };
      }
    });

    // Calculate overall score
    assessData.overall_score = calculateOverallScore(assessData);

    const sql = `
      UPDATE blueprint_initiatives
      SET assess_data = $2, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, JSON.stringify(assessData)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Delete an initiative
   * @param {string} id - Initiative UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await query('DELETE FROM blueprint_initiatives WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get funnel metrics for a domain
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>}
   */
  async getFunnelMetrics(domainId) {
    const sql = `
      SELECT
        stage,
        horizon,
        COUNT(*) as count,
        AVG((assess_data->>'overall_score')::numeric) as avg_score
      FROM blueprint_initiatives
      WHERE domain_id = $1
      GROUP BY stage, horizon
    `;
    const result = await query(sql, [domainId]);

    // Build metrics
    const byStage = {};
    const byHorizon = { h1: 0, h2: 0, h3: 0, unknown: 0 };

    BPS_STAGES.forEach(stage => {
      byStage[stage] = 0;
    });

    result.rows.forEach(row => {
      byStage[row.stage] = (byStage[row.stage] || 0) + parseInt(row.count, 10);
      if (row.horizon) {
        byHorizon[row.horizon] = (byHorizon[row.horizon] || 0) + parseInt(row.count, 10);
      } else {
        byHorizon.unknown += parseInt(row.count, 10);
      }
    });

    const total = Object.values(byStage).reduce((sum, count) => sum + count, 0);
    const active = total - (byStage.approved || 0) - (byStage.declined || 0);

    return {
      byStage,
      byHorizon,
      total,
      active,
    };
  }

  // ============================================================================
  // INITIATIVE V2: Strategic Container Methods
  // ============================================================================

  /**
   * Update initiative status (open/closed)
   * @param {string} id - Initiative UUID
   * @param {string} status - 'open' or 'closed'
   * @param {string} [closedBy] - User who closed
   * @returns {Promise<Object|null>}
   */
  async updateInitiativeStatus(id, status, closedBy = null) {
    const validStatuses = ['open', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updates = ['initiative_status = $2', 'updated_at = now()'];
    const params = [id, status];

    if (status === 'closed' && closedBy) {
      // Record closure in strategic_context
      const initiative = await this.findById(id);
      const strategicContext = initiative?.strategic_context || {};
      strategicContext.closed_at = new Date().toISOString();
      strategicContext.closed_by = closedBy;

      updates.push('strategic_context = $3');
      params.push(JSON.stringify(strategicContext));
    }

    const sql = `
      UPDATE blueprint_initiatives
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Update strategic context for an initiative
   * @param {string} id - Initiative UUID
   * @param {Object} context - Strategic context data
   * @returns {Promise<Object|null>}
   */
  async updateStrategicContext(id, context) {
    const initiative = await this.findById(id);
    if (!initiative) return null;

    const existingContext = initiative.strategic_context || {};
    const mergedContext = { ...existingContext, ...context };

    const sql = `
      UPDATE blueprint_initiatives
      SET strategic_context = $2, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id, JSON.stringify(mergedContext)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Update critical assessment for an initiative
   * @param {string} id - Initiative UUID
   * @param {Object} assessment - Critical assessment from AI
   * @returns {Promise<Object|null>}
   */
  async updateCriticalAssessment(id, assessment) {
    const sql = `
      UPDATE blueprint_initiatives
      SET critical_assessment = $2, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id, JSON.stringify(assessment)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Find initiatives by status (open/closed)
   * @param {string} domainId - Domain ID
   * @param {string} status - 'open' or 'closed'
   * @param {Object} options - Additional options
   * @returns {Promise<Object[]>}
   */
  async findByStatus(domainId, status, options = {}) {
    const {
      search,
      limit,
      offset,
      orderBy = 'created_at',
      orderDirection = 'DESC',
    } = options;

    let sql = `
      SELECT bi.*,
        u1.username as submitter_username,
        u2.username as owner_username,
        (SELECT COUNT(*) FROM blueprint_product_ideas pi WHERE pi.initiative_id = bi.id) as product_idea_count
      FROM blueprint_initiatives bi
      LEFT JOIN users u1 ON u1.username = bi.submitter_id
      LEFT JOIN users u2 ON u2.username = bi.owner_id
      WHERE bi.domain_id = $1
        AND (bi.initiative_status = $2 OR bi.initiative_status IS NULL)
    `;
    const params = [domainId, status];
    let paramIndex = 3;

    if (search) {
      sql += ` AND (bi.name ILIKE $${paramIndex} OR bi.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const validColumns = ['created_at', 'updated_at', 'name'];
    const orderCol = validColumns.includes(orderBy) ? orderBy : 'created_at';
    sql += ` ORDER BY bi.${orderCol} ${direction}`;

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }
    if (offset) {
      sql += ` OFFSET ${parseInt(offset, 10)}`;
    }

    const result = await query(sql, params);
    return result.rows.map(row => this.enrichInitiative(row));
  }

  /**
   * Get initiative with product ideas summary
   * @param {string} id - Initiative UUID
   * @returns {Promise<Object|null>}
   */
  async findWithProductIdeas(id) {
    const initiative = await this.findById(id);
    if (!initiative) return null;

    // Get product ideas summary
    const summaryResult = await query(`
      SELECT
        stage,
        selection_status,
        COUNT(*) as count
      FROM blueprint_product_ideas
      WHERE initiative_id = $1
      GROUP BY stage, selection_status
    `, [id]);

    // Get product ideas list
    const ideasResult = await query(`
      SELECT id, product_idea_id, name, tagline, stage, selection_status, validation_priority
      FROM blueprint_product_ideas
      WHERE initiative_id = $1
      ORDER BY validation_priority ASC, created_at ASC
    `, [id]);

    initiative.product_ideas_summary = {
      total: ideasResult.rows.length,
      by_stage: {},
      by_status: {},
    };

    summaryResult.rows.forEach(row => {
      initiative.product_ideas_summary.by_stage[row.stage] =
        (initiative.product_ideas_summary.by_stage[row.stage] || 0) + parseInt(row.count, 10);
      initiative.product_ideas_summary.by_status[row.selection_status] =
        (initiative.product_ideas_summary.by_status[row.selection_status] || 0) + parseInt(row.count, 10);
    });

    initiative.product_ideas = ideasResult.rows.map(row => ({
      id: row.id,
      displayId: row.product_idea_id,
      name: row.name,
      tagline: row.tagline,
      stage: row.stage,
      selectionStatus: row.selection_status,
      validationPriority: row.validation_priority,
    }));

    return initiative;
  }

  /**
   * Record a hold decision (don't change stage, just update governance data)
   * @param {string} id - Initiative UUID
   * @param {Object} options - { decisionBy, notes }
   * @returns {Promise<Object|null>}
   */
  async recordHoldDecision(id, options = {}) {
    const { decisionBy, notes } = options;
    const initiative = await this.findById(id);
    if (!initiative) return null;

    const governanceData = initiative.governance_data || { stage_history: [], gate_decisions: [] };
    governanceData.gate_decisions = governanceData.gate_decisions || [];

    governanceData.gate_decisions.push({
      from_stage: initiative.stage,
      to_stage: initiative.stage, // stays the same
      decision: 'hold',
      decision_by: decisionBy,
      decision_date: new Date().toISOString(),
      notes,
    });

    governanceData.hold_status = {
      held_at: new Date().toISOString(),
      held_by: decisionBy,
      reason: notes,
    };

    const sql = `
      UPDATE blueprint_initiatives
      SET governance_data = $2, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, JSON.stringify(governanceData)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Recycle initiative to a previous stage
   * @param {string} id - Initiative UUID
   * @param {Object} options - { targetStage, decisionBy, notes }
   * @returns {Promise<Object|null>}
   */
  async recycleToStage(id, options = {}) {
    const { targetStage, decisionBy, notes } = options;
    const initiative = await this.findById(id);
    if (!initiative) return null;

    const stageOrder = ['idea', 'explore', 'assess', 'case', 'approval'];
    const currentIdx = stageOrder.indexOf(initiative.stage);
    const targetIdx = stageOrder.indexOf(targetStage);

    if (targetIdx === -1 || targetIdx >= currentIdx) {
      throw new Error(`Cannot recycle from ${initiative.stage} to ${targetStage} — target must be an earlier stage`);
    }

    const governanceData = initiative.governance_data || { stage_history: [], gate_decisions: [] };
    governanceData.gate_decisions = governanceData.gate_decisions || [];
    governanceData.stage_history = governanceData.stage_history || [];

    // Record exit from current stage
    const currentEntry = governanceData.stage_history.find(h => h.stage === initiative.stage && !h.exited);
    if (currentEntry) {
      currentEntry.exited = new Date().toISOString();
      currentEntry.exited_by = decisionBy;
      currentEntry.exit_decision = 'recycle';
    }

    // Record re-entry to target stage
    governanceData.stage_history.push({
      stage: targetStage,
      entered: new Date().toISOString(),
      entered_by: decisionBy,
      entry_reason: 'recycle',
    });

    governanceData.gate_decisions.push({
      from_stage: initiative.stage,
      to_stage: targetStage,
      decision: 'recycle',
      decision_by: decisionBy,
      decision_date: new Date().toISOString(),
      notes,
    });

    const sql = `
      UPDATE blueprint_initiatives
      SET stage = $2, governance_data = $3, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, targetStage, JSON.stringify(governanceData)]);
    if (result.rows.length === 0) return null;
    return this.enrichInitiative(result.rows[0]);
  }

  /**
   * Enrich initiative with computed fields
   * @param {Object} initiative - Raw initiative from database
   * @returns {Object}
   */
  enrichInitiative(initiative) {
    if (!initiative) return null;

    // Parse JSONB fields if they're strings
    const parsed = { ...initiative };
    ['idea_data', 'explore_data', 'assess_data', 'case_data', 'governance_data', 'approval_data', 'tags', 'custom_fields', 'strategic_context', 'critical_assessment'].forEach(field => {
      if (typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch {
          parsed[field] = field === 'tags' ? [] : {};
        }
      }
    });

    // Add status alias for frontend compatibility (frontend uses 'status', database uses 'stage')
    // For V2, also support initiative_status for open/closed
    parsed.status = parsed.stage;
    parsed.initiativeStatus = parsed.initiative_status || 'open';

    // Map snake_case JSONB fields to camelCase for frontend consistency
    parsed.idea = parsed.idea_data;
    parsed.explore = parsed.explore_data;
    parsed.assess = parsed.assess_data;
    parsed.case = parsed.case_data;
    parsed.governance = parsed.governance_data;
    parsed.approval = parsed.approval_data;
    parsed.customFields = parsed.custom_fields;
    parsed.strategicContext = parsed.strategic_context;
    parsed.criticalAssessment = parsed.critical_assessment;
    parsed.display_id = parsed.initiative_id;

    // Add computed fields (for backward compatibility with V1)
    parsed.stage_info = BPS_STAGE_INFO[parsed.stage];
    parsed.sla_status = calculateSLAStatus(parsed);
    parsed.triggered_kill_criteria = checkKillCriteria(parsed);
    parsed.can_advance = canAdvanceStage(parsed);
    parsed.next_stage = getNextStage(parsed.stage);

    return parsed;
  }
}

// Export singleton instance
export const blueprintRepository = new BlueprintRepository();
