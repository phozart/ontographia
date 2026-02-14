// pages/api/workers/kg-sync.js
// Knowledge Graph sync worker — processes outbox events into graph tables.
// POST /api/workers/kg-sync  — process a batch of pending events
// GET  /api/workers/kg-sync  — return worker status / stats

import { query, getClient } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { EVENT_STATUS, AGGREGATE_TYPES, EVENT_TYPES, MAX_RETRIES } from '../../../lib/events/eventTypes';
import { artefactToGraphNode, eaElementToGraphNode } from '../../../lib/events/kgMappings';

const BATCH_SIZE = 50;

/**
 * Process a single outbox event into the knowledge graph.
 */
async function processEvent(client, event) {
  const { aggregate_type, aggregate_id, event_type, event_data } = event;

  if (aggregate_type === AGGREGATE_TYPES.ARTEFACT) {
    return processArtefactEvent(client, event_type, aggregate_id, event_data);
  }

  if (aggregate_type === AGGREGATE_TYPES.EA_ELEMENT) {
    return processEAElementEvent(client, event_type, aggregate_id, event_data);
  }

  // For kg_node and kg_edge events, they're already in the graph — skip
  if (aggregate_type === AGGREGATE_TYPES.KG_NODE || aggregate_type === AGGREGATE_TYPES.KG_EDGE) {
    return;
  }

  console.warn(`[kg-sync] Unknown aggregate type: ${aggregate_type}`);
}

async function processArtefactEvent(client, eventType, aggregateId, eventData) {
  const nodeId = `artefact_${aggregateId}`;

  if (eventType === EVENT_TYPES.DELETED) {
    await client.query('DELETE FROM graph_nodes WHERE id = $1', [nodeId]);
    return;
  }

  // created or updated — upsert node
  const node = artefactToGraphNode(eventData);

  // Check if the node type exists, create if not
  await ensureNodeType(client, node.type_id, eventData.artefact_type);

  await client.query(`
    INSERT INTO graph_nodes (id, type_id, name, description, domain, attributes)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      domain = EXCLUDED.domain,
      attributes = EXCLUDED.attributes,
      updated_at = NOW()
  `, [node.id, node.type_id, node.name, node.description, node.domain, JSON.stringify(node.attributes)]);
}

async function processEAElementEvent(client, eventType, aggregateId, eventData) {
  const nodeId = `ea_${aggregateId}`;

  if (eventType === EVENT_TYPES.DELETED) {
    await client.query('DELETE FROM graph_nodes WHERE id = $1', [nodeId]);
    return;
  }

  const node = eaElementToGraphNode(eventData);

  await ensureNodeType(client, node.type_id, eventData.element_type);

  await client.query(`
    INSERT INTO graph_nodes (id, type_id, name, description, domain, layer, attributes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      domain = EXCLUDED.domain,
      layer = EXCLUDED.layer,
      attributes = EXCLUDED.attributes,
      updated_at = NOW()
  `, [node.id, node.type_id, node.name, node.description, node.domain, node.layer, JSON.stringify(node.attributes)]);
}

/**
 * Ensure a node type exists in graph_node_types; create a placeholder if missing.
 */
async function ensureNodeType(client, typeId, displayName) {
  const existing = await client.query('SELECT id FROM graph_node_types WHERE id = $1', [typeId]);
  if (existing.rows.length === 0) {
    await client.query(`
      INSERT INTO graph_node_types (id, name, label, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [typeId, displayName || typeId, displayName || typeId, `Auto-created from outbox sync`]);
  }
}

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method === 'GET') {
    // Return outbox stats
    const stats = await query(`
      SELECT status, COUNT(*) as count
      FROM outbox_events
      GROUP BY status
    `);
    const recent = await query(`
      SELECT id, aggregate_type, event_type, status, created_at, processed_at, error_message
      FROM outbox_events
      ORDER BY created_at DESC
      LIMIT 20
    `);
    return res.status(200).json({
      stats: stats.rows,
      recent: recent.rows,
    });
  }

  if (req.method === 'POST') {
    const client = await getClient();
    let processed = 0;
    let failed = 0;
    let deadLettered = 0;

    try {
      // Claim a batch of pending events
      await client.query('BEGIN');
      const batch = await client.query(`
        UPDATE outbox_events
        SET status = $1
        WHERE id IN (
          SELECT id FROM outbox_events
          WHERE status = $2
          ORDER BY created_at ASC
          LIMIT $3
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `, [EVENT_STATUS.PROCESSING, EVENT_STATUS.PENDING, BATCH_SIZE]);
      await client.query('COMMIT');

      // Process each event individually
      for (const event of batch.rows) {
        const eventClient = await getClient();
        try {
          await eventClient.query('BEGIN');
          await processEvent(eventClient, event);
          await eventClient.query(
            `UPDATE outbox_events SET status = $1, processed_at = NOW() WHERE id = $2`,
            [EVENT_STATUS.COMPLETED, event.id]
          );
          await eventClient.query('COMMIT');
          processed++;
        } catch (err) {
          await eventClient.query('ROLLBACK');

          const newRetryCount = (event.retry_count || 0) + 1;
          const newStatus = newRetryCount >= MAX_RETRIES ? EVENT_STATUS.DEAD_LETTER : EVENT_STATUS.FAILED;

          await query(
            `UPDATE outbox_events SET status = $1, retry_count = $2, error_message = $3 WHERE id = $4`,
            [newStatus, newRetryCount, err.message, event.id]
          );

          if (newStatus === EVENT_STATUS.DEAD_LETTER) {
            deadLettered++;
          } else {
            failed++;
          }
          console.error(`[kg-sync] Error processing event ${event.id}:`, err.message);
        } finally {
          eventClient.release();
        }
      }

      // Re-queue failed events back to pending for retry
      await query(
        `UPDATE outbox_events SET status = $1 WHERE status = $2`,
        [EVENT_STATUS.PENDING, EVENT_STATUS.FAILED]
      );

      return res.status(200).json({
        ok: true,
        processed,
        failed,
        deadLettered,
        batchSize: batch.rows.length,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[kg-sync] Worker error:', err);
      return res.status(500).json({ error: 'Worker failed', details: err.message });
    } finally {
      client.release();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
