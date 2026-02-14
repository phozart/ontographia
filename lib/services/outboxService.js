/**
 * Transactional Outbox Service
 *
 * Replaces fire-and-forget side effects (graph sync, event emission) with
 * transactional writes to an outbox table. A relay function then processes
 * pending events and applies the side effects.
 *
 * Pattern:
 *   1. API handler wraps business write + outbox write in a single transaction
 *   2. Relay polls outbox_events for pending items and processes them
 *   3. On success, marks as 'processed'; on failure, increments retries
 *
 * @module lib/services/outboxService
 */

import { query, getClient } from '../pg';

// Outbox event actions — what the relay should do when processing
export const OUTBOX_ACTIONS = {
  // Graph sync actions
  SYNC_INITIATIVE_TO_GRAPH: 'sync_initiative_to_graph',
  SYNC_PRODUCT_IDEA_TO_GRAPH: 'sync_product_idea_to_graph',
  SYNC_ARTEFACT_TO_GRAPH: 'sync_artefact_to_graph',
  SYNC_PROJECT_TO_GRAPH: 'sync_project_to_graph',
  SYNC_RELATIONSHIP_TO_GRAPH: 'sync_relationship_to_graph',
  UPDATE_GRAPH_NODE_PROPS: 'update_graph_node_props',
  REMOVE_GRAPH_NODE: 'remove_graph_node',
  REMOVE_GRAPH_RELATIONSHIP: 'remove_graph_relationship',
  // Event emission actions
  EMIT_INNOVATION_EVENT: 'emit_innovation_event',
  EMIT_ANALYSIS_EVENT: 'emit_analysis_event',
  // Cross-studio actions
  CREATE_NOTIFICATION: 'create_notification',
};

const MAX_RETRIES = 5;

let _tableEnsured = false;

/**
 * Ensure outbox_events table exists
 */
async function ensureTableExists() {
  if (_tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS outbox_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id UUID,
        payload JSONB NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        retries INTEGER NOT NULL DEFAULT 0,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        processed_at TIMESTAMPTZ
      )
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_outbox_pending
      ON outbox_events (status, created_at)
      WHERE status = 'pending'
    `);
    _tableEnsured = true;
  } catch (err) {
    console.error('[Outbox] Failed to ensure table:', err.message);
  }
}

/**
 * Write an outbox event within an existing transaction.
 * Call this inside a withTransaction callback, passing the transaction client.
 *
 * @param {import('pg').PoolClient} client - Transaction client
 * @param {Object} event
 * @param {string} event.action - One of OUTBOX_ACTIONS
 * @param {string} [event.entityType] - Entity type (e.g. 'initiative', 'artefact')
 * @param {string} [event.entityId] - Entity UUID
 * @param {Object} event.payload - Action-specific data
 * @returns {Promise<Object>} The created outbox event
 */
export async function writeOutboxEvent(client, { action, entityType, entityId, payload }) {
  const result = await client.query(`
    INSERT INTO outbox_events (action, entity_type, entity_id, payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [action, entityType || null, entityId || null, JSON.stringify(payload)]);
  return result.rows[0];
}

/**
 * Write multiple outbox events within an existing transaction.
 *
 * @param {import('pg').PoolClient} client - Transaction client
 * @param {Array<Object>} events - Array of {action, entityType, entityId, payload}
 * @returns {Promise<Object[]>} Created outbox events
 */
export async function writeOutboxEvents(client, events) {
  if (!events.length) return [];
  const results = [];
  for (const evt of events) {
    const row = await writeOutboxEvent(client, evt);
    results.push(row);
  }
  return results;
}

/**
 * Enqueue an outbox event without requiring a transaction client.
 * Uses the shared query function — suitable when the business write
 * and outbox write don't need to be in the same transaction.
 * Provides retry semantics and monitoring over fire-and-forget.
 *
 * @param {Object} event
 * @param {string} event.action - One of OUTBOX_ACTIONS
 * @param {string} [event.entityType] - Entity type
 * @param {string} [event.entityId] - Entity UUID
 * @param {Object} event.payload - Action-specific data
 * @returns {Promise<Object>} The created outbox event
 */
export async function enqueueOutboxEvent({ action, entityType, entityId, payload }) {
  await ensureTableExists();
  const result = await query(`
    INSERT INTO outbox_events (action, entity_type, entity_id, payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [action, entityType || null, entityId || null, JSON.stringify(payload)]);
  return result.rows[0];
}

/**
 * Enqueue multiple outbox events without a transaction client.
 *
 * @param {Array<Object>} events
 * @returns {Promise<Object[]>}
 */
export async function enqueueOutboxEvents(events) {
  if (!events.length) return [];
  await ensureTableExists();
  const results = [];
  for (const evt of events) {
    const result = await query(`
      INSERT INTO outbox_events (action, entity_type, entity_id, payload)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [evt.action, evt.entityType || null, evt.entityId || null, JSON.stringify(evt.payload)]);
    results.push(result.rows[0]);
  }
  return results;
}

/**
 * Process pending outbox events.
 * Called by the relay (API route or cron).
 *
 * @param {Object} [options]
 * @param {number} [options.batchSize=20] - Max events to process
 * @returns {Promise<{processed: number, failed: number}>}
 */
export async function processOutbox({ batchSize = 20 } = {}) {
  await ensureTableExists();

  // Grab a batch of pending events, oldest first
  // Use FOR UPDATE SKIP LOCKED to allow concurrent processing
  const client = await getClient();
  let processed = 0;
  let failed = 0;

  try {
    await client.query('BEGIN');

    const batch = await client.query(`
      SELECT * FROM outbox_events
      WHERE status = 'pending' AND retries < $1
      ORDER BY created_at ASC
      LIMIT $2
      FOR UPDATE SKIP LOCKED
    `, [MAX_RETRIES, batchSize]);

    await client.query('COMMIT');

    // Process each event individually (outside the lock transaction)
    for (const event of batch.rows) {
      try {
        await processOneEvent(event);
        await query(`
          UPDATE outbox_events
          SET status = 'processed', processed_at = now(), error = NULL
          WHERE id = $1
        `, [event.id]);
        processed++;
      } catch (err) {
        const newRetries = event.retries + 1;
        const newStatus = newRetries >= MAX_RETRIES ? 'dead_letter' : 'pending';
        await query(`
          UPDATE outbox_events
          SET retries = $2, error = $3, status = $4
          WHERE id = $1
        `, [event.id, newRetries, err.message, newStatus]);
        failed++;
        console.error(`[Outbox] Event ${event.id} (${event.action}) failed (retry ${newRetries}):`, err.message);
      }
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Outbox] Batch processing error:', err.message);
  } finally {
    client.release();
  }

  return { processed, failed };
}

/**
 * Process a single outbox event by dispatching to the appropriate handler.
 *
 * @param {Object} event - The outbox event row
 */
async function processOneEvent(event) {
  const { action, payload } = event;

  switch (action) {
    // ── Graph sync actions ──────────────────────────────────────
    case OUTBOX_ACTIONS.SYNC_INITIATIVE_TO_GRAPH: {
      const { syncInitiativeToGraph } = await import('./blueprintGraphSync');
      await syncInitiativeToGraph(payload);
      break;
    }
    case OUTBOX_ACTIONS.SYNC_PRODUCT_IDEA_TO_GRAPH: {
      const { syncProductIdeaToGraph } = await import('./blueprintGraphSync');
      await syncProductIdeaToGraph(payload);
      break;
    }
    case OUTBOX_ACTIONS.SYNC_ARTEFACT_TO_GRAPH: {
      const { syncArtefactToGraph } = await import('./analysisGraphSync');
      await syncArtefactToGraph(payload);
      break;
    }
    case OUTBOX_ACTIONS.SYNC_PROJECT_TO_GRAPH: {
      const { syncAnalysisProjectToGraph } = await import('./analysisGraphSync');
      await syncAnalysisProjectToGraph(payload);
      break;
    }
    case OUTBOX_ACTIONS.SYNC_RELATIONSHIP_TO_GRAPH: {
      const { syncAnalysisRelationship } = await import('./analysisGraphSync');
      await syncAnalysisRelationship(payload);
      break;
    }
    case OUTBOX_ACTIONS.UPDATE_GRAPH_NODE_PROPS: {
      const { updateGraphNodeProperties } = await import('./blueprintGraphSync');
      await updateGraphNodeProperties(payload.nodeId, payload.updates);
      break;
    }
    case OUTBOX_ACTIONS.REMOVE_GRAPH_NODE: {
      const { removeGraphNode } = await import('./blueprintGraphSync');
      await removeGraphNode(payload.nodeId);
      break;
    }
    case OUTBOX_ACTIONS.REMOVE_GRAPH_RELATIONSHIP: {
      const { removeAnalysisRelationshipFromGraph } = await import('./analysisGraphSync');
      await removeAnalysisRelationshipFromGraph(payload.relId, payload.fromId, payload.toId);
      break;
    }

    // ── Event emission actions ──────────────────────────────────
    case OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT: {
      const { emitEvent } = await import('./innovationEvents');
      await emitEvent(payload);
      break;
    }
    case OUTBOX_ACTIONS.EMIT_ANALYSIS_EVENT: {
      const { emitAnalysisEvent } = await import('./analysisEvents');
      await emitAnalysisEvent(payload);
      break;
    }

    // ── Cross-studio actions ────────────────────────────────────
    case OUTBOX_ACTIONS.CREATE_NOTIFICATION: {
      const { createNotification } = await import('./notificationService');
      await createNotification(payload);
      break;
    }

    default:
      throw new Error(`Unknown outbox action: ${action}`);
  }
}

/**
 * Get outbox statistics (for monitoring/admin)
 *
 * @returns {Promise<Object>} Counts by status
 */
export async function getOutboxStats() {
  await ensureTableExists();
  const result = await query(`
    SELECT status, COUNT(*) as count
    FROM outbox_events
    GROUP BY status
  `);
  const stats = { pending: 0, processed: 0, dead_letter: 0 };
  for (const row of result.rows) {
    stats[row.status] = parseInt(row.count, 10);
  }
  return stats;
}

/**
 * Clean up old processed events (retention policy)
 *
 * @param {number} [daysOld=7] - Delete processed events older than this
 * @returns {Promise<number>} Number of rows deleted
 */
export async function cleanupProcessed(daysOld = 7) {
  await ensureTableExists();
  const result = await query(`
    DELETE FROM outbox_events
    WHERE status = 'processed'
      AND processed_at < now() - interval '1 day' * $1
  `, [daysOld]);
  return result.rowCount;
}

// Export ensureTableExists for use in API routes
export { ensureTableExists as ensureOutboxTable };
