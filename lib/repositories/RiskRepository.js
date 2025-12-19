/**
 * Risk and Resilience Repository
 *
 * Data access layer for risk management artefacts including risks,
 * controls, scenarios, resilience measures, and assessments.
 *
 * @module RiskRepository
 */

import { BaseRepository } from './BaseRepository.js';
import { query } from '../pg.js';
import {
  isRiskType,
  getRiskTypeDef,
  calculateRiskScore,
  getRiskLevel,
  RISK_TYPE_DEFS,
  RISK_CATEGORIES,
  RISK_STAGES,
  CONTROL_EFFECTIVENESS,
  RESILIENCE_MATURITY,
} from '../risk-types.js';

/**
 * Repository for risk and resilience artefacts
 * @extends BaseRepository
 */
export class RiskRepository extends BaseRepository {
  constructor() {
    super('artefacts');
  }

  /**
   * Find all risk artefacts for a domain
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
        AND a.artefact_type LIKE 'risk_%'
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
    if (stage) {
      sql += ` AND a.custom_fields->>'stage' = $${paramIdx}`;
      params.push(stage);
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
    let countSql = `SELECT COUNT(*) as total FROM artefacts WHERE domain_id = $1 AND artefact_type LIKE 'risk_%'`;
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
   * Find all risk artefacts for a project (legacy - use findByDomain)
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of risk artefacts
   */
  async findByProject(projectId) {
    const allArtefacts = await this.findAll();
    return allArtefacts.filter(
      a => a.projectId === projectId && isRiskType(a.type)
    );
  }

  /**
   * Find artefacts by specific type within a project
   * @param {string} projectId - Project ID
   * @param {string} type - Artefact type (e.g., 'risk_risk', 'risk_control')
   * @returns {Promise<Array>}
   */
  async findByType(projectId, type) {
    const artefacts = await this.findByProject(projectId);
    return artefacts.filter(a => a.type === type);
  }

  /**
   * Find risks with their associated controls
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Risks with controls array
   */
  async findRisksWithControls(projectId) {
    const artefacts = await this.findByProject(projectId);
    const risks = artefacts.filter(a => a.type === 'risk_risk');
    const controls = artefacts.filter(a => a.type === 'risk_control');
    const relationships = await this.getRelationships(projectId);

    return risks.map(risk => {
      const riskControlRels = relationships.filter(
        r => (r.sourceId === risk.id || r.targetId === risk.id) &&
             r.type === 'mitigates'
      );
      const controlIds = riskControlRels.map(r =>
        r.sourceId === risk.id ? r.targetId : r.sourceId
      );
      return {
        ...risk,
        controls: controls.filter(c => controlIds.includes(c.id)),
        riskScore: calculateRiskScore(risk.properties?.likelihood, risk.properties?.impact),
        riskLevel: getRiskLevel(calculateRiskScore(risk.properties?.likelihood, risk.properties?.impact)),
      };
    });
  }

  /**
   * Get relationships for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>}
   */
  async getRelationships(projectId) {
    // In a real implementation, this would query a relationships table
    // For now, return empty array - relationships stored in artefact properties
    return [];
  }

  /**
   * Create a new risk artefact
   * @param {Object} data - Artefact data
   * @param {string} data.domainId - Domain UUID (required)
   * @param {string} [data.projectId] - Project UUID (optional)
   * @param {string} data.artefactType - Artefact type (risk_risk, risk_control, etc.)
   * @returns {Promise<Object>} Created artefact
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

    if (!isRiskType(artefactType)) {
      throw new Error(`Invalid risk type: ${artefactType}`);
    }

    // Add risk-specific calculated fields
    let mergedCustomFields = { ...customFields };
    if (artefactType === 'risk_risk') {
      const likelihood = customFields?.likelihood || 1;
      const impact = customFields?.impact || 1;
      mergedCustomFields.riskScore = calculateRiskScore(likelihood, impact);
    }

    // Ensure stage is set
    if (!mergedCustomFields.stage) {
      mergedCustomFields.stage = 'identified';
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
        JSON.stringify(mergedCustomFields),
        createdBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an existing risk artefact
   * @param {string} id - Artefact ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated artefact
   */
  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Artefact not found: ${id}`);
    }

    const updated = {
      ...existing,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      properties: {
        ...existing.properties,
        ...data.properties,
      },
      updatedAt: new Date().toISOString(),
    };

    // Recalculate risk score if likelihood or impact changed
    if (updated.type === 'risk_risk') {
      const likelihood = updated.properties?.likelihood || 1;
      const impact = updated.properties?.impact || 1;
      updated.properties.riskScore = calculateRiskScore(likelihood, impact);
    }

    return this.save(updated);
  }

  /**
   * Get statistics for the risk module
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(domainId) {
    const { artefacts } = await this.findByDomain(domainId);

    const stats = {
      totalArtefacts: artefacts.length,
      byType: {},
      byCategory: {},
      byStage: {},
      risks: {
        total: 0,
        byLevel: { critical: 0, high: 0, medium: 0, low: 0, veryLow: 0 },
        byCategory: {},
      },
      controls: {
        total: 0,
        byEffectiveness: {},
      },
      resilience: {
        total: 0,
        byMaturity: {},
      },
      scenarios: { total: 0 },
      assessments: { total: 0 },
    };

    // Count by type
    Object.keys(RISK_TYPE_DEFS).forEach(type => {
      stats.byType[type] = artefacts.filter(a => a.artefact_type === type).length;
    });

    // Analyze risks
    const risks = artefacts.filter(a => a.artefact_type === 'risk_risk');
    stats.risks.total = risks.length;

    risks.forEach(risk => {
      // By level
      const customFields = risk.custom_fields || {};
      const score = calculateRiskScore(customFields.likelihood, customFields.impact);
      const level = getRiskLevel(score);
      const levelKey = level.label.toLowerCase().replace(' ', '');
      stats.risks.byLevel[levelKey] = (stats.risks.byLevel[levelKey] || 0) + 1;

      // By category
      const category = customFields.category || 'uncategorized';
      stats.risks.byCategory[category] = (stats.risks.byCategory[category] || 0) + 1;
    });

    // Analyze controls
    const controls = artefacts.filter(a => a.artefact_type === 'risk_control');
    stats.controls.total = controls.length;

    controls.forEach(control => {
      const customFields = control.custom_fields || {};
      const effectiveness = customFields.effectiveness || 'not_effective';
      stats.controls.byEffectiveness[effectiveness] =
        (stats.controls.byEffectiveness[effectiveness] || 0) + 1;
    });

    // Analyze resilience
    const resilience = artefacts.filter(a => a.artefact_type === 'risk_resilience');
    stats.resilience.total = resilience.length;

    resilience.forEach(res => {
      const customFields = res.custom_fields || {};
      const maturity = customFields.maturity || 'initial';
      stats.resilience.byMaturity[maturity] =
        (stats.resilience.byMaturity[maturity] || 0) + 1;
    });

    // Count scenarios and assessments
    stats.scenarios.total = artefacts.filter(a => a.artefact_type === 'risk_scenario').length;
    stats.assessments.total = artefacts.filter(a => a.artefact_type === 'risk_assessment').length;

    // By stage
    Object.keys(RISK_STAGES).forEach(stage => {
      stats.byStage[stage] = artefacts.filter(a => (a.custom_fields || {}).stage === stage).length;
    });

    return stats;
  }

  /**
   * Get risk heat map data
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Heat map data structure
   */
  async getRiskHeatMap(domainId) {
    const { artefacts } = await this.findByDomain(domainId, { type: 'risk_risk' });

    // Initialize 5x5 matrix
    const matrix = Array(5).fill(null).map(() =>
      Array(5).fill(null).map(() => [])
    );

    artefacts.forEach(risk => {
      const customFields = risk.custom_fields || {};
      const likelihood = (customFields.likelihood || 1) - 1;
      const impact = (customFields.impact || 1) - 1;
      if (likelihood >= 0 && likelihood < 5 && impact >= 0 && impact < 5) {
        matrix[likelihood][impact].push({
          id: risk.id,
          name: risk.name,
          score: calculateRiskScore(customFields.likelihood, customFields.impact),
        });
      }
    });

    return {
      matrix,
      likelihoodLabels: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'],
      impactLabels: ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
    };
  }

  /**
   * Get control effectiveness summary
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Control effectiveness data
   */
  async getControlEffectiveness(domainId) {
    const { artefacts: controls } = await this.findByDomain(domainId, { type: 'risk_control' });

    const summary = {
      total: controls.length,
      byEffectiveness: {},
      averageEffectiveness: 0,
    };

    let totalScore = 0;

    Object.keys(CONTROL_EFFECTIVENESS).forEach(key => {
      const count = controls.filter(c => (c.custom_fields || {}).effectiveness === key).length;
      summary.byEffectiveness[key] = {
        count,
        percentage: controls.length > 0 ? Math.round((count / controls.length) * 100) : 0,
        ...CONTROL_EFFECTIVENESS[key],
      };
      totalScore += count * CONTROL_EFFECTIVENESS[key].value;
    });

    if (controls.length > 0) {
      summary.averageEffectiveness = Math.round((totalScore / (controls.length * 3)) * 100);
    }

    return summary;
  }

  /**
   * Get resilience maturity summary
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Resilience maturity data
   */
  async getResilienceMaturity(domainId) {
    const { artefacts: measures } = await this.findByDomain(domainId, { type: 'risk_resilience' });

    const summary = {
      total: measures.length,
      byMaturity: {},
      averageMaturity: 0,
    };

    let totalScore = 0;

    Object.keys(RESILIENCE_MATURITY).forEach(key => {
      const count = measures.filter(m => (m.custom_fields || {}).maturity === key).length;
      summary.byMaturity[key] = {
        count,
        percentage: measures.length > 0 ? Math.round((count / measures.length) * 100) : 0,
        ...RESILIENCE_MATURITY[key],
      };
      totalScore += count * RESILIENCE_MATURITY[key].value;
    });

    if (measures.length > 0) {
      summary.averageMaturity = Math.round((totalScore / (measures.length * 5)) * 100);
    }

    return summary;
  }

  /**
   * Build risk register view
   * @param {string} domainId - Domain ID
   * @returns {Promise<Array>} Risk register entries
   */
  async buildRiskRegister(domainId) {
    const { artefacts } = await this.findByDomain(domainId);
    const risks = artefacts.filter(a => a.artefact_type === 'risk_risk');
    const controls = artefacts.filter(a => a.artefact_type === 'risk_control');

    // Get relationships to link risks and controls
    const relResult = await query(
      `SELECT * FROM artefact_relationships
       WHERE domain_id = $1 AND relationship_type = 'mitigates'`,
      [domainId]
    );
    const relationships = relResult.rows;

    return risks.map(risk => {
      const customFields = risk.custom_fields || {};
      const riskScore = calculateRiskScore(customFields.likelihood, customFields.impact);
      const riskLevel = getRiskLevel(riskScore);

      // Find controls that mitigate this risk
      const controlIds = relationships
        .filter(r => r.from_artefact_id === risk.id || r.to_artefact_id === risk.id)
        .map(r => r.from_artefact_id === risk.id ? r.to_artefact_id : r.from_artefact_id);
      const riskControls = controls.filter(c => controlIds.includes(c.id));

      return {
        id: risk.id,
        name: risk.name,
        description: risk.description,
        category: customFields.category,
        categoryLabel: RISK_CATEGORIES[customFields.category]?.label || 'Uncategorized',
        owner: customFields.owner,
        likelihood: customFields.likelihood,
        impact: customFields.impact,
        inherentRiskScore: riskScore,
        inherentRiskLevel: riskLevel,
        stage: customFields.stage,
        stageLabel: RISK_STAGES[customFields.stage]?.label || 'Unknown',
        controlCount: riskControls.length,
        controls: riskControls.map(c => ({
          id: c.id,
          name: c.name,
          type: (c.custom_fields || {}).type,
          effectiveness: (c.custom_fields || {}).effectiveness,
        })),
        residualRiskScore: calculateResidualRisk(riskScore, riskControls),
        updatedAt: risk.updated_at,
      };
    });
  }

  /**
   * Validate risk completeness
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Validation results
   */
  async validateCompleteness(domainId) {
    const { artefacts } = await this.findByDomain(domainId);
    const issues = [];

    // Check for uncontrolled high risks
    const risks = artefacts.filter(a => a.artefact_type === 'risk_risk');
    const controls = artefacts.filter(a => a.artefact_type === 'risk_control');

    risks.forEach(risk => {
      const customFields = risk.custom_fields || {};
      const score = calculateRiskScore(customFields.likelihood, customFields.impact);
      const level = getRiskLevel(score);

      if ((level.label === 'Critical' || level.label === 'High') && !customFields.hasControls) {
        issues.push({
          severity: 'high',
          type: 'uncontrolled_risk',
          artefactId: risk.id,
          artefactName: risk.name,
          message: `${level.label} risk "${risk.name}" has no associated controls`,
          recommendation: 'Define mitigating controls for high-impact risks',
        });
      }

      if (!customFields.owner) {
        issues.push({
          severity: 'medium',
          type: 'unowned_risk',
          artefactId: risk.id,
          artefactName: risk.name,
          message: `Risk "${risk.name}" has no owner assigned`,
          recommendation: 'Assign an owner to ensure accountability',
        });
      }
    });

    // Check for ineffective controls
    controls.forEach(control => {
      const customFields = control.custom_fields || {};
      if (customFields.effectiveness === 'not_effective') {
        issues.push({
          severity: 'high',
          type: 'ineffective_control',
          artefactId: control.id,
          artefactName: control.name,
          message: `Control "${control.name}" is rated as not effective`,
          recommendation: 'Review and improve control design or replace with effective control',
        });
      }
    });

    // Check for low resilience maturity
    const resilience = artefacts.filter(a => a.artefact_type === 'risk_resilience');
    const lowMaturity = resilience.filter(r => {
      const maturity = (r.custom_fields || {}).maturity;
      return maturity === 'initial' || maturity === 'developing';
    });

    if (lowMaturity.length > resilience.length * 0.5 && resilience.length > 0) {
      issues.push({
        severity: 'medium',
        type: 'low_resilience',
        message: 'More than 50% of resilience measures have low maturity',
        recommendation: 'Develop and mature resilience capabilities',
      });
    }

    // Check for missing scenarios
    if (artefacts.filter(a => a.artefact_type === 'risk_scenario').length === 0 && risks.length > 5) {
      issues.push({
        severity: 'low',
        type: 'no_scenarios',
        message: 'No risk scenarios defined despite having multiple risks',
        recommendation: 'Create scenarios to explore how risks might combine and cascade',
      });
    }

    return {
      isComplete: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      summary: {
        total: issues.length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
      },
    };
  }

  /**
   * Get dashboard data
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(domainId) {
    const [stats, heatMap, controlEffectiveness, resilienceMaturity, validation] = await Promise.all([
      this.getStats(domainId),
      this.getRiskHeatMap(domainId),
      this.getControlEffectiveness(domainId),
      this.getResilienceMaturity(domainId),
      this.validateCompleteness(domainId),
    ]);

    return {
      stats,
      heatMap,
      controlEffectiveness,
      resilienceMaturity,
      validation,
    };
  }
}

/**
 * Calculate residual risk score based on controls
 * @param {number} inherentScore - Inherent risk score
 * @param {Array} controls - Associated controls
 * @returns {number} Residual risk score
 */
function calculateResidualRisk(inherentScore, controls) {
  if (!controls || controls.length === 0) return inherentScore;

  // Calculate control effectiveness factor
  let effectivenessFactor = 0;
  controls.forEach(control => {
    const customFields = control.custom_fields || {};
    const effectiveness = CONTROL_EFFECTIVENESS[customFields.effectiveness];
    if (effectiveness) {
      effectivenessFactor += effectiveness.value / 3; // Normalize to 0-1
    }
  });

  // Average effectiveness across controls, max reduction is 80%
  const avgEffectiveness = Math.min(effectivenessFactor / controls.length, 0.8);

  return Math.round(inherentScore * (1 - avgEffectiveness));
}

// Export singleton instance
export const riskRepository = new RiskRepository();
