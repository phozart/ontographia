/**
 * EA-Blueprint Bridge Service
 *
 * Creates Blueprint initiatives from EA capability gaps. When an EA capability
 * is identified as needing investment, this service auto-creates a Blueprint
 * initiative and records a cross-space reference linking the two.
 *
 * @module lib/services/eaBlueprintBridge
 */

import { query, withTransaction } from '../pg';
import { emitEvent, EVENT_TYPES } from './innovationEvents';
import { syncInitiativeToGraph } from './blueprintGraphSync';

/**
 * Create a Blueprint initiative from an EA capability gap.
 *
 * Uses a transaction to ensure atomicity across:
 * 1. Generating the initiative sequence ID
 * 2. Inserting the blueprint initiative
 * 3. Recording the cross-space reference
 *
 * After commit, emits an innovation event and syncs to graph (fire-and-forget).
 *
 * @param {Object} capabilityGap
 * @param {string} capabilityGap.capability_id - UUID of the EA capability element
 * @param {string} capabilityGap.capability_name - Name of the capability
 * @param {string} capabilityGap.gap_description - Description of the gap to address
 * @param {string} [capabilityGap.gap_type] - Type of gap (missing, change, etc.)
 * @param {string} [capabilityGap.priority] - Gap priority (critical, high, medium, low)
 * @param {string} domainId - UUID of the domain
 * @param {string} [actor] - Username of the user triggering this
 * @returns {Promise<Object>} The created initiative (enriched)
 */
export async function createInitiativeFromCapabilityGap(capabilityGap, domainId, actor = null) {
  const {
    capability_id,
    capability_name,
    gap_description,
    gap_type = 'missing',
    priority = 'medium',
  } = capabilityGap;

  if (!capability_id || !capability_name || !domainId) {
    throw new Error('capability_id, capability_name, and domainId are required');
  }

  const initiative = await withTransaction(async (client) => {
    // 1. Generate initiative sequence ID
    const seqResult = await client.query(
      "SELECT nextval('blueprint_initiative_seq') as seq"
    );
    const initiativeId = `BPS-${String(seqResult.rows[0].seq).padStart(3, '0')}`;

    // 2. Build initiative data
    const name = `Address: ${capability_name} Gap`;
    const description = gap_description || `Investment initiative to address the ${gap_type} gap in ${capability_name} capability.`;

    const ideaData = {
      problem_statement: gap_description || `The ${capability_name} capability has a ${gap_type} gap that requires investment.`,
      source: 'enterprise_architecture',
      ea_capability_id: capability_id,
      ea_capability_name: capability_name,
      ea_gap_type: gap_type,
      ea_priority: priority,
    };

    const governanceData = {
      stage_history: [
        {
          stage: 'idea',
          entered: new Date().toISOString(),
          entered_by: actor || 'system',
          note: `Auto-created from EA capability gap: ${capability_name}`,
        },
      ],
      sla_status: 'on_track',
      kill_criteria_triggered: [],
    };

    // 3. Insert initiative
    const initResult = await client.query(`
      INSERT INTO blueprint_initiatives (
        domain_id, initiative_id, name, description,
        stage, submitter_id, owner_id,
        idea_data, governance_data, tags, custom_fields,
        source, source_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      domainId,
      initiativeId,
      name,
      description,
      'idea',
      actor || 'system',
      null,
      JSON.stringify(ideaData),
      JSON.stringify(governanceData),
      JSON.stringify(['ea-gap', 'auto-generated']),
      JSON.stringify({}),
      'ea_capability_gap',
      capability_id,
      actor || 'system',
    ]);

    const createdInitiative = initResult.rows[0];

    // 4. Record cross-space reference
    await client.query(`
      INSERT INTO cross_space_references (
        source_space, target_space, source_entity_id, target_entity_id,
        reference_type, metadata, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'enterprise',
      'blueprint',
      capability_id,
      createdInitiative.id,
      'ea_gap_to_initiative',
      JSON.stringify({
        capability_name,
        initiative_id: initiativeId,
        gap_type,
        priority,
        created_at: new Date().toISOString(),
      }),
      actor || 'system',
    ]);

    return createdInitiative;
  });

  // Fire-and-forget: emit event
  emitEvent({
    domainId,
    eventType: EVENT_TYPES.INITIATIVE_CREATED,
    entityId: initiative.id,
    entityType: 'initiative',
    payload: {
      initiative_id: initiative.initiative_id,
      name: initiative.name,
      stage: 'idea',
      source: 'ea_capability_gap',
      capability_id: capability_id,
      capability_name: capability_name,
    },
    actor: actor || 'system',
    source: 'ea_blueprint_bridge',
  }).catch(err => console.error('[EABlueprintBridge] Failed to emit event:', err.message));

  // Fire-and-forget: sync to knowledge graph
  syncInitiativeToGraph(initiative)
    .catch(err => console.error('[EABlueprintBridge] Failed to sync to graph:', err.message));

  return initiative;
}

/**
 * Get Blueprint initiatives linked to an EA capability.
 *
 * Queries cross_space_references to find blueprint initiatives that were
 * created from a specific EA capability gap.
 *
 * @param {string} capabilityId - UUID of the EA capability element
 * @returns {Promise<Object[]>} Array of linked initiatives with reference metadata
 */
export async function getInitiativesForCapability(capabilityId) {
  const result = await query(`
    SELECT
      bi.*,
      csr.id as reference_id,
      csr.reference_type,
      csr.metadata as reference_metadata,
      csr.created_at as linked_at
    FROM cross_space_references csr
    JOIN blueprint_initiatives bi ON bi.id = csr.target_entity_id
    WHERE csr.source_space = 'enterprise'
      AND csr.target_space = 'blueprint'
      AND csr.source_entity_id = $1
    ORDER BY csr.created_at DESC
  `, [capabilityId]);

  return result.rows;
}

/**
 * Reverse lookup: get the EA capability gap linked to a Blueprint initiative.
 *
 * @param {string} initiativeId - UUID of the Blueprint initiative
 * @returns {Promise<Object|null>} The capability reference or null
 */
export async function getCapabilityGapForInitiative(initiativeId) {
  const result = await query(`
    SELECT
      csr.id as reference_id,
      csr.source_entity_id as capability_id,
      csr.reference_type,
      csr.metadata as reference_metadata,
      csr.created_at as linked_at
    FROM cross_space_references csr
    WHERE csr.source_space = 'enterprise'
      AND csr.target_space = 'blueprint'
      AND csr.target_entity_id = $1
    ORDER BY csr.created_at DESC
    LIMIT 1
  `, [initiativeId]);

  return result.rows[0] || null;
}
