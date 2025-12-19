/**
 * PerfRepository - Data access layer for Performance and Outcomes Studio
 *
 * Handles CRUD operations and business logic for performance artefacts including:
 * - Objectives and Key Results (OKRs) with hierarchy and progress calculation
 * - KPIs and Metrics with health scoring and trend analysis
 * - Targets and Measurements for tracking actuals over time
 * - Reviews, Outcomes, and Insights for learning capture
 *
 * @extends BaseRepository
 * @module lib/repositories/PerfRepository
 *
 * @example
 * import { perfRepository } from '../lib/repositories';
 * const hierarchy = await perfRepository.getObjectiveHierarchy(projectId);
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';
import { calculateObjectiveProgress, calculateKpiHealth } from '../perf-types';

/**
 * Repository for Performance and Outcomes artefacts
 */
export class PerfRepository extends BaseRepository {
  constructor() {
    super('artefacts');
  }

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  /**
   * Find all Performance artefacts for a domain
   * @param {string} domainId - Domain UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.projectId] - Optional project filter
   * @param {string} [options.type] - Filter by specific type (perf_objective, perf_kpi, etc.)
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage (strategy, measurement, tracking, outcomes)
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
        AND a.artefact_type LIKE 'perf_%'
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

    // Filter by stage (look up from type)
    if (stage) {
      const stageTypes = {
        strategy: ['perf_objective', 'perf_key_result'],
        measurement: ['perf_kpi', 'perf_metric', 'perf_target'],
        tracking: ['perf_measurement', 'perf_review'],
        outcomes: ['perf_outcome', 'perf_insight'],
      };
      if (stageTypes[stage]) {
        sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
        params.push(stageTypes[stage]);
        paramIdx++;
      }
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
    let countSql = `SELECT COUNT(*) as total FROM artefacts WHERE domain_id = $1 AND artefact_type LIKE 'perf_%'`;
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
   * Find all Performance artefacts for a project (legacy - use findByDomain)
   * @param {string} projectId - Project UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.type] - Filter by specific type (perf_objective, perf_kpi, etc.)
   * @param {string[]} [options.types] - Filter by multiple types
   * @param {string} [options.stage] - Filter by stage (strategy, measurement, tracking, outcomes)
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
        AND a.artefact_type LIKE 'perf_%'
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

    // Filter by stage (look up from type)
    if (stage) {
      const stageTypes = {
        strategy: ['perf_objective', 'perf_key_result'],
        measurement: ['perf_kpi', 'perf_metric', 'perf_target'],
        tracking: ['perf_measurement', 'perf_review'],
        outcomes: ['perf_outcome', 'perf_insight'],
      };
      if (stageTypes[stage]) {
        sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
        params.push(stageTypes[stage]);
        paramIdx++;
      }
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
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'perf_%'`,
      [projectId]
    );

    return {
      artefacts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Find a single Performance artefact by ID
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
      WHERE a.id = $1 AND a.artefact_type LIKE 'perf_%'`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new Performance artefact
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
   * Update a Performance artefact
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

    updates.push(`updated_at = now()`);

    if (updates.length === 1) {
      return existing;
    }

    params.push(id);

    const sql = `
      UPDATE artefacts
      SET ${updates.join(', ')}
      WHERE id = $${paramIdx} AND artefact_type LIKE 'perf_%'
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a Performance artefact
   * @param {string} id - Artefact UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    // Delete relationships first
    await query(
      `DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
      [id]
    );

    const result = await query(
      `DELETE FROM artefacts WHERE id = $1 AND artefact_type LIKE 'perf_%' RETURNING id`,
      [id]
    );

    return result.rows.length > 0;
  }

  // ============================================================================
  // OBJECTIVES & KEY RESULTS (OKR) OPERATIONS
  // ============================================================================

  /**
   * Find all objectives for a project
   * @param {string} projectId - Project UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.objectiveType] - Filter by objective type (strategic, annual, quarterly, team, individual)
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.timeframe] - Filter by timeframe
   * @returns {Promise<Array>}
   */
  async findObjectives(projectId, options = {}) {
    const { objectiveType, status, timeframe } = options;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        (SELECT COUNT(*) FROM artefacts kr WHERE kr.artefact_type = 'perf_key_result'
          AND kr.custom_fields->>'objective_id' = a.id::text) as key_result_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'perf_objective'
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (objectiveType) {
      sql += ` AND a.custom_fields->>'objective_type' = $${paramIdx}`;
      params.push(objectiveType);
      paramIdx++;
    }

    if (status) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (timeframe) {
      sql += ` AND a.custom_fields->>'timeframe' = $${paramIdx}`;
      params.push(timeframe);
      paramIdx++;
    }

    sql += ` ORDER BY
      CASE a.custom_fields->>'objective_type'
        WHEN 'strategic' THEN 1
        WHEN 'annual' THEN 2
        WHEN 'quarterly' THEN 3
        WHEN 'team' THEN 4
        WHEN 'individual' THEN 5
        ELSE 6
      END,
      a.name`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find an objective with its key results and calculate progress
   * @param {string} objectiveId - Objective UUID
   * @returns {Promise<Object|null>}
   */
  async findObjectiveWithKeyResults(objectiveId) {
    const objective = await this.findById(objectiveId);
    if (!objective || objective.artefact_type !== 'perf_objective') return null;

    const keyResultsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_key_result'
         AND a.custom_fields->>'objective_id' = $1
       ORDER BY a.name`,
      [objectiveId]
    );

    const keyResults = keyResultsResult.rows;
    const progress = calculateObjectiveProgress(objective, keyResults);

    return {
      ...objective,
      keyResults,
      calculatedProgress: progress,
    };
  }

  /**
   * Find key results for an objective
   * @param {string} objectiveId - Objective UUID
   * @returns {Promise<Array>}
   */
  async findKeyResultsForObjective(objectiveId) {
    const result = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_key_result'
         AND a.custom_fields->>'objective_id' = $1
       ORDER BY a.name`,
      [objectiveId]
    );
    return result.rows;
  }

  /**
   * Get the full OKR hierarchy for a project
   * Returns objectives organized as a tree with their key results
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>} Nested objective tree
   */
  async getObjectiveHierarchy(projectId) {
    // Get all objectives
    const objectivesResult = await query(
      `SELECT a.*,
        u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type = 'perf_objective'
       ORDER BY a.name`,
      [projectId]
    );

    // Get all key results
    const keyResultsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.project_id = $1 AND a.artefact_type = 'perf_key_result'
       ORDER BY a.name`,
      [projectId]
    );

    const objectives = objectivesResult.rows;
    const keyResults = keyResultsResult.rows;

    // Index key results by objective_id
    const krByObjective = {};
    keyResults.forEach(kr => {
      const objId = kr.custom_fields?.objective_id;
      if (objId) {
        if (!krByObjective[objId]) krByObjective[objId] = [];
        krByObjective[objId].push(kr);
      }
    });

    // Build parent-child relationships
    const objectiveMap = {};
    objectives.forEach(obj => {
      objectiveMap[obj.id] = {
        ...obj,
        keyResults: krByObjective[obj.id] || [],
        children: [],
        calculatedProgress: null,
      };
    });

    // Calculate progress for each objective and build tree
    const roots = [];
    objectives.forEach(obj => {
      const node = objectiveMap[obj.id];
      node.calculatedProgress = calculateObjectiveProgress(obj, node.keyResults);

      const parentId = obj.custom_fields?.parent_objective;
      if (parentId && objectiveMap[parentId]) {
        objectiveMap[parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort roots by objective type
    const typeOrder = { strategic: 1, annual: 2, quarterly: 3, team: 4, individual: 5 };
    roots.sort((a, b) => {
      const aOrder = typeOrder[a.custom_fields?.objective_type] || 99;
      const bOrder = typeOrder[b.custom_fields?.objective_type] || 99;
      return aOrder - bOrder;
    });

    return roots;
  }

  /**
   * Find child objectives (objectives that cascade from a parent)
   * @param {string} parentObjectiveId - Parent objective UUID
   * @returns {Promise<Array>}
   */
  async findChildObjectives(parentObjectiveId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.artefact_type = 'perf_objective'
         AND a.custom_fields->>'parent_objective' = $1
       ORDER BY a.name`,
      [parentObjectiveId]
    );
    return result.rows;
  }

  // ============================================================================
  // KPI & METRICS OPERATIONS
  // ============================================================================

  /**
   * Find all KPIs for a project
   * @param {string} projectId - Project UUID
   * @param {Object} [options] - Query options
   * @param {string} [options.category] - Filter by category
   * @param {string} [options.metricType] - Filter by metric type (leading, lagging)
   * @returns {Promise<Array>}
   */
  async findKpis(projectId, options = {}) {
    const { category, metricType } = options;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        (SELECT COUNT(*) FROM artefacts m WHERE m.artefact_type = 'perf_metric'
          AND m.custom_fields->>'parent_kpi' = a.id::text) as metric_count,
        (SELECT COUNT(*) FROM artefacts t WHERE t.artefact_type = 'perf_target'
          AND t.custom_fields->>'kpi_id' = a.id::text) as target_count,
        (SELECT COUNT(*) FROM artefacts ms WHERE ms.artefact_type = 'perf_measurement'
          AND ms.custom_fields->>'kpi_id' = a.id::text) as measurement_count
      FROM artefacts a
      LEFT JOIN users u ON u.id = a.owner_id
      WHERE a.project_id = $1
        AND a.artefact_type = 'perf_kpi'
    `;
    const params = [projectId];
    let paramIdx = 2;

    if (category) {
      sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    if (metricType) {
      sql += ` AND a.custom_fields->>'metric_type' = $${paramIdx}`;
      params.push(metricType);
      paramIdx++;
    }

    sql += ` ORDER BY a.name`;

    const result = await query(sql, params);

    // Calculate health for each KPI
    return result.rows.map(kpi => ({
      ...kpi,
      calculatedHealth: calculateKpiHealth(kpi),
    }));
  }

  /**
   * Find a KPI with its metrics and measurements
   * @param {string} kpiId - KPI UUID
   * @returns {Promise<Object|null>}
   */
  async findKpiWithDetails(kpiId) {
    const kpi = await this.findById(kpiId);
    if (!kpi || kpi.artefact_type !== 'perf_kpi') return null;

    // Get metrics that contribute to this KPI
    const metricsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_metric'
         AND a.custom_fields->>'parent_kpi' = $1
       ORDER BY a.name`,
      [kpiId]
    );

    // Get targets for this KPI
    const targetsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_target'
         AND a.custom_fields->>'kpi_id' = $1
       ORDER BY a.custom_fields->>'timeframe' DESC`,
      [kpiId]
    );

    // Get recent measurements
    const measurementsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_measurement'
         AND a.custom_fields->>'kpi_id' = $1
       ORDER BY COALESCE(a.custom_fields->>'measurement_date', a.created_at::text) DESC
       LIMIT 20`,
      [kpiId]
    );

    return {
      ...kpi,
      calculatedHealth: calculateKpiHealth(kpi),
      metrics: metricsResult.rows,
      targets: targetsResult.rows,
      measurements: measurementsResult.rows,
    };
  }

  /**
   * Find metrics that contribute to a KPI
   * @param {string} kpiId - KPI UUID
   * @returns {Promise<Array>}
   */
  async findMetricsForKpi(kpiId) {
    const result = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.artefact_type = 'perf_metric'
         AND a.custom_fields->>'parent_kpi' = $1
       ORDER BY a.name`,
      [kpiId]
    );
    return result.rows;
  }

  /**
   * Build KPI tree structure (KPIs with their metrics)
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async buildKpiTree(projectId) {
    // Get all KPIs
    const kpisResult = await query(
      `SELECT a.*,
        u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.id = a.owner_id
       WHERE a.project_id = $1 AND a.artefact_type = 'perf_kpi'
       ORDER BY a.custom_fields->>'category', a.name`,
      [projectId]
    );

    // Get all metrics
    const metricsResult = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.project_id = $1 AND a.artefact_type = 'perf_metric'
       ORDER BY a.name`,
      [projectId]
    );

    const kpis = kpisResult.rows;
    const metrics = metricsResult.rows;

    // Index metrics by parent KPI
    const metricsByKpi = {};
    metrics.forEach(m => {
      const kpiId = m.custom_fields?.parent_kpi;
      if (kpiId) {
        if (!metricsByKpi[kpiId]) metricsByKpi[kpiId] = [];
        metricsByKpi[kpiId].push(m);
      }
    });

    // Group KPIs by category
    const byCategory = {};
    kpis.forEach(kpi => {
      const category = kpi.custom_fields?.category || 'uncategorized';
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push({
        ...kpi,
        calculatedHealth: calculateKpiHealth(kpi),
        metrics: metricsByKpi[kpi.id] || [],
      });
    });

    return {
      byCategory,
      totalKpis: kpis.length,
      totalMetrics: metrics.length,
      orphanMetrics: metrics.filter(m => !m.custom_fields?.parent_kpi),
    };
  }

  // ============================================================================
  // MEASUREMENT & TRACKING OPERATIONS
  // ============================================================================

  /**
   * Find measurements for a KPI (time series)
   * @param {string} kpiId - KPI UUID
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Limit results
   * @param {string} [options.startDate] - Filter from date
   * @param {string} [options.endDate] - Filter to date
   * @returns {Promise<Array>}
   */
  async findMeasurementsForKpi(kpiId, options = {}) {
    const { limit, startDate, endDate } = options;

    let sql = `
      SELECT a.*
      FROM artefacts a
      WHERE a.artefact_type = 'perf_measurement'
        AND a.custom_fields->>'kpi_id' = $1
    `;
    const params = [kpiId];
    let paramIdx = 2;

    if (startDate) {
      sql += ` AND COALESCE(a.custom_fields->>'measurement_date', a.created_at::text) >= $${paramIdx}`;
      params.push(startDate);
      paramIdx++;
    }

    if (endDate) {
      sql += ` AND COALESCE(a.custom_fields->>'measurement_date', a.created_at::text) <= $${paramIdx}`;
      params.push(endDate);
      paramIdx++;
    }

    sql += ` ORDER BY COALESCE(a.custom_fields->>'measurement_date', a.created_at::text) DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit, 10));
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get KPI trend over time
   * Analyzes measurements to determine trend direction
   * @param {string} kpiId - KPI UUID
   * @param {number} [periods=5] - Number of periods to analyze
   * @returns {Promise<Object>}
   */
  async getKpiTrend(kpiId, periods = 5) {
    const measurements = await this.findMeasurementsForKpi(kpiId, { limit: periods });

    if (measurements.length < 2) {
      return { trend: 'unknown', data: measurements, change: 0 };
    }

    // Extract numeric values
    const values = measurements
      .map(m => parseFloat(m.custom_fields?.value))
      .filter(v => !isNaN(v))
      .reverse(); // Oldest first

    if (values.length < 2) {
      return { trend: 'unknown', data: measurements, change: 0 };
    }

    // Calculate trend
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first !== 0 ? ((last - first) / first) * 100 : 0;

    let trend = 'stable';
    if (percentChange > 5) trend = 'improving';
    else if (percentChange < -5) trend = 'declining';

    return {
      trend,
      data: measurements,
      change,
      percentChange: Math.round(percentChange * 10) / 10,
      firstValue: first,
      lastValue: last,
      periodCount: values.length,
    };
  }

  /**
   * Record a new measurement
   * @param {Object} data - Measurement data
   * @returns {Promise<Object>}
   */
  async recordMeasurement(data) {
    const { projectId, kpiId, metricId, value, period, measurementDate, notes, createdBy } = data;

    const customFields = {
      kpi_id: kpiId,
      metric_id: metricId || null,
      value: value,
      period: period || null,
      measurement_date: measurementDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
    };

    return this.create({
      projectId,
      artefactType: 'perf_measurement',
      name: `${period || 'Measurement'} - ${value}`,
      description: notes || '',
      customFields,
      createdBy,
    });
  }

  // ============================================================================
  // STATISTICS AND DASHBOARD
  // ============================================================================

  /**
   * Get comprehensive statistics for a project's performance data
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async getStats(projectId) {
    // Count by type
    const typeCountsResult = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'perf_%'
       GROUP BY artefact_type`,
      [projectId]
    );

    const countsByType = {};
    typeCountsResult.rows.forEach(row => {
      countsByType[row.artefact_type] = parseInt(row.count, 10);
    });

    // Objective status distribution
    const objectiveStatusResult = await query(
      `SELECT custom_fields->>'status' as status, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'perf_objective'
       GROUP BY custom_fields->>'status'`,
      [projectId]
    );

    const objectiveStatusDist = {};
    objectiveStatusResult.rows.forEach(row => {
      objectiveStatusDist[row.status || 'draft'] = parseInt(row.count, 10);
    });

    // Objective type distribution
    const objectiveTypeResult = await query(
      `SELECT custom_fields->>'objective_type' as obj_type, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'perf_objective'
       GROUP BY custom_fields->>'objective_type'`,
      [projectId]
    );

    const objectiveTypeDist = {};
    objectiveTypeResult.rows.forEach(row => {
      objectiveTypeDist[row.obj_type || 'unclassified'] = parseInt(row.count, 10);
    });

    // KPI category distribution
    const kpiCategoryResult = await query(
      `SELECT custom_fields->>'category' as category, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'perf_kpi'
       GROUP BY custom_fields->>'category'`,
      [projectId]
    );

    const kpiCategoryDist = {};
    kpiCategoryResult.rows.forEach(row => {
      kpiCategoryDist[row.category || 'uncategorized'] = parseInt(row.count, 10);
    });

    // KPI health distribution (calculate from data)
    const kpisResult = await query(
      `SELECT custom_fields->>'target' as target, custom_fields->>'current' as current
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'perf_kpi'`,
      [projectId]
    );

    const kpiHealthDist = { on_track: 0, at_risk: 0, off_track: 0, unknown: 0 };
    kpisResult.rows.forEach(row => {
      const health = calculateKpiHealth({ custom_fields: row });
      kpiHealthDist[health.health] = (kpiHealthDist[health.health] || 0) + 1;
    });

    // KPI trend distribution
    const kpiTrendResult = await query(
      `SELECT custom_fields->>'trend' as trend, COUNT(*) as count
       FROM artefacts
       WHERE project_id = $1 AND artefact_type = 'perf_kpi'
       GROUP BY custom_fields->>'trend'`,
      [projectId]
    );

    const kpiTrendDist = {};
    kpiTrendResult.rows.forEach(row => {
      kpiTrendDist[row.trend || 'unknown'] = parseInt(row.count, 10);
    });

    // Total count
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type LIKE 'perf_%'`,
      [projectId]
    );

    // Recent activity
    const recentResult = await query(
      `SELECT id, name, artefact_type, updated_at, created_at
       FROM artefacts
       WHERE project_id = $1 AND artefact_type LIKE 'perf_%'
       ORDER BY updated_at DESC
       LIMIT 10`,
      [projectId]
    );

    // Calculate overall health score (percentage of objectives on track + achieved)
    const totalObjectives = countsByType['perf_objective'] || 0;
    const onTrackObjectives = (objectiveStatusDist['on_track'] || 0) + (objectiveStatusDist['achieved'] || 0);
    const overallHealth = totalObjectives > 0 ? Math.round((onTrackObjectives / totalObjectives) * 100) : 0;

    return {
      total: parseInt(totalResult.rows[0].total, 10),
      countsByType,
      objectives: {
        total: countsByType['perf_objective'] || 0,
        byStatus: objectiveStatusDist,
        byType: objectiveTypeDist,
      },
      keyResults: {
        total: countsByType['perf_key_result'] || 0,
      },
      kpis: {
        total: countsByType['perf_kpi'] || 0,
        byCategory: kpiCategoryDist,
        byHealth: kpiHealthDist,
        byTrend: kpiTrendDist,
      },
      metrics: {
        total: countsByType['perf_metric'] || 0,
      },
      targets: {
        total: countsByType['perf_target'] || 0,
      },
      measurements: {
        total: countsByType['perf_measurement'] || 0,
      },
      reviews: {
        total: countsByType['perf_review'] || 0,
      },
      outcomes: {
        total: countsByType['perf_outcome'] || 0,
      },
      insights: {
        total: countsByType['perf_insight'] || 0,
      },
      overallHealth,
      recentActivity: recentResult.rows,
    };
  }

  /**
   * Get dashboard summary data for quick visualization
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async getDashboardSummary(projectId) {
    const stats = await this.getStats(projectId);
    const hierarchy = await this.getObjectiveHierarchy(projectId);
    const kpiTree = await this.buildKpiTree(projectId);

    // Calculate aggregate progress from top-level objectives
    let totalProgress = 0;
    let progressCount = 0;
    hierarchy.forEach(obj => {
      if (obj.calculatedProgress && obj.calculatedProgress.progress > 0) {
        totalProgress += obj.calculatedProgress.progress;
        progressCount++;
      }
    });

    const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    // Find at-risk items
    const atRiskObjectives = [];
    const traverseObjectives = (objs) => {
      objs.forEach(obj => {
        if (obj.custom_fields?.status === 'at_risk' || obj.custom_fields?.status === 'off_track') {
          atRiskObjectives.push({ id: obj.id, name: obj.name, status: obj.custom_fields?.status });
        }
        if (obj.children) traverseObjectives(obj.children);
      });
    };
    traverseObjectives(hierarchy);

    const atRiskKpis = Object.values(kpiTree.byCategory)
      .flat()
      .filter(kpi => kpi.calculatedHealth?.health === 'at_risk' || kpi.calculatedHealth?.health === 'off_track')
      .map(kpi => ({ id: kpi.id, name: kpi.name, health: kpi.calculatedHealth?.health }));

    return {
      summary: {
        objectives: stats.objectives.total,
        keyResults: stats.keyResults.total,
        kpis: stats.kpis.total,
        metrics: stats.metrics.total,
        overallHealth: stats.overallHealth,
        averageProgress,
      },
      health: {
        objectivesByStatus: stats.objectives.byStatus,
        kpisByHealth: stats.kpis.byHealth,
      },
      alerts: {
        atRiskObjectives,
        atRiskKpis,
        totalAtRisk: atRiskObjectives.length + atRiskKpis.length,
      },
      recentActivity: stats.recentActivity.slice(0, 5),
    };
  }

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Find relationships for Performance artefacts
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
        AND a1.artefact_type LIKE 'perf_%'
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
}

// Export singleton instance
export const perfRepository = new PerfRepository();
