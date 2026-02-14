/**
 * EA Aggregation Service
 *
 * Service for aggregating data from multiple spaces (CAP, BA, Portfolio, PDS, PERF)
 * into the Enterprise Architecture space, making EA the integration hub.
 *
 * @module lib/services/EAAggregationService
 */

import { query, getClient } from '../pg';

/**
 * Space codes and their artefact type prefixes
 */
export const AGGREGATION_SOURCES = Object.freeze({
  CAP: {
    code: 'CAP',
    name: 'Capability Studio',
    prefix: 'cap_',
    eaLayer: 'Business',
    description: 'Capabilities, value streams, operating models',
  },
  BA: {
    code: 'BA',
    name: 'Requirements Studio',
    prefix: 'ba_',
    eaLayer: 'Application',
    description: 'Requirements, use cases, business rules',
  },
  PORTFOLIO: {
    code: 'PORTFOLIO',
    name: 'Portfolio Studio',
    prefix: 'portfolio_',
    eaLayer: 'Implementation',
    description: 'Investment themes, initiatives, portfolio decisions',
  },
  PDS: {
    code: 'PDS',
    name: 'Project Design Studio',
    prefix: 'pds_',
    eaLayer: 'Implementation',
    description: 'Projects, milestones, deliverables',
  },
  PERF: {
    code: 'PERF',
    name: 'Performance Studio',
    prefix: 'perf_',
    eaLayer: 'Strategy',
    description: 'OKRs, KPIs, metrics',
  },
});

/**
 * Mapping of source artefact types to EA element types
 */
export const TYPE_MAPPINGS = Object.freeze({
  // CAP -> EA Business Layer
  cap_capability: { eaType: 'Capability', eaLayer: 'Strategy' },
  cap_value_stream: { eaType: 'ValueStream', eaLayer: 'Strategy' },
  cap_assessment: { eaType: 'Assessment', eaLayer: 'Motivation' },
  cap_gap: { eaType: 'Gap', eaLayer: 'Implementation' },
  cap_initiative: { eaType: 'WorkPackage', eaLayer: 'Implementation' },
  cap_operating_model: { eaType: 'BusinessFunction', eaLayer: 'Business' },

  // BA -> EA Application/Business Layer
  ba_requirement: { eaType: 'Requirement', eaLayer: 'Motivation' },
  ba_use_case: { eaType: 'BusinessProcess', eaLayer: 'Business' },
  ba_business_rule: { eaType: 'Constraint', eaLayer: 'Motivation' },
  ba_data_entity: { eaType: 'DataObject', eaLayer: 'Application' },
  ba_stakeholder: { eaType: 'Stakeholder', eaLayer: 'Motivation' },

  // Portfolio -> EA Implementation Layer
  portfolio_theme: { eaType: 'Goal', eaLayer: 'Motivation' },
  portfolio_initiative: { eaType: 'WorkPackage', eaLayer: 'Implementation' },
  portfolio_decision: { eaType: 'Assessment', eaLayer: 'Motivation' },

  // PDS -> EA Implementation Layer
  pds_project: { eaType: 'WorkPackage', eaLayer: 'Implementation' },
  pds_milestone: { eaType: 'Plateau', eaLayer: 'Implementation' },
  pds_deliverable: { eaType: 'Deliverable', eaLayer: 'Implementation' },
  pds_risk: { eaType: 'Assessment', eaLayer: 'Motivation' },

  // PERF -> EA Strategy Layer
  perf_objective: { eaType: 'Goal', eaLayer: 'Motivation' },
  perf_key_result: { eaType: 'Outcome', eaLayer: 'Motivation' },
  perf_kpi: { eaType: 'Driver', eaLayer: 'Motivation' },
});

/**
 * EA Aggregation Service class
 */
export class EAAggregationService {
  constructor() {
    this.sources = AGGREGATION_SOURCES;
    this.typeMappings = TYPE_MAPPINGS;
  }

  /**
   * Get artefacts from a specific source space
   * @param {string} spaceCode - Source space code (CAP, BA, PORTFOLIO, PDS, PERF)
   * @param {string} domainId - Domain ID to filter by
   * @param {Object} [options] - Query options
   * @param {string} [options.projectId] - Optional project filter
   * @param {string[]} [options.types] - Filter by specific artefact types
   * @param {string} [options.search] - Search term
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<{artefacts: Array, total: number, source: Object}>}
   */
  async aggregateFromSpace(spaceCode, domainId, options = {}) {
    const source = this.sources[spaceCode.toUpperCase()];
    if (!source) {
      throw new Error(`Unknown source space: ${spaceCode}. Valid sources: ${Object.keys(this.sources).join(', ')}`);
    }

    const { projectId, types, search, limit = 100, offset = 0 } = options;

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        d.name as domain_name,
        p.name as project_name,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      LEFT JOIN domains d ON d.id = a.domain_id
      LEFT JOIN projects p ON p.id = a.project_id
      WHERE a.domain_id = $1
        AND a.artefact_type LIKE $2
    `;
    const params = [domainId, `${source.prefix}%`];
    let paramIdx = 3;

    if (projectId) {
      sql += ` AND a.project_id = $${paramIdx}`;
      params.push(projectId);
      paramIdx++;
    }

    if (types && types.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
      params.push(types);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.updated_at DESC`;
    sql += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM artefacts a
      WHERE a.domain_id = $1
        AND a.artefact_type LIKE $2
    `;
    const countResult = await query(countSql, [domainId, `${source.prefix}%`]);

    // Enrich artefacts with EA mapping info
    const enrichedArtefacts = result.rows.map(artefact => ({
      ...artefact,
      sourceSpace: source.code,
      sourceSpaceName: source.name,
      eaMapping: this.typeMappings[artefact.artefact_type] || null,
    }));

    return {
      artefacts: enrichedArtefacts,
      total: parseInt(countResult.rows[0].total, 10),
      source: {
        code: source.code,
        name: source.name,
        eaLayer: source.eaLayer,
        description: source.description,
      },
    };
  }

  /**
   * Get aggregated view from all source spaces
   * @param {string} domainId - Domain ID
   * @param {Object} [options] - Query options
   * @param {string} [options.projectId] - Optional project filter
   * @param {string} [options.eaLayer] - Filter by EA layer (Strategy, Motivation, Business, Application, Technology, Implementation)
   * @param {string} [options.search] - Search term
   * @param {boolean} [options.includeStats] - Include statistics per space
   * @returns {Promise<Object>}
   */
  async getAggregatedView(domainId, options = {}) {
    const { projectId, eaLayer, search, includeStats = true } = options;

    // Build the combined query for all spaces
    const prefixes = Object.values(this.sources).map(s => s.prefix);
    const likeConditions = prefixes.map((_, i) => `a.artefact_type LIKE $${i + 2}`).join(' OR ');

    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        d.name as domain_name,
        p.name as project_name
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      LEFT JOIN domains d ON d.id = a.domain_id
      LEFT JOIN projects p ON p.id = a.project_id
      WHERE a.domain_id = $1
        AND (${likeConditions})
    `;
    const params = [domainId, ...prefixes.map(p => `${p}%`)];
    let paramIdx = params.length + 1;

    if (projectId) {
      sql += ` AND a.project_id = $${paramIdx}`;
      params.push(projectId);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY a.updated_at DESC LIMIT 500`;

    const result = await query(sql, params);

    // Enrich and categorize by source and EA layer
    const bySource = {};
    const byEaLayer = {};
    const allArtefacts = [];

    for (const artefact of result.rows) {
      const sourceCode = this._getSourceCode(artefact.artefact_type);
      const mapping = this.typeMappings[artefact.artefact_type];

      const enriched = {
        ...artefact,
        sourceSpace: sourceCode,
        sourceSpaceName: this.sources[sourceCode]?.name || sourceCode,
        eaMapping: mapping,
        eaLayer: mapping?.eaLayer || 'Other',
        eaType: mapping?.eaType || null,
      };

      // Filter by EA layer if specified
      if (eaLayer && enriched.eaLayer !== eaLayer) {
        continue;
      }

      allArtefacts.push(enriched);

      // Group by source
      if (!bySource[sourceCode]) {
        bySource[sourceCode] = [];
      }
      bySource[sourceCode].push(enriched);

      // Group by EA layer
      const layer = enriched.eaLayer;
      if (!byEaLayer[layer]) {
        byEaLayer[layer] = [];
      }
      byEaLayer[layer].push(enriched);
    }

    // Calculate statistics if requested
    let statistics = null;
    if (includeStats) {
      statistics = await this._calculateStatistics(domainId, projectId);
    }

    return {
      artefacts: allArtefacts,
      total: allArtefacts.length,
      bySource,
      byEaLayer,
      sources: Object.values(this.sources).map(s => ({
        code: s.code,
        name: s.name,
        eaLayer: s.eaLayer,
        count: bySource[s.code]?.length || 0,
      })),
      eaLayers: ['Strategy', 'Motivation', 'Business', 'Application', 'Technology', 'Implementation'].map(layer => ({
        layer,
        count: byEaLayer[layer]?.length || 0,
      })),
      statistics,
    };
  }

  /**
   * Import artefacts from source spaces into EA context
   * Creates EA cross-references that link to the original artefacts
   * @param {string} sourceSpaceCode - Source space code
   * @param {string[]} artefactIds - IDs of artefacts to import
   * @param {string} domainId - Domain ID for the EA references
   * @param {string} userId - User performing the import
   * @param {Object} [options] - Import options
   * @param {boolean} [options.createElements] - Create EA elements for each artefact
   * @param {string} [options.projectId] - Project ID for EA elements
   * @returns {Promise<Object>}
   */
  async importToEA(sourceSpaceCode, artefactIds, domainId, userId, options = {}) {
    const { createElements = false, projectId } = options;
    const source = this.sources[sourceSpaceCode.toUpperCase()];

    if (!source) {
      throw new Error(`Unknown source space: ${sourceSpaceCode}`);
    }

    if (!artefactIds || artefactIds.length === 0) {
      throw new Error('No artefact IDs provided');
    }

    const client = await getClient();
    const imported = [];
    const errors = [];

    try {
      await client.query('BEGIN');

      // Fetch the source artefacts
      const artefactsResult = await client.query(
        `SELECT * FROM artefacts WHERE id = ANY($1::uuid[]) AND artefact_type LIKE $2`,
        [artefactIds, `${source.prefix}%`]
      );

      for (const artefact of artefactsResult.rows) {
        try {
          const mapping = this.typeMappings[artefact.artefact_type];

          // Check if reference already exists
          const existingRef = await client.query(
            `SELECT id FROM ea_cross_references
             WHERE source_artefact_id = $1 AND domain_id = $2`,
            [artefact.id, domainId]
          );

          if (existingRef.rows.length > 0) {
            // Update existing reference
            await client.query(
              `UPDATE ea_cross_references SET
                updated_at = now(),
                sync_status = 'synced'
               WHERE id = $1`,
              [existingRef.rows[0].id]
            );
            imported.push({
              artefactId: artefact.id,
              referenceId: existingRef.rows[0].id,
              status: 'updated',
            });
          } else {
            // Create new cross-reference
            const refResult = await client.query(
              `INSERT INTO ea_cross_references (
                domain_id, source_space_code, source_artefact_id, source_artefact_type,
                source_artefact_name, ea_layer, ea_element_type, sync_status,
                created_by, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'synced', $8, now(), now())
              RETURNING id`,
              [
                domainId,
                source.code,
                artefact.id,
                artefact.artefact_type,
                artefact.name,
                mapping?.eaLayer || source.eaLayer,
                mapping?.eaType || null,
                userId,
              ]
            );

            let eaElementId = null;

            // Optionally create an EA element
            if (createElements && mapping) {
              const elementResult = await client.query(
                `INSERT INTO ea_elements (
                  domain_id, project_id, element_type, layer, name, description,
                  properties, created_by, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
                RETURNING id`,
                [
                  domainId,
                  projectId,
                  mapping.eaType,
                  mapping.eaLayer,
                  artefact.name,
                  artefact.description || '',
                  JSON.stringify({
                    sourceSpace: source.code,
                    sourceArtefactId: artefact.id,
                    sourceArtefactType: artefact.artefact_type,
                    crossReferenceId: refResult.rows[0].id,
                  }),
                  userId,
                ]
              );
              eaElementId = elementResult.rows[0].id;

              // Link the EA element to the cross-reference
              await client.query(
                `UPDATE ea_cross_references SET ea_element_id = $1 WHERE id = $2`,
                [eaElementId, refResult.rows[0].id]
              );
            }

            imported.push({
              artefactId: artefact.id,
              referenceId: refResult.rows[0].id,
              eaElementId,
              status: 'created',
            });
          }
        } catch (err) {
          errors.push({
            artefactId: artefact.id,
            error: err.message,
          });
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return {
      sourceSpace: source.code,
      imported,
      errors,
      summary: {
        requested: artefactIds.length,
        imported: imported.length,
        updated: imported.filter(i => i.status === 'updated').length,
        created: imported.filter(i => i.status === 'created').length,
        errors: errors.length,
      },
    };
  }

  /**
   * Sync changes from source spaces - detect what has changed
   * @param {string} domainId - Domain ID
   * @param {Object} [options] - Sync options
   * @param {string} [options.projectId] - Optional project filter
   * @param {Date} [options.since] - Only check changes since this date
   * @returns {Promise<Object>}
   */
  async syncChanges(domainId, options = {}) {
    const { projectId, since } = options;
    const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    // Get existing cross-references
    const refsResult = await query(
      `SELECT * FROM ea_cross_references WHERE domain_id = $1`,
      [domainId]
    );

    const changes = {
      updated: [],
      deleted: [],
      new: [],
      unchanged: [],
    };

    // Check each reference
    for (const ref of refsResult.rows) {
      const artefactResult = await query(
        `SELECT id, name, description, updated_at, status FROM artefacts WHERE id = $1`,
        [ref.source_artefact_id]
      );

      if (artefactResult.rows.length === 0) {
        // Artefact was deleted
        changes.deleted.push({
          referenceId: ref.id,
          sourceArtefactId: ref.source_artefact_id,
          sourceArtefactName: ref.source_artefact_name,
          sourceSpace: ref.source_space_code,
        });
      } else {
        const artefact = artefactResult.rows[0];
        const artefactUpdated = new Date(artefact.updated_at);
        const refUpdated = new Date(ref.updated_at);

        if (artefactUpdated > refUpdated) {
          // Artefact was updated
          changes.updated.push({
            referenceId: ref.id,
            sourceArtefactId: ref.source_artefact_id,
            sourceArtefactName: artefact.name,
            previousName: ref.source_artefact_name,
            sourceSpace: ref.source_space_code,
            lastUpdated: artefact.updated_at,
          });
        } else {
          changes.unchanged.push({
            referenceId: ref.id,
            sourceArtefactId: ref.source_artefact_id,
          });
        }
      }
    }

    // Find new artefacts that could be imported (updated since the given date)
    const prefixes = Object.values(this.sources).map(s => s.prefix);
    const likeConditions = prefixes.map((_, i) => `a.artefact_type LIKE $${i + 3}`).join(' OR ');

    let newArtefactsSql = `
      SELECT a.id, a.name, a.artefact_type, a.updated_at
      FROM artefacts a
      WHERE a.domain_id = $1
        AND a.updated_at >= $2
        AND (${likeConditions})
        AND a.id NOT IN (SELECT source_artefact_id FROM ea_cross_references WHERE domain_id = $1)
    `;
    const newParams = [domainId, sinceDate, ...prefixes.map(p => `${p}%`)];

    if (projectId) {
      newArtefactsSql += ` AND a.project_id = $${newParams.length + 1}`;
      newParams.push(projectId);
    }

    newArtefactsSql += ` ORDER BY a.updated_at DESC LIMIT 100`;

    const newArtefactsResult = await query(newArtefactsSql, newParams);

    changes.new = newArtefactsResult.rows.map(a => ({
      artefactId: a.id,
      name: a.name,
      type: a.artefact_type,
      sourceSpace: this._getSourceCode(a.artefact_type),
      updatedAt: a.updated_at,
    }));

    return {
      domainId,
      checkedAt: new Date().toISOString(),
      sinceDatetime: sinceDate.toISOString(),
      changes,
      summary: {
        updated: changes.updated.length,
        deleted: changes.deleted.length,
        new: changes.new.length,
        unchanged: changes.unchanged.length,
        totalReferences: refsResult.rows.length,
      },
    };
  }

  /**
   * Get existing EA cross-references for a domain
   * @param {string} domainId - Domain ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>}
   */
  async getCrossReferences(domainId, options = {}) {
    const { sourceSpace, eaLayer, includeArtefactDetails = false } = options;

    let sql = `
      SELECT r.*,
        e.name as ea_element_name,
        e.element_type as ea_element_type_actual,
        e.layer as ea_element_layer_actual
      FROM ea_cross_references r
      LEFT JOIN ea_elements e ON e.id = r.ea_element_id
      WHERE r.domain_id = $1
    `;
    const params = [domainId];
    let paramIdx = 2;

    if (sourceSpace) {
      sql += ` AND r.source_space_code = $${paramIdx}`;
      params.push(sourceSpace.toUpperCase());
      paramIdx++;
    }

    if (eaLayer) {
      sql += ` AND r.ea_layer = $${paramIdx}`;
      params.push(eaLayer);
      paramIdx++;
    }

    sql += ` ORDER BY r.updated_at DESC`;

    const result = await query(sql, params);
    let references = result.rows;

    // Optionally fetch full artefact details
    if (includeArtefactDetails && references.length > 0) {
      const artefactIds = references.map(r => r.source_artefact_id);
      const artefactsResult = await query(
        `SELECT id, name, description, status, artefact_type, updated_at, custom_fields
         FROM artefacts WHERE id = ANY($1::uuid[])`,
        [artefactIds]
      );

      const artefactMap = new Map(artefactsResult.rows.map(a => [a.id, a]));

      references = references.map(ref => ({
        ...ref,
        sourceArtefact: artefactMap.get(ref.source_artefact_id) || null,
      }));
    }

    return {
      references,
      total: references.length,
    };
  }

  /**
   * Delete a cross-reference
   * @param {string} referenceId - Cross-reference ID
   * @param {Object} [options] - Delete options
   * @param {boolean} [options.deleteEaElement] - Also delete linked EA element
   * @returns {Promise<boolean>}
   */
  async deleteCrossReference(referenceId, options = {}) {
    const { deleteEaElement = false } = options;

    const refResult = await query(
      `SELECT * FROM ea_cross_references WHERE id = $1`,
      [referenceId]
    );

    if (refResult.rows.length === 0) {
      return false;
    }

    const ref = refResult.rows[0];

    if (deleteEaElement && ref.ea_element_id) {
      // Delete the linked EA element
      await query(`DELETE FROM ea_elements WHERE id = $1`, [ref.ea_element_id]);
    }

    await query(`DELETE FROM ea_cross_references WHERE id = $1`, [referenceId]);
    return true;
  }

  /**
   * Get source code from artefact type
   * @private
   */
  _getSourceCode(artefactType) {
    for (const [code, source] of Object.entries(this.sources)) {
      if (artefactType.startsWith(source.prefix)) {
        return code;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Calculate statistics for aggregated data
   * @private
   */
  async _calculateStatistics(domainId, projectId) {
    const stats = {};

    for (const [code, source] of Object.entries(this.sources)) {
      let sql = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft,
          COUNT(CASE WHEN status = 'InReview' THEN 1 END) as in_review,
          COUNT(CASE WHEN updated_at >= NOW() - INTERVAL '7 days' THEN 1 END) as updated_last_week
        FROM artefacts
        WHERE domain_id = $1
          AND artefact_type LIKE $2
      `;
      const params = [domainId, `${source.prefix}%`];

      if (projectId) {
        sql += ` AND project_id = $3`;
        params.push(projectId);
      }

      const result = await query(sql, params);
      const row = result.rows[0];

      stats[code] = {
        total: parseInt(row.total, 10),
        approved: parseInt(row.approved, 10),
        draft: parseInt(row.draft, 10),
        inReview: parseInt(row.in_review, 10),
        updatedLastWeek: parseInt(row.updated_last_week, 10),
      };
    }

    // Cross-reference statistics
    const crossRefResult = await query(
      `SELECT
        source_space_code,
        COUNT(*) as count,
        COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced,
        COUNT(CASE WHEN sync_status = 'stale' THEN 1 END) as stale,
        COUNT(CASE WHEN ea_element_id IS NOT NULL THEN 1 END) as with_ea_element
       FROM ea_cross_references
       WHERE domain_id = $1
       GROUP BY source_space_code`,
      [domainId]
    );

    const crossRefStats = {};
    for (const row of crossRefResult.rows) {
      crossRefStats[row.source_space_code] = {
        total: parseInt(row.count, 10),
        synced: parseInt(row.synced, 10),
        stale: parseInt(row.stale, 10),
        withEaElement: parseInt(row.with_ea_element, 10),
      };
    }

    return {
      bySource: stats,
      crossReferences: crossRefStats,
      totals: {
        artefacts: Object.values(stats).reduce((sum, s) => sum + s.total, 0),
        crossReferences: crossRefResult.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0),
      },
    };
  }
}

// Export singleton instance
export const eaAggregationService = new EAAggregationService();

export default eaAggregationService;
