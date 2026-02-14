// lib/events/outbox.js
// Outbox event emission — called within the same DB transaction as the business write

/**
 * Emit an event to the outbox table within an existing transaction.
 *
 * @param {import('pg').PoolClient} client - The transaction client
 * @param {Object} event
 * @param {string} event.aggregateType - e.g. 'artefact', 'ea_element'
 * @param {string} event.aggregateId - The ID of the entity
 * @param {string} [event.domainId] - Domain UUID for scoping
 * @param {string} event.eventType - e.g. 'created', 'updated', 'deleted'
 * @param {Object} [event.eventData] - Snapshot or delta of the entity
 * @param {string} [event.sourceStudio] - e.g. 'analysis', 'blueprint'
 * @returns {Promise<Object>} The created outbox event row
 */
export async function emitEvent(client, {
  aggregateType,
  aggregateId,
  domainId = null,
  eventType,
  eventData = {},
  sourceStudio = null,
}) {
  const result = await client.query(
    `INSERT INTO outbox_events (aggregate_type, aggregate_id, domain_id, event_type, event_data, source_studio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [aggregateType, aggregateId, domainId, eventType, JSON.stringify(eventData), sourceStudio]
  );
  return result.rows[0];
}

/**
 * Emit an event outside of a transaction (for simpler cases where the caller
 * does not need transactional guarantees with the business write).
 *
 * @param {Function} queryFn - The query function from lib/pg
 * @param {Object} event - Same shape as emitEvent
 * @returns {Promise<Object>}
 */
export async function emitEventSimple(queryFn, {
  aggregateType,
  aggregateId,
  domainId = null,
  eventType,
  eventData = {},
  sourceStudio = null,
}) {
  const result = await queryFn(
    `INSERT INTO outbox_events (aggregate_type, aggregate_id, domain_id, event_type, event_data, source_studio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [aggregateType, aggregateId, domainId, eventType, JSON.stringify(eventData), sourceStudio]
  );
  return result.rows[0];
}
