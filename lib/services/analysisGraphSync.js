/**
 * Analysis <-> Knowledge Graph Sync
 *
 * Dual-write service that mirrors Analysis Studio entities (artefacts, projects,
 * relationships) as nodes and edges in the knowledge graph. This makes them
 * visible in Knowledge Studio and enables cross-space relationship discovery.
 *
 * @module lib/services/analysisGraphSync
 */

import { query } from '../pg';

/**
 * Sync an analysis artefact to the knowledge graph.
 * Creates or updates a graph_nodes entry for the artefact.
 * Uses the artefact UUID as the graph node ID for idempotent upsert.
 *
 * @param {Object} artefact - The artefact object from AnalysisRepository
 * @returns {Promise<Object>} The graph node record
 */
export async function syncArtefactToGraph(artefact) {
  const properties = {
    artefactType: artefact.artefact_type || artefact.artefactType,
    prefix: artefact.prefix,
    status: artefact.status,
    project_id: artefact.project_id,
    module: artefact.module || artefact.discipline,
    discipline: artefact.discipline || artefact.module,
    number: artefact.number,
    source_table: 'analysis_artefacts',
    source_id: artefact.id,
  };

  const result = await query(`
    INSERT INTO graph_nodes (id, name, type, domain, description, properties)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      properties = EXCLUDED.properties,
      updated_at = now()
    RETURNING *
  `, [
    artefact.id,
    artefact.name,
    'analysis_artefact',
    artefact.domain_id,
    artefact.description || '',
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Sync an analysis project to the knowledge graph.
 * Creates or updates a graph_nodes entry for the project.
 *
 * @param {Object} project - The analysis project object
 * @returns {Promise<Object>} The graph node record
 */
export async function syncAnalysisProjectToGraph(project) {
  const properties = {
    status: project.status,
    number: project.number,
    business_owner: project.business_owner,
    technical_owner: project.technical_owner,
    source_table: 'analysis_projects',
    source_id: project.id,
  };

  const result = await query(`
    INSERT INTO graph_nodes (id, name, type, domain, description, properties)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      properties = EXCLUDED.properties,
      updated_at = now()
    RETURNING *
  `, [
    project.id,
    project.name,
    'analysis_project',
    project.domain_id,
    project.description || '',
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Sync an analysis relationship to the knowledge graph.
 * Creates a graph_relationships entry mirroring the traceability link.
 *
 * @param {Object} rel - The analysis relationship object
 * @returns {Promise<Object>} The graph relationship record
 */
export async function syncAnalysisRelationship(rel) {
  const properties = {
    project_id: rel.project_id,
    source_table: 'analysis_relationships',
    source_id: rel.id,
  };

  const result = await query(`
    INSERT INTO graph_relationships (source_id, target_id, name, properties)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
    rel.from_artefact_id,
    rel.to_artefact_id,
    rel.relationship_type,
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Remove an artefact from the knowledge graph.
 * Also cascades to remove any relationships involving this node.
 *
 * @param {string} artefactId - UUID of the artefact to remove
 * @returns {Promise<boolean>} True if deleted
 */
export async function removeArtefactFromGraph(artefactId) {
  // Remove relationships first
  await query(
    'DELETE FROM graph_relationships WHERE source_id = $1 OR target_id = $1',
    [artefactId]
  );

  const result = await query(
    'DELETE FROM graph_nodes WHERE id = $1 RETURNING id',
    [artefactId]
  );

  return result.rowCount > 0;
}

/**
 * Remove a specific analysis relationship from the knowledge graph.
 *
 * @param {string} relId - UUID of the analysis relationship (used for source_id match)
 * @param {string} fromId - Source artefact UUID
 * @param {string} toId - Target artefact UUID
 * @returns {Promise<boolean>} True if deleted
 */
export async function removeAnalysisRelationshipFromGraph(relId, fromId, toId) {
  const result = await query(`
    DELETE FROM graph_relationships
    WHERE source_id = $1 AND target_id = $2
      AND properties->>'source_table' = 'analysis_relationships'
      AND properties->>'source_id' = $3
    RETURNING id
  `, [fromId, toId, relId]);

  return result.rowCount > 0;
}

/**
 * Update only the properties on an existing graph node
 * (lighter than full sync when only status or metadata changes)
 *
 * @param {string} artefactId - UUID of the graph node
 * @param {Object} updates - Properties to merge into existing properties
 * @returns {Promise<Object|null>} Updated node or null if not found
 */
export async function updateArtefactGraphProperties(artefactId, updates) {
  const result = await query(`
    UPDATE graph_nodes
    SET properties = properties || $2, updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [artefactId, JSON.stringify(updates)]);

  return result.rows[0] || null;
}
