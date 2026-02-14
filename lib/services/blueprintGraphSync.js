/**
 * Blueprint <-> Knowledge Graph Sync
 *
 * Dual-write service that mirrors Blueprint Studio entities (initiatives, product ideas)
 * as nodes in the knowledge graph. This makes them visible in Knowledge Studio
 * and enables cross-space relationship discovery.
 *
 * @module lib/services/blueprintGraphSync
 */

import { query } from '../pg';

/**
 * Sync an initiative to the knowledge graph.
 * Creates or updates a graph_nodes entry for the initiative.
 *
 * @param {Object} initiative - The initiative object from BlueprintRepository
 * @returns {Promise<Object>} The graph node record
 */
export async function syncInitiativeToGraph(initiative) {
  const properties = {
    initiative_id: initiative.initiative_id,
    stage: initiative.stage,
    horizon: initiative.horizon,
    source_table: 'blueprint_initiatives',
    source_id: initiative.id,
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
    initiative.id,
    initiative.name,
    'blueprint_initiative',
    initiative.domain_id,
    initiative.description || '',
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Sync a product idea to the knowledge graph.
 *
 * @param {Object} productIdea - The product idea object
 * @returns {Promise<Object>} The graph node record
 */
export async function syncProductIdeaToGraph(productIdea) {
  const properties = {
    product_idea_id: productIdea.product_idea_id,
    initiative_id: productIdea.initiative_id,
    stage: productIdea.stage,
    horizon: productIdea.horizon,
    source_table: 'blueprint_product_ideas',
    source_id: productIdea.id,
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
    productIdea.id,
    productIdea.name,
    'blueprint_product_idea',
    productIdea.domain_id,
    productIdea.description || '',
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Create a relationship between two graph nodes.
 * Used for linking initiatives to capabilities, requirements, etc.
 *
 * @param {Object} params
 * @param {string} params.sourceId - Source node UUID
 * @param {string} params.targetId - Target node UUID
 * @param {string} params.name - Relationship name (e.g. 'addresses_capability')
 * @param {string} [params.description] - Optional description
 * @param {Object} [params.properties] - Optional metadata
 * @returns {Promise<Object>} The relationship record
 */
export async function createGraphRelationship({ sourceId, targetId, name, description, properties = {} }) {
  const result = await query(`
    INSERT INTO graph_relationships (source_id, target_id, name, description, properties)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [
    sourceId,
    targetId,
    name,
    description || null,
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Remove a graph node (used when deleting an initiative or product idea)
 * Also cascades to remove any relationships involving this node.
 *
 * @param {string} nodeId - UUID of the node to remove
 * @returns {Promise<boolean>} True if deleted
 */
export async function removeGraphNode(nodeId) {
  // Remove relationships first
  await query(
    'DELETE FROM graph_relationships WHERE source_id = $1 OR target_id = $1',
    [nodeId]
  );

  const result = await query(
    'DELETE FROM graph_nodes WHERE id = $1 RETURNING id',
    [nodeId]
  );

  return result.rowCount > 0;
}

/**
 * Update only the stage/properties on an existing graph node
 * (lighter than full sync when only stage changes)
 *
 * @param {string} nodeId - UUID of the graph node
 * @param {Object} updates - Properties to merge
 * @returns {Promise<Object|null>}
 */
export async function updateGraphNodeProperties(nodeId, updates) {
  const result = await query(`
    UPDATE graph_nodes
    SET properties = properties || $2, updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [nodeId, JSON.stringify(updates)]);

  return result.rows[0] || null;
}
