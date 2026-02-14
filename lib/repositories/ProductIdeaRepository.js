// lib/repositories/ProductIdeaRepository.js
// Repository for Blueprint Product Ideas (breakdown items under initiatives)

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
} from '../blueprint-types';

/**
 * Product Idea Repository
 * Handles CRUD operations for product ideas (PI-xxx) under initiatives
 */
export class ProductIdeaRepository extends BaseRepository {
  constructor() {
    super('blueprint_product_ideas', 'id');
    this._tableEnsured = false;
  }

  /**
   * Ensure product ideas table and sequence exist
   */
  async ensureTableExists() {
    if (this._tableEnsured) return;
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS blueprint_product_ideas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          initiative_id UUID NOT NULL REFERENCES blueprint_initiatives(id) ON DELETE CASCADE,
          domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
          product_idea_id VARCHAR(20) NOT NULL,
          name VARCHAR(500) NOT NULL,
          tagline VARCHAR(500),
          description TEXT,
          stage VARCHAR(50) DEFAULT 'idea',
          horizon VARCHAR(10),
          idea_type VARCHAR(50),
          technology_posture VARCHAR(50),
          risk_profile VARCHAR(50),
          owner_id VARCHAR(255),
          idea_data JSONB DEFAULT '{}'::jsonb,
          explore_data JSONB DEFAULT '{}'::jsonb,
          assess_data JSONB DEFAULT '{}'::jsonb,
          case_data JSONB DEFAULT '{}'::jsonb,
          approval_data JSONB DEFAULT '{}'::jsonb,
          canvas_data JSONB DEFAULT '{}'::jsonb,
          governance_data JSONB DEFAULT '{}'::jsonb,
          ai_comparison JSONB DEFAULT '{}'::jsonb,
          validation_priority INTEGER DEFAULT 1,
          market_fit_hypothesis TEXT,
          estimated_investment NUMERIC,
          estimated_annual_cost NUMERIC,
          payback_months INTEGER,
          cost_savings_ratio NUMERIC,
          selection_status VARCHAR(50) DEFAULT 'proposed',
          selected_at TIMESTAMPTZ,
          selected_by VARCHAR(255),
          tags JSONB DEFAULT '[]'::jsonb,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          CONSTRAINT unique_product_idea_id UNIQUE (domain_id, product_idea_id)
        )
      `);
      await query(`CREATE SEQUENCE IF NOT EXISTS blueprint_product_idea_seq START 1`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_ideas_initiative ON blueprint_product_ideas(initiative_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_ideas_domain ON blueprint_product_ideas(domain_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_ideas_stage ON blueprint_product_ideas(stage)`);
      this._tableEnsured = true;
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('[ProductIdeaRepository] ensureTableExists error:', err.message);
      }
      this._tableEnsured = true;
    }
  }

  /**
   * Generate next product idea ID (PI-001, PI-002, etc.)
   * @returns {Promise<string>}
   */
  async generateProductIdeaId() {
    const result = await query("SELECT nextval('blueprint_product_idea_seq') as seq");
    const seq = result.rows[0].seq;
    return `PI-${String(seq).padStart(3, '0')}`;
  }

  /**
   * Find all product ideas for an initiative
   * @param {string} initiativeId - Initiative UUID
   * @param {Object} options - Filtering options
   * @returns {Promise<Object[]>}
   */
  async findByInitiative(initiativeId, options = {}) {
    const {
      stage,
      selectionStatus,
      orderBy = 'validation_priority',
      orderDirection = 'ASC',
    } = options;

    let sql = `
      SELECT pi.*,
        bi.name as initiative_name,
        bi.initiative_id as initiative_display_id
      FROM blueprint_product_ideas pi
      JOIN blueprint_initiatives bi ON bi.id = pi.initiative_id
      WHERE pi.initiative_id = $1
    `;
    const params = [initiativeId];
    let paramIndex = 2;

    if (stage) {
      sql += ` AND pi.stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (selectionStatus) {
      sql += ` AND pi.selection_status = $${paramIndex}`;
      params.push(selectionStatus);
      paramIndex++;
    }

    const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const validColumns = ['validation_priority', 'created_at', 'updated_at', 'name', 'stage'];
    const orderCol = validColumns.includes(orderBy) ? orderBy : 'validation_priority';
    sql += ` ORDER BY pi.${orderCol} ${direction}`;

    const result = await query(sql, params);
    return result.rows.map(row => this.enrichProductIdea(row));
  }

  /**
   * Find all product ideas for a domain (across all initiatives)
   * @param {string} domainId - Domain UUID
   * @param {Object} options - Filtering options
   * @returns {Promise<Object[]>}
   */
  async findByDomain(domainId, options = {}) {
    const {
      stage,
      initiativeId,
      selectionStatus,
      search,
      limit,
      offset,
      orderBy = 'created_at',
      orderDirection = 'DESC',
    } = options;

    let sql = `
      SELECT pi.*,
        bi.name as initiative_name,
        bi.initiative_id as initiative_display_id
      FROM blueprint_product_ideas pi
      JOIN blueprint_initiatives bi ON bi.id = pi.initiative_id
      WHERE pi.domain_id = $1
    `;
    const params = [domainId];
    let paramIndex = 2;

    if (stage) {
      sql += ` AND pi.stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (initiativeId) {
      sql += ` AND pi.initiative_id = $${paramIndex}`;
      params.push(initiativeId);
      paramIndex++;
    }

    if (selectionStatus) {
      sql += ` AND pi.selection_status = $${paramIndex}`;
      params.push(selectionStatus);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (pi.name ILIKE $${paramIndex} OR pi.description ILIKE $${paramIndex} OR pi.product_idea_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const validColumns = ['created_at', 'updated_at', 'name', 'stage', 'validation_priority'];
    const orderCol = validColumns.includes(orderBy) ? orderBy : 'created_at';
    sql += ` ORDER BY pi.${orderCol} ${direction}`;

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }
    if (offset) {
      sql += ` OFFSET ${parseInt(offset, 10)}`;
    }

    const result = await query(sql, params);
    return result.rows.map(row => this.enrichProductIdea(row));
  }

  /**
   * Find product idea by ID
   * @param {string} id - Product idea UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const sql = `
      SELECT pi.*,
        bi.name as initiative_name,
        bi.initiative_id as initiative_display_id
      FROM blueprint_product_ideas pi
      JOIN blueprint_initiatives bi ON bi.id = pi.initiative_id
      WHERE pi.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) return null;
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Find product idea by display ID (PI-xxx)
   * @param {string} productIdeaId - Display ID
   * @param {string} domainId - Domain UUID (optional)
   * @returns {Promise<Object|null>}
   */
  async findByDisplayId(productIdeaId, domainId = null) {
    let sql = `
      SELECT pi.*,
        bi.name as initiative_name,
        bi.initiative_id as initiative_display_id
      FROM blueprint_product_ideas pi
      JOIN blueprint_initiatives bi ON bi.id = pi.initiative_id
      WHERE pi.product_idea_id = $1
    `;
    const params = [productIdeaId];

    if (domainId) {
      sql += ` AND pi.domain_id = $2`;
      params.push(domainId);
    }

    const result = await query(sql, params);
    if (result.rows.length === 0) return null;
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Create a new product idea
   * @param {Object} data - Product idea data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      initiativeId,
      domainId,
      name,
      tagline,
      description,
      stage = 'idea',
      horizon,
      ideaType,
      technologyPosture,
      riskProfile,
      ownerId,
      ideaData,
      exploreData,
      assessData,
      caseData,
      canvasData,
      aiComparison,
      validationPriority = 1,
      marketFitHypothesis,
      estimatedInvestment,
      estimatedAnnualCost,
      paybackMonths,
      costSavingsRatio,
      tags,
      customFields,
      createdBy,
    } = data;

    // Generate product idea ID
    const productIdeaId = await this.generateProductIdeaId();

    // Initialize governance data
    const governanceData = {
      stage_history: [
        {
          stage,
          entered: new Date().toISOString(),
          entered_by: createdBy,
        },
      ],
      sla_status: 'on_track',
    };

    const sql = `
      INSERT INTO blueprint_product_ideas (
        initiative_id, domain_id, product_idea_id, name, tagline, description,
        stage, horizon, idea_type, technology_posture, risk_profile, owner_id,
        idea_data, explore_data, assess_data, case_data, canvas_data,
        governance_data, ai_comparison,
        validation_priority, market_fit_hypothesis,
        estimated_investment, estimated_annual_cost, payback_months, cost_savings_ratio,
        tags, custom_fields, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *
    `;
    const params = [
      initiativeId,
      domainId,
      productIdeaId,
      name,
      tagline || null,
      description || '',
      stage,
      horizon || null,
      ideaType || null,
      technologyPosture || null,
      riskProfile || null,
      ownerId || null,
      JSON.stringify(ideaData || {}),
      JSON.stringify(exploreData || {}),
      JSON.stringify(assessData || {}),
      JSON.stringify(caseData || {}),
      JSON.stringify(canvasData || {}),
      JSON.stringify(governanceData),
      JSON.stringify(aiComparison || {}),
      validationPriority,
      marketFitHypothesis || null,
      estimatedInvestment || null,
      estimatedAnnualCost || null,
      paybackMonths || null,
      costSavingsRatio || null,
      JSON.stringify(tags || []),
      JSON.stringify(customFields || {}),
      createdBy,
    ];

    const result = await query(sql, params);
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Create multiple product ideas from AI import
   * @param {string} initiativeId - Parent initiative UUID
   * @param {string} domainId - Domain UUID
   * @param {Object[]} productIdeas - Array of product idea data from AI
   * @param {string} createdBy - User who imported
   * @returns {Promise<Object[]>}
   */
  async createFromAIImport(initiativeId, domainId, productIdeas, createdBy) {
    const created = [];

    for (let i = 0; i < productIdeas.length; i++) {
      const idea = productIdeas[i];

      const productIdea = await this.create({
        initiativeId,
        domainId,
        name: idea.name,
        tagline: idea.tagline,
        description: idea.description,
        stage: idea.recommended_stage || 'idea',
        ideaType: idea.type,
        technologyPosture: idea.technology_posture,
        riskProfile: idea.risk_profile,
        ideaData: {
          description: idea.description,
          market_fit_hypothesis: idea.market_fit_hypothesis,
          key_characteristics: idea.key_characteristics,
        },
        canvasData: {},
        aiComparison: idea.ai_comparison,
        validationPriority: idea.validation_priority || i + 1,
        marketFitHypothesis: idea.market_fit_hypothesis,
        estimatedInvestment: idea.estimated_investment,
        estimatedAnnualCost: idea.estimated_annual_cost,
        paybackMonths: idea.payback_months,
        costSavingsRatio: idea.cost_savings_ratio,
        customFields: {
          pros: idea.pros,
          cons: idea.cons,
          risks_specific: idea.risks_specific,
        },
        createdBy,
      });

      created.push(productIdea);
    }

    return created;
  }

  /**
   * Update a product idea
   * @param {string} id - Product idea UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    const updateableFields = {
      name: 'name',
      tagline: 'tagline',
      description: 'description',
      horizon: 'horizon',
      ideaType: 'idea_type',
      technologyPosture: 'technology_posture',
      riskProfile: 'risk_profile',
      ownerId: 'owner_id',
      ideaData: 'idea_data',
      exploreData: 'explore_data',
      assessData: 'assess_data',
      caseData: 'case_data',
      canvasData: 'canvas_data',
      approvalData: 'approval_data',
      aiComparison: 'ai_comparison',
      validationPriority: 'validation_priority',
      marketFitHypothesis: 'market_fit_hypothesis',
      estimatedInvestment: 'estimated_investment',
      estimatedAnnualCost: 'estimated_annual_cost',
      paybackMonths: 'payback_months',
      costSavingsRatio: 'cost_savings_ratio',
      selectionStatus: 'selection_status',
      tags: 'tags',
      customFields: 'custom_fields',
    };

    const updates = [];
    const params = [id];
    let paramIndex = 2;

    Object.entries(data).forEach(([key, value]) => {
      const dbField = updateableFields[key];
      if (dbField && value !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        // JSON fields need stringify
        const jsonFields = ['idea_data', 'explore_data', 'assess_data', 'case_data', 'canvas_data', 'approval_data', 'ai_comparison', 'tags', 'custom_fields'];
        params.push(jsonFields.includes(dbField) ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    // Handle selection status changes
    if (data.selectionStatus === 'selected' && !data.selectedAt) {
      updates.push(`selected_at = now()`);
      if (data.selectedBy) {
        updates.push(`selected_by = $${paramIndex}`);
        params.push(data.selectedBy);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = now()');

    const sql = `
      UPDATE blueprint_product_ideas
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) return null;
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Advance product idea to next stage
   * @param {string} id - Product idea UUID
   * @param {Object} options - Advance options
   * @returns {Promise<Object|null>}
   */
  async advanceStage(id, options = {}) {
    const { decision = 'approved', decisionBy, notes, conditions } = options;

    const productIdea = await this.findById(id);
    if (!productIdea) return null;

    const currentStage = productIdea.stage;
    const nextStage = decision === 'declined' ? 'declined' : getNextStage(currentStage);

    if (!nextStage && decision !== 'declined') {
      throw new Error(`Cannot advance from stage: ${currentStage}`);
    }

    // Update governance data
    const governanceData = productIdea.governance_data || { stage_history: [] };
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
      UPDATE blueprint_product_ideas
      SET stage = $2, governance_data = $3, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, nextStage, JSON.stringify(governanceData)]);
    if (result.rows.length === 0) return null;
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Update scoring for a product idea
   * @param {string} id - Product idea UUID
   * @param {Object} scores - Scoring data
   * @returns {Promise<Object|null>}
   */
  async updateScoring(id, scores) {
    const productIdea = await this.findById(id);
    if (!productIdea) return null;

    const assessData = productIdea.assess_data || {};

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

    assessData.overall_score = calculateOverallScore(assessData);

    const sql = `
      UPDATE blueprint_product_ideas
      SET assess_data = $2, updated_at = now()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, JSON.stringify(assessData)]);
    if (result.rows.length === 0) return null;
    return this.enrichProductIdea(result.rows[0]);
  }

  /**
   * Select a product idea for execution
   * @param {string} id - Product idea UUID
   * @param {string} selectedBy - User who selected
   * @returns {Promise<Object|null>}
   */
  async select(id, selectedBy) {
    return this.update(id, {
      selectionStatus: 'selected',
      selectedBy,
    });
  }

  /**
   * Delete a product idea
   * @param {string} id - Product idea UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await query('DELETE FROM blueprint_product_ideas WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get stage metrics for an initiative's product ideas
   * @param {string} initiativeId - Initiative UUID
   * @returns {Promise<Object>}
   */
  async getStageMetrics(initiativeId) {
    const sql = `
      SELECT
        stage,
        selection_status,
        COUNT(*) as count
      FROM blueprint_product_ideas
      WHERE initiative_id = $1
      GROUP BY stage, selection_status
    `;
    const result = await query(sql, [initiativeId]);

    const byStage = {};
    const byStatus = {};

    BPS_STAGES.forEach(stage => {
      byStage[stage] = 0;
    });

    result.rows.forEach(row => {
      byStage[row.stage] = (byStage[row.stage] || 0) + parseInt(row.count, 10);
      byStatus[row.selection_status] = (byStatus[row.selection_status] || 0) + parseInt(row.count, 10);
    });

    const total = Object.values(byStage).reduce((sum, count) => sum + count, 0);

    return {
      byStage,
      byStatus,
      total,
    };
  }

  /**
   * Enrich product idea with computed fields
   * @param {Object} productIdea - Raw product idea from database
   * @returns {Object}
   */
  enrichProductIdea(productIdea) {
    if (!productIdea) return null;

    const parsed = { ...productIdea };

    // Parse JSONB fields
    const jsonFields = ['idea_data', 'explore_data', 'assess_data', 'case_data', 'canvas_data', 'approval_data', 'governance_data', 'ai_comparison', 'tags', 'custom_fields'];
    jsonFields.forEach(field => {
      if (typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch {
          parsed[field] = field === 'tags' ? [] : {};
        }
      }
    });

    // Add status alias (frontend uses 'status', database uses 'stage')
    parsed.status = parsed.stage;

    // Map to camelCase for frontend
    parsed.productIdeaId = parsed.product_idea_id;
    parsed.display_id = parsed.product_idea_id;
    parsed.initiativeId = parsed.initiative_id;
    parsed.ideaType = parsed.idea_type;
    parsed.technologyPosture = parsed.technology_posture;
    parsed.riskProfile = parsed.risk_profile;
    parsed.ownerId = parsed.owner_id;
    parsed.selectionStatus = parsed.selection_status;
    parsed.validationPriority = parsed.validation_priority;
    parsed.marketFitHypothesis = parsed.market_fit_hypothesis;
    parsed.estimatedInvestment = parsed.estimated_investment;
    parsed.estimatedAnnualCost = parsed.estimated_annual_cost;
    parsed.paybackMonths = parsed.payback_months;
    parsed.costSavingsRatio = parsed.cost_savings_ratio;
    parsed.customFields = parsed.custom_fields;

    // Add computed fields
    parsed.stage_info = BPS_STAGE_INFO[parsed.stage];
    parsed.sla_status = calculateSLAStatus(parsed);
    parsed.triggered_kill_criteria = checkKillCriteria(parsed);
    parsed.can_advance = canAdvanceStage(parsed);
    parsed.next_stage = getNextStage(parsed.stage);

    return parsed;
  }
}

// Export singleton instance
export const productIdeaRepository = new ProductIdeaRepository();
